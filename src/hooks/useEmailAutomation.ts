import { supabase } from "@/integrations/supabase/client";

export const useEmailAutomation = () => {
  const triggerAutomation = async (event: string, data?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for automation trigger');
        return;
      }

      const response = await supabase.functions.invoke('automation-triggers', {
        body: {
          event,
          user_id: user.id,
          data
        }
      });

      if (response.error) {
        console.error('Automation trigger error:', response.error);
        return false;
      }

      console.log('Automation triggered successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      return false;
    }
  };

  // Specific automation triggers
  const triggerUserSignup = (signupSource: string = 'web') => {
    return triggerAutomation('user_signup', { source: signupSource });
  };

  const triggerProfileUpdate = (missingFields?: string[]) => {
    return triggerAutomation('profile_updated', { missing_fields: missingFields });
  };

  const triggerSOSActivation = (incidentId: string, location?: string) => {
    return triggerAutomation('sos_activated', { incident_id: incidentId, location });
  };

  const triggerEmergencyContactAdded = (contactName: string) => {
    return triggerAutomation('emergency_contact_added', { contact_name: contactName });
  };

  const triggerFamilyInviteSent = (inviteeEmail: string, inviteeName: string) => {
    return triggerAutomation('family_invite_sent', { 
      invitee_email: inviteeEmail, 
      invitee_name: inviteeName 
    });
  };

  const triggerFamilyMemberJoined = (memberEmail: string, memberName: string) => {
    return triggerAutomation('family_member_joined', { 
      member_email: memberEmail, 
      member_name: memberName 
    });
  };

  const triggerSubscriptionExpiring = (expiresAt: string, daysRemaining: number, planName: string) => {
    return triggerAutomation('subscription_expiring', { 
      expires_at: expiresAt, 
      days_remaining: daysRemaining, 
      plan_name: planName 
    });
  };

  const triggerPaymentFailed = (amount: number, reason: string) => {
    return triggerAutomation('payment_failed', { amount, reason });
  };

  return {
    triggerAutomation,
    triggerUserSignup,
    triggerProfileUpdate,
    triggerSOSActivation,
    triggerEmergencyContactAdded,
    triggerFamilyInviteSent,
    triggerFamilyMemberJoined,
    triggerSubscriptionExpiring,
    triggerPaymentFailed
  };
};