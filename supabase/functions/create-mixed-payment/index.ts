import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MIXED-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { subscriptionPlans, products, regionalServices, email, firstName, lastName } = await req.json();
    
    if (!email) {
      throw new Error("Email is required for payment processing");
    }
    
    logStep("Request data received", { email, firstName, lastName, subscriptionPlans, products, regionalServices });

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

    // Fetch subscription plans from database
    let subscriptionTotal = 0;
    const allSubscriptionPlans = [...(subscriptionPlans || []), ...(regionalServices || [])];
    
    if (allSubscriptionPlans.length > 0) {
      const { data: dbPlans, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('id, name, price, currency')
        .in('id', subscriptionPlans || []);

      if (planError) throw new Error(`Error fetching subscription plans: ${planError.message}`);
      
      subscriptionTotal = (dbPlans || []).reduce((total, plan) => {
        return total + Math.round(parseFloat(plan.price.toString()) * 100); // Convert to cents
      }, 0);

      // Fetch regional services if any
      if (regionalServices && regionalServices.length > 0) {
        const { data: dbServices, error: serviceError } = await supabaseClient
          .from('regional_services')
          .select('id, name, price, currency')
          .in('id', regionalServices);

        if (serviceError) throw new Error(`Error fetching regional services: ${serviceError.message}`);
        
        subscriptionTotal += (dbServices || []).reduce((total, service) => {
          return total + Math.round(parseFloat(service.price.toString()) * 100); // Convert to cents
        }, 0);
      }
    }

    // Fetch products from database for one-time purchases
    let productTotal = 0;
    if (products && products.length > 0) {
      const { data: dbProducts, error: productError } = await supabaseClient
        .from('products')
        .select('id, name, price, currency')
        .in('id', products);

      if (productError) throw new Error(`Error fetching products: ${productError.message}`);
      
      productTotal = (dbProducts || []).reduce((total, product) => {
        return total + Math.round(parseFloat(product.price.toString()) * 100); // Convert to cents
      }, 0);
    }

    const totalAmount = subscriptionTotal + productTotal;
    
    if (totalAmount === 0) {
      throw new Error("No valid items selected for payment");
    }

    logStep("Calculated totals", { subscriptionTotal, productTotal, totalAmount });

    // Create payment intent for the total amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur', // Default currency
      customer: customerId,
      metadata: {
        email: email,
        subscription_plans: JSON.stringify(subscriptionPlans || []),
        products: JSON.stringify(products || []),
        regional_services: JSON.stringify(regionalServices || []),
        subscription_amount: subscriptionTotal.toString(),
        product_amount: productTotal.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Payment intent created", { paymentIntentId: paymentIntent.id });

    return new Response(JSON.stringify({ 
      client_secret: paymentIntent.client_secret,
      customer_id: customerId,
      subscription_total: subscriptionTotal / 100,
      product_total: productTotal / 100,
      total_amount: totalAmount / 100
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-mixed-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});