import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain,
  Target,
  BookOpen,
  Share2,
  Mail,
  BarChart3,
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  RefreshCw,
  Plus,
  Activity
} from 'lucide-react';
import BlogPreviewModal from './BlogPreviewModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/hooks/useSiteContent';

// Import existing components
import { EnhancedCommandCenter } from '@/components/admin/EnhancedCommandCenter';
import { EnhancedMarketingCampaigns } from '@/components/admin/EnhancedMarketingCampaigns';
import { CampaignDetailsModal } from '@/components/admin/CampaignDetailsModal';

interface UnifiedContentItem {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  title: string;
  body_text: string;
  status: string;
  created_at: string;
  scheduled_time?: string;
  hashtags?: string[];
  seo_title?: string;
  meta_description?: string;
  keywords?: string[];
  reading_time?: number;
  seo_score?: number;
  slug?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  budget_estimate?: number;
  command_input?: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  follower_count?: number;
  last_sync_at?: string;
}

const UnifiedRivenMarketingAI: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('command-center');
  
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<UnifiedContentItem[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<UnifiedContentItem | null>(null);

  // Command Center state
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
const [rivenResponse, setRivenResponse] = useState('');

  // AI provider overrides
  const [aiRunOverride, setAiRunOverride] = useState<{ overview?: 'openai' | 'xai'; text?: 'openai' | 'xai'; finalize?: 'openai' | 'xai'; image?: 'openai' | 'xai'; }>({});
  const { value: providerOverrides, save: saveProviderOverrides, isSaving: isSavingOverrides } = useSiteContent<any>('ai_providers_overrides', { sections: {} });
  const [localOverrides, setLocalOverrides] = useState<any>(providerOverrides || { sections: {} });
  useEffect(() => { setLocalOverrides(providerOverrides || { sections: {} }); }, [providerOverrides]);

  // Load all data
  useEffect(() => {
    loadAllData();
    setupRealtimeSubscriptions();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCampaigns(),
        loadContents(),
        loadSocialAccounts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setCampaigns(data || []);
  };

  const loadContents = async () => {
    const { data, error } = await supabase
      .from('marketing_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setContents(data || []);
  };

  const loadSocialAccounts = async () => {
    const { data, error } = await supabase
      .from('social_media_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSocialAccounts(data || []);
  };

  const setupRealtimeSubscriptions = () => {
    const campaignChannel = supabase
      .channel('unified-campaigns')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_campaigns'
      }, () => {
        loadCampaigns();
      })
      .subscribe();

    const contentChannel = supabase
      .channel('unified-content')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_content'
      }, () => {
        loadContents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(contentChannel);
    };
  };

  const sendCommandToRiven = async (config?: any) => {
    if (!currentCommand.trim()) {
      toast({
        title: "Command Required",
        description: "Please enter a command for Riven to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setRivenResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          command: currentCommand,
          action: 'process_command',
          workflow_id: crypto.randomUUID(),
          // Top-level overrides recognized by the function
          section: config?.section,
          ai_override: config?.ai_override,
          // Also pass full config under settings for backwards-compat
          settings: config || {}
        }
      });

      if (error) throw error;

      setRivenResponse(data.response || '');
      
      if (data.campaign_created) {
        await loadAllData();
        setActiveTab('campaigns');
        toast({
          title: "Campaign Created",
          description: "Marketing campaign created successfully!",
        });
      }
    } catch (error) {
      console.error('Error sending command:', error);
      toast({
        title: "Error",
        description: "Failed to process command",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContentApproval = async (contentId: string, status: 'published' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ status })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: status === 'published' ? "Content Approved" : "Content Rejected",
        description: `Content has been ${status === 'published' ? 'approved and published' : 'rejected'}`,
      });

      loadContents();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive"
      });
    }
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      // Get the content details
      const { data: content, error: fetchError } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (fetchError) throw fetchError;

      // Generate slug if not exists
      let slug = content.slug;
      if (!slug && content.title) {
        slug = content.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const { error } = await supabase
        .from('marketing_content')
        .update({ 
          status: 'published',
          slug: slug,
          posted_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content published successfully! It's now live on your blog.",
      });

      loadContents();
    } catch (error) {
      console.error('Error publishing content:', error);
      toast({
        title: "Error",
        description: "Failed to publish content",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      pending_review: "outline",
      rejected: "destructive",
      running: "default",
      active: "default",
      paused: "secondary",
      completed: "outline"
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
};

  const rivenSections = ['command-center','campaigns','content-approval','social-hub','analytics','settings'] as const;
  type Stage = 'overview' | 'text' | 'image' | 'finalize';
  type Provider = 'openai' | 'xai';
  const stageLabels: Record<Stage, string> = { overview: 'Overview', text: 'Text', image: 'Image', finalize: 'Finalize' };

  const updateSectionProvider = (section: string, stage: Stage, provider: Provider) => {
    setLocalOverrides((prev: any) => {
      const next = { ...(prev || { sections: {} }) } as any;
      const sec = { ...(next.sections?.[section] || { stages: {} }) } as any;
      sec.stages = { ...(sec.stages || {}), [stage]: { provider } };
      next.sections = { ...(next.sections || {}), [section]: sec };
      return next;
    });
  };

  // Statistics
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'running' || c.status === 'active').length,
    totalContent: contents.length,
    blogPosts: contents.filter(c => c.platform === 'Blog').length,
    socialPosts: contents.filter(c => c.platform !== 'Blog' && c.platform !== 'Email').length,
    emailCampaigns: contents.filter(c => c.platform === 'Email').length,
    pendingApproval: contents.filter(c => c.status === 'pending_review' || c.status === 'draft').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Riven Marketing AI Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Unified AI-powered marketing command center for campaigns, content, and social media
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-orange-500 text-white px-3 py-1">
            {stats.pendingApproval} Pending Approval
          </Badge>
          <Button onClick={loadAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              <p className="text-xs text-muted-foreground">Total Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{stats.blogPosts}</p>
              <p className="text-xs text-muted-foreground">Blog Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Share2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{stats.socialPosts}</p>
              <p className="text-xs text-muted-foreground">Social Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.emailCampaigns}</p>
              <p className="text-xs text-muted-foreground">Email Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{stats.pendingApproval}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{socialAccounts.filter(a => a.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="command-center" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="content-approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Content Approval
          </TabsTrigger>
          <TabsTrigger value="social-hub" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Hub
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command-center" className="space-y-4">
          <EnhancedCommandCenter
            currentCommand={currentCommand}
            setCurrentCommand={setCurrentCommand}
            isProcessing={isProcessing}
            onSendCommand={sendCommandToRiven}
            rivenResponse={rivenResponse}
            commandTemplates={[]}
            useTemplate={() => {}}
            campaignId=""
          />
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <EnhancedMarketingCampaigns />
        </TabsContent>

        {/* Content Approval Tab */}
        <TabsContent value="content-approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Content Approval Dashboard
              </CardTitle>
              <CardDescription>
                Review and approve all AI-generated content across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contents.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No content to review</h3>
                    <p className="text-muted-foreground">Generate content using the Command Center to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contents.map((content) => (
                      <Card key={content.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {content.platform === 'Blog' ? (
                                  <BookOpen className="h-4 w-4 text-orange-600" />
                                ) : content.platform === 'Email' ? (
                                  <Mail className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Share2 className="h-4 w-4 text-blue-600" />
                                )}
                                <Badge variant="outline">{content.platform}</Badge>
                                {getStatusBadge(content.status)}
                                <Badge variant="secondary">{content.content_type}</Badge>
                              </div>
                              <h3 className="font-semibold mb-1">
                                {content.seo_title || content.title || 'Untitled Content'}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {content.meta_description || content.body_text?.substring(0, 100) + '...'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Created: {formatDate(content.created_at)}</span>
                                {content.reading_time && (
                                  <span>{content.reading_time}m read</span>
                                )}
                                {content.seo_score && (
                                  <span>SEO: {content.seo_score}%</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedContent(content);
                                  setPreviewModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {(content.status === 'draft' || content.status === 'pending_review') && (
                                <>
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContentApproval(content.id, 'published')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handlePublishContent(content.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Publish Live
                                  </Button>
                                </>
                              )}
                              {content.status === 'published' && content.platform === 'Blog' && content.slug && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/blog/${content.slug}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Live
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleContentApproval(content.id, 'rejected')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Hub Tab */}
        <TabsContent value="social-hub" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Social Media Hub
              </CardTitle>
              <CardDescription>
                Manage social media accounts and cross-platform content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.platform}
                        </Badge>
                        <Badge variant={account.is_active ? "default" : "outline"}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{account.account_name}</h3>
                      {account.follower_count && (
                        <p className="text-sm text-muted-foreground">
                          {account.follower_count.toLocaleString()} followers
                        </p>
                      )}
                      {account.last_sync_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last sync: {formatDate(account.last_sync_at)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {socialAccounts.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No social accounts connected</h3>
                    <p className="text-muted-foreground">Connect your social media accounts to get started</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Account
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Marketing Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics for all Riven-generated content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Performance tracking and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Provider Settings
              </CardTitle>
              <CardDescription>
                Configure which AI providers to use for different content generation stages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Overview Analysis</label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (Emma)</SelectItem>
                      <SelectItem value="xai">xAI (Grok)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Generation</label>
                  <Select defaultValue="xai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (Emma)</SelectItem>
                      <SelectItem value="xai">xAI (Grok)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Finalization</label>
                  <Select defaultValue="xai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (Emma)</SelectItem>
                      <SelectItem value="xai">xAI (Grok)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Image Generation</label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (DALL-E)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Provider Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">OpenAI (Emma):</span>
                    <p className="text-muted-foreground">Best for analysis, structured content, and image generation</p>
                  </div>
                  <div>
                    <span className="font-medium">xAI (Grok):</span>
                    <p className="text-muted-foreground">Excellent for creative writing and content finalization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Content Quality Settings
              </CardTitle>
              <CardDescription>
                Configure content generation parameters for optimal quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Token Limit</label>
                  <Select defaultValue="2000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1,000 tokens</SelectItem>
                      <SelectItem value="2000">2,000 tokens</SelectItem>
                      <SelectItem value="4000">4,000 tokens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Style</label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">SEO Focus</label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basic</SelectItem>
                      <SelectItem value="medium">Standard</SelectItem>
                      <SelectItem value="high">Optimized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedCampaign(null);
          }}
          onCampaignUpdate={loadAllData}
        />
      )}

      {/* Blog Preview Modal */}
      {selectedContent && (
        <BlogPreviewModal
          content={selectedContent}
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedContent(null);
          }}
          onPublish={handlePublishContent}
        />
      )}
    </div>
  );
};

export default UnifiedRivenMarketingAI;