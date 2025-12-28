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
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: authUser } = await userClient.auth.getUser();
    const caller_id = authUser.user?.id;
    if (!caller_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { team_id, name } = await req.json();
    if (!team_id || !name) return new Response("Missing team_id or name", { status: 400, headers: corsHeaders });

    // Verify caller is owner or admin for rename
    const { data: roleRow, error: roleErr } = await admin
      .from("team_members")
      .select("role")
      .eq("team_id", team_id)
      .eq("user_id", caller_id)
      .single();
    if (roleErr || !roleRow || !["owner","admin"].includes(roleRow.role)) {
      return new Response("Forbidden: admin/owner role required", { status: 403, headers: corsHeaders });
    }

    const { error: updErr } = await admin
      .from("teams")
      .update({ name })
      .eq("id", team_id);
    if (updErr) return new Response(updErr.message, { status: 400, headers: corsHeaders });

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(msg, { status: 500, headers: corsHeaders });
  }
});





