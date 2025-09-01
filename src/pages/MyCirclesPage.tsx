import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Settings, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Circle {
  id: string;
  name: string;
  members_count: number;
  is_owner: boolean;
  billing_status?: string;
}

export default function MyCirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadCircles = async () => {
    if (!user) return;

    try {
      // Get family groups where user is owner
      const { data: ownedGroups, error: ownedError } = await supabase
        .from("family_groups")
        .select("id, owner_user_id")
        .eq("owner_user_id", user.id);

      if (ownedError) throw ownedError;

      // Get family memberships where user is a member
      const { data: memberships, error: memberError } = await supabase
        .from("family_memberships")
        .select(`
          group_id,
          billing_status,
          family_groups!inner(id, owner_user_id)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (memberError) throw memberError;

      // Combine and process circles
      const allCircleIds = new Set([
        ...(ownedGroups?.map(g => g.id) || []),
        ...(memberships?.map(m => m.group_id) || [])
      ]);

      const circleData: Circle[] = [];

      for (const circleId of allCircleIds) {
        // Count members
        const { count } = await supabase
          .from("family_memberships")
          .select("*", { count: "exact", head: true })
          .eq("group_id", circleId)
          .eq("status", "active");

        const isOwner = ownedGroups?.some(g => g.id === circleId) || false;
        const membership = memberships?.find(m => m.group_id === circleId);

        circleData.push({
          id: circleId,
          name: `Family Circle`, // TODO: Add proper name field to family_groups
          members_count: count || 0,
          is_owner: isOwner,
          billing_status: membership?.billing_status || "active"
        });
      }

      setCircles(circleData);
    } catch (error) {
      console.error("Error loading circles:", error);
      toast({
        title: "Error",
        description: "Failed to load family circles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCircles();
  }, [user]);

  const getBillingStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "default";
      case "grace": return "secondary";
      case "past_due": return "destructive";
      default: return "secondary";
    }
  };

  const getBillingStatusText = (status?: string) => {
    switch (status) {
      case "active": return "Active";
      case "grace": return "Grace Period";
      case "past_due": return "Past Due";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Family Circles</h1>
          <p className="text-muted-foreground">Manage your family groups and location sharing</p>
        </div>
        <Button 
          onClick={() => navigate("/family-access-setup")}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Create Circle
        </Button>
      </div>

      <div className="grid gap-4">
        {circles.map(circle => (
          <Card key={circle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {circle.name}
                  {circle.is_owner && (
                    <Badge variant="outline" className="text-xs">Owner</Badge>
                  )}
                </CardTitle>
                <Badge variant={getBillingStatusColor(circle.billing_status)}>
                  {getBillingStatusText(circle.billing_status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {circle.members_count} member{circle.members_count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs">
                    ID: {circle.id.slice(0, 8)}...
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/map?circle=${circle.id}`)}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    View Map
                  </Button>
                  {circle.is_owner && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/family-access-setup?invite=true&group=${circle.id}`)}
                        className="flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Invite
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/family-dashboard/settings?group=${circle.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Manage
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {circle.billing_status === "past_due" && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive">
                    Billing is past due. Location sharing has been paused for privacy protection.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {circles.length === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No Family Circles Yet</h3>
                <p className="text-muted-foreground">
                  Create your first family circle to start sharing locations and staying connected.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/family-access-setup")}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Your First Circle
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}