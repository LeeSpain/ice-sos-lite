import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Settings, CreditCard, AlertCircle, Download, Plus, Users, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionCardProps {
  subscription: any;
}

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', relationship: '' });
  // Temporary simple toast function to avoid useToast dependency
  const toast = ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description} (${variant || 'default'})`);
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    if (subscription?.subscribed) {
      loadInvoices();
      loadFamilyMembers();
    }
  }, [subscription]);

  const loadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const { data, error } = await supabase.functions.invoke('billing-invoices');
      if (error) throw error;
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load billing history.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const loadFamilyMembers = async () => {
    try {
      setIsLoadingFamily(true);
      const { data, error } = await supabase.functions.invoke('family-invites');
      if (error) throw error;
      setFamilyMembers(data.familyMembers || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setIsLoadingFamily(false);
    }
  };

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-invoices', {
        body: new URLSearchParams({ action: 'download', invoiceId })
      });
      if (error) throw error;
      
      // Open PDF in new tab
      window.open(data.downloadUrl, '_blank');
      toast({
        title: "Success",
        description: `Invoice ${invoiceNumber} opened for download.`
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice.",
        variant: "destructive"
      });
    }
  };

  const sendFamilyInvite = async () => {
    try {
      if (!inviteForm.email || !inviteForm.name) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('family-invites', {
        body: inviteForm
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: data.message
      });

      setInviteForm({ email: '', name: '', relationship: '' });
      setShowInviteForm(false);
      loadFamilyMembers();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management.",
        variant: "destructive"
      });
    }
  };

  const getSubscriptionStatus = () => {
    if (subscription?.subscribed) {
      return {
        status: "Active",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />,
        description: "Your emergency protection is active"
      };
    }
    return {
      status: "Inactive",
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-4 w-4" />,
      description: "Complete your subscription to activate protection"
    };
  };

  const status = getSubscriptionStatus();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          Subscription & Billing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {status.icon}
                <div>
                  <Badge className={status.color}>
                    {status.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {status.description}
                  </p>
                </div>
              </div>
            </div>

            {subscription?.subscribed ? (
              <div className="space-y-4">
                {/* Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Plan</label>
                    <p className="text-lg font-semibold capitalize">
                      {subscription.subscription_tier?.replace('_', ' ') || 'Basic'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Next Billing</label>
                    <p className="text-lg font-semibold">
                      {subscription.subscription_end 
                        ? new Date(subscription.subscription_end).toLocaleDateString()
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">24/7 Emergency Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Location Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Emergency Contacts</span>
                    </div>
                    {subscription.subscription_tier === 'spain_plan' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Call Center Support</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  No active subscription found. Complete your subscription to access all emergency protection features.
                </p>
                <Button onClick={() => window.location.href = '/register'}>
                  Complete Subscription
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Billing History</h4>
              <Button onClick={loadInvoices} variant="outline" size="sm" disabled={isLoadingInvoices}>
                <FileText className="h-4 w-4 mr-2" />
                {isLoadingInvoices ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No billing history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {invoice.status}
                        </Badge>
                        <span className="font-medium">Invoice #{invoice.number}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        <p>{invoice.description}</p>
                        {invoice.period_start && invoice.period_end && (
                          <p className="text-xs">
                            Period: {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      {invoice.pdf_available && (
                        <Button
                          onClick={() => downloadInvoice(invoice.id, invoice.number)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Family Sharing Tab */}
          <TabsContent value="family" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Family Members</h4>
              <Button 
                onClick={() => setShowInviteForm(true)} 
                variant="outline" 
                size="sm"
                disabled={!subscription?.subscribed}
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>

            {showInviteForm && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h5 className="font-medium mb-3">Invite Family Member</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <Input
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <Input
                      value={inviteForm.relationship}
                      onChange={(e) => setInviteForm({...inviteForm, relationship: e.target.value})}
                      placeholder="e.g., Spouse, Child, Parent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={sendFamilyInvite} size="sm">
                      Send Invite
                    </Button>
                    <Button onClick={() => setShowInviteForm(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {familyMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No family members invited yet</p>
                <p className="text-sm">Invite family members to share emergency protection</p>
              </div>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{member.invitee_name}</span>
                        <Badge className={getStatusBadge(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{member.invitee_email}</p>
                        <p>{member.relationship}</p>
                        <p>Invited: {new Date(member.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {member.status === 'pending' && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Subscription Management</h4>
              
              {subscription?.subscribed ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription in Stripe
                  </Button>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h5 className="font-medium text-blue-900 mb-2">What you can manage:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Update payment method</li>
                      <li>• Download invoices</li>
                      <li>• Update billing address</li>
                      <li>• Cancel subscription</li>
                      <li>• View billing history</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">
                    No active subscription to manage
                  </p>
                  <Button onClick={() => window.location.href = '/register'}>
                    Start Subscription
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;