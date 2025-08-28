import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Brain, 
  MessageSquare, 
  Shield, 
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Calendar,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  trend: number[];
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  badge?: string;
  color: string;
}

const EnhancedDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');

  // Enhanced metrics with real-time feel
  const metrics: MetricCard[] = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      trend: [65, 68, 72, 75, 78, 82, 85]
    },
    {
      title: 'Monthly Revenue',
      value: '$34,250',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign,
      trend: [28000, 29500, 31000, 32500, 33000, 33750, 34250]
    },
    {
      title: 'AI Conversations',
      value: '8,392',
      change: '+23.1%',
      changeType: 'positive',
      icon: MessageSquare,
      trend: [6800, 7200, 7600, 7800, 8000, 8200, 8392]
    },
    {
      title: 'Emergency Alerts',
      value: '47',
      change: '-5.3%',
      changeType: 'negative',
      icon: Shield,
      trend: [52, 50, 48, 49, 47, 46, 47]
    }
  ];

  // Enhanced quick actions with new Riven components
  const quickActions: QuickAction[] = [
    {
      title: 'Configure Riven AI',
      description: 'Train and configure AI knowledge, prompts, and behavior',
      icon: Brain,
      route: '/admin-dashboard/riven-config',
      badge: 'New',
      color: 'bg-purple-500'
    },
    {
      title: 'Command Center',
      description: 'Advanced content creation with smart scheduling',
      icon: Zap,
      route: '/admin-dashboard/command-center',
      badge: 'Enhanced',
      color: 'bg-blue-500'
    },
    {
      title: 'Social Media Hub',
      description: 'Manage all social media integrations and content',
      icon: MessageSquare,
      route: '/admin-dashboard/social-media',
      color: 'bg-green-500'
    },
    {
      title: 'Customer Analytics',
      description: 'Deep dive into customer behavior and metrics',
      icon: BarChart3,
      route: '/admin-dashboard/analytics',
      color: 'bg-orange-500'
    },
    {
      title: 'Content Automation',
      description: 'Automated content creation and scheduling',
      icon: Target,
      route: '/admin-dashboard/content-automation',
      color: 'bg-pink-500'
    },
    {
      title: 'System Health',
      description: 'Monitor system performance and health checks',
      icon: Activity,
      route: '/admin-dashboard/settings',
      color: 'bg-red-500'
    }
  ];

  // System alerts and notifications
  const systemAlerts = [
    { type: 'success', message: 'Riven AI successfully processed 247 marketing commands today', time: '2 min ago' },
    { type: 'info', message: 'New social media integration available: TikTok', time: '15 min ago' },
    { type: 'warning', message: 'High API usage detected - consider upgrading plan', time: '1 hour ago' },
    { type: 'info', message: '5 new family accounts created this week', time: '3 hours ago' }
  ];

  // Recent activities
  const recentActivities = [
    { action: 'Campaign Generated', details: 'Weekly family safety tips - 7 posts created', time: '5 min ago', user: 'Riven AI' },
    { action: 'User Registered', details: 'John Smith joined family plan', time: '12 min ago', user: 'System' },
    { action: 'Content Published', details: 'Emergency preparedness guide posted to Instagram', time: '18 min ago', user: 'Auto Scheduler' },
    { action: 'AI Model Updated', details: 'Riven knowledge base updated with new safety protocols', time: '1 hour ago', user: 'Admin' },
    { action: 'SOS Alert Resolved', details: 'Emergency alert #SOS-2024-001 successfully handled', time: '2 hours ago', user: 'Emergency Team' }
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'negative': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete system overview and intelligent insights powered by Riven AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button 
            onClick={() => navigate('/admin-dashboard/riven-config')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Brain className="h-4 w-4 mr-2" />
            Configure Riven
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(metric.changeType)}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positive' ? 'text-green-500' : 
                        metric.changeType === 'negative' ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  index === 0 ? 'bg-blue-500/10 text-blue-500' :
                  index === 1 ? 'bg-green-500/10 text-green-500' :
                  index === 2 ? 'bg-purple-500/10 text-purple-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
              
              {/* Mini trend line */}
              <div className="mt-4 h-12 flex items-end gap-1">
                {metric.trend.map((value, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-sm ${
                      index === 0 ? 'bg-blue-500/20' :
                      index === 1 ? 'bg-green-500/20' :
                      index === 2 ? 'bg-purple-500/20' :
                      'bg-red-500/20'
                    }`}
                    style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump to key admin functions and new AI-powered tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={action.title}
                onClick={() => navigate(action.route)}
                className="relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>Recent system notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Riven AI Performance
          </CardTitle>
          <CardDescription>
            Real-time AI system performance and intelligence metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Generation</span>
                <span className="text-sm text-muted-foreground">247 today</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">85% success rate</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Knowledge Processing</span>
                <span className="text-sm text-muted-foreground">1.2K items</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">92% accuracy</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm text-muted-foreground">1.3s avg</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: under 2s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboardOverview;