import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Heart, Users, Clock } from 'lucide-react';

interface ConnectionHeaderProps {
  ownerProfile: any;
  familyRole: any;
  isConnected: boolean;
  lastSync?: Date;
}

const ConnectionHeader = ({ ownerProfile, familyRole, isConnected, lastSync }: ConnectionHeaderProps) => {
  const getConnectionStatus = () => {
    if (!isConnected) return { color: 'bg-destructive', text: 'Disconnected' };
    if (lastSync && Date.now() - lastSync.getTime() < 300000) return { color: 'bg-emerald-500', text: 'Live' };
    return { color: 'bg-warning', text: 'Connected' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-blue-200">
              <AvatarImage src={ownerProfile?.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                {ownerProfile?.first_name?.[0]}{ownerProfile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${connectionStatus.color} rounded-full border-2 border-white flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Connected to {ownerProfile?.first_name || 'Family Owner'}
            </h1>
            <p className="text-blue-700 font-medium">
              You are {familyRole?.membershipData?.relationship || 'a family member'} of {ownerProfile?.first_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-sm text-blue-600">
                {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Never synced'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Badge 
            variant="outline" 
            className={`gap-2 border-blue-300 ${connectionStatus.color === 'bg-emerald-500' ? 'text-emerald-700' : 'text-blue-700'}`}
          >
            <div className={`w-2 h-2 ${connectionStatus.color} rounded-full`}></div>
            {connectionStatus.text}
          </Badge>
          
          <Badge variant="secondary" className="gap-2">
            <Shield className="h-3 w-3" />
            {familyRole?.role === 'owner' ? 'Family Owner' : 'Emergency Monitor'}
          </Badge>
          
          <Badge variant="outline" className="gap-2 text-purple-700 border-purple-300">
            <Heart className="h-3 w-3" />
            Protected Family
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ConnectionHeader;