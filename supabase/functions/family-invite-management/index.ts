import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FAMILY-INVITE] ${step}${detailsStr}`);
};

interface InviteRequest {
  action: 'create' | 'accept' | 'revoke' | 'resend';
  name?: string;
  email?: string;
  phone?: string;
  billing_type?: 'owner' | 'self';
  token?: string;
  invite_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing family invite request");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { action, name, email, phone, billing_type, token: inviteToken, invite_id }: InviteRequest = await req.json();

    switch (action) {
      case 'create':
        return await createFamilyInvite(supabaseService, user, { name, email, phone, billing_type });
      
      case 'accept':
        return await acceptFamilyInvite(supabaseService, user, inviteToken);
      
      case 'revoke':
        return await revokeFamilyInvite(supabaseService, user, invite_id);
      
      case 'resend':
        return await resendFamilyInvite(supabaseService, user, invite_id);
      
      default:
        throw new Error(`Invalid action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing family invite", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function createFamilyInvite(
  supabase: any, 
  user: any, 
  { name, email, phone, billing_type }: { name?: string, email?: string, phone?: string, billing_type?: string }
) {
  logStep("Creating family invite", { name, email, phone, billing_type });

  if (!name || (!email && !phone)) {
    throw new Error("Name and either email or phone are required");
  }

  if (!billing_type || !['owner', 'self'].includes(billing_type)) {
    throw new Error("Valid billing_type (owner/self) is required");
  }

  // Get or create family group for the user
  let { data: familyGroup, error: groupError } = await supabase
    .from('family_groups')
    .select('*')
    .eq('owner_user_id', user.id)
    .single();

  if (groupError && groupError.code === 'PGRST116') {
    // Create family group if it doesn't exist
    const { data: newGroup, error: createError } = await supabase
      .from('family_groups')
      .insert([{
        owner_user_id: user.id,
        owner_seat_quota: 0
      }])
      .select()
      .single();

    if (createError) throw new Error(`Failed to create family group: ${createError.message}`);
    familyGroup = newGroup;
    logStep("Created new family group", { groupId: familyGroup.id });
  } else if (groupError) {
    throw new Error(`Failed to get family group: ${groupError.message}`);
  }

  // Check current family size (max 5 total contacts)
  const { count: contactCount, error: countError } = await supabase
    .from('emergency_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) throw new Error(`Failed to check contact count: ${countError.message}`);
  
  if (contactCount >= 5) {
    throw new Error("Maximum of 5 emergency contacts allowed");
  }

  // Generate invite token and expiry
  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours expiry

  // Create the invite
  const { data: invite, error: inviteError } = await supabase
    .from('family_invites')
    .insert([{
      group_id: familyGroup.id,
      email_or_phone: email || phone,
      name,
      phone,
      token: inviteToken,
      expires_at: expiresAt.toISOString(),
      billing_type
    }])
    .select()
    .single();

  if (inviteError) throw new Error(`Failed to create invite: ${inviteError.message}`);

  // If owner-paid, increment seat quota
  if (billing_type === 'owner') {
    const { error: quotaError } = await supabase
      .from('family_groups')
      .update({ 
        owner_seat_quota: familyGroup.owner_seat_quota + 1 
      })
      .eq('id', familyGroup.id);

    if (quotaError) throw new Error(`Failed to update seat quota: ${quotaError.message}`);
    logStep("Incremented owner seat quota", { newQuota: familyGroup.owner_seat_quota + 1 });
  }

  const inviteLink = `${Deno.env.get("SUPABASE_URL")?.replace('//', '//app.')}/family-invite/${inviteToken}`;
  
  logStep("Family invite created successfully", { inviteId: invite.id, token: inviteToken });

  return new Response(JSON.stringify({
    success: true,
    invite: {
      id: invite.id,
      token: inviteToken,
      link: inviteLink,
      expires_at: invite.expires_at,
      billing_type: invite.billing_type
    }
  }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    status: 200,
  });
}

async function acceptFamilyInvite(supabase: any, user: any, inviteToken?: string) {
  logStep("Accepting family invite", { inviteToken });

  if (!inviteToken) {
    throw new Error("Invite token is required");
  }

  // Get and validate invite
  const { data: invite, error: inviteError } = await supabase
    .from('family_invites')
    .select(`
      *,
      family_groups!inner (
        id,
        owner_user_id,
        owner_seat_quota
      )
    `)
    .eq('token', inviteToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invite token');
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabase
    .from('family_memberships')
    .select('*')
    .eq('group_id', invite.group_id)
    .eq('user_id', user.id)
    .single();

  if (existingMembership) {
    throw new Error('User is already a member of this family group');
  }

  // Create emergency contact for the family member
  const { data: contact, error: contactError } = await supabase
    .from('emergency_contacts')
    .insert([{
      user_id: invite.family_groups.owner_user_id,
      name: invite.name,
      phone: invite.phone || '',
      email: invite.email_or_phone.includes('@') ? invite.email_or_phone : '',
      type: 'family',
      relationship: 'Family Member'
    }])
    .select()
    .single();

  if (contactError) throw new Error(`Failed to create emergency contact: ${contactError.message}`);

  // Create family membership
  const { data: membership, error: memberError } = await supabase
    .from('family_memberships')
    .insert([{
      group_id: invite.group_id,
      user_id: user.id,
      billing_type: invite.billing_type,
      status: invite.billing_type === 'owner' ? 'active' : 'pending'
    }])
    .select()
    .single();

  if (memberError) throw new Error(`Failed to create membership: ${memberError.message}`);

  // Update invite contact_id and mark as used by deleting it
  await supabase
    .from('family_invites')
    .delete()
    .eq('id', invite.id);

  logStep("Family invite accepted successfully", { membershipId: membership.id, contactId: contact.id });

  return new Response(JSON.stringify({
    success: true,
    membership: {
      id: membership.id,
      billing_type: membership.billing_type,
      status: membership.status,
      requires_payment: invite.billing_type === 'self'
    },
    contact: {
      id: contact.id,
      name: contact.name
    }
  }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    status: 200,
  });
}

async function revokeFamilyInvite(supabase: any, user: any, inviteId?: string) {
  logStep("Revoking family invite", { inviteId });

  if (!inviteId) {
    throw new Error("Invite ID is required");
  }

  // Get family group to verify ownership
  const { data: familyGroup, error: groupError } = await supabase
    .from('family_groups')
    .select('*')
    .eq('owner_user_id', user.id)
    .single();

  if (groupError) throw new Error(`Failed to get family group: ${groupError.message}`);

  // Get and delete invite
  const { data: invite, error: inviteError } = await supabase
    .from('family_invites')
    .select('*')
    .eq('id', inviteId)
    .eq('group_id', familyGroup.id)
    .single();

  if (inviteError || !invite) {
    throw new Error('Invite not found or access denied');
  }

  const { error: deleteError } = await supabase
    .from('family_invites')
    .delete()
    .eq('id', inviteId);

  if (deleteError) throw new Error(`Failed to delete invite: ${deleteError.message}`);

  // If owner-paid, decrement seat quota
  if (invite.billing_type === 'owner') {
    const { error: quotaError } = await supabase
      .from('family_groups')
      .update({ 
        owner_seat_quota: Math.max(0, familyGroup.owner_seat_quota - 1)
      })
      .eq('id', familyGroup.id);

    if (quotaError) throw new Error(`Failed to update seat quota: ${quotaError.message}`);
  }

  logStep("Family invite revoked successfully", { inviteId });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    status: 200,
  });
}

async function resendFamilyInvite(supabase: any, user: any, inviteId?: string) {
  logStep("Resending family invite", { inviteId });

  if (!inviteId) {
    throw new Error("Invite ID is required");
  }

  // Get and update invite with new token and expiry
  const newToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72);

  const { data: invite, error: updateError } = await supabase
    .from('family_invites')
    .update({
      token: newToken,
      expires_at: expiresAt.toISOString()
    })
    .eq('id', inviteId)
    .select(`
      *,
      family_groups!inner (owner_user_id)
    `)
    .single();

  if (updateError || !invite) {
    throw new Error('Failed to update invite or invite not found');
  }

  // Verify ownership
  if (invite.family_groups.owner_user_id !== user.id) {
    throw new Error('Access denied - not the group owner');
  }

  const inviteLink = `${Deno.env.get("SUPABASE_URL")?.replace('//', '//app.')}/family-invite/${newToken}`;

  logStep("Family invite resent successfully", { inviteId, newToken });

  return new Response(JSON.stringify({
    success: true,
    invite: {
      id: invite.id,
      token: newToken,
      link: inviteLink,
      expires_at: invite.expires_at
    }
  }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    status: 200,
  });
}