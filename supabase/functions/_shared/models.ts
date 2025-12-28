// supabase/functions/_shared/models.ts
import { isLlamaModel } from "./utils.ts";

const clamp = (n, lo, hi) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : hi));

export async function callModel(messages, model, env, opts = {}) {
  if (isLlamaModel(model)) return llama(messages, model, env, opts);
  if (env.OPENAI_API_KEY)
    return openai(messages, model || "gpt-4o-mini", env, opts);
  if (env.OPENROUTER_API_KEY)
    return openrouter(messages, model || "openrouter/auto", env, opts);

  return {
    ok: false,
    content:
      "⚠︎ No model provider configured (OPENAI_API_KEY or OPENROUTER_API_KEY or LLAMA_API_KEY)"
  };
}

async function openai(messages, model, env, opts = {}) {
  const apiKey = (env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return { ok: false, content: "⚠︎ Missing OPENAI_API_KEY" };

  const body = {
    model,
    messages,
    // OpenAI allows large values, but we keep symmetry:
    max_tokens: clamp(opts.max_tokens, 1, 4000),
    temperature: opts.temperature ?? 0.2
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok)
    return { ok: false, content: `⚠︎ OpenAI ${res.status}: ${await res.text()}` };

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, content };
}

async function openrouter(messages, model, env, opts = {}) {
  const apiKey = (env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) return { ok: false, content: "⚠︎ Missing OPENROUTER_API_KEY" };

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  // (Recommended by OpenRouter; helps with routing/allow-list but not required)
  if (env.HELD_APP_URL) headers["HTTP-Referer"] = env.HELD_APP_URL;

  const body = {
    model,
    messages,
    max_tokens: clamp(opts.max_tokens, 1, 4000),
    temperature: opts.temperature ?? 0.2
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok)
    return {
      ok: false,
      content: `⚠︎ OpenRouter ${res.status}: ${await res.text()}`
    };

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, content };
}

/**
 * Llama (Meta) – also accepts max_tokens/temperature
 */
async function llama(messages, model, env, opts = {}) {
  const apiKey = (env.LLAMA_API_KEY || "").trim();
  if (!apiKey) return { ok: false, content: "⚠︎ Missing LLAMA_API_KEY" };

  const body = {
    model,
    messages,
    max_tokens: clamp(opts.max_tokens, 1, 4000),
    temperature: opts.temperature ?? 0.2
  };

  const res = await fetch("https://api.llama.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const raw = await res.text();
  if (!res.ok) return { ok: false, content: `⚠︎ Llama ${res.status}: ${raw}` };

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      content: `⚠︎ Llama: invalid JSON: ${raw.slice(0, 300)}`
    };
  }

  const cm = data?.completion_message;
  let content = extractText(cm?.content);

  if (!content) {
    const m = data?.choices?.[0]?.message;
    content = extractText(m?.content);
  }

  content = (content || "").trim();
  if (!content) return { ok: false, content: "⚠︎ Llama returned no content" };

  return { ok: true, content };
}

function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && !Array.isArray(content))
    return content.text || content.content || "";
  if (Array.isArray(content))
    return content
      .map((p) => (typeof p === "string" ? p : p?.text || p?.content || ""))
      .join("");
  return "";
}
