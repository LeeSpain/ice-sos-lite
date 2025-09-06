import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const metrics = [
    { label: 'Total Reach', value: '45.2K', change: '+12%', icon: Eye, color: 'text-blue-600' },
    { label: 'Engagement', value: '2.8K', change: '+8%', icon: Heart, color: 'text-red-600' },
    { label: 'Followers', value: '18.3K', change: '+15%', icon: Users, color: 'text-green-600' },
    { label: 'Shares', value: '892', change: '+22%', icon: Share, color: 'text-purple-600' }
  ];

  const campaigns = [
    { name: 'Emergency Preparedness', reach: 12500, engagement: 8.5, status: 'active' },
    { name: 'Family Safety Tips', reach: 9800, engagement: 12.3, status: 'completed' },
    { name: 'Customer Stories', reach: 7200, engagement: 15.2, status: 'active' },
    { name: 'App Features', reach: 5600, engagement: 6.8, status: 'paused' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.reach.toLocaleString()} reach • {campaign.engagement}% engagement
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <Progress value={campaign.engagement * 5} className="w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Top Performing Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Emergency Contact Setup Guide', engagement: '15.2K', platform: 'Instagram' },
                { title: 'Family Safety Checklist', engagement: '12.8K', platform: 'Facebook' },
                { title: 'SOS Button Tutorial', engagement: '9.4K', platform: 'YouTube' }
              ].map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <div>
                    <p className="font-medium text-sm">{content.title}</p>
                    <p className="text-xs text-muted-foreground">{content.platform}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{content.engagement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Weekly Safety Tip #15', time: 'Today 3:00 PM', platform: 'Instagram' },
                { title: 'Customer Success Story', time: 'Tomorrow 10:00 AM', platform: 'Facebook' },
                { title: 'App Feature Highlight', time: 'Wed 2:00 PM', platform: 'LinkedIn' }
              ].map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <div>
                    <p className="font-medium text-sm">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.platform}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{post.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};