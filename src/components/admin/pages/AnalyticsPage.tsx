import React, { useState, useEffect } from 'react';
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
  useTrafficSources, 
  useDeviceData, 
  useTopPages, 
  useCustomEvents, 
  useRealTimeActiveUsers,
  type RealTimeMetrics,
  type TrafficSource,
  type DeviceData 
} from '@/hooks/useRealTimeAnalytics';

const AnalyticsPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Real-time data hooks
  const { data: realTimeMetrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useRealTimeAnalytics();
  const { data: lovableAnalytics } = useLovableAnalytics();
  const trafficSources = useTrafficSources();
  const deviceData = useDeviceData();
  const { data: topPages, isLoading: isLoadingPages } = useTopPages();
  const { data: customEvents, isLoading: isLoadingEvents } = useCustomEvents();
  const { data: realTimeData, isLoading: isLoadingRealTime } = useRealTimeActiveUsers();

  const isLoading = isLoadingMetrics || isLoadingPages || isLoadingEvents || isLoadingRealTime;

  // Refresh all data
  const refreshAllData = async () => {
    setLastUpdated(new Date());
    await refetchMetrics();
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
          value={lovableAnalytics.pageViews}
          icon={Eye}
        />
        <MetricCard
          title="Unique Visitors"
          value={lovableAnalytics.uniqueVisitors}
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
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
        </TabsList>

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
              value={lovableAnalytics.sessions}
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

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
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
              <div className="space-y-4">
                {deviceData.map((device, index) => {
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
            </CardContent>
          </Card>
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
  );
};

export default AnalyticsPage;