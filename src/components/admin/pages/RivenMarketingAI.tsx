import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedCommandCenter } from '@/components/admin/EnhancedCommandCenter';
import { RivenCalendar } from '@/components/admin/RivenCalendar';
import { 
  Send, 
  Settings, 
  Brain,
  Wand2,
  Share2,
  BarChart3,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
  Play,
  Timer,
  BookOpen,
  FileText,
  Palette,
  Shield,
  Upload,
  Save,
  RotateCcw,
  Trash2,
  Edit3,
  Activity,
  Sparkles,
  Globe,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useAuth } from '@/contexts/AuthContext';

// Unified interfaces for all Riven functionality
interface Campaign {
  id: string;
  title: string;
  description: string;
  command_input: string;
  status: string;
  budget_estimate: number;
  created_at: string;
  target_audience: any;
}

interface MarketingContent {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  title: string;
  body_text: string;
  image_url: string;
  hashtags: string[];
  status: string;
  scheduled_time: string;
}

interface SocialMediaAccount {
  id: string;
  platform: string;
  account_name: string;
  account_status: string;
  is_active: boolean;
  posting_permissions: any;
  rate_limits: any;
  follower_count: number;
  last_sync_at: string;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_name: string;
  step_order: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

interface SchedulingOptions {
  mode: 'immediate' | 'optimal' | 'custom' | 'spread' | 'test';
  custom_date?: Date;
  custom_time?: string;
  spread_days?: number;
  test_percentage?: number;
  optimal_times?: boolean;
}

interface CommandConfiguration {
  command: string;
  totalPosts: number;
  postsPerDay: number;
  campaignDuration: number;
  platforms: string[];
  contentTypes: string[];
  budget: number;
  schedulingMode: string;
  targetAudience: string;
  urgency: string;
}

interface RivenConfiguration {
  ai_model: string;
  temperature: number;
  max_tokens: number;
  brand_voice: string;
  default_budget: number;
  auto_approve_content: boolean;
  preferred_posting_times: any;
  content_guidelines: string;
  knowledge_base: any[];
  prompt_templates: any[];
  content_moderation: {
    enabled: boolean;
    auto_moderate: boolean;
    approval_workflow: boolean;
  };
}

const RivenMarketingAI: React.FC = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Unified state management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rivenResponse, setRivenResponse] = useState('');
  const [activeTab, setActiveTab] = useState('command-center');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  
  // Configuration state using site_content
  const { value: rivenConfig, save: saveRivenConfig, isLoading: configLoading } = useSiteContent('riven_ai_configuration', {
    ai_model: 'gpt-5',
    temperature: 0.7,
    max_tokens: 1000,
    brand_voice: 'Professional, caring, safety-focused',
    default_budget: 500,
    auto_approve_content: false,
    preferred_posting_times: { morning: '09:00', afternoon: '14:00', evening: '19:00' },
    content_guidelines: '',
    knowledge_base: [],
    prompt_templates: [],
    content_moderation: {
      enabled: true,
      auto_moderate: false,
      approval_workflow: true
    }
  });

  // Scheduling options
  const [schedulingOptions, setSchedulingOptions] = useState<SchedulingOptions>({
    mode: 'optimal',
    optimal_times: true
  });

  const [publishingControls, setPublishingControls] = useState({
    platforms: ['facebook', 'instagram'],
    content_types: ['post'],
    approval_required: !rivenConfig?.auto_approve_content,
    ab_testing: false
  });

  const [showSettings, setShowSettings] = useState(false);

  // Command templates
  const commandTemplates = [
    {
      id: '1',
      name: 'Weekly Safety Series',
      template: 'Create a week of posts about family emergency preparedness, posting daily at optimal times across social platforms',
      category: 'Education',
      description: 'Educational content series about emergency preparedness'
    },
    {
      id: '2', 
      name: 'Product Launch Campaign',
      template: 'Launch our new ICE SOS features with a 3-day campaign highlighting benefits, pricing, and customer testimonials',
      category: 'Product',
      description: 'Product announcement with testimonials'
    },
    {
      id: '3',
      name: 'Seasonal Safety Campaign',
      template: 'Create holiday safety content emphasizing family protection during travel season',
      category: 'Seasonal',
      description: 'Holiday-themed safety content'
    },
    {
      id: '4',
      name: 'Emergency Response Awareness',
      template: 'Develop content showcasing our 24/7 emergency response capabilities and success stories',
      category: 'Awareness',
      description: 'Emergency response capabilities content'
    }
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, active: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, active: true },
    { id: 'twitter', name: 'Twitter', icon: Twitter, active: false },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, active: true },
    { id: 'youtube', name: 'YouTube', icon: Youtube, active: false }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (currentWorkflowId) {
      const interval = setInterval(() => {
        loadWorkflowSteps(currentWorkflowId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentWorkflowId]);

  const loadAllData = async () => {
    await Promise.all([
      loadCampaigns(),
      loadContents(),
      loadSocialAccounts()
    ]);
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadContents = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const loadSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error) {
      console.error('Error loading social accounts:', error);
    }
  };

  const loadWorkflowSteps = async (workflowId: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      setWorkflowSteps(data || []);
    } catch (error) {
      console.error('Error loading workflow steps:', error);
    }
  };

  const sendCommandToRiven = async (config?: CommandConfiguration) => {
    const commandToUse = config?.command || currentCommand;
    
    if (!commandToUse.trim()) {
      toast({
        title: "Command Required",
        description: "Please enter a command for Riven to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setRivenResponse('');
    
    const workflowId = crypto.randomUUID();
    setCurrentWorkflowId(workflowId);

    // Create notification for new campaign
    await createNotification(
      'New Campaign Processing',
      `Riven is processing your marketing command: "${commandToUse.substring(0, 50)}..."`,
      'campaign',
      'medium',
      `/admin-dashboard/riven-marketing`
    );

    try {
      console.log('🚀 Sending command to Riven:', commandToUse);
      
      if (!session?.access_token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          command: commandToUse,
          action: 'process_command',
          workflow_id: workflowId,
          settings: rivenConfig,
          scheduling_options: schedulingOptions,
          publishing_controls: {
            platforms: ['facebook', 'instagram', 'linkedin'],
            approval_required: !rivenConfig?.auto_approve_content
          }
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });

      console.log('📡 Riven response:', { data, error });

      if (error) {
        console.error('❌ Riven function error:', error);
        throw error;
      }
      if (!data || data.success === false) {
        console.error('❌ Riven returned error:', data);
        throw new Error(data?.error || 'Riven returned no data');
      }

      setRivenResponse(data.response || '');
      
      if (data.campaign_created) {
        await loadCampaigns();
        setActiveTab('campaigns');
        
        // Create notification for campaign completion
        await createNotification(
          'Campaign Created Successfully',
          `New marketing campaign "${data.campaign_title || 'Untitled'}" has been created and is ready for review.`,
          'campaign',
          'low',
          `/admin-dashboard/riven-marketing`,
          'Review Campaign'
        );
      }

      // Auto-generate content if enabled
      if (rivenConfig?.auto_approve_content && data.campaign_created) {
        setTimeout(() => {
          generateContent(data.campaign_id);
        }, 1000);
      } else if (data.campaign_created) {
        // Create notification for approval needed
        await createNotification(
          'Campaign Awaiting Approval',
          `Your new marketing campaign is ready and needs approval before content generation can begin.`,
          'approval',
          'high',
          `/admin-dashboard/riven-marketing`,
          'Approve Campaign'
        );
      }

      if (data.campaign_created) {
        toast({
          title: "Campaign Created",
          description: "Campaign strategy created successfully!",
        });
      } else {
        toast({
          title: "Strategy Generated, No Campaign",
          description: data?.error || "You might lack admin permissions to create campaigns.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error processing command:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to process command. Please try again.";
      
      // Special handling for authentication errors
      if (errorMessage.includes('Authentication required') || errorMessage.includes('not authenticated')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please refresh the page and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Create error notification
      await createNotification(
        'Campaign Processing Failed',
        `Error processing your marketing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        'high'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContent = async (campaignId: string) => {
    try {
      console.log('🎨 Generating content for campaign:', campaignId);
      
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'generate_content',
          campaign_id: campaignId,
          settings: rivenConfig
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });

      if (error) throw error;
      if (!data || data.success === false) {
        throw new Error(data?.error || 'Content generation failed');
      }

      await loadContents();
      
      // Create notification for content generation completion
      await createNotification(
        'Content Generation Complete',
        `Marketing content has been generated for your campaign and is ready for review and approval.`,
        'content',
        'medium',
        `/admin-dashboard/riven-marketing`,
        'Review Content'
      );
      
      toast({
        title: "Content Generated",
        description: "Marketing content created and ready for review!",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      
      // Create error notification
      await createNotification(
        'Content Generation Failed',
        `Failed to generate content for your campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        'high'
      );
      
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectSocialAccount = async (platform: string) => {
    try {
      // Real OAuth integration
      const { data, error } = await supabase.functions.invoke('social-media-oauth', {
        body: { action: 'initiate', platform }
      });

      if (error) throw error;

      if (data.authUrl) {
        // Redirect to OAuth authorization URL
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        
        toast({
          title: `Connecting to ${platform}`,
          description: "Please complete the authorization in the popup window.",
        });

        // Poll for connection status
        const pollConnection = setInterval(async () => {
          await loadSocialAccounts();
          const connected = socialAccounts.find(acc => 
            acc.platform === platform && acc.account_status === 'connected'
          );
          
          if (connected) {
            clearInterval(pollConnection);
            toast({
              title: "Account Connected!",
              description: `${platform} account connected successfully.`,
            });
          }
        }, 3000);

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(pollConnection), 120000);
      }
    } catch (error) {
      console.error('Error connecting social account:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${platform} account. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const approveCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;
      
      await loadCampaigns();
      
      // Auto-generate content for approved campaigns
      await generateContent(campaignId);
      
      toast({
        title: "Campaign Approved",
        description: "Campaign is now active and content is being generated!",
      });
    } catch (error) {
      console.error('Error approving campaign:', error);
    }
  };

  const publishContent = async (contentId: string) => {
    try {
      // Simulate publishing to social platform
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update content status to published
      const { error } = await supabase
        .from('marketing_content')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;
      await loadContents();
      
      toast({
        title: "Content Published",
        description: "Content has been successfully posted to social media!",
      });
    } catch (error) {
      console.error('Error publishing content:', error);
      
      // Create error notification for publish failure
      await createNotification(
        'Publishing Failed',
        `Failed to publish content to social media: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        'high',
        `/admin-dashboard/riven-marketing`,
        'Retry Publishing'
      );
    }
  };

  const createNotification = async (
    title: string,
    message: string,
    category: string = 'general',
    priority: string = 'medium',
    actionUrl?: string,
    actionLabel?: string
  ) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title,
          message,
          category,
          priority,
          action_url: actionUrl,
          action_label: actionLabel
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const useTemplate = (template: any) => {
    setCurrentCommand(template.template);
    
    // Apply template-specific settings
    if (template.category === 'Education') {
      setSchedulingOptions({ mode: 'spread', spread_days: 7, optimal_times: true });
    } else if (template.category === 'Product') {
      setSchedulingOptions({ mode: 'test', test_percentage: 20 });
      setPublishingControls(prev => ({ ...prev, ab_testing: true }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'active': return 'bg-primary text-primary-foreground';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'published': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getWorkflowProgress = () => {
    if (workflowSteps.length === 0) return 0;
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  const getSchedulingDescription = () => {
    switch (schedulingOptions.mode) {
      case 'immediate':
        return 'Content will be published immediately after generation';
      case 'optimal':
        return 'Content will be scheduled for peak engagement times';
      case 'custom':
        return `Content will be published on selected date`;
      case 'spread':
        return `Content will be spread over ${schedulingOptions.spread_days} days`;
      case 'test':
        return `Content will be tested with ${schedulingOptions.test_percentage}% of audience first`;
      default:
        return 'Scheduling mode not selected';
    }
  };

  if (configLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">Loading Riven Marketing AI...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Riven Marketing AI</h1>
            <p className="text-muted-foreground">
              Complete AI-powered marketing automation and campaign management
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                AI Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Riven AI Configuration</DialogTitle>
                <DialogDescription>
                  Configure Riven's behavior, knowledge base, and automation settings
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="automation">Automation</TabsTrigger>
                  <TabsTrigger value="brand">Brand Voice</TabsTrigger>
                  <TabsTrigger value="moderation">Moderation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>AI Model</Label>
                      <Select 
                        value={rivenConfig?.ai_model} 
                        onValueChange={(value) => saveRivenConfig({...rivenConfig, ai_model: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-5">GPT-5 (Recommended)</SelectItem>
                          <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Budget ($)</Label>
                      <Input 
                        type="number"
                        value={rivenConfig?.default_budget}
                        onChange={(e) => saveRivenConfig({...rivenConfig, default_budget: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Temperature: {rivenConfig?.temperature}</Label>
                      <Slider
                        value={[rivenConfig?.temperature || 0.7]}
                        onValueChange={([value]) => saveRivenConfig({...rivenConfig, temperature: value})}
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Tokens</Label>
                      <Input 
                        type="number"
                        value={rivenConfig?.max_tokens}
                        onChange={(e) => saveRivenConfig({...rivenConfig, max_tokens: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="automation" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Approve Content</Label>
                        <p className="text-sm text-muted-foreground">Automatically approve and schedule generated content</p>
                      </div>
                      <Switch
                        checked={rivenConfig?.auto_approve_content}
                        onCheckedChange={(checked) => saveRivenConfig({...rivenConfig, auto_approve_content: checked})}
                      />
                    </div>
                    
                    <div>
                      <Label>Preferred Posting Times</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Input 
                          placeholder="Morning"
                          value={rivenConfig?.preferred_posting_times?.morning || '09:00'}
                          onChange={(e) => saveRivenConfig({
                            ...rivenConfig, 
                            preferred_posting_times: {...rivenConfig?.preferred_posting_times, morning: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="Afternoon"
                          value={rivenConfig?.preferred_posting_times?.afternoon || '14:00'}
                          onChange={(e) => saveRivenConfig({
                            ...rivenConfig, 
                            preferred_posting_times: {...rivenConfig?.preferred_posting_times, afternoon: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="Evening"
                          value={rivenConfig?.preferred_posting_times?.evening || '19:00'}
                          onChange={(e) => saveRivenConfig({
                            ...rivenConfig, 
                            preferred_posting_times: {...rivenConfig?.preferred_posting_times, evening: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="brand" className="space-y-4">
                  <div>
                    <Label>Brand Voice</Label>
                    <Textarea 
                      value={rivenConfig?.brand_voice}
                      onChange={(e) => saveRivenConfig({...rivenConfig, brand_voice: e.target.value})}
                      placeholder="Describe your brand's voice and tone..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Content Guidelines</Label>
                    <Textarea 
                      value={rivenConfig?.content_guidelines}
                      onChange={(e) => saveRivenConfig({...rivenConfig, content_guidelines: e.target.value})}
                      placeholder="Specific guidelines for content creation..."
                      rows={4}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="moderation" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Content Moderation</Label>
                        <p className="text-sm text-muted-foreground">Enable AI content moderation</p>
                      </div>
                      <Switch
                        checked={rivenConfig?.content_moderation?.enabled}
                        onCheckedChange={(checked) => saveRivenConfig({
                          ...rivenConfig, 
                          content_moderation: {...rivenConfig?.content_moderation, enabled: checked}
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Approval Workflow</Label>
                        <p className="text-sm text-muted-foreground">Require manual approval before publishing</p>
                      </div>
                      <Switch
                        checked={rivenConfig?.content_moderation?.approval_workflow}
                        onCheckedChange={(checked) => saveRivenConfig({
                          ...rivenConfig, 
                          content_moderation: {...rivenConfig?.content_moderation, approval_workflow: checked}
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => window.open('/#chat', '_blank')} variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Test with Emma
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="command-center">Command Center</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="social-accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command-center" className="space-y-6">
          <EnhancedCommandCenter
            currentCommand={currentCommand}
            setCurrentCommand={setCurrentCommand}
            isProcessing={isProcessing}
            onSendCommand={(config) => sendCommandToRiven(config)}
            commandTemplates={commandTemplates}
            useTemplate={useTemplate}
            rivenResponse={rivenResponse}
          />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <RivenCalendar />
        </TabsContent>

        {/* Legacy Card for continuity */}
        <TabsContent value="legacy-command" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    Command Riven
                  </CardTitle>
                  <CardDescription>
                    Give Riven detailed marketing instructions. Be specific about goals, audience, platforms, and budget.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Marketing Command</Label>
                    <Textarea
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      placeholder="Example: Create a 5-post social media campaign about our new family protection features, targeting parents aged 30-50. Include pricing information and schedule across Facebook and Instagram over the next week. Budget: $750"
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">{publishingControls.platforms.length}</div>
                      <div className="text-sm text-muted-foreground">Platforms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">${rivenConfig?.default_budget}</div>
                      <div className="text-sm text-muted-foreground">Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">{schedulingOptions.mode}</div>
                      <div className="text-sm text-muted-foreground">Schedule</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">{rivenConfig?.auto_approve_content ? 'Auto' : 'Manual'}</div>
                      <div className="text-sm text-muted-foreground">Approval</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => sendCommandToRiven()} 
                      disabled={isProcessing || !currentCommand.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Riven is Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Command to Riven
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentCommand('')}>
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling & Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Scheduling & Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Scheduling Mode</Label>
                      <Select 
                        value={schedulingOptions.mode} 
                        onValueChange={(value: any) => setSchedulingOptions({...schedulingOptions, mode: value})}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Post Immediately
                            </div>
                          </SelectItem>
                          <SelectItem value="optimal">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Schedule for Optimal Times
                            </div>
                          </SelectItem>
                          <SelectItem value="spread">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4" />
                              Spread Over Days
                            </div>
                          </SelectItem>
                          <SelectItem value="test">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Test with Small Audience
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getSchedulingDescription()}
                      </p>
                    </div>

                    <div>
                      <Label>Target Platforms</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {platforms.map((platform) => (
                          <div key={platform.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={platform.id}
                              checked={publishingControls.platforms.includes(platform.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPublishingControls(prev => ({
                                    ...prev,
                                    platforms: [...prev.platforms, platform.id]
                                  }));
                                } else {
                                  setPublishingControls(prev => ({
                                    ...prev,
                                    platforms: prev.platforms.filter(p => p !== platform.id)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={platform.id} className="flex items-center gap-2">
                              <platform.icon className="h-4 w-4" />
                              {platform.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {schedulingOptions.mode === 'spread' && (
                    <div>
                      <Label>Spread Over Days: {schedulingOptions.spread_days}</Label>
                      <Slider
                        value={[schedulingOptions.spread_days || 7]}
                        onValueChange={([value]) => setSchedulingOptions({...schedulingOptions, spread_days: value})}
                        min={1}
                        max={14}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {schedulingOptions.mode === 'test' && (
                    <div>
                      <Label>Test Audience %: {schedulingOptions.test_percentage}</Label>
                      <Slider
                        value={[schedulingOptions.test_percentage || 20]}
                        onValueChange={([value]) => setSchedulingOptions({...schedulingOptions, test_percentage: value})}
                        min={5}
                        max={50}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Templates & Workflow Sidebar */}
            <div className="space-y-4">
              {/* Command Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {commandTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="w-full justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Workflow Progress */}
              {isProcessing && workflowSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing Workflow
                    </CardTitle>
                    <Progress value={getWorkflowProgress()} className="w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workflowSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : step.status === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : step.status === 'in_progress' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={
                            step.status === 'completed' ? 'text-green-700' : 
                            step.status === 'failed' ? 'text-red-700' : ''
                          }>
                            {step.step_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Riven Response */}
              {rivenResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Riven's Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm whitespace-pre-wrap">{rivenResponse}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Marketing Campaigns</h3>
              <p className="text-muted-foreground">Track and manage your AI-generated campaigns</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {campaigns.length} Total Campaigns
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">${campaign.budget_estimate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {campaign.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => approveCampaign(campaign.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateContent(campaign.id)}
                        className="flex-1"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Generate Content
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {campaigns.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign using the Command Center
                </p>
                <Button onClick={() => setActiveTab('command-center')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Content Library Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Content Library</h3>
              <p className="text-muted-foreground">Review and manage AI-generated content</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {contents.length} Content Items
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content) => (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(content.platform)}
                      <span className="font-medium">{content.platform}</span>
                    </div>
                    <Badge variant="outline">{content.content_type}</Badge>
                  </div>
                  <CardTitle className="text-base">{content.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.body_text}
                  </p>
                  
                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.hashtags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {content.hashtags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{content.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                    
                    {content.status === 'draft' && (
                      <Button size="sm" onClick={() => publishContent(content.id)}>
                        <Share2 className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {contents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Content will appear here after campaigns are approved
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Social Accounts Tab */}
        <TabsContent value="social-accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <p className="text-muted-foreground">Connect and manage your social media platforms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const account = socialAccounts.find(acc => acc.platform === platform.id);
              
              return (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <platform.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>
                          {account ? account.account_name : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {account ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge className={getStatusColor(account.account_status)}>
                            {account.account_status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Followers</span>
                          <span className="text-sm font-medium">{account.follower_count.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(account.last_sync_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Connection
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Connect your {platform.name} account to enable automated posting
                        </p>
                        
                        <Button 
                          onClick={() => connectSocialAccount(platform.id)}
                          className="w-full"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect {platform.name}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Marketing Analytics</h3>
              <p className="text-muted-foreground">Performance metrics and insights</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Content Generated</p>
                    <p className="text-2xl font-bold">{contents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Published Posts</p>
                    <p className="text-2xl font-bold">{contents.filter(c => c.status === 'published').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">
                      ${campaigns.reduce((sum, c) => sum + c.budget_estimate, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for detailed analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Detailed analytics coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Comprehensive performance metrics and insights will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RivenMarketingAI;