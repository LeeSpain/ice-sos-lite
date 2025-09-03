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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Invalid invitation link', { status: 400 });
    }

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get connection by invite token
    const { data: connection, error: connectionError } = await supabaseServiceClient
      .from('connections')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (connectionError || !connection) {
      return new Response('Invalid or expired invitation', { status: 404 });
    }

    // Check if user is authenticated
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      user = authUser;
    }

    // If POST request, accept the invitation
    if (req.method === 'POST') {
      if (!user) {
        return new Response(JSON.stringify({ error: 'Must be logged in to accept invitation' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update connection with user ID and set as active
      const { data: updatedConnection, error: updateError } = await supabaseServiceClient
        .from('connections')
        .update({
          contact_user_id: user.id,
          status: 'active',
          accepted_at: new Date().toISOString()
        })
        .eq('id', connection.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error accepting invitation:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to accept invitation' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create circle permissions if this is a family circle invitation
      if (connection.type === 'family_circle') {
        await supabaseServiceClient
          .from('circle_permissions')
          .insert({
            owner_id: connection.owner_id,
            family_user_id: user.id,
            can_view_history: true,
            can_view_devices: true,
            can_view_location: true
          });
      }

      return new Response(JSON.stringify({ 
        success: true,
        connection: updatedConnection,
        redirect_url: connection.type === 'family_circle' ? '/family-dashboard' : '/dashboard'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET request - return invitation details
    return new Response(JSON.stringify({
      valid: true,
      connection: {
        type: connection.type,
        relationship: connection.relationship,
        invite_email: connection.invite_email,
        invited_at: connection.invited_at
      },
      requires_auth: !user
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in connections-accept:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});