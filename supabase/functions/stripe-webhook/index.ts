import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function statusToPlan(status: string): { plan: "pro" | "free"; normalized: string } {
  const normalized = String(status || "").toLowerCase();
  const pro = new Set(["active", "trialing"]);
  return { plan: pro.has(normalized) ? "pro" : "free", normalized };
}

async function getProfileByCustomerId(
  supabaseAdmin: ReturnType<typeof createClient>,
  customerId: string
) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data || null;
}

async function updateProfile(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  patch: Record<string, unknown>
) {
  return supabaseAdmin
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const WHSEC = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""; // Dashboard secret
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !WHSEC) {
    console.error("[webhook] missing server env");
    return json({ error: "Server misconfigured" }, 500);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return json({ error: "Missing stripe-signature" }, 400);

    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, sig, WHSEC);

    console.log(`[stripe] ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id as string | undefined;
        const customerId = (session.customer as string) || null;
        const subscriptionId = (session.subscription as string) || null;

        if (userId) {
          await updateProfile(supabaseAdmin, userId, {
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            subscription_status: subscriptionId ? "active" : "incomplete",
            plan: subscriptionId ? "pro" : "free",
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const profile = await getProfileByCustomerId(supabaseAdmin, customerId);
        if (profile) {
          const { plan, normalized } = statusToPlan(sub.status || "");
          await updateProfile(supabaseAdmin, profile.user_id, {
            subscription_id: sub.id,
            subscription_status: normalized,
            plan,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const profile = await getProfileByCustomerId(supabaseAdmin, customerId);
        if (profile) {
          await updateProfile(supabaseAdmin, profile.user_id, {
            subscription_id: null,
            subscription_status: "canceled",
            plan: "free",
          });
        }
        break;
      }

      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        const profile = await getProfileByCustomerId(supabaseAdmin, customer.id);
        if (profile) {
          await updateProfile(supabaseAdmin, profile.user_id, {
            subscription_id: null,
            subscription_status: "canceled",
            plan: "free",
            stripe_customer_id: null,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const profile = await getProfileByCustomerId(supabaseAdmin, customerId);
        if (profile) {
          await updateProfile(supabaseAdmin, profile.user_id, {
            subscription_status: "active",
            plan: "pro",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const profile = await getProfileByCustomerId(supabaseAdmin, customerId);
        if (profile) {
          await updateProfile(supabaseAdmin, profile.user_id, {
            subscription_status: "past_due",
          });
        }
        break;
      }

      default:
        break;
    }

    return json({ received: true }, 200);
  } catch (err: any) {
    console.error("Webhook error:", err);
    return json({ error: err?.message ?? "unknown" }, 400);
  }
});
