import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowProvider, useWorkflow } from '@/contexts/RivenWorkflowContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, 
  Brain, 
  CheckCircle2,
  XCircle,
  Share2,
  Clock,
  Activity,
  Zap,
  FileText,
  Mail,
  Video,
  Image,
  Eye,
  Edit3,
  Trash2,
  ArrowRight,
  CheckCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';

type WorkflowStage = 'command' | 'process' | 'approval' | 'success';

interface ContentItem {
  id: string;
  title: string;
  body_text: string;
  status: string;
  platform: string;
  content_type: string;
  image_url?: string;
  hashtags?: string[];
  seo_score?: number;
  created_at: string;
}

const SimplifiedRivenContent: React.FC = () => {
  const { sendCommand, activeWorkflows, currentCampaignId } = useWorkflow();
  const { toast } = useToast();
  
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('command');
  const [command, setCommand] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-navigate through workflow stages
  useEffect(() => {
    if (currentCampaignId && currentStage === 'process') {
      const workflow = activeWorkflows[currentCampaignId];
      if (workflow) {
        const completedSteps = workflow.filter(step => step.status === 'completed');
        setCurrentStep(completedSteps.length);
        
        // Auto-advance to approval when content is generated
        if (completedSteps.length === workflow.length) {
          setTimeout(() => {
            setCurrentStage('approval');
            // Simulate content generation
            setGeneratedContent([
              {
                id: '1',
                title: 'Emergency Preparedness Guide for Families',
                body_text: 'Comprehensive guide on how families can prepare for emergencies...',
                status: 'pending',
                platform: contentType,
                content_type: 'safety_guide',
                seo_score: 85,
                created_at: new Date().toISOString()
              }
            ]);
          }, 1000);
        }
      }
    }
  }, [currentCampaignId, activeWorkflows, currentStage, contentType]);

  const handleCreateContent = async () => {
    if (!command.trim()) {
      toast({
        title: "Command Required",
        description: "Please enter a content creation command",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStage('process');
    
    // Set processing steps
    const steps = [
      'Analyzing command...',
      'Generating content structure...',
      'Writing engaging copy...',
      'Optimizing for SEO...',
      'Finalizing content...'
    ];
    setProcessingSteps(steps);
    setCurrentStep(0);

    try {
      await sendCommand(command, {
        title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content`,
        platform: contentType,
        content_type: 'safety_guide'
      });
    } catch (error) {
      console.error('Content creation failed:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create content. Please try again.",
        variant: "destructive"
      });
      setCurrentStage('command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveContent = (contentId: string) => {
    setGeneratedContent(prev => 
      prev.map(item => 
        item.id === contentId 
          ? { ...item, status: 'approved' }
          : item
      )
    );
    
    // Auto-publish and show success
    setTimeout(() => {
      setCurrentStage('success');
      toast({
        title: "Content Published",
        description: "Your content has been successfully published!",
      });
    }, 1000);
  };

  const handleRejectContent = (contentId: string) => {
    setGeneratedContent(prev => 
      prev.map(item => 
        item.id === contentId 
          ? { ...item, status: 'rejected' }
          : item
      )
    );
  };

  const handleStartOver = () => {
    setCurrentStage('command');
    setCommand('');
    setGeneratedContent([]);
    setProcessingSteps([]);
    setCurrentStep(0);
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      blog: FileText,
      email: Mail,
      social: Share2,
      video: Video,
      image: Image
    };
    return icons[type] || FileText;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Progress Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-7 w-7 text-primary" />
                Riven AI Marketing System
              </h1>
              <Badge variant="outline" className="text-sm">
                Professional Edition
              </Badge>
            </div>
            
            {/* Stage Progress */}
            <div className="flex items-center gap-4">
              {[
                { id: 'command', label: 'Command Centre', icon: Wand2 },
                { id: 'process', label: 'AI Processing', icon: Activity },
                { id: 'approval', label: 'Review & Approve', icon: CheckCircle2 },
                { id: 'success', label: 'Published', icon: TrendingUp }
              ].map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = currentStage === stage.id;
                const isCompleted = ['command', 'process', 'approval'].indexOf(currentStage) > index;
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <StageIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{stage.label}</span>
                    </div>
                    {index < 3 && (
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stage Content */}
        {currentStage === 'command' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Command Centre
              </CardTitle>
              <p className="text-muted-foreground">
                Tell Riven what content you want to create and watch the AI work its magic
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: 'blog', label: 'Blog Post', icon: FileText, desc: 'SEO-optimized articles' },
                  { id: 'social', label: 'Social Media', icon: Share2, desc: 'Engaging social posts' },
                  { id: 'email', label: 'Email Campaign', icon: Mail, desc: 'Newsletter content' },
                  { id: 'video', label: 'Video Script', icon: Video, desc: 'Script for videos' }
                ].map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={contentType === type.id ? 'default' : 'outline'}
                      onClick={() => setContentType(type.id)}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <TypeIcon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.desc}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              <Textarea
                placeholder="e.g., Create a comprehensive family emergency preparedness guide that covers SOS device setup, emergency contacts, and safety protocols..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="min-h-[120px] text-base"
              />

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Be specific about your target audience and content goals
                </p>
                <Button 
                  onClick={handleCreateContent}
                  disabled={!command.trim() || isProcessing}
                  className="px-8"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Create with Riven
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStage === 'process' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                AI Processing
              </CardTitle>
              <p className="text-muted-foreground">
                Riven is creating your content using advanced AI technology
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : index === currentStep ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={`${
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              <Progress value={(currentStep / processingSteps.length) * 100} className="w-full" />
              
              <div className="text-center text-sm text-muted-foreground">
                Estimated time remaining: {Math.max(0, (processingSteps.length - currentStep) * 2)} seconds
              </div>
            </CardContent>
          </Card>
        )}

        {currentStage === 'approval' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Review & Approve
              </CardTitle>
              <p className="text-muted-foreground">
                Review the AI-generated content and approve for publishing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedContent.map((content) => (
                <Card key={content.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{content.platform}</Badge>
                          <Badge variant="outline">{content.content_type}</Badge>
                          {content.seo_score && (
                            <Badge variant="secondary">SEO: {content.seo_score}%</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      {content.body_text.substring(0, 200)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Ready for review • Generated just now
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectContent(content.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button 
                          onClick={() => handleApproveContent(content.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve & Publish
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStage === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-3">
                Content Published Successfully!
              </h2>
              <p className="text-green-700 mb-6 max-w-md mx-auto">
                Your content has been automatically published and is now live. 
                Analytics and engagement data will be available shortly.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={handleStartOver}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create More Content
                </Button>
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export const SimplifiedRivenWorkflow: React.FC = () => {
  return (
    <WorkflowProvider>
      <SimplifiedRivenContent />
    </WorkflowProvider>
  );
};