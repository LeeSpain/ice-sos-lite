import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Lightbulb
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

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [commandAnalysis, setCommandAnalysis] = useState<any>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Smart command templates
  const smartTemplates = [
    {
      id: 'product-launch',
      title: 'Product Launch Campaign',
      description: 'Multi-platform launch with social, email, and blog content',
      command: 'Create a comprehensive product launch campaign for [product name] targeting [audience]. Include social media posts, email sequences, blog articles, and promotional materials. Focus on benefits: [key benefits].',
      tags: ['product', 'launch', 'multi-platform'],
      estimatedTime: '8-12 minutes',
      platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Email', 'Blog']
    },
    {
      id: 'brand-awareness',
      title: 'Brand Awareness Boost',
      description: 'Increase brand visibility across all channels',
      command: 'Develop a brand awareness campaign for [company name] in [industry]. Create engaging content that showcases our values: [brand values]. Target demographic: [target audience].',
      tags: ['branding', 'awareness', 'engagement'],
      estimatedTime: '6-10 minutes',
      platforms: ['Instagram', 'Twitter', 'LinkedIn', 'Blog']
    },
    {
      id: 'seasonal-promotion',
      title: 'Seasonal Promotion',
      description: 'Holiday and seasonal marketing campaigns',
      command: 'Create a seasonal marketing campaign for [holiday/season] promoting [products/services]. Include urgency, special offers, and seasonal themes. Target: [customer segment].',
      tags: ['seasonal', 'promotion', 'urgency'],
      estimatedTime: '5-8 minutes',
      platforms: ['Instagram', 'Facebook', 'Email']
    },
    {
      id: 'thought-leadership',
      title: 'Thought Leadership',
      description: 'Establish industry authority with expert content',
      command: 'Develop thought leadership content about [industry topic] for [company/person]. Create insightful articles, social posts, and expert commentary. Focus on trends: [current trends].',
      tags: ['leadership', 'expertise', 'industry'],
      estimatedTime: '10-15 minutes',
      platforms: ['LinkedIn', 'Blog', 'Twitter']
    }
  ];

  // AI-powered command suggestions
  useEffect(() => {
    if (currentCommand.length > 20) {
      const suggestions = generateSmartSuggestions(currentCommand);
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [currentCommand]);

  const generateSmartSuggestions = (command: string): string[] => {
    const suggestions = [];
    
    if (command.toLowerCase().includes('product')) {
      suggestions.push('Include product benefits and unique selling points');
      suggestions.push('Add customer testimonials and social proof');
    }
    
    if (command.toLowerCase().includes('social')) {
      suggestions.push('Consider optimal posting times for each platform');
      suggestions.push('Include relevant hashtags and mentions');
    }
    
    if (command.toLowerCase().includes('email')) {
      suggestions.push('Segment audience for personalized messaging');
      suggestions.push('Include clear call-to-action buttons');
    }

    return suggestions.slice(0, 3);
  };

  const analyzeCommand = async (command: string) => {
    // Simulate AI analysis
    const analysis = {
      confidence: Math.random() * 30 + 70,
      targetAudience: 'Young professionals aged 25-40',
      recommendedPlatforms: ['Instagram', 'LinkedIn', 'Email'],
      estimatedReach: Math.floor(Math.random() * 50000) + 10000,
      contentTypes: ['Social Posts', 'Blog Article', 'Email Campaign'],
      keywords: ['innovation', 'technology', 'solution', 'efficiency']
    };
    
    setCommandAnalysis(analysis);
  };

  const handleSendCommand = () => {
    if (!currentCommand.trim()) {
      addNotification('warning', 'Empty Command', 'Please enter a marketing command first');
      return;
    }

    analyzeCommand(currentCommand);
    onSendCommand({
      command: currentCommand,
      analysis: commandAnalysis,
      templates: smartTemplates,
      priority: 'normal'
    });
  };

  const useSmartTemplate = (template: any) => {
    setCurrentCommand(template.command);
    setShowAdvancedOptions(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Active Campaigns</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalCampaigns}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Success Rate</p>
                <p className="text-2xl font-bold text-green-900">{analytics.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Avg. Time</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.averageTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">AI Agents</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.activeAgents}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command Input Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Marketing Command Center
            {isProcessing && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Marketing Command</label>
            <Textarea
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              placeholder="Describe your marketing goals... (e.g., 'Create a social media campaign for our new eco-friendly product launch targeting millennials')"
              className="min-h-[100px] resize-none"
              disabled={isProcessing}
            />
            
            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">AI Suggestions</span>
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Command Analysis */}
          {commandAnalysis && (
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Command Analysis</span>
                  <Badge variant="secondary">{Math.round(commandAnalysis.confidence)}% Confidence</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target Audience:</span>
                    <p className="font-medium">{commandAnalysis.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Reach:</span>
                    <p className="font-medium">{commandAnalysis.estimatedReach.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-muted-foreground text-sm">Recommended Platforms:</span>
                  <div className="flex gap-1 mt-1">
                    {commandAnalysis.recommendedPlatforms.map((platform: string) => (
                      <Badge key={platform} variant="outline" className="text-xs">{platform}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estimated Time */}
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated completion: {formatTime(estimatedTimeRemaining)}</span>
            </div>
          )}

          <Button 
            onClick={handleSendCommand}
            disabled={isProcessing || !currentCommand.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Command...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Launch AI Campaign
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Smart Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Campaign Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smartTemplates.map((template) => (
              <Card key={template.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{template.title}</h4>
                    <Badge variant="outline" className="text-xs">{template.estimatedTime}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.platforms.slice(0, 3).map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                    ))}
                    {template.platforms.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{template.platforms.length - 3}</Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => useSmartTemplate(template)}
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

      {/* Workflow Queue */}
      {workflowQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Campaign Queue ({workflowQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflowQueue.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div>
                    <span className="font-medium">{campaign.title}</span>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(campaign.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="outline">{campaign.status}</Badge>
                </div>
              ))}
              {workflowQueue.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{workflowQueue.length - 3} more campaigns in queue
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};