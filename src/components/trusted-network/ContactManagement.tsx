import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Edit, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Shield,
  UserCheck,
  AlertCircle,
  Heart,
  Briefcase,
  Home
} from 'lucide-react';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  accessLevel: 'inner_circle' | 'care_network' | 'notify_only';
  type: 'family' | 'professional' | 'friend';
}

export const ContactManagement = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    accessLevel: 'care_network',
    type: 'family'
  });

  const { data: familyRole } = useFamilyRole();
  const { data: familyData } = useFamilyMembers(familyRole?.familyGroupId);
  const { contacts } = useEmergencyContacts();

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'inner_circle':
        return <Badge className="bg-emergency text-white">Inner Circle</Badge>;
      case 'care_network':
        return <Badge className="bg-primary text-white">Care Network</Badge>;
      case 'notify_only':
        return <Badge variant="secondary">Notify Only</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'family':
        return <Heart className="h-4 w-4 text-emergency" />;
      case 'professional':
        return <Briefcase className="h-4 w-4 text-primary" />;
      case 'friend':
        return <UserCheck className="h-4 w-4 text-wellness" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-wellness';
      case 'pending':
        return 'text-warning';
      case 'inactive':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleAddContact = () => {
    // Handle form submission
    console.log('Adding contact:', formData);
    setShowAddDialog(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      accessLevel: 'care_network',
      type: 'family'
    });
  };

  // Combine family members and emergency contacts
  const allContacts = [
    ...(familyData?.members || []).map(member => ({
      ...member,
      source: 'family',
      accessLevel: 'inner_circle'
    })),
    ...(contacts || []).map(contact => ({
      ...contact,
      source: 'emergency',
      accessLevel: 'care_network',
      status: 'active'
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contact Management</h2>
          <p className="text-muted-foreground">Manage your trusted emergency network contacts</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Trusted Contact</DialogTitle>
              <DialogDescription>
                Add a new person to your emergency coordination network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g. Spouse, Daughter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Contact Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="professional">Professional Carer</SelectItem>
                      <SelectItem value="friend">Friend/Neighbor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select value={formData.accessLevel} onValueChange={(value: any) => setFormData({ ...formData, accessLevel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inner_circle">Inner Circle</SelectItem>
                      <SelectItem value="care_network">Care Network</SelectItem>
                      <SelectItem value="notify_only">Notify Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>
                  Add Contact
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contact Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emergency">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-emergency" />
              Inner Circle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {allContacts.filter(c => c.accessLevel === 'inner_circle').length}
            </div>
            <p className="text-xs text-muted-foreground">Full emergency access & real-time coordination</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Care Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {allContacts.filter(c => c.accessLevel === 'care_network').length}
            </div>
            <p className="text-xs text-muted-foreground">Emergency-only access with professional tools</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Notify Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {allContacts.filter(c => c.accessLevel === 'notify_only').length}
            </div>
            <p className="text-xs text-muted-foreground">Basic emergency notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Contacts ({allContacts.length})
          </CardTitle>
          <CardDescription>
            Your complete emergency coordination network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts added yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              allContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://avatar.vercel.sh/${contact.name}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{contact.name}</h3>
                        {getContactTypeIcon((contact as any).type || 'family')}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {contact.relationship || 'Emergency Contact'}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getAccessLevelBadge(contact.accessLevel)}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${contact.status === 'active' ? 'bg-wellness' : contact.status === 'pending' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                      <span className={`text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status || 'active'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span>Bulk Import</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Phone className="h-6 w-6 text-primary" />
              <span>Test Network</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span>Export Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};