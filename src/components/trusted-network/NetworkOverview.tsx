import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Activity,
  Phone,
  MapPin,
  Timer
} from 'lucide-react';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';

export const NetworkOverview = () => {
  const { data: familyRole } = useFamilyRole();
  const { data: familyData } = useFamilyMembers(familyRole?.familyGroupId);
  const { contacts } = useEmergencyContacts();

  const totalConnections = (familyData?.members?.length || 0) + (contacts?.length || 0);
  const activeConnections = familyData?.members?.filter(m => m.status === 'active')?.length || 0;
  const pendingInvites = familyData?.pendingInvites?.length || 0;

  const networkHealth = totalConnections > 0 ? Math.min(100, (activeConnections / Math.max(totalConnections, 1)) * 100) : 0;

  const getHealthStatus = (health: number) => {
    if (health >= 80) return { label: 'Excellent', color: 'bg-wellness', textColor: 'text-wellness' };
    if (health >= 60) return { label: 'Good', color: 'bg-warning', textColor: 'text-warning' };
    if (health >= 40) return { label: 'Fair', color: 'bg-accent-red', textColor: 'text-accent-red' };
    return { label: 'Needs Attention', color: 'bg-emergency', textColor: 'text-emergency' };
  };

  const healthStatus = getHealthStatus(networkHealth);

  const quickStats = [
    {
      label: 'Total Network',
      value: totalConnections,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active Contacts',
      value: activeConnections,
      icon: CheckCircle,
      color: 'text-wellness',
      bgColor: 'bg-wellness/10'
    },
    {
      label: 'Pending Invites',
      value: pendingInvites,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Network Health',
      value: `${Math.round(networkHealth)}%`,
      icon: Shield,
      color: healthStatus.textColor,
      bgColor: `${healthStatus.color}/10`
    }
  ];

  const recentActivity = [
    {
      type: 'contact_added',
      message: 'New emergency contact added',
      time: '2 hours ago',
      icon: Plus,
      color: 'text-wellness'
    },
    {
      type: 'invite_sent',
      message: 'Family invitation sent to Sarah',
      time: '1 day ago',
      icon: Users,
      color: 'text-primary'
    },
    {
      type: 'test_completed',
      message: 'Emergency system test completed',
      time: '3 days ago',
      icon: CheckCircle,
      color: 'text-wellness'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Network Overview</h2>
          <p className="text-muted-foreground">Your trusted emergency coordination network status</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Health Card */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Network Health Score
          </CardTitle>
          <CardDescription>
            Overall readiness of your emergency coordination network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{Math.round(networkHealth)}%</p>
              <Badge variant="secondary" className={`${healthStatus.color} text-white`}>
                {healthStatus.label}
              </Badge>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${healthStatus.textColor} stroke-current transition-all duration-500`}
                  strokeWidth="3"
                  strokeDasharray={`${networkHealth}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="space-y-2 pt-4 border-t border-border/50">
            <p className="text-sm font-medium text-foreground">Recommendations:</p>
            <div className="space-y-1">
              {pendingInvites > 0 && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {pendingInvites} pending invitation{pendingInvites > 1 ? 's' : ''} need follow-up
                </div>
              )}
              {activeConnections < 3 && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Users className="h-4 w-4" />
                  Consider adding more emergency contacts for better coverage
                </div>
              )}
              {networkHealth === 100 && (
                <div className="flex items-center gap-2 text-sm text-wellness">
                  <CheckCircle className="h-4 w-4" />
                  Your network is optimally configured
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest changes to your trusted network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Readiness Test */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Emergency Readiness
          </CardTitle>
          <CardDescription>
            Test your network's emergency response capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Last Test: 3 days ago</p>
              <p className="text-sm text-muted-foreground">All contacts responded within 5 minutes</p>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Run Test
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-lg font-bold text-wellness">2.3min</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-wellness">100%</p>
              <p className="text-xs text-muted-foreground">Contact Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-wellness">98%</p>
              <p className="text-xs text-muted-foreground">Reliability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};