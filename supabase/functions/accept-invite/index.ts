import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

    // user-scoped client to read user from JWT
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: authUser } = await userClient.auth.getUser();
    const user_id = authUser.user?.id;
    const email   = authUser.user?.email ?? null;
    if (!user_id || !email) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { team_id, token } = await req.json();
    if (!team_id || !token) return new Response(JSON.stringify({ ok: false, reason: "missing_params" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // 1) Validate invite existence by team+token, then check status and email
    const { data: invitesAny, error: invAnyErr } = await admin
      .from("team_invites")
      .select("team_id, email, expires_at, accepted_at")
      .eq("team_id", team_id)
      .eq("token", token)
      .limit(1);
    if (invAnyErr) throw invAnyErr;
    if (!invitesAny || invitesAny.length === 0) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_or_used_invite" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const invite = invitesAny[0] as { email: string; expires_at: string; accepted_at: string | null };
    if (invite.accepted_at) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_or_used_invite" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ ok: false, reason: "expired" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    // Compare invited email to currently authenticated email (case-insensitive)
    if (!invite.email || invite.email.toLowerCase() !== String(email || "").toLowerCase()) {
      return new Response(JSON.stringify({ ok: false, reason: "email_mismatch", invite_email: invite.email }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 2) Upsert membership (idempotent)
    const { error: upErr } = await admin
      .from("team_members")
      .upsert({ user_id, team_id, role: "member", joined_at: new Date().toISOString() }, { onConflict: "user_id,team_id" });
    if (upErr) throw upErr;

    // 3) Mark accepted, then delete the invite
    await admin.from("team_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("team_id", team_id).eq("token", token).ilike("email", email);

    await admin.from("team_invites")
      .delete()
      .eq("team_id", team_id).eq("token", token).ilike("email", email);

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(String(e), { status: 500, headers: corsHeaders });
  }
});
