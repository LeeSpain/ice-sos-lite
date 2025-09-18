import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Users, 
  Mail, 
  Filter, 
  Eye, 
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Database,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  lead_source?: string;
  lead_score?: number;
  status: string;
  tags?: string[];
  created_at: string;
  subscription_status?: string;
  country_code?: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: any;
}

export const BulkEmailCRM: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Email composition
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('custom');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  
  const { toast } = useToast();
  const { triggerAutomation } = useEmailAutomation();

  useEffect(() => {
    loadContacts();
    loadContactGroups();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Load from leads table (CRM contacts)
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Load from profiles (registered users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          role,
          subscription_regional,
          country_code,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Combine and format data
      const formattedContacts: Contact[] = [
        // Format leads
        ...leadsData.map(lead => ({
          id: lead.id,
          name: lead.email?.split('@')[0] || 'Lead',
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company_name || '',
          job_title: lead.job_title || '',
          lead_source: lead.lead_source || 'unknown',
          lead_score: lead.lead_score || 0,
          status: lead.status || 'lead',
          tags: lead.tags || [],
          created_at: lead.created_at,
          subscription_status: 'none',
          country_code: lead.timezone || ''
        })),
        // Format profiles (registered users)
        ...profilesData.map(profile => ({
          id: profile.user_id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
          email: '', // Will need to get from auth
          phone: '',
          company: '',
          job_title: '',
          lead_source: 'registration',
          lead_score: 0,
          status: profile.role || 'user',
          tags: profile.subscription_regional ? ['regional_subscriber'] : [],
          created_at: profile.created_at,
          subscription_status: profile.subscription_regional ? 'active' : 'none',
          country_code: profile.country_code
        }))
      ];

      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContactGroups = async () => {
    // Define predefined contact groups
    const predefinedGroups: ContactGroup[] = [
      {
        id: 'all',
        name: 'All Contacts',
        description: 'All contacts in the system',
        count: 0,
        criteria: {}
      },
      {
        id: 'leads',
        name: 'Leads',
        description: 'Potential customers from lead generation',
        count: 0,
        criteria: { status: 'lead' }
      },
      {
        id: 'users',
        name: 'Registered Users',
        description: 'Users who have registered accounts',
        count: 0,
        criteria: { status: 'user' }
      },
      {
        id: 'members',
        name: 'Members',
        description: 'Active subscribers and members',
        count: 0,
        criteria: { subscription_status: 'active' }
      },
      {
        id: 'regional',
        name: 'Regional Subscribers',
        description: 'Users with regional subscriptions',
        count: 0,
        criteria: { tags: ['regional_subscriber'] }
      },
      {
        id: 'spain',
        name: 'Spain Users',
        description: 'Users based in Spain',
        count: 0,
        criteria: { country_code: 'ES' }
      },
      {
        id: 'high_score',
        name: 'High Score Leads',
        description: 'Leads with score above 70',
        count: 0,
        criteria: { lead_score_min: 70 }
      }
    ];

    // Calculate counts for each group
    const groupsWithCounts = predefinedGroups.map(group => ({
      ...group,
      count: filterContactsByGroup(contacts, group.criteria).length
    }));

    setContactGroups(groupsWithCounts);
  };

  const filterContactsByGroup = (contactList: Contact[], criteria: any): Contact[] => {
    return contactList.filter(contact => {
      if (criteria.status && contact.status !== criteria.status) return false;
      if (criteria.subscription_status && contact.subscription_status !== criteria.subscription_status) return false;
      if (criteria.country_code && contact.country_code !== criteria.country_code) return false;
      if (criteria.lead_score_min && (contact.lead_score || 0) < criteria.lead_score_min) return false;
      if (criteria.tags && !criteria.tags.some((tag: string) => contact.tags?.includes(tag))) return false;
      return true;
    });
  };

  const applyFilters = (contactList: Contact[]): Contact[] => {
    return contactList.filter(contact => {
      if (statusFilter !== 'all' && contact.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && contact.lead_source !== sourceFilter) return false;
      if (subscriptionFilter !== 'all' && contact.subscription_status !== subscriptionFilter) return false;
      return true;
    });
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroup(groupId);
    const group = contactGroups.find(g => g.id === groupId);
    if (group) {
      const filteredContacts = filterContactsByGroup(contacts, group.criteria);
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const filteredContacts = applyFilters(contacts);
    setSelectedContacts(filteredContacts.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedContacts([]);
  };

  const handleSendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Email Content Required",
        description: "Please provide both subject and content for the email.",
        variant: "destructive"
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one contact to send the email.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Get selected contact details
      const selectedContactDetails = contacts.filter(c => selectedContacts.includes(c.id));
      
      // Send bulk email using the bulk-messaging function
      const { data, error } = await supabase.functions.invoke('bulk-messaging', {
        body: {
          action: 'create',
          campaignData: {
            name: `Bulk Email - ${emailSubject}`,
            description: `Bulk email campaign sent to ${selectedContacts.length} contacts`,
            channel: 'email',
            content_template: emailContent,
            subject_template: emailSubject,
            target_criteria: {
              selected_contacts: selectedContacts
            },
            variables: {
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;

      // Trigger email automation for tracking
      await triggerAutomation('bulk_email_sent', {
        campaign_id: data.campaignId,
        recipient_count: selectedContacts.length,
        subject: emailSubject
      });

      toast({
        title: "Bulk Email Sent",
        description: `Email campaign started for ${selectedContacts.length} contacts.`,
      });

      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedContacts([]);
      setSelectedGroup('');

    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast({
        title: "Email Send Failed",
        description: "Failed to send bulk email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getEmailTemplates = () => {
    return [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to ICE SOS Lite!',
        content: `Hi {{name}},

Welcome to ICE SOS Lite! We're excited to have you join our community focused on family safety and emergency preparedness.

Your account is now active and ready to use. Here are some quick first steps:

1. Set up your emergency contacts
2. Configure your family group
3. Download our mobile app
4. Test your SOS button

If you have any questions, our support team is here to help.

Stay safe,
The ICE SOS Lite Team`
      },
      {
        id: 'newsletter',
        name: 'Newsletter',
        subject: 'ICE SOS Lite Newsletter - Safety Tips & Updates',
        content: `Hi {{name}},

Hope you're staying safe! Here's this month's safety update from ICE SOS Lite.

🚨 Safety Tip of the Month:
Always keep your emergency contacts updated and ensure they know how to respond to alerts.

📱 New Features:
- Enhanced location accuracy
- Improved family notifications
- Battery optimization

📈 Your Safety Stats:
You've been keeping your family safer with ICE SOS Lite.

Questions? We're here to help!

Best regards,
ICE SOS Lite Team`
      },
      {
        id: 'custom',
        name: 'Custom Email',
        subject: '',
        content: ''
      }
    ];
  };

  const handleTemplateSelection = (templateId: string) => {
    setEmailTemplate(templateId);
    const template = getEmailTemplates().find(t => t.id === templateId);
    if (template && templateId !== 'custom') {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    } else {
      setEmailSubject('');
      setEmailContent('');
    }
  };

  const filteredContacts = applyFilters(contacts);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email CRM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Groups */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Contact Groups</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {contactGroups.map(group => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGroupSelection(group.id)}
                  className="flex items-center justify-between p-3 h-auto"
                >
                  <span className="text-xs">{group.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {group.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Source Filter</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subscription Filter</Label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="none">No Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedContacts.length} of {filteredContacts.length} contacts selected
              </span>
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadContacts}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Contact List */}
          <div className="max-h-64 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No contacts found</div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        <Badge variant="outline">
                          {contact.status}
                        </Badge>
                        {contact.lead_score && contact.lead_score > 50 && (
                          <Badge variant="secondary">
                            Score: {contact.lead_score}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contact.email} • {contact.lead_source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Template Selection */}
          <div>
            <Label>Email Template</Label>
            <Select value={emailTemplate} onValueChange={handleTemplateSelection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getEmailTemplates().map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Enter email content... Use {{name}} for personalization."
              rows={8}
            />
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Ready to send to {selectedContacts.length} recipients
            </div>
            <Button
              onClick={handleSendBulkEmail}
              disabled={isSending || selectedContacts.length === 0}
              className="min-w-32"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};