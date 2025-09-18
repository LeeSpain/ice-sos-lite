import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeCustomerMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
  premiumSubscriptions: number;
  callCentreSubscriptions: number;
  averageRevenuePerCustomer: number;
  subscriptionConversionRate: number;
}

export function useRealTimeCustomerData() {
  const query = useQuery({
    queryKey: ['real-time-customer-data'],
    queryFn: async (): Promise<RealTimeCustomerMetrics> => {
      console.log('🔄 Fetching real-time customer data...');
      
      // Fetch comprehensive data using the admin revenue function
      const { data, error } = await supabase.functions.invoke('get-admin-revenue');
      
      if (error) {
        console.error('❌ Error fetching customer data:', error);
        throw error;
      }

      console.log('✅ Real-time customer data received:', data);

      // Calculate current month start
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Extract metrics from the response
      const totalCustomers = data?.metrics?.totalCustomers || 0;
      const activeSubscriptions = data?.metrics?.activeSubscriptions || 0;
      const totalRevenue = data?.metrics?.totalRevenue || 0;

      // Calculate new customers this month from profiles
      const profiles = data?.rawData?.allProfiles || [];
      const newCustomersThisMonth = profiles.filter((profile: any) => 
        new Date(profile.created_at) >= monthStart
      ).length;

      // Calculate subscription tiers
      const subscribers = data?.subscribers || [];
      const premiumSubscriptions = subscribers.filter((sub: any) => 
        sub.subscribed && sub.subscription_tier === 'premium'
      ).length;
      
      const callCentreSubscriptions = subscribers.filter((sub: any) => 
        sub.subscribed && sub.subscription_tier === 'call_centre'
      ).length;

      // Calculate derived metrics
      const averageRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
      const subscriptionConversionRate = totalCustomers > 0 ? (activeSubscriptions / totalCustomers) * 100 : 0;

      return {
        totalCustomers,
        newCustomersThisMonth,
        activeSubscriptions,
        totalRevenue,
        premiumSubscriptions,
        callCentreSubscriptions,
        averageRevenuePerCustomer,
        subscriptionConversionRate
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    console.log('🔔 Setting up real-time subscriptions for customer data...');
    
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('📊 Profiles table changed, invalidating customer data...');
        query.refetch();
      })
      .subscribe();

    const subscribersChannel = supabase
      .channel('subscribers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscribers'
      }, () => {
        console.log('💰 Subscribers table changed, invalidating customer data...');
        query.refetch();
      })
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up real-time subscriptions...');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscribersChannel);
    };
  }, [query]);

  return query;
}