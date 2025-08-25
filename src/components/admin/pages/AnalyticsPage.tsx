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
  Activity
} from 'lucide-react';
// Analytics integration will be implemented with Google Analytics API

interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  totalRevenue: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  sessions: number;
  percentage: number;
}

const AnalyticsPage = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    conversionRate: 0,
    totalRevenue: 0
  });
  
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Get last 30 days of data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // This would integrate with Google Analytics API in production
      // For now, showing sample data structure
      setMetrics({
        pageViews: 15420,
        uniqueVisitors: 8934,
        bounceRate: 42.3,
        avgSessionDuration: 245,
        conversionRate: 3.2,
        totalRevenue: 2840.50
      });

      setTrafficSources([
        { source: 'Organic Search', visitors: 4521, percentage: 50.6 },
        { source: 'Direct', visitors: 2145, percentage: 24.0 },
        { source: 'Social Media', visitors: 1289, percentage: 14.4 },
        { source: 'Referral', visitors: 979, percentage: 11.0 }
      ]);

      setDeviceData([
        { device: 'Mobile', sessions: 5421, percentage: 60.7 },
        { device: 'Desktop', sessions: 2876, percentage: 32.2 },
        { device: 'Tablet', sessions: 637, percentage: 7.1 }
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

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
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Page Views"
          value={metrics.pageViews}
          change={12.5}
          icon={Eye}
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          change={8.2}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          change={0.8}
          icon={TrendingUp}
          format="percentage"
        />
        <MetricCard
          title="Revenue"
          value={metrics.totalRevenue}
          change={15.3}
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
              value={metrics.bounceRate}
              change={-2.1}
              icon={MousePointer}
              format="percentage"
            />
            <MetricCard
              title="Avg. Session Duration"
              value={metrics.avgSessionDuration}
              change={5.7}
              icon={Activity}
              format="duration"
            />
            <MetricCard
              title="Sessions"
              value={8934}
              change={11.2}
              icon={Calendar}
            />
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { page: '/', views: 3421, percentage: 22.2 },
                  { page: '/register', views: 2156, percentage: 14.0 },
                  { page: '/auth', views: 1834, percentage: 11.9 },
                  { page: '/support', views: 1245, percentage: 8.1 },
                  { page: '/contact', views: 892, percentage: 5.8 }
                ].map((item, index) => (
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
              <div className="space-y-4">
                {[
                  { event: 'Emergency SOS Button Clicked', count: 127, trend: '+5.2%' },
                  { event: 'Registration Completed', count: 89, trend: '+12.1%' },
                  { event: 'Subscription Purchased', count: 34, trend: '+18.9%' },
                  { event: 'Emma Chat Interaction', count: 456, trend: '+8.7%' },
                  { event: 'Family Member Invited', count: 67, trend: '+3.4%' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{event.count} events</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        {event.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-emerald-600">23</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Page Views (last hour)</p>
                  <p className="text-3xl font-bold">142</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Top Active Pages</p>
                <div className="space-y-2">
                  {[
                    { page: '/', users: 8 },
                    { page: '/register', users: 5 },
                    { page: '/member-dashboard', users: 4 },
                    { page: '/contact', users: 3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.page}</span>
                      <span className="font-medium">{item.users} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;