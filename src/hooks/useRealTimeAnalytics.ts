import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useSessionMetrics } from './useEnhancedAnalytics';
// Removed circular import - useFamilyAnalytics should be imported directly where needed

export interface RealTimeMetrics {
  totalUsers: number;
  totalContacts: number;
  contactsLast30Days: number;
  totalOrders: number;
  totalRevenue: number;
  totalRegistrations: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  // Family system metrics
  familyConnections: number;
  activeSosEvents: number;
  familyRevenue: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface DeviceData {
  device: string;
  sessions: number;
  percentage: number;
}

export interface TopPage {
  page: string;
  views: number;
  percentage: number;
}

export interface CustomEvent {
  event: string;
  count: number;
  trend: string;
}

// Hook to fetch real-time analytics data
export function useRealTimeAnalytics() {
  const { data: sessionMetrics } = useSessionMetrics();
  
  return useQuery({
    queryKey: ['real-time-analytics'],
    queryFn: async (): Promise<RealTimeMetrics> => {
      console.log('🔄 Fetching real-time analytics data...');
      try {
        // Get real data from database with error handling
        // Note: contact_submissions now requires admin access, so we handle gracefully
        const [contactsResult, ordersResult, registrationsResult, profilesResult] = await Promise.allSettled([
          supabase.from('contact_submissions').select('count', { count: 'exact', head: true }),
          supabase.from('orders').select('total_price').eq('status', 'completed').throwOnError(),
          supabase.from('registration_selections').select('count', { count: 'exact', head: true }).eq('registration_completed', true),
          supabase.from('profiles').select('count', { count: 'exact', head: true }).throwOnError()
        ]);

        // Get actual user count from profiles
        const profilesCount = profilesResult.status === 'fulfilled' ? profilesResult.value.count : 1;
        const totalUsers = (typeof profilesCount === 'number') ? profilesCount : 1;
        
        // Get contact count (admin-only access now)
        const contactsCount = contactsResult.status === 'fulfilled' ? contactsResult.value.count : 0;
        const totalContacts = (typeof contactsCount === 'number') ? contactsCount : 0;
        
        console.log('📊 Analytics data:', { totalUsers, totalContacts });
        
        // For contacts last 30 days, we'll use a simpler approach since we can't fetch detailed data
        // This will need to be enhanced with a dedicated admin-only analytics query later
        const contactsLast30Days = Math.floor(totalContacts * 0.3); // Estimate based on total

        const orders = ordersResult.status === 'fulfilled' ? (ordersResult.value.data || []) : [];
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_price?.toString() || '0') || 0), 0);
        
        const registrationsCount = registrationsResult.status === 'fulfilled' ? registrationsResult.value.count : 0;
        const totalRegistrations = (typeof registrationsCount === 'number') ? registrationsCount : 0;

        // Calculate conversion rate (registrations / total users)
        const conversionRate = totalUsers > 0 ? (totalRegistrations / totalUsers) * 100 : 0;

        return {
          totalUsers,
          totalContacts,
          contactsLast30Days,
          totalOrders,
          totalRevenue,
          totalRegistrations,
          bounceRate: sessionMetrics?.bounceRate || 0,
          avgSessionDuration: sessionMetrics?.avgSessionDuration || 0,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          // Family system metrics - set to 0 since we removed the circular dependency
          familyConnections: 0,
          activeSosEvents: 0,
          familyRevenue: 0
        };
      } catch (error) {
        console.error('Error fetching real-time analytics:', error);
        return {
          totalUsers: 0,
          totalContacts: 0,
          contactsLast30Days: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalRegistrations: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
          conversionRate: 0,
          familyConnections: 0,
          activeSosEvents: 0,
          familyRevenue: 0
        };
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}

// Hook for Lovable analytics data - now fetches real page view data
export function useLovableAnalytics() {
  return useQuery({
    queryKey: ['lovable-analytics'],
    queryFn: async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get page views from the last 30 days
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('session_id, event_data')
          .eq('event_type', 'page_view')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        const pageViews = pageViewData?.length || 0;
        const uniqueVisitors = new Set(pageViewData?.map(item => item.session_id) || []).size;
        const sessions = uniqueVisitors; // For simplicity, treat unique visitors as sessions

        return {
          pageViews,
          uniqueVisitors,
          sessions
        };
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        return {
          pageViews: 0,
          uniqueVisitors: 0,
          sessions: 0
        };
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchIntervalInBackground: false,
  });
}

// Hook for real-time traffic sources - now deprecated, use useEnhancedTrafficSources
export function useTrafficSources(): TrafficSource[] {
  return [
    { source: 'Direct', visitors: 0, percentage: 0 },
    { source: 'Organic Search', visitors: 0, percentage: 0 },
    { source: 'Social Media', visitors: 0, percentage: 0 },
    { source: 'Referral', visitors: 0, percentage: 0 }
  ];
}

// Enhanced Traffic Sources with real data
export function useEnhancedTrafficSources() {
  return useQuery({
    queryKey: ['enhanced-traffic-sources'],
    queryFn: async (): Promise<TrafficSource[]> => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('event_data, session_id')
          .eq('event_type', 'page_view')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        const sources: Record<string, Set<string>> = {
          'Direct': new Set(),
          'Search': new Set(),
          'Social': new Set(),
          'Referral': new Set()
        };

        pageViewData?.forEach(item => {
          const eventData = item.event_data as any;
          const referrer = eventData?.referrer || '';
          const sessionId = item.session_id;
          
          if (!referrer || referrer === 'Direct') {
            sources['Direct'].add(sessionId);
          } else if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('search')) {
            sources['Search'].add(sessionId);
          } else if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('linkedin')) {
            sources['Social'].add(sessionId);
          } else {
            sources['Referral'].add(sessionId);
          }
        });

        const totalVisitors = Object.values(sources).reduce((sum, set) => sum + set.size, 0);

        return Object.entries(sources).map(([source, sessionSet]) => ({
          source,
          visitors: sessionSet.size,
          percentage: totalVisitors > 0 ? parseFloat(((sessionSet.size / totalVisitors) * 100).toFixed(1)) : 0
        }));
      } catch (error) {
        console.error('Error fetching enhanced traffic sources:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for device data - now deprecated, use useEnhancedDeviceData
export function useDeviceData(): DeviceData[] {
  return [
    { device: 'Mobile', sessions: 0, percentage: 0 },
    { device: 'Desktop', sessions: 0, percentage: 0 },
    { device: 'Tablet', sessions: 0, percentage: 0 }
  ];
}

// Enhanced Device Data with real data
export function useEnhancedDeviceData() {
  return useQuery({
    queryKey: ['enhanced-device-data'],
    queryFn: async (): Promise<DeviceData[]> => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('event_data, session_id')
          .eq('event_type', 'page_view')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        const devices: Record<string, Set<string>> = {
          'Mobile': new Set(),
          'Desktop': new Set(),
          'Tablet': new Set()
        };

        pageViewData?.forEach(item => {
          const eventData = item.event_data as any;
          const userAgent = eventData?.user_agent || '';
          const sessionId = item.session_id;
          
          if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
            devices['Mobile'].add(sessionId);
          } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
            devices['Tablet'].add(sessionId);
          } else {
            devices['Desktop'].add(sessionId);
          }
        });

        const totalSessions = Object.values(devices).reduce((sum, set) => sum + set.size, 0);

        return Object.entries(devices).map(([device, sessionSet]) => ({
          device,
          sessions: sessionSet.size,
          percentage: totalSessions > 0 ? parseFloat(((sessionSet.size / totalSessions) * 100).toFixed(1)) : 0
        }));
      } catch (error) {
        console.error('Error fetching enhanced device data:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for top pages with real data
export function useTopPages() {
  return useQuery({
    queryKey: ['top-pages'],
    queryFn: async (): Promise<TopPage[]> => {
      try {
        // Get page view data from homepage_analytics table
        const { data: pageData, error } = await supabase
          .from('homepage_analytics')
          .select('event_data, page_context')
          .eq('event_type', 'page_view')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Group by page and count views
        const pageViews: Record<string, number> = {};
        pageData?.forEach(item => {
          const page = item.page_context || '/';
          pageViews[page] = (pageViews[page] || 0) + 1;
        });

        const totalViews = Object.values(pageViews).reduce((sum, views) => sum + views, 0);
        
        return Object.entries(pageViews)
          .map(([page, views]) => ({
            page,
            views,
            percentage: totalViews > 0 ? parseFloat(((views / totalViews) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);
      } catch (error) {
        console.error('Error fetching top pages:', error);
        return [
          { page: '/', views: 0, percentage: 0 },
          { page: '/register', views: 0, percentage: 0 },
          { page: '/auth', views: 0, percentage: 0 },
          { page: '/support', views: 0, percentage: 0 },
          { page: '/contact', views: 0, percentage: 0 }
        ];
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}

// Hook for custom events with real data
export function useCustomEvents() {
  return useQuery({
    queryKey: ['custom-events'],
    queryFn: async (): Promise<CustomEvent[]> => {
      try {
        // Get custom events from homepage_analytics table
        const { data: eventData, error } = await supabase
          .from('homepage_analytics')
          .select('event_type, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Count events by type
        const eventCounts: Record<string, number> = {
          'Emergency SOS Button Clicked': 0,
          'Registration Completed': 0,
          'Subscription Purchased': 0,
          'Emma Chat Interaction': 0,
          'Family Member Invited': 0
        };

        eventData?.forEach(item => {
          switch (item.event_type) {
            case 'sos_button_click':
              eventCounts['Emergency SOS Button Clicked']++;
              break;
            case 'registration_completed':
              eventCounts['Registration Completed']++;
              break;
            case 'subscription_purchased':
              eventCounts['Subscription Purchased']++;
              break;
            case 'chat_interaction':
              eventCounts['Emma Chat Interaction']++;
              break;
            case 'family_invite':
              eventCounts['Family Member Invited']++;
              break;
          }
        });

        return Object.entries(eventCounts).map(([event, count]) => ({
          event,
          count,
          trend: count > 0 ? '+0.0%' : '0.0%' // Placeholder until we have historical data for trends
        }));
      } catch (error) {
        console.error('Error fetching custom events:', error);
        return [
          { event: 'Emergency SOS Button Clicked', count: 0, trend: '0.0%' },
          { event: 'Registration Completed', count: 0, trend: '0.0%' },
          { event: 'Subscription Purchased', count: 0, trend: '0.0%' },
          { event: 'Emma Chat Interaction', count: 0, trend: '0.0%' },
          { event: 'Family Member Invited', count: 0, trend: '0.0%' }
        ];
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}

// Hook for real-time active users with real data
export function useRealTimeActiveUsers() {
  return useQuery({
    queryKey: ['real-time-active-users'],
    queryFn: async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        // Get active sessions in the last hour
        const { data: recentActivity, error } = await supabase
          .from('homepage_analytics')
          .select('session_id, page_context, created_at')
          .gte('created_at', oneHourAgo.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Count unique active users
        const uniqueSessions = new Set(recentActivity?.map(item => item.session_id) || []);
        const activeUsers = uniqueSessions.size;

        // Count page views in the last hour
        const pageViewsLastHour = recentActivity?.filter(item => 
          new Date(item.created_at) >= oneHourAgo
        ).length || 0;

        // Get top active pages
        const pageActivity: Record<string, number> = {};
        recentActivity?.forEach(item => {
          const page = item.page_context || '/';
          pageActivity[page] = (pageActivity[page] || 0) + 1;
        });

        const topActivePages = Object.entries(pageActivity)
          .map(([page, users]) => ({ page, users }))
          .sort((a, b) => b.users - a.users)
          .slice(0, 4);

        return {
          activeUsers,
          pageViewsLastHour,
          topActivePages
        };
      } catch (error) {
        console.error('Error fetching real-time active users:', error);
        return {
          activeUsers: 0,
          pageViewsLastHour: 0,
          topActivePages: [
            { page: '/', users: 0 },
            { page: '/register', users: 0 },
            { page: '/member-dashboard', users: 0 },
            { page: '/contact', users: 0 }
          ]
        };
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}