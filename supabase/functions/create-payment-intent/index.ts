import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { plans, email, firstName, lastName } = await req.json();
    
    if (!email) {
      throw new Error("Email is required for payment processing");
    }
    
    logStep("Request data received", { email, firstName, lastName, plans });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create customer
      const customer = await stripe.customers.create({
        email: email,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Plan pricing mapping
    const planPricing = {
      "personal": { name: "Personal Account", amount: 199 },
      "guardian": { name: "Guardian Wellness", amount: 499 },
      "family": { name: "Family Sharing", amount: 99 },
      "callcenter": { name: "Call Centre (Spain)", amount: 2499 }
    };

    // Calculate total amount
    const totalAmount = plans.reduce((total: number, planId: string) => {
      const plan = planPricing[planId as keyof typeof planPricing];
      return total + (plan?.amount || 0);
    }, 0);

    logStep("Calculated total", { plans, totalAmount });

    // Create payment intent for the total amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "eur",
      customer: customerId,
      metadata: {
        email: email,
        plans: plans.join(","),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Payment intent created", { paymentIntentId: paymentIntent.id });

    return new Response(JSON.stringify({ 
      client_secret: paymentIntent.client_secret,
      customer_id: customerId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment-intent", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});