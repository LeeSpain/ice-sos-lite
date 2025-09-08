import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GeographicData {
  country: string;
  region: string;
  city: string;
  visitors: number;
  pageViews: number;
}

export interface PopupAnalytics {
  popupType: string;
  totalShown: number;
  totalCompleted: number;
  totalDismissed: number;
  conversionRate: number;
}

export interface InteractionData {
  eventType: string;
  count: number;
  avgTimeSpent: number;
  topPages: string[];
}

export function useGeographicAnalytics(timeRange = '7d') {
  return useQuery({
    queryKey: ['geographic-analytics', timeRange],
    queryFn: async (): Promise<GeographicData[]> => {
      const startDate = new Date();
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('homepage_analytics')
        .select('event_data')
        .gte('created_at', startDate.toISOString())
        .eq('event_type', 'page_view');

      if (error) throw error;

      // Process geographic data
      const geographicMap = new Map<string, GeographicData>();
      
      data?.forEach(record => {
        const eventData = record.event_data as any;
        const location = eventData?.location;
        if (location?.country) {
          const key = `${location.country}-${location.region || 'Unknown'}-${location.city || 'Unknown'}`;
          const existing = geographicMap.get(key);
          
          if (existing) {
            existing.visitors += 1;
            existing.pageViews += 1;
          } else {
            geographicMap.set(key, {
              country: location.country,
              region: location.region || 'Unknown',
              city: location.city || 'Unknown',
              visitors: 1,
              pageViews: 1
            });
          }
        }
      });

      return Array.from(geographicMap.values())
        .sort((a, b) => b.visitors - a.visitors);
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePopupAnalytics(timeRange = '7d') {
  return useQuery({
    queryKey: ['popup-analytics', timeRange],
    queryFn: async (): Promise<PopupAnalytics[]> => {
      const startDate = new Date();
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('homepage_analytics')
        .select('event_type, event_data')
        .gte('created_at', startDate.toISOString())
        .in('event_type', [
          'preferences_modal_opened',
          'preferences_selected',
          'trial_popup_shown',
          'trial_signup_completed',
          'trial_popup_dismissed'
        ]);

      if (error) throw error;

      // Process popup analytics
      const analytics = new Map<string, any>();

      data?.forEach(record => {
        const eventData = record.event_data as any;
        const popupType = eventData?.popup_type || 
                         eventData?.modal_type || 
                         'unknown';
        
        if (!analytics.has(popupType)) {
          analytics.set(popupType, {
            popupType,
            totalShown: 0,
            totalCompleted: 0,
            totalDismissed: 0
          });
        }

        const popup = analytics.get(popupType);
        
        switch (record.event_type) {
          case 'preferences_modal_opened':
          case 'trial_popup_shown':
            popup.totalShown += 1;
            break;
          case 'preferences_selected':
          case 'trial_signup_completed':
            popup.totalCompleted += 1;
            break;
          case 'trial_popup_dismissed':
            popup.totalDismissed += 1;
            break;
        }
      });

      return Array.from(analytics.values()).map(popup => ({
        ...popup,
        conversionRate: popup.totalShown > 0 
          ? (popup.totalCompleted / popup.totalShown) * 100 
          : 0
      }));
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useInteractionAnalytics(timeRange = '7d') {
  return useQuery({
    queryKey: ['interaction-analytics', timeRange],
    queryFn: async (): Promise<InteractionData[]> => {
      const startDate = new Date();
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('homepage_analytics')
        .select('event_type, event_data, page_context, created_at')
        .gte('created_at', startDate.toISOString())
        .neq('event_type', 'page_view');

      if (error) throw error;

      // Process interaction data
      const interactions = new Map<string, any>();
      const pageCount = new Map<string, number>();

      data?.forEach(record => {
        const eventType = record.event_type;
        
        if (!interactions.has(eventType)) {
          interactions.set(eventType, {
            eventType,
            count: 0,
            totalTime: 0,
            pages: new Set()
          });
        }

        const interaction = interactions.get(eventType);
        interaction.count += 1;
        interaction.pages.add(record.page_context);
        
        // Count pages for this event type
        const pageKey = `${eventType}-${record.page_context}`;
        pageCount.set(pageKey, (pageCount.get(pageKey) || 0) + 1);
      });

      return Array.from(interactions.values()).map(interaction => ({
        eventType: interaction.eventType,
        count: interaction.count,
        avgTimeSpent: 0, // Placeholder - would need session tracking
        topPages: Array.from(interaction.pages).slice(0, 5) as string[]
      }));
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useHourlyAnalytics() {
  return useQuery({
    queryKey: ['hourly-analytics'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);

      const { data, error } = await supabase
        .from('homepage_analytics')
        .select('created_at, event_type, event_data')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by hour
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
        return {
          hour: hour.getHours(),
          timestamp: hour.toISOString(),
          pageViews: 0,
          interactions: 0,
          uniqueVisitors: new Set<string>()
        };
      });

      data?.forEach(record => {
        const recordHour = new Date(record.created_at).getHours();
        const hourIndex = hourlyData.findIndex(h => h.hour === recordHour);
        
        if (hourIndex >= 0) {
          const eventData = record.event_data as any;
          const sessionId = eventData?.session_id;
          if (sessionId) {
            hourlyData[hourIndex].uniqueVisitors.add(sessionId);
          }
          
          if (record.event_type === 'page_view') {
            hourlyData[hourIndex].pageViews += 1;
          } else {
            hourlyData[hourIndex].interactions += 1;
          }
        }
      });

      return hourlyData.map(hour => ({
        ...hour,
        uniqueVisitors: hour.uniqueVisitors.size,
        uniqueVisitors_set: undefined // Remove the Set for serialization
      }));
    },
    refetchInterval: 5 * 60 * 1000,
  });
}