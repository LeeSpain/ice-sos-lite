import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  AlertTriangle, 
  Bell, 
  Phone, 
  MapPin, 
  Shield,
  Clock,
  Heart,
  Eye
} from 'lucide-react';

interface MyRoleCardProps {
  familyRole: any;
  userAccess: {
    canViewLocation: boolean;
    canViewMedical: boolean;
    canReceiveAlerts: boolean;
    canContactEmergency: boolean;
  };
  ownerName: string;
}

const MyRoleCard = ({ familyRole, userAccess, ownerName }: MyRoleCardProps) => {
  const getMyResponsibilities = () => {
    const responsibilities = [];
    
    if (userAccess.canReceiveAlerts) {
      responsibilities.push({
        icon: AlertTriangle,
        title: 'Emergency Response',
        description: 'Receive and respond to emergency alerts',
        priority: 'high'
      });
    }
    
    if (userAccess.canViewLocation) {
      responsibilities.push({
        icon: MapPin,
        title: 'Location Monitoring',
        description: 'Monitor family member locations',
        priority: 'medium'
      });
    }
    
    if (userAccess.canContactEmergency) {
      responsibilities.push({
        icon: Phone,
        title: 'Emergency Contact',
        description: 'Can contact emergency services',
        priority: 'high'
      });
    }
    
    if (userAccess.canViewMedical) {
      responsibilities.push({
        icon: Heart,
        title: 'Medical Information',
        description: 'Access to medical/health info',
        priority: 'medium'
      });
    }

    return responsibilities;
  };

  const responsibilities = getMyResponsibilities();
  
  const getRoleDescription = () => {
    if (familyRole?.role === 'owner') {
      return {
        title: 'Family Emergency Owner',
        description: `You own and manage this family emergency protection system.`,
        badge: { variant: 'default' as const, text: 'Owner', color: 'text-blue-700' }
      };
    }
    
    const relationship = familyRole?.membershipData?.relationship || 'family member';
    return {
      title: `Emergency Contact & Monitor`,
      description: `You are ${ownerName}'s ${relationship} with emergency monitoring access.`,
      badge: { variant: 'secondary' as const, text: 'Emergency Monitor', color: 'text-purple-700' }
    };
  };

  const roleInfo = getRoleDescription();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <UserCheck className="h-5 w-5" />
          My Role & Responsibilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Information */}
        <div className="p-4 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{roleInfo.title}</h3>
            <Badge {...roleInfo.badge} className={roleInfo.badge.color}>
              {roleInfo.badge.text}
            </Badge>
          </div>
          <p className="text-sm text-purple-700">{roleInfo.description}</p>
        </div>

        {/* Responsibilities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-purple-700">Your Emergency Responsibilities:</h4>
          {responsibilities.map((responsibility, index) => {
            const Icon = responsibility.icon;
            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityColor(responsibility.priority)}`}
              >
                <div className={`p-2 rounded-full ${
                  responsibility.priority === 'high' ? 'bg-red-100 text-red-600' :
                  responsibility.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{responsibility.title}</p>
                  <p className="text-xs text-muted-foreground">{responsibility.description}</p>
                </div>
                {responsibility.priority === 'high' && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    Critical
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Emergency Protocols */}
        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Emergency Protocol
          </h4>
          <div className="space-y-1 text-xs text-purple-600">
            <p>1. Respond to emergency alerts within 5 minutes</p>
            <p>2. Contact {ownerName} directly if needed</p>
            <p>3. Call emergency services if situation is critical</p>
            <p>4. Keep your contact information updated</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-purple-700 border-purple-300 hover:bg-purple-50"
            onClick={() => window.location.href = '/family-dashboard/notifications'}
          >
            <Bell className="h-4 w-4 mr-2" />
            Alert History
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-purple-700 border-purple-300 hover:bg-purple-50"
            onClick={() => window.location.href = '/family-dashboard/profile'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Update Info
          </Button>
        </div>

        <div className="text-xs text-purple-600 text-center pt-2 border-t border-purple-200">
          Your access level allows you to monitor and respond to {ownerName}'s emergency needs
        </div>
      </CardContent>
    </Card>
  );
};

export default MyRoleCard;