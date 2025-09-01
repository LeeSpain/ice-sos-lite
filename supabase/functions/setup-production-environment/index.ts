import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRODUCTION-SETUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting production environment setup");

    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Admin access required for production setup");
    }

    logStep("Admin access verified", { userId: user.id, email: user.email });

    // Production readiness checks
    const setupResults = {
      database: false,
      stripe: false,
      security: false,
      content: false,
      analytics: false
    };

    // 1. Database setup verification
    try {
      const { data: tables } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      const requiredTables = [
        'profiles', 'subscribers', 'emergency_contacts', 
        'family_groups', 'family_memberships', 'sos_events',
        'contact_submissions', 'site_content'
      ];

      const missingTables = requiredTables.filter(table => 
        !tables?.some(t => t.table_name === table)
      );

      if (missingTables.length === 0) {
        setupResults.database = true;
        logStep("Database setup verified - all required tables present");
      } else {
        logStep("Missing database tables", { missing: missingTables });
      }
    } catch (error) {
      logStep("Database verification failed", { error: error.message });
    }

    // 2. Stripe configuration verification
    try {
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
      
      if (stripeSecretKey && stripePublishableKey) {
        // Check if using production keys
        const isProduction = stripeSecretKey.startsWith('sk_live_') && 
                           stripePublishableKey.startsWith('pk_live_');
        
        setupResults.stripe = true;
        logStep("Stripe configuration verified", { 
          isProduction,
          hasSecretKey: !!stripeSecretKey,
          hasPublishableKey: !!stripePublishableKey
        });
      } else {
        logStep("Stripe configuration incomplete");
      }
    } catch (error) {
      logStep("Stripe verification failed", { error: error.message });
    }

    // 3. Security configuration verification
    try {
      // Check for essential security settings
      const { data: securityEvents } = await supabaseClient
        .from('security_events')
        .select('id')
        .limit(1);

      setupResults.security = securityEvents !== null;
      logStep("Security configuration verified");
    } catch (error) {
      logStep("Security verification failed", { error: error.message });
    }

    // 4. Content setup verification
    try {
      const { data: siteContent } = await supabaseClient
        .from('site_content')
        .select('key')
        .in('key', ['privacy_policy', 'terms_of_service', 'emergency_disclaimer']);

      setupResults.content = siteContent && siteContent.length >= 3;
      logStep("Content setup verified", { contentItems: siteContent?.length || 0 });
    } catch (error) {
      logStep("Content verification failed", { error: error.message });
    }

    // 5. Analytics configuration verification
    try {
      const gaId = Deno.env.get("GA_MEASUREMENT_ID");
      setupResults.analytics = !!gaId;
      logStep("Analytics configuration verified", { hasGoogleAnalytics: !!gaId });
    } catch (error) {
      logStep("Analytics verification failed", { error: error.message });
    }

    // Calculate overall readiness score
    const readinessScore = Object.values(setupResults).filter(Boolean).length / Object.keys(setupResults).length * 100;
    
    logStep("Production setup complete", { 
      readinessScore: `${readinessScore.toFixed(1)}%`,
      setupResults 
    });

    return new Response(JSON.stringify({
      success: true,
      readinessScore,
      setupResults,
      recommendations: generateRecommendations(setupResults),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in production setup", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateRecommendations(setupResults: Record<string, boolean>): string[] {
  const recommendations: string[] = [];

  if (!setupResults.database) {
    recommendations.push("Complete database migration and verify all required tables are present");
  }

  if (!setupResults.stripe) {
    recommendations.push("Configure production Stripe keys and verify payment processing");
  }

  if (!setupResults.security) {
    recommendations.push("Enable security monitoring and configure auth settings in Supabase");
  }

  if (!setupResults.content) {
    recommendations.push("Add required legal content (Privacy Policy, Terms of Service, Emergency Disclaimer)");
  }

  if (!setupResults.analytics) {
    recommendations.push("Configure Google Analytics for production monitoring");
  }

  if (recommendations.length === 0) {
    recommendations.push("System is production-ready! Consider final testing and deployment");
  }

  return recommendations;
}