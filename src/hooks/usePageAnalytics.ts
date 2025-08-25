import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PageAnalytic {
  page: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: number;
  topCountries: Array<{ country: string; visitors: number }>;
  topReferrers: Array<{ referrer: string; visitors: number }>;
}

export interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
}

export interface UserJourney {
  path: string[];
  count: number;
  conversionRate: number;
}

// Hook to get comprehensive page analytics
export function usePageAnalytics() {
  return useQuery({
    queryKey: ['page-analytics'],
    queryFn: async (): Promise<PageAnalytic[]> => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get all page view data from the last 30 days
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('page_context, session_id, event_data, created_at')
          .eq('event_type', 'page_view')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group data by page
        const pageGroups: Record<string, any[]> = {};
        pageViewData?.forEach(item => {
          const page = item.page_context || '/';
          if (!pageGroups[page]) pageGroups[page] = [];
          pageGroups[page].push(item);
        });

        // Calculate metrics for each page
        const pageAnalytics: PageAnalytic[] = Object.entries(pageGroups).map(([page, data]) => {
          const views = data.length;
          const uniqueVisitors = new Set(data.map(item => item.session_id)).size;
          
          // Calculate bounce rate (single page sessions)
          const sessionPages: Record<string, number> = {};
          data.forEach(item => {
            sessionPages[item.session_id] = (sessionPages[item.session_id] || 0) + 1;
          });
          const singlePageSessions = Object.values(sessionPages).filter(count => count === 1).length;
          const bounceRate = uniqueVisitors > 0 ? (singlePageSessions / uniqueVisitors) * 100 : 0;

          // Calculate average time on page (simplified)
          const avgTimeOnPage = 45; // Placeholder - would need session duration tracking

          // Extract country data from location info
          const countries: Record<string, number> = {};
          data.forEach(item => {
            const eventData = item.event_data as any;
            const location = eventData?.location;
            if (location?.country) {
              countries[location.country] = (countries[location.country] || 0) + 1;
            }
          });
          const topCountries = Object.entries(countries)
            .map(([country, visitors]) => ({ country, visitors }))
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 5);

          // Extract referrer data
          const referrers: Record<string, number> = {};
          data.forEach(item => {
            const eventData = item.event_data as any;
            const referrer = eventData?.referrer || 'Direct';
            const simplifiedReferrer = referrer === '' ? 'Direct' : 
              referrer.includes('google') ? 'Google' :
              referrer.includes('facebook') ? 'Facebook' :
              referrer.includes('twitter') ? 'Twitter' :
              new URL(referrer || 'https://direct.com').hostname;
            referrers[simplifiedReferrer] = (referrers[simplifiedReferrer] || 0) + 1;
          });
          const topReferrers = Object.entries(referrers)
            .map(([referrer, visitors]) => ({ referrer, visitors }))
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 5);

          return {
            page,
            views,
            uniqueVisitors,
            bounceRate: parseFloat(bounceRate.toFixed(1)),
            avgTimeOnPage,
            topCountries,
            topReferrers
          };
        });

        return pageAnalytics.sort((a, b) => b.views - a.views);
      } catch (error) {
        console.error('Error fetching page analytics:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    refetchIntervalInBackground: false,
  });
}

// Hook to get geographic distribution of visitors
export function useGeographicAnalytics() {
  return useQuery({
    queryKey: ['geographic-analytics'],
    queryFn: async (): Promise<GeographicData[]> => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('event_data')
          .eq('event_type', 'page_view')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        // Extract country data
        const countries: Record<string, number> = {};
        let totalVisitors = 0;

        pageViewData?.forEach(item => {
          const eventData = item.event_data as any;
          const location = eventData?.location;
          if (location?.country) {
            countries[location.country] = (countries[location.country] || 0) + 1;
            totalVisitors++;
          }
        });

        return Object.entries(countries)
          .map(([country, visitors]) => ({
            country,
            visitors,
            percentage: totalVisitors > 0 ? parseFloat(((visitors / totalVisitors) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.visitors - a.visitors)
          .slice(0, 10);
      } catch (error) {
        console.error('Error fetching geographic analytics:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

// Hook to analyze user journeys through the site
export function useUserJourneyAnalytics() {
  return useQuery({
    queryKey: ['user-journey-analytics'],
    queryFn: async (): Promise<UserJourney[]> => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: pageViewData, error } = await supabase
          .from('homepage_analytics')
          .select('page_context, session_id, created_at')
          .eq('event_type', 'page_view')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by session and create user journeys
        const sessions: Record<string, string[]> = {};
        pageViewData?.forEach(item => {
          const sessionId = item.session_id;
          const page = item.page_context || '/';
          if (!sessions[sessionId]) sessions[sessionId] = [];
          sessions[sessionId].push(page);
        });

        // Find common journey patterns
        const journeyPatterns: Record<string, number> = {};
        Object.values(sessions).forEach(journey => {
          if (journey.length >= 2) {
            const pathKey = journey.slice(0, 3).join(' → '); // First 3 pages
            journeyPatterns[pathKey] = (journeyPatterns[pathKey] || 0) + 1;
          }
        });

        // Calculate conversion rates (simplified - registrations/signups)
        const totalJourneys = Object.values(journeyPatterns).reduce((sum, count) => sum + count, 0);

        return Object.entries(journeyPatterns)
          .map(([pathString, count]) => ({
            path: pathString.split(' → '),
            count,
            conversionRate: totalJourneys > 0 ? parseFloat(((count / totalJourneys) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      } catch (error) {
        console.error('Error fetching user journey analytics:', error);
        return [];
      }
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
}