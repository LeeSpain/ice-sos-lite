import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  MessageSquare, 
  Bot, 
  Send, 
  Reply, 
  RefreshCw,
  Phone,
  AtSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface EmailData {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  threadId: string;
  snippet: string;
}

interface GmailAuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
}

interface AutomationSetting {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  trigger_type: string;
  email_template: string;
  last_run_at?: string;
}

export default function CommunicationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(false);
  const [gmailAuth, setGmailAuth] = useState<GmailAuthData | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [automationSettings, setAutomationSettings] = useState<AutomationSetting[]>([]);
  const [emailQueue, setEmailQueue] = useState<any[]>([]);

  // Manual email compose state
  const [composeEmail, setComposeEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    loadGmailAuth();
    loadAutomationSettings();
    loadEmailQueue();
  }, [user]);

  const loadGmailAuth = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Check if token is expired
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt <= now) {
          // Token expired, try to refresh
          await refreshGmailToken(data.refresh_token);
        } else {
          setGmailAuth({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            email: data.email_address || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading Gmail auth:', error);
    }
  };

  const loadAutomationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_settings')
        .select('*')
        .order('name');

      if (error) throw error;
      setAutomationSettings(data || []);
    } catch (error) {
      console.error('Error loading automation settings:', error);
    }
  };

  const loadEmailQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('scheduled_at')
        .limit(20);

      if (error) throw error;
      setEmailQueue(data || []);
    } catch (error) {
      console.error('Error loading email queue:', error);
    }
  };

  const authorizeGmail = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { action: 'authorize' }
      });

      if (error) throw error;

      // Open OAuth in new window
      const popup = window.open(
        data.authUrl, 
        'gmail-auth', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Reload auth data after OAuth completion
          setTimeout(() => loadGmailAuth(), 1000);
        }
      }, 1000);

    } catch (error) {
      console.error('Error authorizing Gmail:', error);
      toast({
        title: "Authorization Error",
        description: "Failed to initiate Gmail authorization",
        variant: "destructive",
      });
    }
  };

  const refreshGmailToken = async (refreshToken: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { 
          action: 'refresh',
          refreshToken,
          userId: user.id
        }
      });

      if (error) throw error;

      setGmailAuth(prev => prev ? {
        ...prev,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt
      } : null);

    } catch (error) {
      console.error('Error refreshing Gmail token:', error);
      // Clear invalid auth
      setGmailAuth(null);
    }
  };

  const fetchEmails = async () => {
    if (!gmailAuth) {
      toast({
        title: "Authorization Required",
        description: "Please authorize Gmail access first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if token needs refresh
      const expiresAt = new Date(gmailAuth.expiresAt);
      const now = new Date();
      
      if (expiresAt <= now) {
        await refreshGmailToken(gmailAuth.refreshToken);
        return; // Will retry after refresh completes
      }

      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: {
          action: 'fetch',
          accessToken: gmailAuth.accessToken
        }
      });

      if (error) throw error;

      setEmails(data.emails || []);
      toast({
        title: "Success",
        description: `Fetched ${data.emails?.length || 0} emails`,
      });

    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (to: string, subject: string, body: string) => {
    if (!gmailAuth) {
      toast({
        title: "Authorization Required",
        description: "Please authorize Gmail access first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: {
          action: 'send',
          accessToken: gmailAuth.accessToken,
          to,
          subject,
          body
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${to}`,
      });

      // Clear compose form
      setComposeEmail({ to: '', subject: '', body: '' });

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const replyToEmail = async () => {
    if (!selectedEmail || !gmailAuth) return;

    try {
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: {
          action: 'reply',
          accessToken: gmailAuth.accessToken,
          threadId: selectedEmail.threadId,
          body: replyContent
        }
      });

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully",
      });

      setShowReplyModal(false);
      setReplyContent('');
      setSelectedEmail(null);

    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const generateAIReply = async () => {
    if (!selectedEmail) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: `Generate a professional email reply to this message from ${selectedEmail.from} with subject "${selectedEmail.subject}": ${selectedEmail.body}`,
          session_id: 'admin-email-reply'
        }
      });

      if (error) throw error;

      setReplyContent(data.response || '');
      
      toast({
        title: "AI Reply Generated",
        description: "AI has generated a reply for you to review",
      });

    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI reply",
        variant: "destructive",
      });
    }
  };

  const toggleAutomation = async (automationId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automation_settings')
        .update({ is_enabled: enabled })
        .eq('id', automationId);

      if (error) throw error;

      setAutomationSettings(prev => 
        prev.map(automation => 
          automation.id === automationId 
            ? { ...automation, is_enabled: enabled }
            : automation
        )
      );

      toast({
        title: "Automation Updated",
        description: `Automation ${enabled ? 'enabled' : 'disabled'} successfully`,
      });

    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    }
  };

  const processEmailQueue = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('email-automation', {
        body: { action: 'process_queue' }
      });

      if (error) throw error;

      toast({
        title: "Queue Processed",
        description: `Sent ${data.emailsSent || 0} emails, ${data.emailsFailed || 0} failed`,
      });

      loadEmailQueue(); // Refresh queue display

    } catch (error) {
      console.error('Error processing queue:', error);
      toast({
        title: "Error",
        description: "Failed to process email queue",
        variant: "destructive",
      });
    }
  };

  // Template Management Component
  const TemplateManagement = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [showCreateTemplate, setShowCreateTemplate] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [newTemplate, setNewTemplate] = useState({
      name: '',
      description: '',
      subject_template: '',
      body_template: '',
      template_type: 'workflow',
      variables: []
    });

    useEffect(() => {
      loadTemplates();
    }, []);

    const loadTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('name');

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    const createTemplate = async () => {
      try {
        const { error } = await supabase
          .from('email_templates')
          .insert([newTemplate]);

        if (error) throw error;

        toast({
          title: "Template Created",
          description: "Email template created successfully",
        });

        setShowCreateTemplate(false);
        setNewTemplate({
          name: '',
          description: '',
          subject_template: '',
          body_template: '',
          template_type: 'workflow',
          variables: []
        });
        loadTemplates();
      } catch (error) {
        console.error('Error creating template:', error);
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email Templates</CardTitle>
              <Button onClick={() => setShowCreateTemplate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline">{template.template_type}</Badge>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Subject: {template.subject_template}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array.isArray(template.variables) && template.variables.map((variable: string) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={newTemplate.template_type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, template_type: e.target.value }))}
                  >
                    <option value="workflow">Workflow</option>
                    <option value="auto_reply">Auto Reply</option>
                    <option value="campaign">Campaign</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject Template</label>
                <Input
                  value={newTemplate.subject_template}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject_template: e.target.value }))}
                  placeholder="Welcome {{first_name}}!"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Body Template</label>
                <Textarea
                  value={newTemplate.body_template}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, body_template: e.target.value }))}
                  placeholder="Hello {{first_name}}, welcome to our service..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={createTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Auto-Reply Management Component
  const AutoReplyManagement = () => {
    const [autoReplies, setAutoReplies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
      loadAutoReplies();
      loadCategories();
    }, []);

    const loadAutoReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('auto_reply_queue')
          .select(`
            *,
            conversation_categories(name),
            email_templates(name)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setAutoReplies(data || []);
      } catch (error) {
        console.error('Error loading auto replies:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const approveReply = async (replyId: string) => {
      try {
        const { error } = await supabase
          .from('auto_reply_queue')
          .update({
            status: 'approved',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', replyId);

        if (error) throw error;

        toast({
          title: "Reply Approved",
          description: "Auto-reply has been approved and will be sent",
        });

        loadAutoReplies();
      } catch (error) {
        console.error('Error approving reply:', error);
        toast({
          title: "Error",
          description: "Failed to approve reply",
          variant: "destructive",
        });
      }
    };

    const rejectReply = async (replyId: string, notes: string) => {
      try {
        const { error } = await supabase
          .from('auto_reply_queue')
          .update({
            status: 'rejected',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            review_notes: notes
          })
          .eq('id', replyId);

        if (error) throw error;

        toast({
          title: "Reply Rejected",
          description: "Auto-reply has been rejected",
        });

        loadAutoReplies();
      } catch (error) {
        console.error('Error rejecting reply:', error);
        toast({
          title: "Error",
          description: "Failed to reject reply",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Auto-Replies</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {autoReplies.filter(reply => reply.status === 'pending').map((reply) => (
                    <div key={reply.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          Confidence: {Math.round(reply.confidence_score * 100)}%
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => approveReply(reply.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => rejectReply(reply.id, 'Manual rejection')}
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><strong>Category:</strong> {reply.conversation_categories?.name || 'Uncategorized'}</p>
                        <p><strong>Template:</strong> {reply.email_templates?.name || 'AI Generated'}</p>
                        <div className="bg-muted p-2 rounded text-xs">
                          {reply.generated_reply}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {autoReplies.filter(reply => reply.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending auto-replies
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge variant="outline">
                        Priority: {category.priority_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {category.keywords?.map((keyword: string) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Auto-Reply Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {autoReplies.slice(0, 10).map((reply) => (
                <div key={reply.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <Badge variant={
                      reply.status === 'approved' ? 'default' :
                      reply.status === 'rejected' ? 'destructive' :
                      reply.status === 'sent' ? 'secondary' : 'outline'
                    }>
                      {reply.status}
                    </Badge>
                    <span className="text-sm ml-2">
                      {reply.conversation_categories?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">Manage emails and automated responses</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inbox">
            <Mail className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Bot className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="auto-replies">
            <MessageSquare className="h-4 w-4 mr-2" />
            Auto-Replies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Inbox</CardTitle>
                <div className="flex gap-2">
                  {!gmailAuth ? (
                    <Button onClick={authorizeGmail}>
                      <AtSign className="h-4 w-4 mr-2" />
                      Authorize Gmail
                    </Button>
                  ) : (
                    <Button onClick={fetchEmails} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {emails.map((email) => (
                    <div key={email.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                          <span className="font-medium text-sm">{email.from}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedEmail(email);
                              setShowReplyModal(true);
                            }}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{email.subject}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{email.snippet}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(email.date).toLocaleString()}</span>
                        <span>Thread ID: {email.threadId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  ))}

                  {emails.length === 0 && gmailAuth && (
                    <div className="text-center py-8 text-muted-foreground">
                      No new emails found. Click refresh to check for updates.
                    </div>
                  )}

                  {!gmailAuth && (
                    <div className="text-center py-8 text-muted-foreground">
                      Please authorize Gmail access to view your inbox.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input
                  value={composeEmail.to}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={composeEmail.subject}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={composeEmail.body}
                  onChange={(e) => setComposeEmail(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Your message here..."
                  rows={8}
                />
              </div>
              <Button 
                onClick={() => sendEmail(composeEmail.to, composeEmail.subject, composeEmail.body)}
                disabled={!composeEmail.to || !composeEmail.subject || !composeEmail.body}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Automation Settings</CardTitle>
                  <Button size="sm" onClick={processEmailQueue}>
                    <Play className="h-4 w-4 mr-2" />
                    Process Queue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationSettings.map((automation) => (
                  <div key={automation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {automation.is_enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Pause className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold">{automation.name}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant={automation.is_enabled ? "outline" : "default"}
                        onClick={() => toggleAutomation(automation.id, !automation.is_enabled)}
                      >
                        {automation.is_enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {automation.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={automation.is_enabled ? "bg-green-500" : "bg-gray-500"}>
                        {automation.is_enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Trigger: {automation.trigger_type}
                      </span>
                    </div>
                    {automation.last_run_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last run: {new Date(automation.last_run_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Queue Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {emailQueue.map((email) => (
                      <div key={email.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={email.status === 'pending' ? 'default' : 'secondary'}>
                            {email.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Priority: {email.priority}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">To: {email.recipient_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {new Date(email.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    
                    {emailQueue.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No emails in queue
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gmail Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Status: {gmailAuth ? 'Connected' : 'Not Connected'}
                  </p>
                  {gmailAuth && (
                    <p className="text-sm text-muted-foreground">
                      Connected as: {gmailAuth.email}
                    </p>
                  )}
                </div>
                {gmailAuth ? (
                  <Button variant="outline" onClick={() => setGmailAuth(null)}>
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={authorizeGmail}>
                    <AtSign className="h-4 w-4 mr-2" />
                    Connect Gmail
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateManagement />
        </TabsContent>

        <TabsContent value="auto-replies" className="space-y-4">
          <AutoReplyManagement />
        </TabsContent>
      </Tabs>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to: {selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded text-sm">
              <strong>From:</strong> {selectedEmail?.from}<br />
              <strong>Original:</strong> {selectedEmail?.snippet}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Your Reply</label>
                <Button size="sm" variant="outline" onClick={generateAIReply}>
                  <Bot className="h-3 w-3 mr-1" />
                  AI Generate
                </Button>
              </div>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={replyToEmail} disabled={!replyContent}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}