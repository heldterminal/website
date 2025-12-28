// supabase/functions/held-chat/index.ts
/// <reference lib="deno.unstable" />
import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { packRows, extractProbe, systemPrompt } from "../_shared/utils.ts";
import { callModel } from "../_shared/models.ts";
import { calculateTokenCount, checkQuotas, trackUsage } from "../_shared/usage.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Chat memory table name
const CHAT_TABLE = Deno.env.get("HELD_CHAT_TABLE") || "held_chat_memory";
const CHAT_MAX_TURNS = Number(Deno.env.get("HELD_CHAT_MAX_TURNS") || "20");

serve(async (req) => {
  // CORS (optional: restrict to your app domain)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST,DELETE,OPTIONS"
      }
    });
  }

  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
      return json({ error: "missing bearer token" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: auth }
      }
    });

    // validate the JWT (and get user id)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return json({ error: "invalid token" }, 401);
    }
    const userId = userData.user.id;

    // Get user's default team ID from profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("default_team_id")
      .eq("user_id", userId)
      .single();
    
    const defaultTeamId = profileData?.default_team_id;

    if (req.method === "DELETE") {
      // Purge a chat session memory: body: { session_id }
      const b = await safeJson(req);
      const sessionId = String(b?.session_id || "").trim();
      if (!sessionId) return json({ error: "session_id required" }, 400);

      const { error } = await supabase
        .from(CHAT_TABLE)
        .delete()
        .match({ user_id: userId, session_id: sessionId });

      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, purged: sessionId });
    }

    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const body = await safeJson(req);
    const q = (body?.q || "").trim();
    if (!q) return json({ error: "empty query" }, 400);

    // Calculate token count for this request
    const tokenCount = calculateTokenCount(q);

    // Check quotas before processing
    if (defaultTeamId) {
      const quotaError = await checkQuotas(supabase, userId, defaultTeamId, tokenCount);
      if (quotaError) {
        return json({ error: quotaError }, 429); // 429 Too Many Requests
      }

      // Track usage in team_usage_daily
      await trackUsage(supabase, userId, defaultTeamId, tokenCount);
    }

    const mode = String(body?.mode || "ai");
    const model = String(body?.model || "");
    const sessionId = String(body?.session_id || "").trim() ||
      autoSessionId(req.headers.get("held-tty") || "");
    const chatSession = String(body?.chat_session || `${sessionId}-ai`);
    const maxTokens = Number(body?.max_tokens || 256);
    const temperature = Number(body?.temperature || 0.2);
    const overridePrompt = (Deno.env.get("HELD_SYSTEM_PROMPT") || "").trim() || undefined;

    // ----- Fetch candidate history rows (with RLS via user token) -----
    const limitRecent = Math.min(Number(body?.limit_recent || 80), 200);
    const limitLike = Math.min(Number(body?.limit_like || 40), 200);

    const rowsAll = [];

    // phrase probe
    const { kind, phrase } = extractProbe(q);
    if (phrase && kind === "cmd") {
      const { data, error } = await supabase
        .from("commands")
        .select("ts_start,cwd,cmd,exit_code,stdout,stderr,ssh_host,ssh_user")
        .ilike("cmd", `%${phrase}%`)
        .order("ts_start", { ascending: false })
        .limit(limitLike);
      if (data?.length) rowsAll.push(...data);
    } else if (phrase && kind === "out") {
      const { data, error } = await supabase
        .from("commands")
        .select("ts_start,cwd,cmd,exit_code,stdout,stderr,ssh_host,ssh_user")
        .or(`stdout.ilike.%${phrase}%,stderr.ilike.%${phrase}%`)
        .order("ts_start", { ascending: false })
        .limit(limitLike);
      if (data?.length) rowsAll.push(...data);
    }

    // recents
    {
      const { data, error } = await supabase
        .from("commands")
        .select("ts_start,cwd,cmd,exit_code,stdout,stderr,ssh_host,ssh_user")
        .order("ts_start", { ascending: false })
        .limit(limitRecent);
      if (data?.length) rowsAll.push(...data);
    }

    // dedupe by (ts_start, cmd, cwd)
    const seen = new Set();
    const uniq = [];
    for (const r of rowsAll) {
      const k = `${r.ts_start}||${r.cmd}||${r.cwd}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(r);
    }

    // load prior chat memory (Q/A only; system is injected at call time)
    const memory = await loadMemory(supabase, userId, sessionId, CHAT_TABLE, CHAT_MAX_TURNS);

    const sys = systemPrompt(mode, overridePrompt);
    const packed = packRows(uniq, 60, 220);

    const messages = [
      { role: "system", content: sys },
      ...memory,
      {
        role: "user",
        content:
          `User request:\n${q}\n\n` +
          `Candidate history rows:\n` +
          `${packed || "(no rows found)"}\n\n` +
          `Answer now.`
      }
    ];

    // call LLM
    const env = {
      OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY"),
      OPENROUTER_API_KEY: Deno.env.get("OPENROUTER_API_KEY"),
      LLAMA_API_KEY: Deno.env.get("LLAMA_API_KEY"),
      HELD_APP_URL: Deno.env.get("HELD_APP_URL") || ""
    };

    const { ok, content } = await callModel(messages, model, env, {
      max_tokens: Math.max(1, Math.min(maxTokens, 4000)),
      temperature
    });

    // update memory and persist
    const newMem = [...memory, { role: "user", content: q }];
    if (ok) newMem.push({ role: "assistant", content });
    await saveMemory(supabase, userId, sessionId, CHAT_TABLE, newMem, CHAT_MAX_TURNS);

    // ✅ guarantee non-empty body to avoid "(no output)" in the UI
    const finalText =
      content && String(content).trim().length > 0
        ? content
        : `No model output.

    Tip: confirm you set at least one provider key (OPENAI_API_KEY / OPENROUTER_API_KEY / LLAMA_API_KEY).
    Echo: ${q}`;

    return new Response(
      ok ? finalText : `${finalText}\n\n(no LLM; echoing your query)\n${q}`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

async function safeJson(req) {
  const txt = await req.text();
  try {
    return JSON.parse(txt || "{}");
  } catch {
    return {};
  }
}

function autoSessionId(tty) {
  const key = `${tty}|ua=edge`;
  // Use a random suffix to avoid async hashing in Edge runtime
  const rand = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(rand)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "auto-" + hex;
}
// no-op

// Memory helpers -------------------------------------------------------------
async function loadMemory(supabase, userId, sessionId, table, cap) {
  const { data, error } = await supabase
    .from(table)
    .select("messages")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .single();

  if (!data?.messages) return [];
  try {
    const arr = Array.isArray(data.messages) ? data.messages : JSON.parse(data.messages);
    // keep only user/assistant turns (no system)
    return arr
      .filter((m) => m?.role === "user" || m?.role === "assistant")
      .slice(-cap * 2);
  } catch {
    return [];
  }
}

async function saveMemory(supabase, userId, sessionId, table, messages, cap) {
  const trimmed = messages
    .filter((m) => m?.role === "user" || m?.role === "assistant")
    .slice(-cap * 2);

  const row = {
    user_id: userId,
    session_id: sessionId,
    messages: trimmed,
    updated_at: new Date().toISOString()
  };

  const { error: upErr } = await supabase.from(table).upsert(row, {
    onConflict: "user_id,session_id"
  });

  if (upErr) console.error("memory upsert failed:", upErr.message);
}
