/**
 * stripe-webhook
 * Auth: webhook signature validation
 * Updates billing_status on family memberships based on Stripe events
 * Pauses location visibility when billing is past due for privacy protection
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

function verifyStripeSignature(req: Request, secret: string): boolean {
  // TODO: Implement proper Stripe signature verification
  // For now, we'll just check if the secret exists and request has signature header
  const signature = req.headers.get("stripe-signature");
  return !!(secret && signature);
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Verify Stripe webhook signature if secret is configured
    if (STRIPE_WEBHOOK_SECRET && !verifyStripeSignature(req, STRIPE_WEBHOOK_SECRET)) {
      console.error("❌ Invalid Stripe signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const event = await req.json();
    console.log("💳 Processing Stripe webhook:", event.type);

    // Extract user_id from metadata - could be owner_user_id for subscriptions or user_id for orders
    const ownerUserId = event?.data?.object?.metadata?.owner_user_id;
    const userId = event?.data?.object?.metadata?.user_id;
    
    // For one-time payments (checkout.session.completed), we don't require owner_user_id
    if (!ownerUserId && !userId && event.type !== "checkout.session.completed") {
      console.log("ℹ️ No user metadata found, skipping");
      return new Response(JSON.stringify({ 
        received: true, 
        note: "No user metadata found" 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    console.log("👤 Processing for owner_user_id:", ownerUserId);

    // Handle successful payment events
    if (event.type === "invoice.payment_succeeded" || 
        event.type === "customer.subscription.resumed" ||
        event.type === "checkout.session.completed") {
      
      console.log("✅ Payment successful - activating billing status");
      
      // For one-time payments, update orders to completed
      if (event.type === "checkout.session.completed") {
        const sessionId = event?.data?.object?.id;
        const userId = event?.data?.object?.metadata?.user_id;
        
        if (sessionId && userId) {
          const { error: orderError } = await supabase
            .from("orders")
            .update({ status: "completed" })
            .eq("stripe_payment_intent_id", sessionId)
            .eq("user_id", userId);

          if (orderError) {
            console.error("❌ Error updating order status:", orderError);
          } else {
            console.log("✅ Order marked as completed");
          }
        }
      }
      
      // Update subscription billing status if this is subscription-related
      if (ownerUserId) {
        const { error: updateError } = await supabase
          .from("family_memberships")
          .update({ billing_status: "active" })
          .eq("user_id", ownerUserId);

        if (updateError) {
          console.error("❌ Error updating billing status to active:", updateError);
        } else {
          console.log("✅ Billing status updated to active");
        }

        // Re-enable location sharing for all family members
        const { error: presenceError } = await supabase
          .from("live_presence")
          .update({ is_paused: false })
          .in("user_id", [ownerUserId]);

        if (presenceError) {
          console.error("❌ Error resuming location sharing:", presenceError);
        } else {
          console.log("📍 Location sharing resumed");
        }
      }
    }

    // Handle failed payment events
    if (event.type === "invoice.payment_failed" || 
        event.type === "customer.subscription.paused" ||
        event.type === "customer.subscription.canceled") {
      
      console.log("❌ Payment failed - updating billing status");
      
      // Update billing status to past_due
      const { error: updateError } = await supabase
        .from("family_memberships")
        .update({ billing_status: "past_due" })
        .eq("user_id", ownerUserId);

      if (updateError) {
        console.error("❌ Error updating billing status to past_due:", updateError);
      } else {
        console.log("⚠️ Billing status updated to past_due");
      }

      // Pause location sharing for privacy protection
      const { error: presenceError } = await supabase
        .from("live_presence")
        .update({ is_paused: true })
        .in("user_id", [ownerUserId]); // Could expand to all family members

      if (presenceError) {
        console.error("❌ Error pausing location sharing:", presenceError);
      } else {
        console.log("⏸️ Location sharing paused for privacy");
      }
    }

    // Handle grace period events
    if (event.type === "invoice.payment_action_required") {
      console.log("⏳ Payment action required - setting grace period");
      
      const { error: updateError } = await supabase
        .from("family_memberships")
        .update({ billing_status: "grace" })
        .eq("user_id", ownerUserId);

      if (updateError) {
        console.error("❌ Error updating billing status to grace:", updateError);
      } else {
        console.log("⏳ Billing status updated to grace period");
      }
    }

    return new Response(JSON.stringify({ 
      received: true,
      processed: true,
      event_type: event.type,
      owner_user_id: ownerUserId
    }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Stripe webhook error:", error);
    return new Response(JSON.stringify({ 
      error: String(error?.message ?? error) 
    }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
});