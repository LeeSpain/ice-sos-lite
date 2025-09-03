import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Heart, 
  Briefcase, 
  Users, 
  MapPin, 
  Phone, 
  Clock, 
  Eye, 
  Bell, 
  MessageSquare,
  Camera,
  Mic,
  Calendar,
  FileText,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';

interface AccessLevel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  permissions: {
    category: string;
    items: {
      name: string;
      description: string;
      enabled: boolean;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export const AccessLevels = () => {
  const accessLevels: AccessLevel[] = [
    {
      id: 'inner_circle',
      name: 'Inner Circle',
      description: 'Immediate family with full emergency access and real-time coordination',
      icon: Heart,
      color: 'text-emergency',
      bgColor: 'bg-emergency/10',
      permissions: [
        {
          category: 'Emergency Response',
          items: [
            { name: 'Instant SOS Alerts', description: 'Immediate push notifications for all emergencies', enabled: true, icon: Bell },
            { name: 'Real-time Location', description: 'Live GPS tracking during active emergencies', enabled: true, icon: MapPin },
            { name: 'Emergency Coordination', description: 'Access to family emergency chat and coordination tools', enabled: true, icon: MessageSquare },
            { name: 'Medical Information', description: 'View emergency medical data and conditions', enabled: true, icon: FileText },
            { name: 'Contact Emergency Services', description: 'Direct integration with 112/999 services', enabled: true, icon: Phone }
          ]
        },
        {
          category: 'Communication Access',
          items: [
            { name: 'Video Call Access', description: 'Emergency video calls during incidents', enabled: true, icon: Camera },
            { name: 'Voice Messages', description: 'Send and receive emergency voice updates', enabled: true, icon: Mic },
            { name: 'Status Updates', description: 'Real-time emergency status notifications', enabled: true, icon: Clock }
          ]
        },
        {
          category: 'Privacy & Control',
          items: [
            { name: 'Always-On Access', description: '24/7 emergency response capability', enabled: true, icon: Shield },
            { name: 'Emergency-Only Location', description: 'Location shared only during SOS events', enabled: true, icon: Eye },
            { name: 'Full Coordination Rights', description: 'Can coordinate with other family members', enabled: true, icon: Users }
          ]
        }
      ]
    },
    {
      id: 'care_network',
      name: 'Care Network',
      description: 'Professional carers and close friends with emergency-only access',
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      permissions: [
        {
          category: 'Emergency Response',
          items: [
            { name: 'Emergency Notifications', description: 'SOS alerts during working hours or emergencies', enabled: true, icon: Bell },
            { name: 'Location During Emergency', description: 'GPS location only during active SOS events', enabled: true, icon: MapPin },
            { name: 'Limited Medical Info', description: 'Essential medical information for emergency response', enabled: true, icon: FileText },
            { name: 'Professional Escalation', description: 'Contact emergency services through care platform', enabled: true, icon: Phone }
          ]
        },
        {
          category: 'Professional Tools',
          items: [
            { name: 'Care Plan Integration', description: 'Access to relevant care plan during emergencies', enabled: true, icon: Calendar },
            { name: 'Incident Reporting', description: 'Submit emergency incident reports', enabled: true, icon: FileText },
            { name: 'Time-Based Access', description: 'Access limited to care hours or emergencies', enabled: true, icon: Clock }
          ]
        },
        {
          category: 'Privacy Controls',
          items: [
            { name: 'Emergency-Only Access', description: 'No access outside of emergency situations', enabled: true, icon: Lock },
            { name: 'Professional Boundaries', description: 'Appropriate access for care relationship', enabled: true, icon: Shield },
            { name: 'Audit Trail', description: 'All access logged for transparency', enabled: true, icon: Eye }
          ]
        }
      ]
    },
    {
      id: 'notify_only',
      name: 'Notify Only',
      description: 'Extended family and neighbors with basic emergency notifications',
      icon: Users,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      permissions: [
        {
          category: 'Basic Notifications',
          items: [
            { name: 'Emergency Alerts', description: 'Basic notification when SOS is triggered', enabled: true, icon: Bell },
            { name: 'General Location', description: 'Approximate area (not precise coordinates)', enabled: true, icon: MapPin },
            { name: 'Status Updates', description: 'Basic updates on emergency resolution', enabled: true, icon: Clock }
          ]
        },
        {
          category: 'Limited Access',
          items: [
            { name: 'No Medical Info', description: 'Cannot access any medical information', enabled: false, icon: FileText },
            { name: 'No Direct Communication', description: 'Cannot directly contact during emergency', enabled: false, icon: MessageSquare },
            { name: 'No Coordination Role', description: 'Cannot participate in emergency coordination', enabled: false, icon: Users }
          ]
        },
        {
          category: 'Privacy Protection',
          items: [
            { name: 'Minimal Data Access', description: 'Only essential emergency information', enabled: true, icon: Lock },
            { name: 'No Location Tracking', description: 'No access to real-time location', enabled: false, icon: Eye },
            { name: 'Emergency-Only Contact', description: 'Contact only during confirmed emergencies', enabled: true, icon: Shield }
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Access Levels & Permissions</h2>
        <p className="text-muted-foreground">Configure granular access controls for different types of trusted contacts</p>
      </div>

      {/* Access Levels Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accessLevels.map((level) => (
          <Card key={level.id} className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${level.bgColor} rounded-xl flex items-center justify-center`}>
                  <level.icon className={`h-6 w-6 ${level.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{level.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {level.permissions.reduce((acc, cat) => acc + cat.items.filter(item => item.enabled).length, 0)} permissions
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {level.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Detailed Permissions */}
      <div className="space-y-6">
        {accessLevels.map((level) => (
          <Card key={level.id} className="border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <level.icon className={`h-6 w-6 ${level.color}`} />
                {level.name} Permissions
              </CardTitle>
              <CardDescription>
                Detailed permissions and capabilities for {level.name} contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {level.permissions.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{category.category}</h4>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${item.enabled ? level.bgColor : 'bg-muted'} rounded-lg flex items-center justify-center`}>
                            <item.icon className={`h-4 w-4 ${item.enabled ? level.color : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{item.name}</span>
                              {item.enabled ? (
                                <Unlock className="h-3 w-3 text-wellness" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`${level.id}-${categoryIndex}-${itemIndex}`} className="sr-only">
                            Toggle {item.name}
                          </Label>
                          <Switch 
                            id={`${level.id}-${categoryIndex}-${itemIndex}`}
                            checked={item.enabled}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-l-4 border-l-warning bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            Privacy & Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-foreground">
            <p>• <strong>Emergency-Only Access:</strong> Location sharing and sensitive data access is restricted to active emergency situations only.</p>
            <p>• <strong>Audit Trail:</strong> All access to your emergency data is logged and can be reviewed in your security dashboard.</p>
            <p>• <strong>Granular Control:</strong> You can modify these permissions at any time or revoke access immediately.</p>
            <p>• <strong>GDPR Compliance:</strong> All data handling follows European privacy regulations with your explicit consent.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};