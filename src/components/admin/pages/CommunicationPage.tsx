import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Users,
  Filter,
  Search,
  Calendar,
  Target
} from 'lucide-react';

interface UnifiedConversation {
  id: string;
  channel: 'email' | 'whatsapp' | 'web_chat';
  subject?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'open' | 'assigned' | 'closed' | 'escalated';
  priority: number;
  assigned_to?: string;
  tags: string[];
  latest_message?: any;
  message_count: number;
  last_activity_at: string;
  created_at: string;
}

interface CommunicationMetrics {
  total_conversations: number;
  total_messages: number;
  avg_response_time: number;
  avg_resolution_time: number;
  channel_breakdown: Record<string, number>;
}

const CommunicationPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Unified Inbox State
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    channel: '',
    status: '',
    assigned_to: '',
    priority: ''
  });
  
  // Analytics State
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('7d');
  
  // Handover State
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);
  const [handoverData, setHandoverData] = useState({
    to_user_id: '',
    reason: '',
    notes: ''
  });
  
  // Bulk Messaging State
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkCampaign, setBulkCampaign] = useState({
    name: '',
    description: '',
    channel: 'email' as 'email' | 'whatsapp' | 'both',
    content_template: '',
    subject_template: '',
    target_criteria: {
      subscription_status: '',
      country: '',
      created_after: ''
    }
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    loadMetrics();
    loadCampaigns();
  }, [filters]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unified-inbox', {
        body: {
          action: 'get_conversations',
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        }
      });

      if (error) throw error;
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('unified-inbox', {
        body: {
          action: 'get_messages',
          conversation_id: conversationId
        }
      });

      if (error) throw error;
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_metrics_summary')
        .select('*')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Aggregate metrics
      const totalConversations = data?.reduce((sum, row) => sum + (row.total_conversations || 0), 0) || 0;
      const totalMessages = data?.reduce((sum, row) => sum + (row.total_messages || 0), 0) || 0;
      const avgResponseTime = data?.reduce((sum, row) => sum + (row.avg_response_time || 0), 0) / (data?.length || 1);
      const avgResolutionTime = data?.reduce((sum, row) => sum + (row.avg_resolution_time || 0), 0) / (data?.length || 1);

      const channelBreakdown: Record<string, number> = {};
      data?.forEach(row => {
        channelBreakdown[row.channel] = (channelBreakdown[row.channel] || 0) + (row.total_conversations || 0);
      });

      setMetrics({
        total_conversations: totalConversations,
        total_messages: totalMessages,
        avg_response_time: Math.round(avgResponseTime || 0),
        avg_resolution_time: Math.round(avgResolutionTime || 0),
        channel_breakdown: channelBreakdown
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-messaging', {
        body: { action: 'get_campaigns' }
      });

      if (error) throw error;
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('unified-inbox', {
        body: {
          action: 'send_message',
          conversation_id: selectedConversation.id,
          message_data: {
            content: newMessage,
            direction: 'outbound',
            sender_name: 'Support Team'
          }
        }
      });

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedConversation.id);
      loadConversations();

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handoverConversation = async () => {
    if (!selectedConversation || !handoverData.to_user_id) return;

    try {
      const { data, error } = await supabase.functions.invoke('unified-inbox', {
        body: {
          action: 'handover_conversation',
          conversation_id: selectedConversation.id,
          handover_data: {
            ...handoverData,
            initiated_by: user?.id
          }
        }
      });

      if (error) throw error;

      setShowHandoverDialog(false);
      setHandoverData({ to_user_id: '', reason: '', notes: '' });
      loadConversations();

      toast({
        title: "Handover Complete",
        description: "Conversation has been handed over successfully",
      });
    } catch (error) {
      console.error('Error handing over conversation:', error);
      toast({
        title: "Error",
        description: "Failed to handover conversation",
        variant: "destructive",
      });
    }
  };

  const createBulkCampaign = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-messaging', {
        body: {
          action: 'create',
          campaignData: bulkCampaign
        }
      });

      if (error) throw error;

      setShowBulkDialog(false);
      setBulkCampaign({
        name: '',
        description: '',
        channel: 'email',
        content_template: '',
        subject_template: '',
        target_criteria: {
          subscription_status: '',
          country: '',
          created_after: ''
        }
      });
      loadCampaigns();

      toast({
        title: "Campaign Created",
        description: `Campaign created with ${data.recipients} recipients`,
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-messaging', {
        body: {
          action: 'send',
          campaign_id: campaignId
        }
      });

      if (error) throw error;

      loadCampaigns();

      toast({
        title: "Campaign Sent",
        description: `Sent ${data.sent} messages, ${data.failed} failed`,
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive",
      });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'web_chat': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'assigned': return 'default';
      case 'closed': return 'secondary';
      case 'escalated': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'destructive';
    if (priority <= 3) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Unified Communication Center</h1>
        <p className="text-muted-foreground">Manage all customer communications in one place</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox">
            <MessageSquare className="h-4 w-4 mr-2" />
            Unified Inbox
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Target className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <Button onClick={loadConversations} size="sm" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Channels</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="web_chat">Web Chat</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(conversation.channel)}
                            <Badge variant={getStatusColor(conversation.status)} className="text-xs">
                              {conversation.status}
                            </Badge>
                            <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
                              P{conversation.priority}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {conversation.message_count} msgs
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1">
                          {conversation.contact_name || conversation.contact_email || conversation.contact_phone || 'Unknown Contact'}
                        </h4>
                        
                        {conversation.subject && (
                          <p className="text-sm text-muted-foreground mb-1">{conversation.subject}</p>
                        )}
                        
                        {conversation.latest_message && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {conversation.latest_message.content}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{new Date(conversation.last_activity_at).toLocaleString()}</span>
                          <div className="flex gap-1">
                            {conversation.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {conversations.length === 0 && !loading && (
                      <div className="text-center py-8 text-muted-foreground">
                        No conversations found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                {selectedConversation ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getChannelIcon(selectedConversation.channel)}
                        {selectedConversation.contact_name || selectedConversation.contact_email || 'Unknown Contact'}
                      </CardTitle>
                      {selectedConversation.subject && (
                        <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showHandoverDialog} onOpenChange={setShowHandoverDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Handover
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Handover Conversation</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Assign To User ID</label>
                              <Input
                                value={handoverData.to_user_id}
                                onChange={(e) => setHandoverData(prev => ({ ...prev, to_user_id: e.target.value }))}
                                placeholder="Enter user ID"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Reason</label>
                              <Input
                                value={handoverData.reason}
                                onChange={(e) => setHandoverData(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Reason for handover"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Textarea
                                value={handoverData.notes}
                                onChange={(e) => setHandoverData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowHandoverDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handoverConversation}>
                                Handover
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CardTitle>Select a conversation</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <ScrollArea className="h-64 border rounded p-3">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              message.direction === 'outbound' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <div className="text-sm mb-1">
                                <strong>{message.sender_name || 'Unknown'}</strong>
                                <span className="text-xs ml-2 opacity-75">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Reply */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1"
                        rows={3}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a conversation to view messages
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Conversations</span>
                </div>
                <div className="text-2xl font-bold">{metrics?.total_conversations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Messages</span>
                </div>
                <div className="text-2xl font-bold">{metrics?.total_messages || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Response Time</span>
                </div>
                <div className="text-2xl font-bold">{metrics?.avg_response_time || 0}min</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Resolution Time</span>
                </div>
                <div className="text-2xl font-bold">{metrics?.avg_resolution_time || 0}min</div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics?.channel_breakdown || {}).map(([channel, count]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel)}
                      <span className="capitalize">{channel}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bulk Messaging Campaigns</h3>
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bulk Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Campaign Name</label>
                      <Input
                        value={bulkCampaign.name}
                        onChange={(e) => setBulkCampaign(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Campaign name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Channel</label>
                      <Select 
                        value={bulkCampaign.channel} 
                        onValueChange={(value: 'email' | 'whatsapp' | 'both') => 
                          setBulkCampaign(prev => ({ ...prev, channel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={bulkCampaign.description}
                      onChange={(e) => setBulkCampaign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Campaign description"
                    />
                  </div>
                  
                  {(bulkCampaign.channel === 'email' || bulkCampaign.channel === 'both') && (
                    <div>
                      <label className="text-sm font-medium">Email Subject</label>
                      <Input
                        value={bulkCampaign.subject_template}
                        onChange={(e) => setBulkCampaign(prev => ({ ...prev, subject_template: e.target.value }))}
                        placeholder="Hello {{first_name}}!"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium">Message Content</label>
                    <Textarea
                      value={bulkCampaign.content_template}
                      onChange={(e) => setBulkCampaign(prev => ({ ...prev, content_template: e.target.value }))}
                      placeholder="Hi {{first_name}}, this is a message from our team..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="border rounded p-4">
                    <h4 className="font-medium mb-3">Target Criteria</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Subscription Status</label>
                        <Select 
                          value={bulkCampaign.target_criteria.subscription_status}
                          onValueChange={(value) => setBulkCampaign(prev => ({
                            ...prev,
                            target_criteria: { ...prev.target_criteria, subscription_status: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All users" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Users</SelectItem>
                            <SelectItem value="active">Active Subscribers</SelectItem>
                            <SelectItem value="inactive">Inactive Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Country</label>
                        <Input
                          value={bulkCampaign.target_criteria.country}
                          onChange={(e) => setBulkCampaign(prev => ({
                            ...prev,
                            target_criteria: { ...prev.target_criteria, country: e.target.value }
                          }))}
                          placeholder="e.g., Spain"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createBulkCampaign}>
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={campaign.status === 'completed' ? 'default' : 'outline'}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="secondary">{campaign.channel}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Recipients</div>
                      <div className="font-medium">{campaign.total_recipients}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sent</div>
                      <div className="font-medium">{campaign.sent_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Delivered</div>
                      <div className="font-medium">{campaign.delivered_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                      <div className="font-medium">{campaign.failed_count}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                        <Send className="h-4 w-4 mr-1" />
                        Send Campaign
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {campaigns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns created yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Auto-Assignment Rules</h4>
                  <p className="text-sm text-muted-foreground">Configure automatic conversation assignment based on criteria</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Response Templates</h4>
                  <p className="text-sm text-muted-foreground">Manage quick response templates for common inquiries</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">SLA Settings</h4>
                  <p className="text-sm text-muted-foreground">Set service level agreement response time targets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationPage;