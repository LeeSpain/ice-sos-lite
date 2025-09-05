import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Activity, BarChart3, Settings, Users, Target } from 'lucide-react';
import { useOptimizedSupabaseQuery, useBatchQueries, clearCache } from '@/hooks/useOptimizedQuery';
import OptimizedComponentLoader from './OptimizedComponentLoader';

export default function OptimizedRivenMarketingAI() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('command-center');

  // Optimized data fetching with caching
  const { data: campaigns = [], loading: campaignsLoading, invalidate: invalidateCampaigns } = useOptimizedSupabaseQuery(
    'marketing_campaigns',
    '*',
    { 
      order: { column: 'created_at', ascending: false },
      limit: 50,
      cacheTime: 30000 // 30 seconds cache
    }
  );

  const { data: contents = [], loading: contentsLoading, invalidate: invalidateContents } = useOptimizedSupabaseQuery(
    'marketing_content',
    '*',
    { 
      order: { column: 'created_at', ascending: false },
      limit: 100,
      cacheTime: 30000
    }
  );

  const { data: socialAccounts = [], loading: socialAccountsLoading, invalidate: invalidateSocialAccounts } = useOptimizedSupabaseQuery(
    'social_media_accounts',
    '*',
    { 
      order: { column: 'created_at', ascending: false },
      cacheTime: 60000 // Social accounts change less frequently
    }
  );

  // Batch query for additional data only when needed
  const additionalQueries = useMemo(() => [
    {
      key: 'pendingContent',
      fn: async () => {
        const { data } = await supabase
          .from('marketing_content')
          .select('id')
          .in('status', ['pending_review', 'draft']);
        return data?.length || 0;
      }
    },
    {
      key: 'connectedAccounts', 
      fn: async () => {
        const { data } = await supabase
          .from('social_media_oauth')
          .select('id')
          .eq('connection_status', 'connected');
        return data?.length || 0;
      }
    }
  ], []);

  const { data: metrics = {}, loading: metricsLoading } = useBatchQueries(additionalQueries);

  // Memoized computed values
  const stats = useMemo(() => {
    const campaignList = campaigns as any[];
    const contentList = contents as any[];
    const accountList = socialAccounts as any[];
    
    return {
      totalCampaigns: campaignList.length,
      activeCampaigns: campaignList.filter((c: any) => ['running', 'scheduled'].includes(c.status)).length,
      completedCampaigns: campaignList.filter((c: any) => c.status === 'completed').length,
      totalContent: contentList.length,
      publishedContent: contentList.filter((c: any) => c.status === 'published').length,
      pendingContent: metrics.pendingContent || 0,
      connectedAccounts: metrics.connectedAccounts || 0,
      totalAccounts: accountList.length
    };
  }, [campaigns, contents, socialAccounts, metrics]);

  // Optimized event handlers
  const handleContentUpdate = useCallback(() => {
    invalidateContents();
    clearCache('marketing_content');
  }, [invalidateContents]);

  const handleCampaignUpdate = useCallback(() => {
    invalidateCampaigns();
    clearCache('marketing_campaigns');
  }, [invalidateCampaigns]);

  const handleAccountsUpdate = useCallback(() => {
    invalidateSocialAccounts();
    clearCache('social_media');
  }, [invalidateSocialAccounts]);

  const handleContentApproval = useCallback(async (contentId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: approved ? "Content Approved" : "Content Rejected",
        description: `Content has been ${approved ? 'approved' : 'rejected'} successfully.`,
      });

      handleContentUpdate();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      });
    }
  }, [toast, handleContentUpdate]);

  const handlePublishContent = useCallback(async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ 
          status: 'published',
          posted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Content Published",
        description: "Content has been published successfully.",
      });

      handleContentUpdate();
    } catch (error) {
      console.error('Error publishing content:', error);
      toast({
        title: "Error",
        description: "Failed to publish content",
        variant: "destructive"
      });
    }
  }, [toast, handleContentUpdate]);

  // Loading state
  const isLoading = campaignsLoading || contentsLoading || socialAccountsLoading || metricsLoading;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campaigns</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={stats.activeCampaigns > 0 ? "default" : "secondary"} className="text-xs">
                {stats.activeCampaigns} Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Content</p>
                <p className="text-2xl font-bold">{stats.totalContent}</p>
              </div>
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={stats.pendingContent > 0 ? "destructive" : "secondary"} className="text-xs">
                {stats.pendingContent} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Social Accounts</p>
                <p className="text-2xl font-bold">{stats.totalAccounts}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={stats.connectedAccounts > 0 ? "default" : "secondary"} className="text-xs">
                {stats.connectedAccounts} Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.publishedContent}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                This Month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs with Lazy Loading */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="command-center" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="content-approval" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Content Approval
          </TabsTrigger>
          <TabsTrigger value="social-hub" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social Hub
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command-center">
          <OptimizedComponentLoader
            type="command-center"
            props={{
              campaigns,
              onCampaignUpdate: handleCampaignUpdate,
              isLoading
            }}
          />
        </TabsContent>

        <TabsContent value="content-approval">
          <OptimizedComponentLoader
            type="content-approval"
            props={{
              contents,
              onContentUpdate: handleContentUpdate,
              onContentApproval: handleContentApproval,
              onPublishContent: handlePublishContent,
              isLoading: contentsLoading
            }}
          />
        </TabsContent>

        <TabsContent value="social-hub">
          <OptimizedComponentLoader
            type="social-hub"
            props={{
              socialAccounts,
              onAccountsUpdate: handleAccountsUpdate,
              isLoading: socialAccountsLoading
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <OptimizedComponentLoader
            type="analytics"
            props={{
              campaigns,
              contents,
              socialAccounts,
              isLoading
            }}
          />
        </TabsContent>

        <TabsContent value="monitor">
          <OptimizedComponentLoader
            type="monitor"
            props={{
              campaigns,
              onCampaignUpdate: handleCampaignUpdate,
              isLoading: campaignsLoading
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}