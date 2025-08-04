import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Shield, MapPin, Phone, Mail } from "lucide-react";

export function FamilyPage() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    relationship: ""
  });

  // Mock family members data
  const familyMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      relationship: "Spouse",
      status: "active",
      lastSeen: "2 minutes ago",
      location: "Home",
      avatar: null
    },
    {
      id: 2,
      name: "Michael Johnson",
      email: "mike.j@email.com",
      relationship: "Child",
      status: "active",
      lastSeen: "15 minutes ago",
      location: "School",
      avatar: null
    }
  ];

  const handleInvite = () => {
    // TODO: Implement family invite functionality
    console.log("Inviting family member:", inviteData);
    setShowInviteForm(false);
    setInviteData({ name: "", email: "", relationship: "" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Family Dashboard
              </CardTitle>
              <Button onClick={() => setShowInviteForm(true)} variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Invite Family Member
              </Button>
            </div>
            <CardDescription>
              Manage your family members and monitor their safety
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Invite Form */}
        {showInviteForm && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Family Member</CardTitle>
              <CardDescription>
                Send an invitation to a family member to join your safety network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={inviteData.relationship}
                  onChange={(e) => setInviteData({...inviteData, relationship: e.target.value})}
                  placeholder="e.g., Spouse, Child, Parent, Sibling"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInvite}>Send Invitation</Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Members ({familyMembers.length})
            </CardTitle>
            <CardDescription>
              Monitor the safety status and location of your family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {member.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(member.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Last seen: {member.lastSeen}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {familyMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your safety network by inviting family members
                </p>
                <Button onClick={() => setShowInviteForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Your First Family Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}