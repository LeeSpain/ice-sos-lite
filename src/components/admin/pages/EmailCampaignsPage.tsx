import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  Plus, 
  Eye, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_name: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  created_by?: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  content: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    name: "welcome",
    subject: "🛡️ Welcome to ICE SOS - Your Safety Network is Active!",
    content: `
      <h1>Welcome to ICE SOS!</h1>
      <p>Thank you for joining our personal safety network. Your account is now active and ready to protect you.</p>
      <h3>Next Steps:</h3>
      <ul>
        <li>Complete your profile and emergency contacts</li>
        <li>Set up your medical information</li>
        <li>Download our mobile app</li>
      </ul>
      <a href="{{dashboard_url}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Dashboard</a>
    `
  },
  {
    name: "follow_up",
    subject: "🚀 Complete Your ICE SOS Setup",
    content: `
      <h1>Complete Your Safety Setup</h1>
      <p>We noticed you haven't finished setting up your ICE SOS profile yet. Your safety is important to us!</p>
      <p>Missing items:</p>
      <ul>
        <li>Emergency contacts</li>
        <li>Medical information</li>
        <li>Location preferences</li>
      </ul>
      <a href="{{dashboard_url}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Setup</a>
    `
  },
  {
    name: "newsletter",
    subject: "📢 ICE SOS Monthly Safety Updates",
    content: `
      <h1>Your Monthly Safety Update</h1>
      <p>Stay informed about the latest safety features and tips from ICE SOS.</p>
      <h3>This Month's Highlights:</h3>
      <ul>
        <li>New AI chat features</li>
        <li>Enhanced emergency response</li>
        <li>Safety tips for travelers</li>
      </ul>
      <p>Thank you for being part of the ICE SOS community!</p>
    `
  }
];

export default function EmailCampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load email campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      if (!campaignName || (!selectedTemplate && !customContent)) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const template = EMAIL_TEMPLATES.find(t => t.name === selectedTemplate);
      const subject = customSubject || template?.subject || '';
      const content = customContent || template?.content || '';

      // Count recipients based on filter
      let recipientCount = 0;
      if (recipientFilter === 'all') {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        recipientCount = count || 0;
      } else if (recipientFilter === 'subscribers') {
        const { count } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('subscribed', true);
        recipientCount = count || 0;
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignName,
          subject: subject,
          template_name: selectedTemplate || 'custom',
          status: 'draft',
          recipient_count: recipientCount,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });

      setShowCreateModal(false);
      resetForm();
      loadCampaigns();

    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create email campaign",
        variant: "destructive",
      });
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      // Call the email campaigns edge function to send
      const { data, error } = await supabase.functions.invoke('email-campaigns', {
        body: {
          action: 'send_campaign',
          campaign_id: campaignId
        }
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent",
        description: `Successfully sent to ${data.sent} recipients, ${data.failed} failed`,
      });

      loadCampaigns();

    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send email campaign",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setSelectedTemplate('');
    setCustomSubject('');
    setCustomContent('');
    setRecipientFilter('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'sending': return 'bg-blue-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'sending': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Manage and send email campaigns to your users</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Email Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Welcome Series - Week 1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Template</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or create custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Email</SelectItem>
                    {EMAIL_TEMPLATES.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name.charAt(0).toUpperCase() + template.name.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={EMAIL_TEMPLATES.find(t => t.name === selectedTemplate)?.subject || "Enter email subject"}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Recipients</label>
                <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="subscribers">Active Subscribers</SelectItem>
                    <SelectItem value="new_users">New Users (Last 30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedTemplate === 'custom' || !selectedTemplate) && (
                <div>
                  <label className="text-sm font-medium">Email Content</label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Enter your email content (HTML supported)"
                    rows={8}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createCampaign}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Send className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
                <p className="text-sm text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.recipient_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.open_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Opens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(campaign.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </div>
                      </Badge>
                      <h3 className="font-semibold">{campaign.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => sendCampaign(campaign.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span>
                      <br />
                      {campaign.subject}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span>
                      <br />
                      {campaign.recipient_count}
                    </div>
                    <div>
                      <span className="font-medium">Sent:</span>
                      <br />
                      {campaign.sent_count} / {campaign.recipient_count}
                    </div>
                    <div>
                      <span className="font-medium">Opens:</span>
                      <br />
                      {campaign.open_count} ({campaign.sent_count > 0 ? ((campaign.open_count / campaign.sent_count) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                    {campaign.sent_at && (
                      <> • Sent: {new Date(campaign.sent_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              ))}

              {campaigns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No email campaigns yet. Create your first campaign to get started!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}