import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-MIXED-PAYMENT] ${step}${detailsStr}`);
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

    const { payment_intent_id, customer_id } = await req.json();
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Verify payment intent is succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }
    logStep("Payment verified", { paymentIntentId: payment_intent_id, status: paymentIntent.status });

    // Extract metadata from payment intent
    const subscriptionPlans = JSON.parse(paymentIntent.metadata.subscription_plans || '[]');
    const products = JSON.parse(paymentIntent.metadata.products || '[]');
    const regionalServices = JSON.parse(paymentIntent.metadata.regional_services || '[]');
    const subscriptionData = JSON.parse(paymentIntent.metadata.subscription_data || '[]');
    const productData = JSON.parse(paymentIntent.metadata.product_data || '[]');
    const regionalData = JSON.parse(paymentIntent.metadata.regional_data || '[]');
    const subscriptionAmount = parseFloat(paymentIntent.metadata.subscription_amount || '0');
    const productAmount = parseFloat(paymentIntent.metadata.product_amount || '0');
    const regionalAmount = parseFloat(paymentIntent.metadata.regional_amount || '0');

    logStep("Extracted payment metadata", { 
      subscriptionPlans, products, regionalServices, 
      subscriptionAmount, productAmount, regionalAmount 
    });

    // Process subscriptions if any
    let subscriptions = [];
    let allSubscriptionData: any[] = [];
    
    // Fetch subscription plan details by IDs from metadata
    if (subscriptionPlans && subscriptionPlans.length > 0) {
      const { data: dbPlans, error: plansError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .in('id', subscriptionPlans);
      if (plansError) throw new Error(`Error fetching subscription plans: ${plansError.message}`);
      allSubscriptionData = allSubscriptionData.concat(dbPlans || []);
    }

    // Fetch regional service details by IDs from metadata
    if (regionalServices && regionalServices.length > 0) {
      const { data: dbServices, error: servicesError } = await supabaseClient
        .from('regional_services')
        .select('*')
        .in('id', regionalServices);
      if (servicesError) throw new Error(`Error fetching regional services: ${servicesError.message}`);
      allSubscriptionData = allSubscriptionData.concat(dbServices || []);
    }
    
    if (allSubscriptionData.length > 0) {
      // Create subscriptions for each plan/service using their database data
      for (const item of allSubscriptionData) {
        // Create a price for this plan/service
        const price = await stripe.prices.create({
          currency: (item.currency || "EUR").toLowerCase(),
          unit_amount: Math.round(parseFloat(item.price.toString()) * 100),
          recurring: { interval: "month" },
          product_data: { name: item.name },
        });

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer_id,
          items: [{ price: price.id }],
          payment_behavior: "default_incomplete",
          payment_settings: { save_default_payment_method: "on_subscription" },
          expand: ["latest_invoice.payment_intent"],
        });

        subscriptions.push(subscription);
        logStep("Created subscription", { itemId: item.id, subscriptionId: subscription.id });
      }

      // Update subscriber record
      const subscriptionTiers = allSubscriptionData.map((item: any) => item.name).join(", ");

      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customer_id,
        subscribed: true,
        subscription_tier: subscriptionTiers,
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      logStep("Updated subscriber record", { subscribed: true, tiers: subscriptionTiers });
    }

    // Process one-time product purchases if any
    let orders = [];
    if (products && products.length > 0) {
      // Fetch product data from database
      const { data: dbProducts, error: productError } = await supabaseClient
        .from('products')
        .select('*')
        .in('id', products);

      if (productError) throw new Error(`Error fetching products: ${productError.message}`);

      // Create order records for each product
      for (const product of dbProducts || []) {
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
            unit_price: parseFloat(product.price.toString()),
            total_price: parseFloat(product.price.toString()),
            currency: product.currency,
            stripe_payment_intent_id: payment_intent_id,
            status: 'paid',
          })
          .select()
          .single();

        if (orderError) {
          logStep("Error creating order", { productId: product.id, error: orderError });
        } else {
          orders.push(order);
          logStep("Created order", { productId: product.id, orderId: order.id });
        }
      }
    }

    // Save registration selections with correct amounts
    await supabaseClient.from('registration_selections').insert({
      user_id: user.id,
      session_id: paymentIntent.id,
      subscription_plans: subscriptionPlans,
      selected_products: products,
      selected_regional_services: regionalServices,
      total_subscription_amount: subscriptionAmount + regionalAmount,
      total_product_amount: productAmount,
      currency: paymentIntent.metadata.payment_currency || 'EUR',
      registration_completed: true,
    });

    logStep("Saved registration selections");

    return new Response(JSON.stringify({ 
      success: true,
      subscriptions: subscriptions.map(sub => ({ id: sub.id, status: sub.status })),
      orders: orders.map(order => ({ id: order.id, status: order.status })),
      subscription_count: subscriptions.length,
      order_count: orders.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-mixed-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});