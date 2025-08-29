import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Heart,
  Save,
  Users,
  Settings,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { useToast } from '@/hooks/use-toast';

const FamilyProfile = () => {
  const { user } = useOptimizedAuth();
  const { data: familyRole } = useFamilyRole();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [familyMembership, setFamilyMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    medical_conditions: [] as string[],
    allergies: [] as string[],
    address: '',
    date_of_birth: ''
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);
      
      if (profileData) {
        setProfileData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          medical_conditions: profileData.medical_conditions || [],
          allergies: profileData.allergies || [],
          address: profileData.address || '',
          date_of_birth: profileData.date_of_birth || ''
        });
      }

      // Load family membership details
      if (familyRole?.familyGroupId) {
        const { data: membership } = await supabase
          .from('family_memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', familyRole.familyGroupId)
          .single();

        setFamilyMembership(membership);
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          medical_conditions: profileData.medical_conditions,
          allergies: profileData.allergies,
          address: profileData.address,
          date_of_birth: profileData.date_of_birth,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your family profile has been saved successfully"
      });

      loadProfileData();

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const firstName = profileData.first_name || '';
    const lastName = profileData.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Family Profile</h1>
          <p className="text-muted-foreground">
            Manage your emergency information and family settings
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Heart className="h-3 w-3" />
          Family Member
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials() || 'FM'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {profileData.first_name} {profileData.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-1">
                  {familyMembership?.status || 'Active'} Family Member
                </Badge>
              </div>
            </div>

            {/* Personal Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Home address"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Medical Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Input
                    id="medical_conditions"
                    value={profileData.medical_conditions.join(', ')}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      medical_conditions: e.target.value ? e.target.value.split(', ').map(item => item.trim()) : []
                    }))}
                    placeholder="List any medical conditions (separated by commas)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={profileData.allergies.join(', ')}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      allergies: e.target.value ? e.target.value.split(', ').map(item => item.trim()) : []
                    }))}
                    placeholder="List any allergies (separated by commas)"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Family Status & Settings */}
        <div className="space-y-6">
          {/* Family Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Membership Status:</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Alerts:</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Sharing:</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    SOS Only
                  </Badge>
                </div>
                {familyMembership && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since:</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(familyMembership.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Location Privacy</p>
                  <p className="text-muted-foreground">Your location is only shared during active SOS emergencies.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Data Protection</p>
                  <p className="text-muted-foreground">All emergency data is encrypted and securely stored.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Family Access</p>
                  <p className="text-muted-foreground">Only approved family members can see your emergency status.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/app'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Emergency SOS App
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/family-dashboard/emergency-map'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Emergency Map
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/family-dashboard/notifications'}
              >
                <Bell className="h-4 w-4 mr-2" />
                View Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyProfile;