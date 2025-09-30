import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL      = Deno.env.get("SITE_URL")!; // e.g., https://app.example.com
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Coro Team Invites <onboarding@resend.dev>";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let debugStep = "init";

serve(async (req) => {
  try {
    debugStep = "init";
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

    // user-scoped client from caller's JWT
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });

    debugStep = "getUser";
    const { data: authUser } = await userClient.auth.getUser();
    const caller_id = authUser.user?.id;
    if (!caller_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    debugStep = "parseBody";
    const { team_id, email } = await req.json();
    if (!team_id || !email) return new Response("Missing team_id/email", { status: 400, headers: corsHeaders });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      return new Response("Invalid email format", { status: 400, headers: corsHeaders });
    }

    // 1) Ensure caller is team admin/owner
    debugStep = "checkRole";
    const { data: roleRow, error: roleErr } = await admin
      .from("team_members")
      .select("role")
      .eq("team_id", team_id)
      .eq("user_id", caller_id)
      .single();
    if (roleErr || !roleRow || !["owner","admin"].includes(roleRow.role)) {
      return new Response("Forbidden: not a team admin", { status: 403, headers: corsHeaders });
    }

    // Passed role check
    console.log(JSON.stringify({ at: "create-invite:after-role-check", caller_id, team_id }));

    // 2) Guard: already a member?
    debugStep = "checkAlreadyMember";
    const { data: profRow } = await admin
      .from("profiles")
      .select("user_id")
      .ilike("email", normalizedEmail)
      .maybeSingle();
    if (profRow?.user_id) {
      // Enforce invitee must be Pro
      const { data: planRow } = await admin
        .from("profiles")
        .select("plan, subscription_status")
        .eq("user_id", profRow.user_id)
        .maybeSingle();
      const isPro = (planRow?.plan === 'pro') || (planRow?.subscription_status === 'active');
      if (!isPro) {
        return new Response("Invitee must be on a Pro plan", { status: 400, headers: corsHeaders });
      }

      // Enforce max 3 org teams (exclude personal/default team)
      const { data: profWithDefault } = await admin
        .from("profiles")
        .select("default_team_id")
        .eq("user_id", profRow.user_id)
        .maybeSingle();

      const baseCountQuery = admin
        .from("team_members")
        .select("team_id", { count: 'exact', head: true })
        .eq("user_id", profRow.user_id);
      const { count: teamCount } = profWithDefault?.default_team_id
        ? await baseCountQuery.neq("team_id", profWithDefault.default_team_id)
        : await baseCountQuery;
      if ((teamCount ?? 0) >= 3) {
        return new Response("User is already a member of the maximum number of teams", { status: 400, headers: corsHeaders });
      }

      const { data: memRow } = await admin
        .from("team_members")
        .select("user_id")
        .eq("team_id", team_id)
        .eq("user_id", profRow.user_id)
        .maybeSingle();
      if (memRow) {
        return new Response("User is already a member of this team", { status: 400, headers: corsHeaders });
      }
    }

    // 3) Guard: already invited?
    let token: string | null = null;
    debugStep = "findExistingInvite";
    console.log(JSON.stringify({ at: debugStep, team_id, normalizedEmail }));
    const { data: existing, error: existingErr } = await admin
      .from("team_invites")
      .select("token, expires_at, accepted_at")
      .eq("team_id", team_id)
      .ilike("email", normalizedEmail)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1);
    if (existingErr) throw existingErr;
    if (existing && existing.length) {
      const existingUrl = `${SITE_URL}/accept-invite?team=${team_id}&token=${existing[0].token}`;
      return new Response(`An active invite already exists. Link: ${existingUrl}`, { status: 400, headers: corsHeaders });
    }

    // 4) Insert invite
    debugStep = "insertInvite";
    const { data: inserted, error: insErr } = await userClient
      .from("team_invites")
      .insert({ team_id, email: normalizedEmail })
      .select("token")
      .single();
    if (insErr) throw insErr;
    token = inserted.token;

    // 5) Lookup team name and inviter display
    debugStep = "loadTeamAndInviter";
    console.log(JSON.stringify({ at: debugStep, team_id }));
    const { data: team, error: teamErr } = await admin
      .from("teams")
      .select("name")
      .eq("id", team_id)
      .maybeSingle();
    if (teamErr) {
      console.error("create-invite teamErr", teamErr);
      throw teamErr;
    }
    const { data: inviter, error: inviterErr } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", caller_id)
      .maybeSingle();
    if (inviterErr) {
      console.error("create-invite inviterErr", inviterErr);
    }
    const team_name = team?.name ?? "your team";
    const inviter_name = inviter?.display_name ?? "A teammate";

    // 6) Build redirect with team + token
    debugStep = "buildRedirect";
    const redirectTo = `${SITE_URL}/accept-invite?team=${team_id}&token=${token}`;
    console.log(JSON.stringify({ at: debugStep, redirectTo }));

    // DEBUG: log computed values
    console.log(JSON.stringify({
      at: "create-invite:pre-email",
      team_id,
      normalizedEmail,
      team_name,
      inviter_name,
      redirectTo,
      hasToken: Boolean(token),
      env: {
        hasUrl: Boolean(SUPABASE_URL),
        hasAnon: Boolean(ANON_KEY),
        hasService: Boolean(SERVICE_ROLE),
        hasSite: Boolean(SITE_URL),
      }
    }));

    // 7) Send invite email via Resend only (all invitees already have accounts)
    if (!team) {
      return new Response("Team not found", { status: 404, headers: corsHeaders });
    }

    let emailSent = false;
    let emailReason = "";
    if (resend) {
      try {
        const result = await resend.emails.send({
          from: RESEND_FROM,
          to: [normalizedEmail],
          subject: `${inviter_name} invited you to join ${team_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
              <h2>You’re invited to join <strong>${team_name}</strong></h2>
              <p>${inviter_name} has invited you to collaborate in Coro.</p>
              <p>
                <a href="${redirectTo}" style="display:inline-block;padding:10px 16px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none">
                  Accept invite
                </a>
              </p>
              <p>If the button doesn’t work, copy and paste this URL:</p>
              <p><a href="${redirectTo}">${redirectTo}</a></p>
            </div>
          `,
        });
        emailSent = Boolean(result?.id || result?.data?.id || true);
      } catch (e) {
        emailReason = e instanceof Error ? e.message : String(e);
        console.error("resend send error", e);
      }
    } else {
      emailReason = "resend_not_configured";
    }

    return new Response(
      JSON.stringify({ ok: true, accept_url: redirectTo, email_sent: emailSent, email_reason: emailReason }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("create-invite error", { step: debugStep, error: msg });
    return new Response(`Internal Error at ${debugStep}: ${msg || "unknown"}`, { status: 500, headers: corsHeaders });
  }
});
