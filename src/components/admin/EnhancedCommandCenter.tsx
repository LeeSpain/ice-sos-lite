import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Settings, 
  Wand2, 
  Calendar,
  Target,
  DollarSign,
  Zap,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Loader2,
  Info,
  Timer,
  BarChart3,
  Globe,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  TrendingUp
} from 'lucide-react';

interface CommandCenterProps {
  currentCommand: string;
  setCurrentCommand: (command: string) => void;
  isProcessing: boolean;
  onSendCommand: (config: CommandConfiguration) => void;
  commandTemplates: any[];
  useTemplate: (template: any) => void;
  rivenResponse: string;
  campaignId?: string;
}

interface CampaignStatus {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  totalContent: number;
  publishedContent: number;
  scheduledContent: number;
  platforms: string[];
  createdAt: string;
  metrics?: {
    reach: number;
    engagement: number;
    clicks: number;
  };
}

interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  lastSync: string;
}

interface CommandConfiguration {
  command: string;
  totalPosts: number;
  postsPerDay: number;
  campaignDuration: number;
  platforms: string[];
  contentTypes: string[];
  schedulingMode: string;
  targetAudience: string;
  urgency: string;
  wordCount?: number;
  seoDifficulty?: string;
  contentDepth?: string;
}

export const EnhancedCommandCenter: React.FC<CommandCenterProps> = ({
  currentCommand,
  setCurrentCommand,
  isProcessing,
  onSendCommand,
  commandTemplates,
  useTemplate,
  rivenResponse,
  campaignId
}) => {
  const { toast } = useToast();
  const [activeCampaigns, setActiveCampaigns] = useState<CampaignStatus[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [showCampaignManager, setShowCampaignManager] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [totalPosts, setTotalPosts] = useState([10]);
  const [postsPerDay, setPostsPerDay] = useState([2]);
  const [campaignDuration, setCampaignDuration] = useState([7]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'instagram']);
  const [selectedContentTypes, setSelectedContentTypes] = useState(['post']);
  const [schedulingMode, setSchedulingMode] = useState('optimal');
  const [targetAudience, setTargetAudience] = useState('family_safety');
  const [urgency, setUrgency] = useState('normal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState([1000]);
  const [seoDifficulty, setSeoDifficulty] = useState('intermediate');
  const [contentDepth, setContentDepth] = useState('detailed');

  // Load campaigns and social accounts
  useEffect(() => {
    loadActiveCampaigns();
    loadSocialAccounts();
    
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        loadActiveCampaigns();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const loadActiveCampaigns = async () => {
    try {
      const { data: campaigns, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .in('status', ['running', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaignStatuses: CampaignStatus[] = campaigns?.map(campaign => ({
        id: campaign.id,
        name: campaign.title || 'Untitled Campaign',
        status: campaign.status as CampaignStatus['status'],
        progress: 0, // Will calculate from content
        totalContent: 0,
        publishedContent: 0,
        scheduledContent: 0,
        platforms: [],
        createdAt: campaign.created_at,
        metrics: {
          reach: 0,
          engagement: 0,
          clicks: 0
        }
      })) || [];

      setActiveCampaigns(campaignStatuses);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadSocialAccounts = async () => {
    try {
      const { data: accounts, error } = await supabase
        .from('social_media_oauth')
        .select('*')
        .eq('connection_status', 'connected');

      if (error) throw error;

      const socialAccountStatuses: SocialMediaAccount[] = accounts?.map(account => ({
        id: account.id,
        platform: account.platform,
        username: account.platform_name || 'Connected',
        isConnected: account.connection_status === 'connected',
        lastSync: account.updated_at
      })) || [];

      setSocialAccounts(socialAccountStatuses);
    } catch (error) {
      console.error('Error loading social accounts:', error);
    }
  };

  const connectSocialAccount = async (platform: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-media-oauth', {
        body: {
          action: 'initiate',
          platform,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=600');
        toast({
          title: "OAuth Flow Started",
          description: `Please complete authentication for ${platform}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${platform}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast({
        title: "Campaign Paused",
        description: "Campaign has been paused successfully",
      });
      
      loadActiveCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause campaign",
        variant: "destructive"
      });
    }
  };

  const resumeCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: 'running' })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast({
        title: "Campaign Resumed",
        description: "Campaign is now running",
      });
      
      loadActiveCampaigns();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to resume campaign",
        variant: "destructive"
      });
    }
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'blog', name: 'Blog', icon: BookOpen, color: '#10B981' },
    { id: 'email', name: 'Email Marketing', icon: Send, color: '#059669' }
  ];

  const contentTypes = [
    { id: 'post', name: 'Social Post', description: 'Regular social media posts' },
    { id: 'story', name: 'Story', description: 'Instagram/Facebook stories' },
    { id: 'reel', name: 'Reel/Video', description: 'Short-form video content' },
    { id: 'article', name: 'Article', description: 'Long-form content' },
    { id: 'how-to-guide', name: 'How-to Guide', description: 'Step-by-step educational content' },
    { id: 'case-study', name: 'Case Study', description: 'Customer success stories' },
    { id: 'industry-insights', name: 'Industry Insights', description: 'Thought leadership articles' },
    { id: 'product-features', name: 'Product Features', description: 'Detailed product explanations' },
    { id: 'safety-tips', name: 'Safety Tips', description: 'Emergency preparedness content' },
    { id: 'email-welcome', name: 'Welcome Email', description: 'New user onboarding emails' },
    { id: 'email-newsletter', name: 'Newsletter', description: 'Regular email newsletters' },
    { id: 'email-campaign', name: 'Email Campaign', description: 'Promotional email sequences' }
  ];

  const audiences = [
    { id: 'family_safety', name: 'Family Safety', description: 'Parents concerned about family security' },
    { id: 'seniors', name: 'Senior Citizens', description: 'Elderly individuals and their families' },
    { id: 'young_families', name: 'Young Families', description: 'Families with young children' },
    { id: 'business', name: 'Business Users', description: 'Companies needing security solutions' },
    { id: 'travelers', name: 'Travelers', description: 'People who travel frequently' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleContentType = (typeId: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const calculateEstimatedReach = () => {
    const baseReach = selectedPlatforms.length * totalPosts[0] * 1000;
    return Math.round(baseReach);
  };

  const handleSendCommand = () => {
    const config: CommandConfiguration = {
      command: currentCommand,
      totalPosts: totalPosts[0],
      postsPerDay: postsPerDay[0],
      campaignDuration: campaignDuration[0],
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      schedulingMode,
      targetAudience,
      urgency,
      wordCount: selectedPlatforms.includes('blog') ? wordCount[0] : undefined,
      seoDifficulty: selectedPlatforms.includes('blog') ? seoDifficulty : undefined,
      contentDepth: selectedPlatforms.includes('blog') ? contentDepth : undefined
    };
    
    onSendCommand(config);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            Riven AI Command Center
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Give Riven a marketing command and watch AI create professional campaigns across all platforms
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Command Input */}
          <div className="space-y-3">
            <Label htmlFor="command" className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10">
                <Send className="h-4 w-4 text-primary" />
              </div>
              Marketing Command
            </Label>
            <Textarea
              id="command"
              placeholder="Tell Riven what you want to achieve...

💡 Examples:
• Create a week-long family safety campaign for Instagram & Facebook
• Generate 10 blog posts about emergency preparedness with SEO optimization
• Launch a social media series highlighting customer testimonials"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              className="mt-2 min-h-[120px] bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Quick Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Posts: {totalPosts[0]}
              </Label>
              <Slider
                value={totalPosts}
                onValueChange={setTotalPosts}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Posts per Day: {postsPerDay[0]}
              </Label>
              <Slider
                value={postsPerDay}
                onValueChange={setPostsPerDay}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Duration: {campaignDuration[0]} days
              </Label>
              <Slider
                value={campaignDuration}
                onValueChange={setCampaignDuration}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <Label className="text-base font-medium">Target Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <Button
                    key={platform.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => togglePlatform(platform.id)}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" style={{ color: isSelected ? 'white' : platform.color }} />
                    {platform.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content Types */}
          <div>
            <Label className="text-base font-medium">Content Types</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {contentTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedContentTypes.includes(type.id)}
                    onCheckedChange={() => toggleContentType(type.id)}
                  />
                  <Label htmlFor={type.id} className="cursor-pointer">
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPosts[0]}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedPlatforms.length}</div>
              <div className="text-sm text-muted-foreground">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{calculateEstimatedReach().toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Est. Reach</div>
            </div>
          </div>

          {/* Blog-Specific Settings */}
          {selectedPlatforms.includes('blog') && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                <BookOpen className="h-5 w-5" />
                Blog SEO Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Word Count: {wordCount[0]}</Label>
                  <Slider
                    value={wordCount}
                    onValueChange={setWordCount}
                    min={500}
                    max={3000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>500</span>
                    <span>3000</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">SEO Difficulty</Label>
                  <Select value={seoDifficulty} onValueChange={setSeoDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Basic SEO</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Standard SEO</SelectItem>
                      <SelectItem value="advanced">Advanced - Complex SEO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Depth</Label>
                  <Select value={contentDepth} onValueChange={setContentDepth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview - High-level content</SelectItem>
                      <SelectItem value="detailed">Detailed - In-depth content</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - Complete guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Advanced Settings */}
          <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Advanced Campaign Settings</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Scheduling Mode</Label>
                  <Select value={schedulingMode} onValueChange={setSchedulingMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimal">Optimal Times</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                      <SelectItem value="spread">Spread Evenly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((audience) => (
                        <SelectItem key={audience.id} value={audience.id}>
                          <div>
                            <div>{audience.name}</div>
                            <div className="text-sm text-muted-foreground">{audience.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Campaign Urgency</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Standard processing</SelectItem>
                      <SelectItem value="normal">Normal - Regular priority</SelectItem>
                      <SelectItem value="high">High - Expedited processing</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate attention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Command Templates */}
          <div>
            <Label className="text-base font-medium">Quick Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {commandTemplates.slice(0, 4).map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  onClick={() => useTemplate(template)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">{template.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Send Command */}
          <div className="space-y-4">
            <Button 
              onClick={handleSendCommand}
              disabled={isProcessing || !currentCommand.trim()}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Riven is Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-3" />
                  Execute Command
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-4 text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <div>
                <div className="font-medium text-primary">Est. Reach</div>
                <div>{calculateEstimatedReach().toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium text-primary">Est. Platforms</div>
                <div>{selectedPlatforms.length}</div>
              </div>
            </div>
          </div>

          {/* Riven Response */}
          {rivenResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" />
                  Riven's Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{rivenResponse}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Import and render the monitoring components */}
      <RealTimeCampaignMonitor 
        isOpen={showCampaignManager} 
        onClose={() => setShowCampaignManager(false)} 
      />
    </div>
  );
};

// Import the monitoring components at the top level
import { RealTimeCampaignMonitor } from './RealTimeCampaignMonitor';