import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { owner_id, type, invite_email, relationship, escalation_priority = 3, notify_channels = ['app'], preferred_language = 'en' } = await req.json();

    // Validate input
    if (!owner_id || !type || !invite_email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is the owner
    if (user.id !== owner_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Can only create connections for yourself' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check Spain rule before creating connection
    const { data: profile } = await supabaseServiceClient
      .from('profiles')
      .select('country_code, subscription_regional')
      .eq('user_id', owner_id)
      .single();

    // Generate invite token
    const invite_token = crypto.randomUUID();

    // Create connection
    const { data: connection, error: connectionError } = await supabaseServiceClient
      .from('connections')
      .insert({
        owner_id,
        invite_email,
        type,
        relationship,
        escalation_priority,
        notify_channels,
        preferred_language,
        invite_token,
        invited_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (connectionError) {
      console.error('Error creating connection:', connectionError);
      return new Response(JSON.stringify({ error: 'Failed to create connection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send invitation email
    const inviteUrl = `${Deno.env.get('APP_URL')}/invite/accept?token=${invite_token}`;
    
    // TODO: Send actual email via Resend or your email provider
    console.log(`Invitation sent to ${invite_email}: ${inviteUrl}`);

    return new Response(JSON.stringify({ 
      success: true, 
      connection,
      invite_url: inviteUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in connections-invite:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});