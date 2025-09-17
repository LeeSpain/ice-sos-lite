import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useWorkflow } from '@/contexts/RivenWorkflowContext';
import { 
  Wand2, 
  Sparkles, 
  Brain, 
  Zap, 
  Target,
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  Lightbulb,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  FileText,
  Eye,
  Video,
  MessageSquare,
  Shield,
  CheckSquare,
  UserCheck,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface EnhancedCommandCenterProps {
  currentCommand: string;
  setCurrentCommand: (value: string) => void;
  isProcessing: boolean;
  onSendCommand: (config: any) => void;
  commandTemplates: any[];
  useTemplate: (template: any) => void;
  rivenResponse: string;
  campaignId?: string;
}

export const EnhancedCommandCenter: React.FC<EnhancedCommandCenterProps> = ({
  currentCommand,
  setCurrentCommand,
  isProcessing,
  onSendCommand,
  commandTemplates,
  useTemplate,
  rivenResponse,
  campaignId
}) => {
  const { 
    workflowQueue, 
    notifications, 
    analytics, 
    estimatedTimeRemaining,
    addNotification 
  } = useWorkflow();

  // Publishing settings state
  const [publishMode, setPublishMode] = useState('campaign');
  const [totalPosts, setTotalPosts] = useState([10]);
  const [postsPerDay, setPostsPerDay] = useState([2]);
  const [campaignDuration, setCampaignDuration] = useState([7]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['social_post', 'safety_tips']);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Platform options
  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { id: 'blog', name: 'Blog', icon: FileText, color: 'text-green-600' },
    { id: 'email', name: 'Email Marketing', icon: Mail, color: 'text-purple-600' }
  ];

  // Content types focused on family safety
  const contentTypes = [
    { id: 'social_post', name: 'Social Post', description: 'Emergency safety tips and family updates', icon: MessageSquare },
    { id: 'story', name: 'Story', description: 'Instagram/Facebook safety stories', icon: Eye },
    { id: 'safety_reel', name: 'Safety Reel', description: 'Quick safety tip videos', icon: Video },
    { id: 'safety_guide', name: 'Safety Guide', description: 'Emergency preparedness guides', icon: Shield },
    { id: 'emergency_howto', name: 'Emergency How-to', description: 'Step-by-step emergency procedures', icon: CheckSquare },
    { id: 'customer_testimonial', name: 'Customer Testimonial', description: 'Real family safety success stories', icon: UserCheck },
    { id: 'feature_spotlight', name: 'Feature Spotlight', description: 'ICE SOS app feature explanations', icon: Sparkles },
    { id: 'safety_tips', name: 'Safety Tips', description: 'Daily family safety advice', icon: Lightbulb },
    { id: 'emergency_checklist', name: 'Emergency Checklist', description: 'Printable safety checklists', icon: CheckSquare },
    { id: 'safety_onboarding', name: 'Safety Onboarding', description: 'New user safety setup emails', icon: Target },
    { id: 'safety_newsletter', name: 'Safety Newsletter', description: 'Monthly family safety updates', icon: Mail },
    { id: 'safety_alerts', name: 'Safety Alerts', description: 'Emergency awareness campaigns', icon: AlertTriangle }
  ];

  // Quick templates
  const quickTemplates = [
    {
      id: 'emergency-preparedness',
      title: 'Emergency Preparedness Campaign',
      description: 'Educate families about emergency readiness',
      command: 'Create a comprehensive 7-day emergency preparedness campaign for families. Generate content for Instagram, Facebook, and our blog focusing on emergency planning, SOS device setup, and family safety protocols. Include practical tips, safety checklists, and real-world scenarios.'
    },
    {
      id: 'family-safety-series', 
      title: 'Family Safety Tips Series',
      description: 'Daily safety tips for families',
      command: 'Develop a 10-part family safety tips series covering personal safety, travel safety, and emergency response. Create engaging social media posts and detailed blog articles with SEO optimization for emergency safety keywords.'
    },
    {
      id: 'customer-testimonials',
      title: 'Customer Success Stories',
      description: 'Real stories of how ICE SOS helped families',
      command: 'Generate 6 pieces of content featuring real customer testimonials about how ICE SOS Lite helped in emergency situations. Create Instagram stories, Facebook posts, and email content highlighting peace of mind for families and life-saving features.'
    },
    {
      id: 'feature-spotlight',
      title: 'App Feature Highlights',
      description: 'Highlight key app features and benefits',
      command: 'Create a feature-focused campaign showcasing ICE SOS Lite capabilities. Generate 12 pieces of content including social posts, blog articles, and email sequences explaining emergency contacts, location sharing, family groups, and quick SOS activation.'
    }
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

  const useQuickTemplate = (template: any) => {
    setCurrentCommand(template.command);
  };

  const handleExecuteCommand = () => {
    if (!currentCommand.trim()) {
      addNotification('warning', 'Empty Command', 'Please enter a marketing command first');
      return;
    }

    const config = {
      command: currentCommand,
      publishMode,
      totalPosts: totalPosts[0],
      postsPerDay: postsPerDay[0],
      campaignDuration: campaignDuration[0],
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      priority: 'normal'
    };

    onSendCommand(config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="h-8 w-8 text-primary" />
            Riven AI Command Center
          </CardTitle>
          <p className="text-muted-foreground">
            Give Riven a family safety marketing command and watch AI create professional emergency preparedness campaigns across all platforms
          </p>
        </CardHeader>
      </Card>

      {/* Main Command Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Marketing Command
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="Describe your family safety marketing campaign..."
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="min-h-[120px] text-base"
          />

          {/* Publishing Mode */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Publishing Mode
            </h3>
            <div className="flex gap-4">
              <Button
                variant={publishMode === 'single' ? 'default' : 'outline'}
                onClick={() => setPublishMode('single')}
                className="flex-1"
              >
                Single Post Mode
              </Button>
              <Button
                variant={publishMode === 'quick' ? 'default' : 'outline'}
                onClick={() => setPublishMode('quick')}
                className="flex-1"
              >
                Quick Publish
              </Button>
              <Button
                variant={publishMode === 'campaign' ? 'default' : 'outline'}
                onClick={() => setPublishMode('campaign')}
                className="flex-1"
              >
                Campaign Mode
              </Button>
            </div>
          </div>

          {publishMode === 'single' && (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Create one post for immediate publishing</p>
              </CardContent>
            </Card>
          )}

          {(publishMode === 'campaign' || publishMode === 'quick') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Posts: {totalPosts[0]}</Label>
                <Slider
                  value={totalPosts}
                  onValueChange={setTotalPosts}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Posts per Day: {postsPerDay[0]}</Label>
                <Slider
                  value={postsPerDay}
                  onValueChange={setPostsPerDay}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration: {campaignDuration[0]} days</Label>
                <Slider
                  value={campaignDuration}
                  onValueChange={setCampaignDuration}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Target Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant={selectedPlatforms.includes(platform.id) ? 'default' : 'outline'}
                  onClick={() => togglePlatform(platform.id)}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <IconComponent className={`h-5 w-5 ${platform.color}`} />
                  <span className="text-xs">{platform.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Content Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedContentTypes.includes(type.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleContentType(type.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedContentTypes.includes(type.id)}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{type.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalPosts[0]}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{selectedPlatforms.length}</div>
            <div className="text-sm text-muted-foreground">Platforms</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">Live</div>
            <div className="text-sm text-muted-foreground">Real Data</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">Ready</div>
            <div className="text-sm text-muted-foreground">System Status</div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Advanced Settings
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide' : 'Show'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvancedSettings && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Tone</Label>
                <Select defaultValue="professional">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SEO Focus</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High SEO</SelectItem>
                    <SelectItem value="medium">Medium SEO</SelectItem>
                    <SelectItem value="low">Low SEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTemplates.map((template) => (
              <Card key={template.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{template.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => useQuickTemplate(template)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execute Command */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <Button 
            onClick={handleExecuteCommand}
            disabled={isProcessing || !currentCommand.trim()}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Command...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Execute Command
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated completion: {Math.floor(estimatedTimeRemaining / 60)}:{(estimatedTimeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real Reach & Selected Platforms Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Real Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              No data yet
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Selected Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPlatforms.map(platformId => {
                const platform = platforms.find(p => p.id === platformId);
                return platform ? (
                  <Badge key={platformId} variant="secondary">
                    {platform.name}
                  </Badge>
                ) : null;
              })}
              {selectedPlatforms.length === 0 && (
                <span className="text-muted-foreground text-sm">No platforms selected</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};