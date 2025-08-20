import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Received webhook event:', event.type);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? "",
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        
        if (userId && session.subscription) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_id: session.subscription as string,
              subscription_status: 'active',
              plan: 'pro',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          
          console.log('Updated user subscription status to active');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const plan = subscription.status === 'active' ? 'pro' : 'free';
          
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              plan,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.user_id);
          
          console.log(`Updated subscription status: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_id: null,
              subscription_status: 'canceled',
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.user_id);
          
          console.log('Subscription canceled, updated user to free plan');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'active',
                plan: 'pro',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', profile.user_id);
            
            console.log('Payment succeeded, subscription active');
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', profile.user_id);
            
            console.log('Payment failed, subscription past due');
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});