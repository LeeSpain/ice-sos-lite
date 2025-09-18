/**
 * get-received-revenue
 * Auth: Admin only
 * Returns ACTUAL received revenue based on Stripe paid invoices and paid/completed orders
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanAgg { count: number; revenue: number; }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    // Orders (product sales) actually received
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['paid', 'completed'])
      .order('created_at', { ascending: false });
    if (ordersError) console.error('Error fetching orders:', ordersError);
    const productReceived = (orders || []).reduce((sum, o: any) => sum + (Number(o.total_price) || 0), 0);

    // Stripe invoices: actually paid subscription revenue
    let subscriptionReceived = 0;
    let invoiceCount = 0;
    const planBreakdown: Record<string, PlanAgg> = {};

    if (STRIPE_SECRET_KEY) {
      const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
      const params = new URLSearchParams({ status: 'paid', limit: '100', 'created[gte]': String(oneYearAgo), 'expand[]': 'data.lines' });
      const resp = await fetch(`https://api.stripe.com/v1/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Stripe invoice fetch failed:', errText);
      } else {
        const json: any = await resp.json();
        const invoices: any[] = json?.data || [];
        invoiceCount = invoices.length;
        invoices.forEach((inv) => {
          const paid = Number(inv.amount_paid || 0) / 100; // to EUR assuming account currency
          subscriptionReceived += paid;
          const lines: any[] = inv?.lines?.data || [];
          if (lines.length > 0) {
            lines.forEach((line) => {
              const nickname = line?.plan?.nickname || line?.price?.nickname || line?.price?.lookup_key || 'Subscription';
              const lineTotal = Number(line?.amount || 0) / 100;
              if (!planBreakdown[nickname]) planBreakdown[nickname] = { count: 0, revenue: 0 };
              planBreakdown[nickname].count += 1;
              planBreakdown[nickname].revenue += lineTotal;
            });
          } else {
            if (!planBreakdown['Subscription']) planBreakdown['Subscription'] = { count: 0, revenue: 0 };
            planBreakdown['Subscription'].count += 1;
            planBreakdown['Subscription'].revenue += paid;
          }
        });
      }
    } else {
      console.warn('STRIPE_SECRET_KEY not configured; subscriptionReceived will be 0');
    }

    const totalReceived = productReceived + subscriptionReceived;

    return new Response(JSON.stringify({
      success: true,
      metrics: {
        totalRevenue: totalReceived,
        productRevenue: productReceived,
        subscriptionRevenue: subscriptionReceived,
        invoices: invoiceCount,
        timeWindowDays: 365
      },
      orders: (orders || []).filter((o: any) => ['paid', 'completed'].includes(o.status)),
      planBreakdown,
    }), { headers: { ...corsHeaders, 'content-type': 'application/json' } });

  } catch (error: any) {
    console.error('get-received-revenue error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    });
  }
});
