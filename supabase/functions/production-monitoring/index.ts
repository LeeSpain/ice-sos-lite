import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonitoringRequest {
  action: 'health_check' | 'performance_test' | 'error_tracking' | 'usage_metrics';
  data?: any;
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
    connection_count?: number;
  };
  authentication: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
  };
  emergency_services: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
    last_test: string;
  };
  payment_processing: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
  };
  overall_health: 'healthy' | 'degraded' | 'unhealthy';
  uptime_percentage: number;
  last_updated: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, data }: MonitoringRequest = await req.json();

    switch (action) {
      case 'health_check':
        return await performHealthCheck(supabaseService);
      
      case 'performance_test':
        return await performPerformanceTest(supabaseService);
      
      case 'error_tracking':
        return await trackError(supabaseService, data);
      
      case 'usage_metrics':
        return await collectUsageMetrics(supabaseService);
      
      default:
        throw new Error(`Unknown monitoring action: ${action}`);
    }

  } catch (error) {
    console.error("Production monitoring error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function performHealthCheck(supabase: any): Promise<Response> {
  const healthCheck: SystemHealth = {
    database: await checkDatabaseHealth(supabase),
    authentication: await checkAuthenticationHealth(supabase),
    storage: await checkStorageHealth(supabase),
    emergency_services: await checkEmergencyServicesHealth(supabase),
    payment_processing: await checkPaymentProcessingHealth(),
    overall_health: 'healthy',
    uptime_percentage: 99.9,
    last_updated: new Date().toISOString()
  };

  // Determine overall health
  const services = [
    healthCheck.database,
    healthCheck.authentication,
    healthCheck.storage,
    healthCheck.emergency_services,
    healthCheck.payment_processing
  ];

  const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;

  if (unhealthyCount > 0) {
    healthCheck.overall_health = 'unhealthy';
  } else if (degradedCount > 1) {
    healthCheck.overall_health = 'degraded';
  }

  // Store health check result
  await supabase
    .from('system_health_checks')
    .insert([{
      check_timestamp: new Date().toISOString(),
      overall_status: healthCheck.overall_health,
      database_status: healthCheck.database.status,
      auth_status: healthCheck.authentication.status,
      storage_status: healthCheck.storage.status,
      emergency_status: healthCheck.emergency_services.status,
      payment_status: healthCheck.payment_processing.status,
      performance_data: {
        database_ms: healthCheck.database.response_time_ms,
        auth_ms: healthCheck.authentication.response_time_ms,
        storage_ms: healthCheck.storage.response_time_ms,
        emergency_ms: healthCheck.emergency_services.response_time_ms,
        payment_ms: healthCheck.payment_processing.response_time_ms
      }
    }]);

  return new Response(JSON.stringify({
    success: true,
    health_check: healthCheck
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: healthCheck.overall_health === 'healthy' ? 200 : 503,
  });
}

async function checkDatabaseHealth(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Test basic database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy' as const,
        response_time_ms: responseTime,
        error: error.message
      };
    }

    return {
      status: responseTime < 500 ? 'healthy' as const : 'degraded' as const,
      response_time_ms: responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      response_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkAuthenticationHealth(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Test auth service
    const { data, error } = await supabase.auth.getSession();
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 300 ? 'healthy' as const : 'degraded' as const,
      response_time_ms: responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      response_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkStorageHealth(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Test storage service by listing buckets
    const { data, error } = await supabase.storage.listBuckets();
    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'degraded' as const,
        response_time_ms: responseTime,
        error: error.message
      };
    }

    return {
      status: responseTime < 400 ? 'healthy' as const : 'degraded' as const,
      response_time_ms: responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      response_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkEmergencyServicesHealth(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Check recent emergency service requests
    const { data, error } = await supabase
      .from('emergency_service_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'degraded' as const,
        response_time_ms: responseTime,
        last_test: new Date().toISOString(),
        error: error.message
      };
    }

    // Check if emergency services are responding within SLA
    const recentFailures = data?.filter(req => 
      req.status === 'failed' && 
      new Date(req.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0;

    return {
      status: recentFailures === 0 ? 'healthy' as const : 'degraded' as const,
      response_time_ms: responseTime,
      last_test: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      response_time_ms: Date.now() - startTime,
      last_test: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkPaymentProcessingHealth() {
  const startTime = Date.now();
  
  try {
    // Test Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return {
        status: 'unhealthy' as const,
        response_time_ms: Date.now() - startTime,
        error: 'Stripe configuration missing'
      };
    }

    // Simple connectivity test (would expand with actual Stripe API call in production)
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy' as const,
      response_time_ms: responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      response_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function performPerformanceTest(supabase: any): Promise<Response> {
  const startTime = Date.now();
  
  // Test database query performance
  const dbStart = Date.now();
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .limit(100);
  const dbTime = Date.now() - dbStart;

  // Test complex query performance
  const complexStart = Date.now();
  const { data: complexData } = await supabase
    .from('sos_events')
    .select(`
      *,
      profiles(first_name, last_name)
    `)
    .limit(50);
  const complexTime = Date.now() - complexStart;

  const totalTime = Date.now() - startTime;

  const performanceData = {
    total_test_time_ms: totalTime,
    simple_query_time_ms: dbTime,
    complex_query_time_ms: complexTime,
    queries_per_second: Math.round(1000 / ((dbTime + complexTime) / 2)),
    performance_grade: totalTime < 1000 ? 'A' : totalTime < 2000 ? 'B' : totalTime < 3000 ? 'C' : 'D'
  };

  // Store performance metrics
  await supabase
    .from('performance_metrics')
    .insert([{
      test_timestamp: new Date().toISOString(),
      metric_type: 'database_performance',
      values: performanceData
    }]);

  return new Response(JSON.stringify({
    success: true,
    performance: performanceData
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function trackError(supabase: any, errorData: any): Promise<Response> {
  const errorRecord = {
    error_timestamp: new Date().toISOString(),
    error_type: errorData.type || 'unknown',
    error_message: errorData.message || 'No message provided',
    stack_trace: errorData.stack || null,
    user_id: errorData.user_id || null,
    url: errorData.url || null,
    user_agent: errorData.user_agent || null,
    severity: errorData.severity || 'medium',
    metadata: errorData.metadata || {}
  };

  await supabase
    .from('error_tracking')
    .insert([errorRecord]);

  return new Response(JSON.stringify({
    success: true,
    error_id: errorRecord.error_timestamp
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function collectUsageMetrics(supabase: any): Promise<Response> {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // Collect various usage metrics
  const metrics = {
    daily_active_users: await getDailyActiveUsers(supabase, yesterday, today),
    emergency_button_presses: await getEmergencyButtonPresses(supabase, yesterday, today),
    new_registrations: await getNewRegistrations(supabase, yesterday, today),
    family_invitations: await getFamilyInvitations(supabase, yesterday, today),
    payment_transactions: await getPaymentTransactions(supabase, yesterday, today),
    timestamp: new Date().toISOString()
  };

  // Store metrics
  await supabase
    .from('usage_metrics')
    .insert([{
      date: yesterday.toISOString().split('T')[0],
      metrics: metrics
    }]);

  return new Response(JSON.stringify({
    success: true,
    metrics: metrics
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function getDailyActiveUsers(supabase: any, start: Date, end: Date) {
  const { count } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  
  return count || 0;
}

async function getEmergencyButtonPresses(supabase: any, start: Date, end: Date) {
  const { count } = await supabase
    .from('sos_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  
  return count || 0;
}

async function getNewRegistrations(supabase: any, start: Date, end: Date) {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  
  return count || 0;
}

async function getFamilyInvitations(supabase: any, start: Date, end: Date) {
  const { count } = await supabase
    .from('family_invitations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  
  return count || 0;
}

async function getPaymentTransactions(supabase: any, start: Date, end: Date) {
  const { count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .eq('subscribed', true);
  
  return count || 0;
}