// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for Lifetime Pro ($4.99 one-time payment)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.19.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const appUrl = Deno.env.get('APP_URL') || 'https://drivelog-app.vercel.app';

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Stripe secret key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user identity with Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create a 1-time Stripe Checkout Session for Lifetime Pro ($4.99 USD)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment (NOT subscription)
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan: 'lifetime',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 499, // $4.99 in cents
            product_data: {
              name: 'DriveLog Lifetime Pro',
              description: 'Unlimited practice hours tracking, DMV PDF exports, multi-driver backup & no ads.',
              images: ['https://drivelog-app.vercel.app/pwa-512x512.png'],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings?payment=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
