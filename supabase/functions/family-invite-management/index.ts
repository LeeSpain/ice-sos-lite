import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

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
  relationship?: string;
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

    const { action, name, email, phone, relationship, billing_type, token: inviteToken, invite_id }: InviteRequest = await req.json();

    switch (action) {
      case 'create':
        return await createFamilyInvite(supabaseService, user, { name, email, phone, relationship, billing_type });
      
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
  { name, email, phone, relationship, billing_type }: { name?: string, email?: string, phone?: string, relationship?: string, billing_type?: string }
) {
  logStep("Creating family invite", { name, email, phone, relationship, billing_type });

  if (!name || !email || !phone || !relationship) {
    throw new Error("Name, email, phone, and relationship are all required");
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
      inviter_user_id: user.id,
      inviter_email: user.email,
      invitee_email: email,
      invitee_name: name,
      name,
      phone,
      relationship,
      invite_token: inviteToken,
      expires_at: expiresAt.toISOString(),
      billing_type
    }])
    .select()
    .single();

  if (inviteError) throw new Error(`Failed to create invite: ${inviteError.message}`);

  // Create emergency contact immediately for all billing types
  const { data: contact, error: contactError } = await supabase
    .from('emergency_contacts')
    .insert([{
      user_id: user.id,
      name,
      phone,
      email,
      type: 'family',
      relationship,
      priority: 1
    }])
    .select()
    .single();

  if (contactError) {
    logStep("Warning: Failed to create emergency contact", { error: contactError });
    // Don't fail the invite if contact creation fails
  } else {
    logStep("Created emergency contact", { contactId: contact.id });
  }

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

  const originUrl = req.headers.get("origin") || "https://yourapp.com";
  
  const inviteLink = billing_type === 'self' 
    ? `${originUrl}/family-invite-payment?token=${inviteToken}`
    : `${originUrl}/family-invite-accept?token=${inviteToken}`;

  // Send email notification
  if (email) {
    try {
      await sendInviteEmail({
        invitee_email: email,
        invitee_name: name,
        inviter_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'A family member',
        relationship,
        billing_type,
        invite_link: inviteLink,
        origin_url: originUrl
      });
      logStep("Invite email sent successfully");
    } catch (emailError) {
      logStep("Warning: Failed to send invite email", { error: emailError });
      // Don't fail the invite creation if email fails
    }
  }
  
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

async function sendInviteEmail({
  invitee_email,
  invitee_name,
  inviter_name,
  relationship,
  billing_type,
  invite_link,
  origin_url
}: {
  invitee_email: string;
  invitee_name: string;
  inviter_name: string;
  relationship: string;
  billing_type: string;
  invite_link: string;
  origin_url: string;
}) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const resend = new Resend(resendKey);

  const subject = `Family Emergency Access Invitation from ${inviter_name}`;
  
  const emailContent = billing_type === 'self' 
    ? `
      <h1>You're Invited to Join Emergency Family Access</h1>
      <p>Hello ${invitee_name},</p>
      <p><strong>${inviter_name}</strong> has invited you to join their emergency family access system as their <strong>${relationship}</strong>.</p>
      
      <h3>What this means:</h3>
      <ul>
        <li>📍 You'll receive their live location during emergency situations</li>
        <li>🚨 Get instant SOS alerts when they need help</li>
        <li>👥 Coordinate family response with other members</li>
        <li>🛡️ Privacy protected - only emergency location sharing</li>
      </ul>
      
      <h3>Your Subscription (€2.99/month)</h3>
      <p>Since you'll be managing your own subscription, you'll need to set up payment to activate your family access.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invite_link}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invite & Set Up Payment
        </a>
      </div>
      
      <p><small>This invitation expires in 72 hours.</small></p>
      <p>Questions? Contact support at ${origin_url}/contact</p>
    `
    : `
      <h1>You're Invited to Join Emergency Family Access</h1>
      <p>Hello ${invitee_name},</p>
      <p><strong>${inviter_name}</strong> has invited you to join their emergency family access system as their <strong>${relationship}</strong>.</p>
      
      <h3>What this means:</h3>
      <ul>
        <li>📍 You'll receive their live location during emergency situations</li>
        <li>🚨 Get instant SOS alerts when they need help</li>
        <li>👥 Coordinate family response with other members</li>
        <li>🛡️ Privacy protected - only emergency location sharing</li>
      </ul>
      
      <h3>Already Paid For</h3>
      <p>${inviter_name} is covering your monthly subscription, so you just need to accept the invitation.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invite_link}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Family Invitation
        </a>
      </div>
      
      <p><small>This invitation expires in 72 hours.</small></p>
      <p>Questions? Contact support at ${origin_url}/contact</p>
    `;

  await resend.emails.send({
    from: "Family Emergency Access <noreply@yourdomain.com>",
    to: [invitee_email],
    subject: subject,
    html: emailContent,
  });
}