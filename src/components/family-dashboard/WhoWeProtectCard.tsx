import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, MapPin, Phone, Heart, AlertTriangle, Eye } from 'lucide-react';

interface WhoWeProtectCardProps {
  ownerProfile: any;
  familyRole: any;
  emergencyContacts: any[];
  userAccess: {
    canViewLocation: boolean;
    canViewMedical: boolean;
    canReceiveAlerts: boolean;
    canContactEmergency: boolean;
  };
}

const WhoWeProtectCard = ({ ownerProfile, familyRole, emergencyContacts, userAccess }: WhoWeProtectCardProps) => {
  const getAccessLevelBadge = () => {
    const accessCount = Object.values(userAccess).filter(Boolean).length;
    if (accessCount >= 4) return { variant: 'default' as const, text: 'Full Emergency Access', color: 'text-emerald-700' };
    if (accessCount >= 2) return { variant: 'secondary' as const, text: 'Emergency Monitor', color: 'text-blue-700' };
    return { variant: 'outline' as const, text: 'Limited Access', color: 'text-orange-700' };
  };

  const accessLevel = getAccessLevelBadge();

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <Shield className="h-5 w-5" />
          Who We're Protecting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Person */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-emerald-200">
          <Avatar className="w-12 h-12 border-2 border-emerald-200">
            <AvatarImage src={ownerProfile?.avatar_url} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
              {ownerProfile?.first_name?.[0]}{ownerProfile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {ownerProfile?.first_name} {ownerProfile?.last_name}
            </h3>
            <p className="text-sm text-emerald-700">Primary Protected Person</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">
                {ownerProfile?.address ? 'Location tracked' : 'Address on file'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <Badge {...accessLevel} className={accessLevel.color}>
              {accessLevel.text}
            </Badge>
            <p className="text-xs text-emerald-600 mt-1">Your Access Level</p>
          </div>
        </div>

        {/* Access Permissions */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 p-2 rounded ${userAccess.canViewLocation ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Eye className={`h-4 w-4 ${userAccess.canViewLocation ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${userAccess.canViewLocation ? 'text-emerald-700' : 'text-gray-500'}`}>
              Location Access
            </span>
          </div>
          
          <div className={`flex items-center gap-2 p-2 rounded ${userAccess.canReceiveAlerts ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <AlertTriangle className={`h-4 w-4 ${userAccess.canReceiveAlerts ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${userAccess.canReceiveAlerts ? 'text-emerald-700' : 'text-gray-500'}`}>
              Emergency Alerts
            </span>
          </div>
          
          <div className={`flex items-center gap-2 p-2 rounded ${userAccess.canViewMedical ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Heart className={`h-4 w-4 ${userAccess.canViewMedical ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${userAccess.canViewMedical ? 'text-emerald-700' : 'text-gray-500'}`}>
              Medical Info
            </span>
          </div>
          
          <div className={`flex items-center gap-2 p-2 rounded ${userAccess.canContactEmergency ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Phone className={`h-4 w-4 ${userAccess.canContactEmergency ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${userAccess.canContactEmergency ? 'text-emerald-700' : 'text-gray-500'}`}>
              Emergency Contact
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-emerald-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            disabled={!userAccess.canViewLocation}
            onClick={() => window.location.href = '/family-dashboard/live-map'}
          >
            <MapPin className="h-4 w-4 mr-2" />
            View Location
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            disabled={!userAccess.canContactEmergency}
            onClick={() => window.location.href = '/family-dashboard/profile'}
          >
            <Shield className="h-4 w-4 mr-2" />
            Safety Check
          </Button>
        </div>

        <div className="text-xs text-emerald-600 text-center pt-2 border-t border-emerald-200">
          You have been granted emergency monitoring access by {ownerProfile?.first_name}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhoWeProtectCard;