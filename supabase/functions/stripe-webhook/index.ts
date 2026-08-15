// Supabase Edge Function: stripe-webhook
// Securely verifies Stripe webhook signature and activates Lifetime Pro in Supabase database

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.19.0?target=deno';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!signature || !stripeWebhookSecret || !stripeSecretKey) {
    console.error('Missing signature or Stripe configuration secrets');
    return new Response('Configuration error', { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    // Cryptographically verify webhook authenticity
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received verified event: ${event.type} [${event.id}]`);

  // Handle successful checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id || session.client_reference_id;

    if (!userId) {
      console.error('No user_id found in Stripe Checkout session metadata');
      return new Response('User ID missing from session metadata', { status: 400 });
    }

    // Initialize Supabase admin client with service_role key to bypass RLS and grant entitlement
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error: dbError } = await supabaseAdmin
      .from('entitlements')
      .upsert(
        {
          user_id: userId,
          plan: 'lifetime',
          status: 'active',
          purchased_at: new Date().toISOString(),
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
          stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,plan' }
      );

    if (dbError) {
      console.error('Failed to grant Lifetime Pro entitlement:', dbError);
      return new Response('Database error granting entitlement', { status: 500 });
    }

    console.log(`[Stripe Webhook] ✅ Lifetime Pro successfully granted to user: ${userId}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
