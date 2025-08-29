import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

interface CommandCenterProps {
  currentCommand: string;
  setCurrentCommand: (command: string) => void;
  isProcessing: boolean;
  onSendCommand: (config: CommandConfiguration) => void;
  commandTemplates: any[];
  useTemplate: (template: any) => void;
  rivenResponse: string;
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

export const EnhancedCommandCenter: React.FC<CommandCenterProps> = ({
  currentCommand,
  setCurrentCommand,
  isProcessing,
  onSendCommand,
  commandTemplates,
  useTemplate,
  rivenResponse
}) => {
  const [totalPosts, setTotalPosts] = useState([10]);
  const [postsPerDay, setPostsPerDay] = useState([2]);
  const [campaignDuration, setCampaignDuration] = useState([7]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'instagram']);
  const [selectedContentTypes, setSelectedContentTypes] = useState(['post']);
  const [budget, setBudget] = useState([500]);
  const [schedulingMode, setSchedulingMode] = useState('optimal');
  const [targetAudience, setTargetAudience] = useState('family_safety');
  const [urgency, setUrgency] = useState('normal');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ];

  const contentTypes = [
    { id: 'post', name: 'Social Post', description: 'Regular social media posts' },
    { id: 'story', name: 'Story', description: 'Instagram/Facebook stories' },
    { id: 'reel', name: 'Reel/Video', description: 'Short-form video content' },
    { id: 'article', name: 'Article', description: 'Long-form content' }
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
    const multiplier = budget[0] / 500;
    return Math.round(baseReach * multiplier);
  };

  const calculateEstimatedCost = () => {
    const baseCost = totalPosts[0] * selectedPlatforms.length * 5;
    return Math.min(baseCost, budget[0]);
  };

  const handleSendCommand = () => {
    const config: CommandConfiguration = {
      command: currentCommand,
      totalPosts: totalPosts[0],
      postsPerDay: postsPerDay[0],
      campaignDuration: campaignDuration[0],
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      budget: budget[0],
      schedulingMode,
      targetAudience,
      urgency
    };
    
    onSendCommand(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Riven Command Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Command Input */}
          <div>
            <Label htmlFor="command">Marketing Command</Label>
            <Textarea
              id="command"
              placeholder="Tell Riven what you want to achieve... 
Example: Create a week-long campaign about family emergency preparedness for Instagram and Facebook, posting twice daily with educational content and testimonials."
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              className="mt-2 min-h-[100px]"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
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
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${calculateEstimatedCost()}</div>
              <div className="text-sm text-muted-foreground">Est. Cost</div>
            </div>
          </div>

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
                <div className="space-y-2">
                  <Label>Budget Range: ${budget[0]}</Label>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                </div>

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
          <Button 
            onClick={handleSendCommand}
            disabled={isProcessing || !currentCommand.trim()}
            className="w-full"
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
    </div>
  );
};