import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, TrendingUp, Target, AlertTriangle, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  totalConversations: number;
  averageInterest: number;
  conversionRate: number;
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  emergencyIncidents: number;
}

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

// Helper function to calculate monthly revenue based on subscription tiers
const calculateMonthlyRevenue = (subscribers: any[]) => {
  let totalRevenue = 0;
  subscribers.forEach(subscriber => {
    switch (subscriber.subscription_tier) {
      case 'Basic':
        totalRevenue += 7.99;
        break;
      case 'Premium':
        totalRevenue += 19.99;
        break;
      case 'Enterprise':
        totalRevenue += 49.99;
        break;
      default:
        totalRevenue += 7.99; // Default to Basic if tier not specified
    }
  });
  return totalRevenue;
}

export default function DashboardOverview() {
  console.log('📊 DashboardOverview component is rendering');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalConversations: 0,
    averageInterest: 0,
    conversionRate: 0,
    totalCustomers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    emergencyIncidents: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Load recent conversations count
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id')
        .limit(1000);

      // Load customers
      const { data: customersData } = await supabase
        .from('profiles')
        .select('id');

      // Load subscribers
      const { data: subscribersData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('subscribed', true);

      if (leadsData) {
        setRecentLeads(leadsData.slice(0, 5));
        const avgInterest = leadsData.length > 0 
          ? leadsData.reduce((sum, lead) => sum + lead.interest_level, 0) / leadsData.length 
          : 0;
        const conversions = leadsData.filter(lead => lead.status === 'converted').length;
        
        setStats({
          totalLeads: leadsData.length,
          totalConversations: conversationsData?.length || 0,
          averageInterest: avgInterest,
          conversionRate: leadsData.length > 0 ? (conversions / leadsData.length) * 100 : 0,
          totalCustomers: customersData?.length || 0,
          activeSubscriptions: subscribersData?.length || 0,
          monthlyRevenue: calculateMonthlyRevenue(subscribersData || []),
          emergencyIncidents: 0 // Placeholder for future implementation
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">ICE SOS Lite Admin Analytics</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">€{stats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue (EUR)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-500" />
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
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{stats.averageInterest.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Interest Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-xl font-bold">{stats.emergencyIncidents}</p>
                <p className="text-sm text-muted-foreground">Emergency Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {recentLeads.map((lead) => (
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
    </div>
  );
}