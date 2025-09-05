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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Command Center state
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rivenResponse, setRivenResponse] = useState('');
  
  // Emergency/Family Safety focused command templates
  const commandTemplates = [
    {
      id: '1',
      title: 'Emergency Preparedness Campaign',
      description: 'Educate families about emergency readiness',
      command: 'Create a comprehensive 7-day emergency preparedness campaign for families. Generate content for Instagram, Facebook, and our blog focusing on emergency planning, SOS device setup, and family safety protocols. Include practical tips, safety checklists, and real-world scenarios.'
    },
    {
      id: '2', 
      title: 'Family Safety Tips Series',
      description: 'Daily safety tips for families',
      command: 'Develop a 10-part family safety tips series covering personal safety, travel safety, and emergency response. Create engaging social media posts and detailed blog articles with SEO optimization for emergency safety keywords.'
    },
    {
      id: '3',
      title: 'Customer Testimonials Campaign',
      description: 'Real stories of how ICE SOS helped families',
      command: 'Generate 6 pieces of content featuring real customer testimonials about how ICE SOS Lite helped in emergency situations. Create Instagram stories, Facebook posts, and email content highlighting peace of mind for families and life-saving features.'
    },
    {
      id: '4',
      title: 'SOS Feature Awareness Campaign',
      description: 'Highlight key app features and benefits',
      command: 'Create a feature-focused campaign showcasing ICE SOS Lite capabilities. Generate 12 pieces of content including social posts, blog articles, and email sequences explaining emergency contacts, location sharing, family groups, and quick SOS activation.'
    },
    {
      id: '5',
      title: 'Senior Safety Initiative',
      description: 'Safety solutions for elderly users',
      command: 'Develop content specifically for seniors and their families about personal safety technology. Create 8 pieces including blog posts about aging safely, family communication, and how ICE SOS provides peace of mind for adult children.'
    }
  ];

  // Error boundary effect
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Riven AI Error:', event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Optimized data fetching with caching and error handling
  const { data: campaigns = [], loading: campaignsLoading, invalidate: invalidateCampaigns, error: campaignsError } = useOptimizedSupabaseQuery(
    'marketing_campaigns',
    '*',
    { 
      order: { column: 'created_at', ascending: false },
      limit: 50,
      cacheTime: 30000 // 30 seconds cache
    }
  );

  const { data: contents = [], loading: contentsLoading, invalidate: invalidateContents, error: contentsError } = useOptimizedSupabaseQuery(
    'marketing_content',
    '*',
    { 
      order: { column: 'created_at', ascending: false },
      limit: 100,
      cacheTime: 30000
    }
  );

  const { data: socialAccounts = [], loading: socialAccountsLoading, invalidate: invalidateSocialAccounts, error: socialAccountsError } = useOptimizedSupabaseQuery(
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

  // Memoized computed values with proper null checks
  const stats = useMemo(() => {
    const campaignList = Array.isArray(campaigns) ? campaigns : [];
    const contentList = Array.isArray(contents) ? contents : [];
    const accountList = Array.isArray(socialAccounts) ? socialAccounts : [];
    
    return {
      totalCampaigns: campaignList.length,
      activeCampaigns: campaignList.filter((c: any) => ['running', 'scheduled'].includes(c?.status)).length,
      completedCampaigns: campaignList.filter((c: any) => c?.status === 'completed').length,
      totalContent: contentList.length,
      publishedContent: contentList.filter((c: any) => c?.status === 'published').length,
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

  // Command Center handlers
  const handleSendCommand = useCallback(async (command: string, config: any) => {
    setIsProcessing(true);
    setRivenResponse('');
    
    try {
      const response = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'process_command',
          command,
          configuration: config
        }
      });

      if (response.error) throw response.error;

      setRivenResponse(response.data?.message || 'Command processed successfully');
      handleCampaignUpdate(); // Refresh campaigns list
      
      toast({
        title: "Command Executed",
        description: "Riven is processing your marketing command.",
      });
    } catch (error) {
      console.error('Error executing command:', error);
      setRivenResponse('Error: ' + (error as Error).message);
      toast({
        title: "Error",
        description: "Failed to execute command",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, handleCampaignUpdate]);

  const handleUseTemplate = useCallback((template: any) => {
    setCurrentCommand(template.command);
  }, []);

  // Loading state and error checking
  const isLoading = campaignsLoading || contentsLoading || socialAccountsLoading || metricsLoading;
  const hasAnyError = hasError || campaignsError || contentsError || socialAccountsError;

  // Show error state if there are any errors
  if (hasAnyError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Riven Marketing AI - Error Detected
            </CardTitle>
            <CardDescription>
              We've detected some issues that need to be resolved:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Application Error:</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            )}
            
            {campaignsError && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Campaigns Error:</p>
                <p className="text-sm text-muted-foreground">{campaignsError.message}</p>
              </div>
            )}
            
            {contentsError && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Content Error:</p>
                <p className="text-sm text-muted-foreground">{contentsError.message}</p>
              </div>
            )}
            
            {socialAccountsError && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Social Accounts Error:</p>
                <p className="text-sm text-muted-foreground">{socialAccountsError.message}</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Known Issues:</p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• OpenAI API quota has been exceeded - check your billing</li>
                <li>• Some database permissions may need to be configured</li>
                <li>• Edge functions may be experiencing connectivity issues</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900">Quick Fixes:</p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                <li>• Check your OpenAI account billing and quota</li>
                <li>• Refresh the page to retry connections</li>
                <li>• Contact support if issues persist</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              isLoading,
              commandTemplates,
              useTemplate: handleUseTemplate,
              currentCommand,
              setCurrentCommand,
              isProcessing,
              onSendCommand: handleSendCommand,
              rivenResponse,
              campaignId: (campaigns && campaigns.length > 0) ? campaigns[0]?.id : null
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