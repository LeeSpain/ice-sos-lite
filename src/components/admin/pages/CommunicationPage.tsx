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
  AlertCircle
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
  expiresAt: number;
}

export default function CommunicationPage() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(false);
  const [gmailAuth, setGmailAuth] = useState<GmailAuthData | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Manual email compose state
  const [composeEmail, setComposeEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    // Check if user has authorized Gmail
    const authData = localStorage.getItem('gmail_auth');
    if (authData) {
      setGmailAuth(JSON.parse(authData));
    }
  }, []);

  const authorizeGmail = () => {
    const clientId = 'your-gmail-client-id'; // This would come from environment
    const redirectUri = `${window.location.origin}/admin-dashboard/communication`;
    const scope = 'https://www.googleapis.com/auth/gmail.modify';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline`;

    window.location.href = authUrl;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">Manage emails and automated responses</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
          <Card>
            <CardHeader>
              <CardTitle>Email Automation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Welcome Emails</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically send welcome emails to new users
                  </p>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">AI Auto-Reply</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI responds to common customer inquiries
                  </p>
                  <Badge className="bg-yellow-500">Pending Setup</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Follow-up Sequences</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automated follow-up for incomplete profiles
                  </p>
                  <Badge className="bg-blue-500">Coming Soon</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Emergency Alerts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Critical emergency notification system
                  </p>
                  <Badge className="bg-orange-500">In Development</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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