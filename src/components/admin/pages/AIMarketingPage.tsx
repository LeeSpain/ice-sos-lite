import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  DollarSign, 
  Calendar, 
  Share2, 
  BarChart3, 
  Plus,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Wand2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Enhanced interfaces
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

interface RivenSettings {
  id?: string;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  brand_voice: string;
  default_budget: number;
  auto_approve_content: boolean;
  preferred_posting_times: any;
  content_guidelines: string;
}

interface SocialMediaAccount {
  id: string;
  platform: string;
  account_name: string;
  account_status: string;
  is_active: boolean;
  posting_permissions: any;
  rate_limits: any;
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

const AIMarketingPage: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [rivenSettings, setRivenSettings] = useState<RivenSettings>({
    ai_model: 'gpt-5-2025-08-07',
    temperature: 0.7,
    max_tokens: 1000,
    brand_voice: 'Professional, caring, safety-focused',
    default_budget: 500,
    auto_approve_content: false,
    preferred_posting_times: { morning: '09:00', afternoon: '14:00', evening: '19:00' },
    content_guidelines: ''
  });
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rivenResponse, setRivenResponse] = useState('');
  const [activeTab, setActiveTab] = useState('command-center');
  const [showRivenSettings, setShowRivenSettings] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadCampaigns(),
      loadContents(),
      loadSocialAccounts(),
      loadRivenSettings()
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

  const loadRivenSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('riven_settings')
        .select('*')
        .single();

      if (data) {
        setRivenSettings(data);
      }
    } catch (error) {
      console.error('Error loading Riven settings:', error);
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

  const saveRivenSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('riven_settings')
        .upsert({
          ...rivenSettings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setRivenSettings(data);
      
      toast({
        title: "Settings Saved",
        description: "Riven's configuration has been updated successfully!",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendCommandToRiven = async () => {
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
    
    // Create workflow ID for tracking
    const workflowId = crypto.randomUUID();
    setCurrentWorkflowId(workflowId);

    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          command: currentCommand,
          action: 'process_command',
          workflow_id: workflowId,
          settings: rivenSettings
        }
      });

      if (error) throw error;

      setRivenResponse(data.response);
      
      if (data.campaign_created) {
        await loadCampaigns();
        setActiveTab('campaigns');
      }

      // Load workflow steps for real-time tracking
      if (workflowId) {
        await loadWorkflowSteps(workflowId);
      }

      toast({
        title: "Riven Response",
        description: "Command processed successfully!",
      });
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: "Error",
        description: "Failed to process command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContent = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'generate_content',
          campaign_id: campaignId,
          settings: rivenSettings
        }
      });

      if (error) throw error;

      await loadContents();
      toast({
        title: "Content Generated",
        description: "Marketing content has been created successfully!",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectSocialAccount = async (platform: string) => {
    try {
      // This would typically redirect to OAuth flow
      toast({
        title: "Connect " + platform,
        description: "OAuth integration coming soon! Configure API credentials in Social Settings.",
      });
    } catch (error) {
      console.error('Error connecting social account:', error);
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
      toast({
        title: "Campaign Approved",
        description: "Campaign is now active and ready for publishing!",
      });
    } catch (error) {
      console.error('Error approving campaign:', error);
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

  return (
    <div className="space-y-6">
      {/* Header with clickable Riven brain */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Marketing - Riven</h1>
          <p className="text-muted-foreground">
            Your AI Marketing Expert for Automated Campaign Creation & Social Media Management
          </p>
        </div>
        
        <Dialog open={showRivenSettings} onOpenChange={setShowRivenSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/10">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
              <span className="font-medium">Riven Brain</span>
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Riven AI Configuration
              </DialogTitle>
              <DialogDescription>
                Configure Riven's AI settings, brand voice, and automation preferences
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* AI Model Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI Model Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select 
                      value={rivenSettings.ai_model} 
                      onValueChange={(value) => setRivenSettings({...rivenSettings, ai_model: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5-2025-08-07">GPT-5 (Latest)</SelectItem>
                        <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Reliable)</SelectItem>
                        <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <Input 
                      id="max-tokens"
                      type="number"
                      value={rivenSettings.max_tokens}
                      onChange={(e) => setRivenSettings({...rivenSettings, max_tokens: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-voice">Brand Voice & Personality</Label>
                  <Textarea 
                    id="brand-voice"
                    value={rivenSettings.brand_voice}
                    onChange={(e) => setRivenSettings({...rivenSettings, brand_voice: e.target.value})}
                    placeholder="Describe your brand's voice, tone, and personality..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content & Automation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-budget">Default Campaign Budget ($)</Label>
                    <Input 
                      id="default-budget"
                      type="number"
                      value={rivenSettings.default_budget}
                      onChange={(e) => setRivenSettings({...rivenSettings, default_budget: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch 
                      id="auto-approve"
                      checked={rivenSettings.auto_approve_content}
                      onCheckedChange={(checked) => setRivenSettings({...rivenSettings, auto_approve_content: checked})}
                    />
                    <Label htmlFor="auto-approve">Auto-approve content</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-guidelines">Content Guidelines & Restrictions</Label>
                  <Textarea 
                    id="content-guidelines"
                    value={rivenSettings.content_guidelines}
                    onChange={(e) => setRivenSettings({...rivenSettings, content_guidelines: e.target.value})}
                    placeholder="Specify any content restrictions, compliance requirements, or style guidelines..."
                    rows={4}
                  />
                </div>
              </div>

              <Separator />

              {/* Posting Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferred Posting Times</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Morning</Label>
                    <Input 
                      type="time"
                      value={rivenSettings.preferred_posting_times?.morning || '09:00'}
                      onChange={(e) => setRivenSettings({
                        ...rivenSettings, 
                        preferred_posting_times: {
                          ...rivenSettings.preferred_posting_times,
                          morning: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Afternoon</Label>
                    <Input 
                      type="time"
                      value={rivenSettings.preferred_posting_times?.afternoon || '14:00'}
                      onChange={(e) => setRivenSettings({
                        ...rivenSettings, 
                        preferred_posting_times: {
                          ...rivenSettings.preferred_posting_times,
                          afternoon: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Evening</Label>
                    <Input 
                      type="time"
                      value={rivenSettings.preferred_posting_times?.evening || '19:00'}
                      onChange={(e) => setRivenSettings({
                        ...rivenSettings, 
                        preferred_posting_times: {
                          ...rivenSettings.preferred_posting_times,
                          evening: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRivenSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={saveRivenSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="command-center">Command Center</TabsTrigger>
          <TabsTrigger value="social-accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Enhanced Command Center */}
        <TabsContent value="command-center" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    Command Center
                  </CardTitle>
                  <CardDescription>
                    Give Riven detailed instructions about your marketing campaigns. Be specific about goals, audience, timeline, and budget.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="command">Marketing Command</Label>
                    <Textarea
                      id="command"
                      placeholder="Example: Create 5 social media posts about our family protection features targeting parents aged 30-50. Include pricing information, schedule for next week across Facebook, Instagram, and LinkedIn. Budget: $500"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    onClick={sendCommandToRiven} 
                    disabled={isProcessing || !currentCommand.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Riven is Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Command to Riven
                      </>
                    )}
                  </Button>

                  {/* Real-time workflow progress */}
                  {isProcessing && workflowSteps.length > 0 && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing Steps
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
                              ) : (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              <span className={step.status === 'completed' ? 'text-green-700' : ''}>{step.step_name}</span>
                              {step.status === 'failed' && step.error_message && (
                                <span className="text-red-500 text-xs">({step.error_message})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {rivenResponse && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          Riven's Response
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-32">
                          <p className="text-sm whitespace-pre-wrap">{rivenResponse}</p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Templates */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
                      <div className="text-xs text-muted-foreground">Campaigns</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{contents.length}</div>
                      <div className="text-xs text-muted-foreground">Content</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{socialAccounts.length}</div>
                      <div className="text-xs text-muted-foreground">Platforms</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        ${campaigns.reduce((sum, c) => sum + (c.budget_estimate || 0), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Budget</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Command Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Create a week of social media posts for our emergency alert system",
                    "Generate content for Black Friday promotion with 30% discount",
                    "Plan a product launch campaign for our new family safety app",
                    "Create testimonial-based posts targeting elderly care market"
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-2 text-xs"
                      onClick={() => setCurrentCommand(template)}
                    >
                      <ChevronRight className="h-3 w-3 mr-1" />
                      {template}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Social Media Accounts Tab */}
        <TabsContent value="social-accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Social Media Integration</h2>
            <Button onClick={loadSocialAccounts} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Accounts
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok'].map((platform) => {
              const account = socialAccounts.find(acc => acc.platform.toLowerCase() === platform.toLowerCase());
              
              return (
                <Card key={platform} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(platform)}
                        <CardTitle className="text-lg">{platform}</CardTitle>
                      </div>
                      <Badge className={account?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {account?.is_active ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {account ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Account:</strong> {account.account_name}
                        </div>
                        <div className="text-sm">
                          <strong>Status:</strong> {account.account_status}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {account.posting_permissions?.post && <Badge variant="secondary" className="text-xs">Posts</Badge>}
                          {account.posting_permissions?.story && <Badge variant="secondary" className="text-xs">Stories</Badge>}
                          {account.posting_permissions?.reel && <Badge variant="secondary" className="text-xs">Reels</Badge>}
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Connect your {platform} account to enable automated posting.
                        </p>
                        <Button 
                          onClick={() => connectSocialAccount(platform)} 
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Connect {platform}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Platform-specific overlay */}
                  <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 ${
                    platform === 'Facebook' ? 'bg-blue-600' :
                    platform === 'Instagram' ? 'bg-pink-500' :
                    platform === 'Twitter' ? 'bg-blue-400' :
                    platform === 'LinkedIn' ? 'bg-blue-700' :
                    platform === 'YouTube' ? 'bg-red-600' :
                    'bg-gray-400'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center">
                      {getPlatformIcon(platform)}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* API Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration & Settings</CardTitle>
              <CardDescription>
                Configure API keys, webhooks, and platform-specific settings for each social media platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced API configuration interface coming soon. 
                  Connect platforms above to get started with OAuth flows.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
            <Button onClick={loadCampaigns} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      {campaign.status === 'active' && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Budget: ${campaign.budget_estimate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Target: {campaign.target_audience?.demographics || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {campaign.status === 'draft' && (
                      <>
                        <Button 
                          onClick={() => generateContent(campaign.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Content
                        </Button>
                        <Button 
                          onClick={() => approveCampaign(campaign.id)}
                          size="sm"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Campaign
                        </Button>
                      </>
                    )}
                    
                    {campaign.status === 'active' && (
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {campaigns.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No campaigns yet</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Use the Command Center to create your first marketing campaign with Riven
                  </p>
                  <Button onClick={() => setActiveTab('command-center')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Enhanced Content Library */}
        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Content Library</h2>
            <div className="flex gap-2">
              <Button onClick={loadContents} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {contents.map((content) => (
              <Card key={content.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getPlatformIcon(content.platform)}
                      {content.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm">
                      {content.body_text?.substring(0, 200)}...
                    </p>
                  </div>

                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.hashtags.slice(0, 8).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {content.hashtags.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{content.hashtags.length - 8} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span>{content.content_type}</span>
                    </div>
                    {content.image_url && (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Has Image</span>
                      </div>
                    )}
                    {content.scheduled_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Scheduled: {new Date(content.scheduled_time).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {content.status === 'draft' && (
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Schedule Post
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {contents.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No content created yet</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Create campaigns and generate content to see your marketing materials here
                  </p>
                  <Button onClick={() => setActiveTab('campaigns')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketing Analytics</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  {campaigns.filter(c => c.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {contents.filter(c => c.status === 'published').length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{socialAccounts.filter(a => a.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {socialAccounts.length} total accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${campaigns.reduce((sum, campaign) => sum + (campaign.budget_estimate || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Real-time performance metrics will appear here once campaigns are published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                    <p className="text-muted-foreground">
                      Analytics dashboard ready for live data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  Track likes, shares, comments, and reach across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Total Likes</span>
                    </div>
                    <span className="font-bold">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Total Shares</span>
                    </div>
                    <span className="font-bold">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Total Comments</span>
                    </div>
                    <span className="font-bold">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Total Reach</span>
                    </div>
                    <span className="font-bold">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMarketingPage;