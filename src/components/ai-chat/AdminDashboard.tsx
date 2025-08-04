import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, TrendingUp, Target } from 'lucide-react';

interface Lead {
  id: string;
  session_id: string;
  email?: string;
  phone?: string;
  interest_level: number;
  recommended_plan?: string;
  conversation_summary?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  message_type: string;
  content: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalConversations: 0,
    averageInterest: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Load recent conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (leadsData) {
        setLeads(leadsData);
        const avgInterest = leadsData.length > 0 
          ? leadsData.reduce((sum, lead) => sum + lead.interest_level, 0) / leadsData.length 
          : 0;
        const conversions = leadsData.filter(lead => lead.status === 'converted').length;
        
        setStats({
          totalLeads: leadsData.length,
          totalConversations: conversationsData?.length || 0,
          averageInterest: avgInterest,
          conversionRate: leadsData.length > 0 ? (conversions / leadsData.length) * 100 : 0
        });
      }

      if (conversationsData) {
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const getInterestColor = (level: number) => {
    if (level >= 7) return 'bg-green-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-green-500';
      case 'qualified': return 'bg-blue-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Chat Analytics Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageInterest.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Interest Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <Badge className={getInterestColor(lead.interest_level)}>
                        Interest: {lead.interest_level}/10
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Email:</strong> {lead.email || 'Not provided'}
                    </div>
                    <div>
                      <strong>Phone:</strong> {lead.phone || 'Not provided'}
                    </div>
                    <div>
                      <strong>Recommended Plan:</strong> {lead.recommended_plan || 'Not set'}
                    </div>
                    <div>
                      <strong>Session ID:</strong> {lead.session_id.substring(0, 8)}...
                    </div>
                  </div>
                  
                  {lead.conversation_summary && (
                    <div className="text-sm">
                      <strong>Summary:</strong> {lead.conversation_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="border-l-4 border-l-primary pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={conv.message_type === 'user' ? 'default' : 'secondary'}>
                      {conv.message_type === 'user' ? 'User' : 'AI'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{conv.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Session: {conv.session_id.substring(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;