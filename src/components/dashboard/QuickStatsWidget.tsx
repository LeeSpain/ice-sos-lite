import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Heart, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Bluetooth,
  Battery,
  Wifi
} from "lucide-react";

interface QuickStatsWidgetProps {
  profile: any;
  subscription: any;
}

const QuickStatsWidget = ({ profile, subscription }: QuickStatsWidgetProps) => {
  const emergencyContactsCount = profile?.emergency_contacts ? 
    (Array.isArray(profile.emergency_contacts) ? profile.emergency_contacts.length : 0) : 0;
  
  const profileCompletion = profile?.profile_completion_percentage || 0;
  
  const protectionStatus = subscription?.subscribed ? 'active' : 'inactive';
  
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-emergency' : 'text-orange-500';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? CheckCircle : AlertTriangle;
  };

  const stats = [
    {
      label: "Protection Status",
      value: protectionStatus === 'active' ? 'Active' : 'Inactive',
      icon: Shield,
      color: getStatusColor(protectionStatus),
      IconComponent: getStatusIcon(protectionStatus)
    },
    {
      label: "Emergency Contacts",
      value: emergencyContactsCount,
      icon: Users,
      color: emergencyContactsCount >= 3 ? 'text-emergency' : 'text-orange-500',
      IconComponent: emergencyContactsCount >= 3 ? CheckCircle : AlertTriangle
    },
    {
      label: "Health Profile",
      value: profile?.medical_conditions?.length > 0 ? 'Complete' : 'Incomplete',
      icon: Heart,
      color: profile?.medical_conditions?.length > 0 ? 'text-emergency' : 'text-orange-500',
      IconComponent: profile?.medical_conditions?.length > 0 ? CheckCircle : AlertTriangle
    },
    {
      label: "Device Status",
      value: 'Connected',
      icon: Bluetooth,
      color: 'text-emergency',
      IconComponent: CheckCircle
    }
  ];

  return (
    <div className="space-y-4">
      {/* Profile Completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {profileCompletion === 100 ? 'Profile complete!' : 'Complete your profile for better protection'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50`}>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.value}</p>
                  </div>
                </div>
                <stat.IconComponent className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety Score */}
      <Card className="bg-gradient-to-r from-primary/5 to-emergency/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Safety Score</span>
            <Badge variant="secondary" className="bg-emergency/10 text-emergency">
              85/100
            </Badge>
          </div>
          <Progress value={85} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Excellent safety preparedness
          </p>
        </CardContent>
      </Card>

      {/* Device Status */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Connected Devices</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4 text-primary" />
                <span className="text-sm">Bluetooth Pendant</span>
              </div>
              <div className="flex items-center gap-1">
                <Battery className="h-3 w-3 text-emergency" />
                <span className="text-xs text-muted-foreground">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-sm">Location Services</span>
              </div>
              <CheckCircle className="h-4 w-4 text-emergency" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStatsWidget;