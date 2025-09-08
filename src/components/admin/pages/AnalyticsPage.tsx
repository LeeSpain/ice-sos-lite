import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor,
  RefreshCw,
  Calendar,
  DollarSign,
  Activity,
  UserPlus,
  Mail,
  ShoppingCart
} from 'lucide-react';
import { 
  useRealTimeAnalytics, 
  useLovableAnalytics, 
  useTopPages, 
  useCustomEvents, 
  useRealTimeActiveUsers,
  type RealTimeMetrics
} from '@/hooks/useRealTimeAnalytics';
import { 
  useEnhancedTrafficSources, 
  useEnhancedDeviceData,
  type TrafficSource,
  type DeviceData 
} from '@/hooks/useEnhancedAnalytics';
import { 
  usePageAnalytics, 
  useUserJourneyAnalytics 
} from '@/hooks/usePageAnalytics';
import { useGeographicAnalytics } from '@/hooks/useAdvancedAnalytics';
import { GeographicAnalyticsCard } from '@/components/admin/analytics/GeographicAnalyticsCard';
import { PopupAnalyticsCard } from '@/components/admin/analytics/PopupAnalyticsCard';
import { HourlyAnalyticsChart } from '@/components/admin/analytics/HourlyAnalyticsChart';
import { AnalyticsHealthCheck } from '@/components/admin/analytics/AnalyticsHealthCheck';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';

const AnalyticsPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState('30d');
  const queryClient = useQueryClient();

  // Realtime updates: invalidate queries when new analytics events arrive
  useEffect(() => {
    const channel = supabase
      .channel('analytics-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'homepage_analytics' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lovable-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-traffic-sources'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-device-data'] });
          queryClient.invalidateQueries({ queryKey: ['top-pages'] });
          queryClient.invalidateQueries({ queryKey: ['custom-events'] });
          queryClient.invalidateQueries({ queryKey: ['real-time-active-users'] });
          queryClient.invalidateQueries({ queryKey: ['session-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['page-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['geographic-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['user-journey-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['real-time-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['popup-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['interaction-analytics'] });
          queryClient.invalidateQueries({ queryKey: ['hourly-analytics'] });
          setLastUpdated(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'video_analytics' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['custom-events'] });
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Real-time data hooks
  const { data: realTimeMetrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useRealTimeAnalytics();
  const { data: lovableAnalytics, isLoading: isLoadingLovable } = useLovableAnalytics();
  const { data: trafficSources, isLoading: isLoadingTraffic } = useEnhancedTrafficSources();
  const { data: deviceData, isLoading: isLoadingDevices } = useEnhancedDeviceData();
  const { data: topPages, isLoading: isLoadingPages } = useTopPages();
  const { data: customEvents, isLoading: isLoadingEvents } = useCustomEvents();
  const { data: realTimeData, isLoading: isLoadingRealTime } = useRealTimeActiveUsers();
  
  // Enhanced analytics hooks
  const { data: pageAnalytics, isLoading: isLoadingPageAnalytics } = usePageAnalytics();
  const { data: userJourneys, isLoading: isLoadingJourneys } = useUserJourneyAnalytics();

  const isLoading = isLoadingMetrics || isLoadingPages || isLoadingEvents || isLoadingRealTime || isLoadingTraffic || isLoadingDevices || isLoadingLovable || isLoadingPageAnalytics || isLoadingJourneys;

  // Refresh all data
  const refreshAllData = async () => {
    setLastUpdated(new Date());
    const keys: readonly (readonly string[])[] = [
      ['real-time-analytics'],
      ['lovable-analytics'],
      ['enhanced-traffic-sources'],
      ['enhanced-device-data'],
      ['top-pages'],
      ['custom-events'],
      ['real-time-active-users'],
      ['session-metrics'],
      ['page-analytics'],
      ['geographic-analytics'],
      ['user-journey-analytics'],
    ];
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key as any }));
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    format?: 'number' | 'percentage' | 'currency' | 'duration';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'percentage':
          return `${val}%`;
        case 'currency':
          return `€${val.toLocaleString()}`;
        case 'duration':
          return `${Math.floor(val / 60)}m ${val % 60}s`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change !== undefined && (
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {' '}from last month
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your ICE SOS platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <MetricCard
          title="Page Views"
          value={lovableAnalytics?.pageViews || 0}
          icon={Eye}
        />
        <MetricCard
          title="Unique Visitors"
          value={lovableAnalytics?.uniqueVisitors || 0}
          icon={Users}
        />
        <MetricCard
          title="Total Users"
          value={realTimeMetrics?.totalUsers || 0}
          icon={UserPlus}
        />
        <MetricCard
          title="Contacts (30d)"
          value={realTimeMetrics?.contactsLast30Days || 0}
          icon={Mail}
        />
        <MetricCard
          title="Conversion Rate"
          value={realTimeMetrics?.conversionRate || 0}
          icon={TrendingUp}
          format="percentage"
        />
        <MetricCard
          title="Revenue"
          value={realTimeMetrics?.totalRevenue || 0}
          icon={DollarSign}
          format="currency"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="pages">Page Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="popups">Popups</TabsTrigger>
          <TabsTrigger value="hourly">24-Hour View</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
          <TabsTrigger value="journeys">User Journeys</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <AnalyticsHealthCheck />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Bounce Rate"
              value={realTimeMetrics?.bounceRate || 0}
              icon={MousePointer}
              format="percentage"
            />
            <MetricCard
              title="Avg. Session Duration"
              value={realTimeMetrics?.avgSessionDuration || 0}
              icon={Activity}
              format="duration"
            />
            <MetricCard
              title="Sessions"
              value={lovableAnalytics?.sessions || 0}
              icon={Calendar}
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Contacts"
              value={realTimeMetrics?.totalContacts || 0}
              icon={Mail}
            />
            <MetricCard
              title="Completed Orders"
              value={realTimeMetrics?.totalOrders || 0}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Registrations"
              value={realTimeMetrics?.totalRegistrations || 0}
              icon={UserPlus}
            />
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPages ? (
                <p className="text-sm text-muted-foreground">Loading page data...</p>
              ) : topPages && topPages.length > 0 ? (
                <div className="space-y-4">
                  {topPages.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.page}</p>
                        <p className="text-sm text-muted-foreground">{item.views.toLocaleString()} views</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No page view data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Detailed analytics for each page</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPageAnalytics ? (
                <p className="text-sm text-muted-foreground">Loading page analytics...</p>
              ) : pageAnalytics && pageAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {pageAnalytics.map((page, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{page.page}</h4>
                        <Badge variant="outline">{page.views} views</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Unique Visitors</p>
                          <p className="font-medium">{page.uniqueVisitors}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bounce Rate</p>
                          <p className="font-medium">{page.bounceRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Time</p>
                          <p className="font-medium">{page.avgTimeOnPage}s</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Top Country</p>
                          <p className="font-medium">{page.topCountries[0]?.country || 'N/A'}</p>
                        </div>
                      </div>
                      {page.topReferrers.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Top Referrers:</p>
                          <div className="flex flex-wrap gap-1">
                            {page.topReferrers.slice(0, 3).map((ref, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {ref.referrer} ({ref.visitors})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No page analytics data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <GeographicAnalyticsCard 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
          />
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTraffic ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-8 bg-muted rounded animate-pulse mb-1" />
                        <div className="w-16 h-2 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {trafficSources?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{source.source}</p>
                        <p className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} visitors</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{source.percentage}%</p>
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Sessions by device type</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDevices ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {deviceData?.map((device, index) => {
                    const Icon = device.device === 'Mobile' ? Smartphone : 
                                device.device === 'Desktop' ? Monitor : 
                                Globe;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{device.device}</p>
                            <p className="text-sm text-muted-foreground">{device.sessions.toLocaleString()} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{device.percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PopupAnalyticsCard timeRange={timeRange} />
            <GeographicAnalyticsCard 
              timeRange={timeRange} 
              onTimeRangeChange={setTimeRange} 
            />
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <HourlyAnalyticsChart />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Events</CardTitle>
              <CardDescription>ICE SOS specific event tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <p className="text-sm text-muted-foreground">Loading event data...</p>
              ) : customEvents && customEvents.length > 0 ? (
                <div className="space-y-4">
                  {customEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.count} events</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {event.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No custom event data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Analysis</CardTitle>
              <CardDescription>Common paths users take through your site</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJourneys ? (
                <p className="text-sm text-muted-foreground">Loading user journey data...</p>
              ) : userJourneys && userJourneys.length > 0 ? (
                <div className="space-y-4">
                  {userJourneys.map((journey, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Journey #{index + 1}</span>
                          <Badge variant="outline">{journey.count} users</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{journey.conversionRate}% of total</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {journey.path.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2">
                            <span className="bg-secondary px-2 py-1 rounded text-xs font-mono">
                              {step}
                            </span>
                            {stepIndex < journey.path.length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No user journey data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Overview</CardTitle>
              <CardDescription>Live visitors and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRealTime ? (
                <p className="text-sm text-muted-foreground">Loading real-time data...</p>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold text-emerald-600">{realTimeData?.activeUsers || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Page Views (last hour)</p>
                      <p className="text-3xl font-bold">{realTimeData?.pageViewsLastHour || 0}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium">Top Active Pages</p>
                    <div className="space-y-2">
                      {realTimeData?.topActivePages.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.page}</span>
                          <span className="font-medium">{item.users} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
};

export default AnalyticsPage;