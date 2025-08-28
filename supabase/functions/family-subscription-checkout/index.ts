import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FAMILY-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  email: string;
  billing_type: 'owner' | 'self';
  invite_token?: string;
  seat_quantity?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Creating family subscription checkout");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { email, billing_type, invite_token, seat_quantity = 1 }: CheckoutRequest = await req.json();

    logStep("Processing checkout request", { email, billing_type, invite_token, seat_quantity });

    // Validate invite token if provided
    let familyInvite = null;
    if (invite_token) {
      const { data: invite, error: inviteError } = await supabaseClient
        .from('family_invites')
        .select('*')
        .eq('token', invite_token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        throw new Error('Invalid or expired invite token');
      }
      familyInvite = invite;
      logStep("Validated family invite", { inviteId: invite.id });
    }

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    logStep("Customer resolved", { customerId });

    // Get Family Seat price ID (should be created by setup-family-stripe-products)
    const prices = await stripe.prices.list({
      limit: 10,
      active: true,
    });

    const familySeatPrice = prices.data.find(price => 
      price.metadata?.type === "family_seat_monthly"
    );

    if (!familySeatPrice) {
      throw new Error("Family seat pricing not configured. Please run setup-family-stripe-products first.");
    }

    logStep("Found family seat price", { priceId: familySeatPrice.id });

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: familySeatPrice.id,
          quantity: seat_quantity,
        },
      ],
      success_url: `${req.headers.get("origin")}/family-checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/family-checkout-canceled`,
      metadata: {
        billing_type,
        invite_token: invite_token || "",
        email,
      },
      subscription_data: {
        metadata: {
          billing_type,
          invite_token: invite_token || "",
          email,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR creating family checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});