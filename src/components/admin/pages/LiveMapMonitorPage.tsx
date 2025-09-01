import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMapProvider } from '@/hooks/useMapProvider';
import { Map, Users, MapPin, Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LivePresence {
  user_id: string;
  lat: number;
  lng: number;
  last_seen: string;
  battery?: number;
  is_paused: boolean;
}

interface FamilyGroup {
  id: string;
  owner_user_id: string;
  member_count: number;
}

export default function LiveMapMonitorPage() {
  const [presences, setPresences] = useState<LivePresence[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { MapView } = useMapProvider();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all live presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('live_presence')
        .select('*');

      if (presenceError) throw presenceError;

      // Load family groups with member counts
      const { data: groupsData, error: groupsError } = await supabase
        .from('family_groups')
        .select(`
          id,
          owner_user_id,
          created_at
        `);

      if (groupsError) throw groupsError;

      // Transform groups data to include member count
      const enrichedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('family_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setPresences(presenceData || []);
      setFamilyGroups(enrichedGroups);
    } catch (error) {
      console.error('Error loading Live Map data:', error);
      toast({
        title: "Error",
        description: "Failed to load Live Map data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const activePresences = presences.filter(p => !p.is_paused);
  const pausedPresences = presences.filter(p => p.is_paused);

  const markers = activePresences.map(presence => ({
    id: presence.user_id,
    lat: presence.lat,
    lng: presence.lng,
    render: () => (
      <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg" />
    )
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Map Monitor</h1>
          <p className="text-muted-foreground">Real-time family location tracking overview</p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePresences.length}</div>
            <p className="text-xs text-muted-foreground">Currently sharing location</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Users</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pausedPresences.length}</div>
            <p className="text-xs text-muted-foreground">Location sharing paused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{familyGroups.length}</div>
            <p className="text-xs text-muted-foreground">Active family circles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{presences.length}</div>
            <p className="text-xs text-muted-foreground">In Live Map system</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Map View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Global Family Location Map
          </CardTitle>
          <CardDescription>
            Real-time view of all active family members' locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border">
            <MapView
              markers={markers}
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Presence Details */}
      <Card>
        <CardHeader>
          <CardTitle>Location Status Details</CardTitle>
          <CardDescription>Detailed view of all users in the Live Map system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {presences.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active location data found</p>
            ) : (
              presences.map((presence) => (
                <div key={presence.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${presence.is_paused ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <div>
                      <p className="font-medium">User {presence.user_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {presence.lat.toFixed(6)}, {presence.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {presence.battery && (
                      <Badge variant="outline">{presence.battery}% battery</Badge>
                    )}
                    <Badge variant={presence.is_paused ? "secondary" : "default"}>
                      {presence.is_paused ? 'Paused' : 'Active'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(presence.last_seen).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}