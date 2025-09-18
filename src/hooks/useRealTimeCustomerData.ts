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
      
      try {
        // Fetch data directly from Supabase tables for more reliable metrics
        const [profilesResult, subscribersResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('created_at, user_id, role')
            .neq('role', 'admin'), // Exclude admin users from customer count
          
          supabase
            .from('subscribers')
            .select('user_id, subscribed, subscription_tier, email')
        ]);

        if (profilesResult.error) {
          console.error('❌ Error fetching profiles:', profilesResult.error);
          throw profilesResult.error;
        }

        if (subscribersResult.error) {
          console.error('❌ Error fetching subscribers:', subscribersResult.error);
          throw subscribersResult.error;
        }

        const profiles = profilesResult.data || [];
        const subscribers = subscribersResult.data || [];

        console.log('✅ Fetched profiles:', profiles.length, 'subscribers:', subscribers.length);

        // Calculate current month start
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic metrics
        const totalCustomers = profiles.length;
        const activeSubscriptions = subscribers.filter(sub => sub.subscribed).length;

        // Calculate new customers this month
        const newCustomersThisMonth = profiles.filter(profile => 
          new Date(profile.created_at) >= monthStart
        ).length;

        // Calculate subscription tiers (fixed logic)
        const premiumSubscriptions = subscribers.filter(sub => 
          sub.subscribed && (
            sub.subscription_tier?.toLowerCase().includes('premium') ||
            sub.subscription_tier?.toLowerCase().includes('protection')
          )
        ).length;
        
        // Regional/Call Centre subscriptions - €24.99/month tier
        const callCentreSubscriptions = subscribers.filter(sub => 
          sub.subscribed && (
            sub.subscription_tier?.toLowerCase().includes('regional') ||
            sub.subscription_tier?.toLowerCase().includes('call') ||
            sub.subscription_tier?.toLowerCase().includes('centre') ||
            sub.subscription_tier?.toLowerCase().includes('center')
          )
        ).length;

        // Revenue calculation (simplified - based on subscription tiers)
        const premiumPrice = 0.99; // €0.99/month
        const regionalPrice = 24.99; // €24.99/month (corrected price)
        const totalRevenue = (premiumSubscriptions * premiumPrice) + (callCentreSubscriptions * regionalPrice);

        // Calculate derived metrics
        const averageRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
        const subscriptionConversionRate = totalCustomers > 0 ? (activeSubscriptions / totalCustomers) * 100 : 0;

        console.log('📊 Calculated metrics:', {
          totalCustomers,
          newCustomersThisMonth,
          activeSubscriptions,
          premiumSubscriptions,
          callCentreSubscriptions,
          totalRevenue
        });

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
      } catch (error) {
        console.error('❌ Error in useRealTimeCustomerData:', error);
        throw error;
      }
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