import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Shield, Activity, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const CustomerProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: customer, isLoading } = useCustomerProfile(userId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const handleBack = () => {
    navigate('/admin-dashboard/customers');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
      country: customer?.country || '',
      address: customer?.address || '',
      date_of_birth: customer?.date_of_birth || '',
      language_preference: customer?.language_preference || 'en'
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedData)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Customer profile updated successfully'
      });

      // Refetch the customer data
      queryClient.invalidateQueries({ queryKey: ['customer-profile', userId] });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update customer profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button onClick={handleBack} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer';
  const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || 'UC';
  const subscriptionStatus = customer.subscriber?.subscribed ? 'Active' : 'Inactive';
  const subscriptionTier = customer.subscriber?.subscription_tier || 'Free';
  const profileCompletion = customer.profile_completion_percentage || 0;

  // Calculate days remaining for subscription
  const daysRemaining = customer.subscriber?.subscription_end 
    ? Math.ceil((new Date(customer.subscriber.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">Customer ID: {customer.user_id.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={subscriptionStatus === 'Active' ? 'default' : 'secondary'}>
            {subscriptionStatus}
          </Badge>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-left">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.country}</span>
                  </div>
                )}
                {customer.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className="font-semibold">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subscription</span>
                  <Badge variant="outline">{subscriptionTier}</Badge>
                </div>
                {customer.subscriber?.subscription_end && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Days Remaining</span>
                    <span className="font-semibold">{daysRemaining}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Emergency Contacts</span>
                  <span className="font-semibold">{customer.emergency_contacts?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-semibold">{customer.connections?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customer.email && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={`mailto:${customer.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              )}
              {customer.phone && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={`tel:${customer.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <Shield className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Summary</CardTitle>
                  <CardDescription>Key information and metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Profile Completion</p>
                      <p className="text-2xl font-bold">{profileCompletion}%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Subscription</p>
                      <p className="text-2xl font-bold">{subscriptionTier}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Emergency Network</p>
                      <p className="text-2xl font-bold">{(customer.emergency_contacts?.length || 0) + (customer.connections?.length || 0)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className="text-2xl font-bold">{customer.role || 'User'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Account Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{new Date(customer.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{new Date(customer.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location Sharing</p>
                        <Badge variant={customer.location_sharing_enabled ? 'default' : 'secondary'}>
                          {customer.location_sharing_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Regional Subscription</p>
                        <Badge variant={customer.subscription_regional ? 'default' : 'secondary'}>
                          {customer.subscription_regional ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edit customer personal details' : 'View customer personal details'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          value={editedData.first_name}
                          onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.first_name || '-'}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          value={editedData.last_name}
                          onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.last_name || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedData.phone}
                          onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.phone || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <p className="text-sm p-2 bg-muted rounded">{customer.email || '-'}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={editedData.date_of_birth}
                          onChange={(e) => setEditedData({ ...editedData, date_of_birth: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">
                          {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : '-'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      {isEditing ? (
                        <Input
                          id="country"
                          value={editedData.country}
                          onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.country || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={editedData.address}
                          onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.address || '-'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      {isEditing ? (
                        <Input
                          id="language"
                          value={editedData.language_preference}
                          onChange={(e) => setEditedData({ ...editedData, language_preference: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted rounded">{customer.language_preference || 'en'}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Regional Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Country Code</p>
                        <p className="font-medium">{customer.country_code || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spain Call Center</p>
                        <Badge variant={customer.has_spain_call_center ? 'default' : 'secondary'}>
                          {customer.has_spain_call_center ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>Current subscription information and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {customer.subscriber ? (
                    <>
                      <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">Current Subscription</h3>
                          <Badge variant={customer.subscriber.subscribed ? 'default' : 'secondary'} className="text-sm">
                            {customer.subscriber.subscribed ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Tier</p>
                            <p className="font-medium">{customer.subscriber.subscription_tier || 'Free'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium">{customer.subscriber.subscribed ? 'Active' : 'Inactive'}</p>
                          </div>
                          {customer.subscriber.subscription_end && (
                            <div>
                              <p className="text-sm text-muted-foreground">End Date</p>
                              <p className="font-medium">{new Date(customer.subscriber.subscription_end).toLocaleDateString()}</p>
                            </div>
                          )}
                          {customer.subscriber.stripe_customer_id && (
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Stripe Customer ID</p>
                              <p className="font-mono text-sm">{customer.subscriber.stripe_customer_id}</p>
                            </div>
                          )}
                        </div>

                        {customer.subscriber.subscription_end && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Subscription Progress</span>
                              <span className="font-semibold">{daysRemaining} days remaining</span>
                            </div>
                            <Progress 
                              value={Math.max(0, Math.min(100, (daysRemaining / 365) * 100))} 
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No subscription information available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
