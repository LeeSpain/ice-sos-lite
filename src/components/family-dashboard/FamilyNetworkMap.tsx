import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown, Heart, Phone, Mail, MapPin, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

interface FamilyNetworkMapProps {
  familyGroupId: string;
  ownerProfile: any;
  currentUserRole: any;
}

const FamilyNetworkMap = ({ familyGroupId, ownerProfile, currentUserRole }: FamilyNetworkMapProps) => {
  const { data: familyData } = useFamilyMembers(familyGroupId);
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);

  useEffect(() => {
    loadFamilyProfiles();
  }, [familyData]);

  const loadFamilyProfiles = async () => {
    if (!familyData?.members) return;

    try {
      const userIds = familyData.members.map(m => m.user_id).filter(Boolean);
      if (userIds.length === 0) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, phone')
        .in('user_id', userIds);

      if (profiles) {
        const enrichedProfiles = profiles.map(profile => {
          const memberData = familyData.members.find(m => m.user_id === profile.user_id);
          return {
            ...profile,
            relationship: memberData?.relationship || 'Family Member',
            isOwner: profile.user_id === ownerProfile?.user_id,
            status: memberData?.status || 'active'
          };
        });
        setFamilyProfiles(enrichedProfiles);
      }
    } catch (error) {
      console.error('Error loading family profiles:', error);
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'spouse': case 'partner': return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'child': case 'son': case 'daughter': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'parent': case 'mother': case 'father': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'sibling': case 'sister': case 'brother': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIndicator = (profile: any) => {
    if (profile.isOwner) return { color: 'bg-yellow-400', text: 'Owner' };
    // In a real app, this would check actual online status
    return { color: 'bg-emerald-400', text: 'Connected' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Family Network Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your connected family members and their relationships
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner at the center */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-yellow-300">
                  <AvatarImage src={ownerProfile?.avatar_url} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700 text-lg font-semibold">
                    {ownerProfile?.first_name?.[0]}{ownerProfile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mt-2">{ownerProfile?.first_name}</h3>
              <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                Family Owner
              </Badge>
            </div>
          </div>
        </div>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {familyProfiles.filter(p => !p.isOwner).map((profile) => {
            const statusInfo = getStatusIndicator(profile);
            const relationshipColor = getRelationshipColor(profile.relationship);
            
            return (
              <div key={profile.user_id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-sm">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusInfo.color} rounded-full border border-white`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">
                    {profile.first_name} {profile.last_name}
                  </h4>
                  <Badge variant="outline" className={`text-xs ${relationshipColor}`}>
                    {profile.relationship}
                  </Badge>
                </div>
                
                <div className="flex gap-1">
                  {profile.phone && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Phone className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MapPin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Invites */}
        {familyData?.pendingInvites && familyData.pendingInvites.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Pending Invitations</h4>
            <div className="space-y-2">
              {familyData.pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded border border-dashed">
                  <Avatar className="w-8 h-8 opacity-50">
                    <AvatarFallback className="text-xs">
                      {invite.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{invite.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {invite.relationship} • Pending
                    </Badge>
                  </div>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{familyProfiles.length}</div>
            <div className="text-xs text-muted-foreground">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {familyProfiles.filter(p => !p.isOwner).length}
            </div>
            <div className="text-xs text-muted-foreground">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {familyData?.pendingInvites?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/family-dashboard/live-map'}
        >
          <Activity className="h-4 w-4 mr-2" />
          View Everyone on Live Map
        </Button>
      </CardContent>
    </Card>
  );
};

export default FamilyNetworkMap;