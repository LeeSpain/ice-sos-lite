import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'basic' | 'call_centre' | null;

interface SubscriptionData {
  tier: SubscriptionTier;
  isCallCentreEnabled: boolean;
  loading: boolean;
}

export const useSubscriptionTier = (): SubscriptionData => {
  const [tier, setTier] = useState<SubscriptionTier>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTier('basic');
      setLoading(false);
      return;
    }

    fetchSubscriptionTier();
  }, [user]);

  const fetchSubscriptionTier = async () => {
    try {
      setLoading(true);

      // For now, default to basic plan
      // TODO: Implement proper subscription checking when payment tables are set up
      setTier('basic');

      // Future implementation could check:
      // - Stripe subscription status
      // - Admin-configured user privileges  
      // - Profile subscription metadata
      
    } catch (error) {
      console.error('Error checking subscription tier:', error);
      setTier('basic');
    } finally {
      setLoading(false);
    }
  };

  return {
    tier,
    isCallCentreEnabled: tier === 'call_centre',
    loading
  };
};