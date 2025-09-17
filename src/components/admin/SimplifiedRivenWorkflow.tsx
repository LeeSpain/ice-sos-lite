import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Activity, Eye, CheckCircle, ArrowRight, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RealTimeWorkflowVisualizer } from './RealTimeWorkflowVisualizer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type WorkflowStage = 'command' | 'process' | 'approval' | 'success';

interface WorkflowStageData {
  id: string;
  campaign_id: string;
  stage_name: string;
  stage_order: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  output_data?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const SimplifiedRivenWorkflow: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStageData[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('command');
  const [realTimeStages, setRealTimeStages] = useState<any[]>([]);
  const [apiProviderStatus, setApiProviderStatus] = useState<{ openai: boolean; xai: boolean }>({ openai: false, xai: false });

  // Form data state
  const [formData, setFormData] = useState({
    command: '',
    title: '',
    settings: {
      tone: 'professional',
      target_audience: 'families',
      content_type: 'blog_post',
      length: 'medium'
    },
    schedulingOptions: {
      publish_immediately: true,
      scheduled_time: null
    },
    publishingControls: {
      auto_publish: false,
      require_approval: true
    }
  });

  // Modal states
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  interface ContentItem {
    id: string;
    campaign_id: string;
    platform: string;
    content_type: string;
    title?: string;
    body_text?: string;
    seo_title?: string;
    meta_description?: string;
    image_url?: string;
    featured_image_alt?: string;
    hashtags?: string[];
    status: string;
    created_at: string;
    updated_at: string;
    keywords?: string[];
    seo_score?: number;
    reading_time?: number;
    content_sections?: any;
    posted_at?: string;
  }

  const { toast } = useToast();

  // Check API provider status on mount
  useEffect(() => {
    const checkProviderStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('riven-marketing-enhanced', {
          body: { action: 'provider_status' }
        });
        
        if (data?.providers) {
          setApiProviderStatus(data.providers);
          
          if (!data.providers.openai && !data.providers.xai) {
            toast({
              title: "API Provider Warning",
              description: "No AI providers are configured. Content generation may use fallback templates.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Failed to check provider status:', error);
      }
    };
    
    checkProviderStatus();
  }, []);

  // Real-time subscription for workflow stages
  useEffect(() => {
    if (!currentCampaignId) return;

    const channel = supabase
      .channel(`workflow-stages-${currentCampaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_stages',
          filter: `campaign_id=eq.${currentCampaignId}`
        },
        (payload) => {
          console.log('Real-time workflow stage update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setRealTimeStages(prev => {
              const updated = [...prev];
              const index = updated.findIndex(stage => stage.stage_name === payload.new.stage_name);
              
              if (index >= 0) {
                updated[index] = payload.new;
              } else {
                updated.push(payload.new);
              }
              
              // Sort by stage order
              return updated.sort((a, b) => a.stage_order - b.stage_order);
            });
            
            // Update processing status based on stages
            const allStagesCompleted = payload.new.status === 'completed' && 
              realTimeStages.filter(s => s.status === 'completed').length >= 4;
            
            if (allStagesCompleted) {
              setIsProcessing(false);
              setCurrentStage('approval');
              loadContentItems();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentCampaignId, realTimeStages]);

  // Load content items from database
  const loadContentItems = async () => {
    if (!currentCampaignId) return;

    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('campaign_id', currentCampaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGeneratedContent(data || []);
      
      // Auto-move to approval stage if content exists
      if (data && data.length > 0 && currentStage === 'process') {
        setCurrentStage('approval');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error loading content items:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load content items",
        variant: "destructive"
      });
    }
  };

  // Load content items when campaign ID changes
  useEffect(() => {
    if (currentCampaignId) {
      loadContentItems();
    }
  }, [currentCampaignId]);

  const handleSubmit = async () => {
    if (!formData.command.trim()) {
      toast({
        title: "Command Required",
        description: "Please enter a marketing command to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStage('process');
    setCurrentStep(0);
    setRealTimeStages([]);

    try {
      const { data: campaignData, error: campaignError } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: {
          command: formData.command,
          title: formData.title,
          settings: formData.settings,
          scheduling_options: formData.schedulingOptions,
          publishing_controls: formData.publishingControls
        }
      });

      if (campaignError) {
        throw new Error(campaignError.message || 'Failed to start campaign');
      }

      if (campaignData?.campaignId) {
        setCurrentCampaignId(campaignData.campaignId);
        setRealTimeStages([]); // Reset stages for new campaign
        // Start monitoring real-time stages immediately
        monitorWorkflowProgress(campaignData.campaignId);
      }

      toast({
        title: "Campaign Started",
        description: "Your AI marketing campaign is now processing...",
      });

    } catch (error) {
      console.error('Error starting campaign:', error);
      setIsProcessing(false);
      setCurrentStage('command');
      
      toast({
        title: "Campaign Failed",
        description: error instanceof Error ? error.message : 'Failed to start campaign',
        variant: "destructive"
      });
    }
  };

  const monitorWorkflowProgress = async (campaignId: string) => {
    // This function can be used for additional monitoring if needed
    console.log('Monitoring workflow progress for campaign:', campaignId);
  };

  const handleApproval = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ status: 'approved' })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setGeneratedContent(prev => 
        prev.map(item => 
          item.id === contentId ? { ...item, status: 'approved' } : item
        )
      );
      
      // Reload content to sync
      await loadContentItems();
      
      toast({
        title: "Content Approved",
        description: "Content has been approved and is ready for publishing.",
      });
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ 
          status: 'published',
          posted_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setGeneratedContent(prev => 
        prev.map(item => 
          item.id === contentId ? { ...item, status: 'published', posted_at: new Date().toISOString() } : item
        )
      );
      
      // Move to success stage if any content is published
      setCurrentStage('success');
      
      // Reload content to sync
      await loadContentItems();
      
      toast({
        title: "Content Published",
        description: "Content has been successfully published!",
      });
    } catch (error) {
      console.error('Error publishing content:', error);
      toast({
        title: "Publishing Failed",
        description: "Failed to publish content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({ status: 'rejected' })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setGeneratedContent(prev => 
        prev.map(item => 
          item.id === contentId ? { ...item, status: 'rejected' } : item
        )
      );
      
      // Reload content to sync
      await loadContentItems();
      
      toast({
        title: "Content Rejected",
        description: "Content has been rejected and marked for revision.",
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject content. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Modal handlers
  const handlePreviewContent = (content: ContentItem) => {
    setSelectedContent(content);
    setShowPreviewModal(true);
  };

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedContent: ContentItem) => {
    try {
      // Update database first
      const { error } = await supabase
        .from('marketing_content')
        .update({
          title: updatedContent.title,
          body_text: updatedContent.body_text,
          seo_title: updatedContent.seo_title,
          meta_description: updatedContent.meta_description,
          keywords: updatedContent.keywords,
          image_url: updatedContent.image_url,
          featured_image_alt: updatedContent.featured_image_alt,
          seo_score: updatedContent.seo_score
        })
        .eq('id', updatedContent.id);

      if (error) throw error;

      // Update local state
      setGeneratedContent(prev => 
        prev.map(item => 
          item.id === updatedContent.id ? updatedContent : item
        )
      );
      
      // Reload content from database to sync
      await loadContentItems();
      
      toast({
        title: "Content Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setSelectedContent(null);
    setShowEditModal(false);
  };

  const handleRegenerateContent = async (contentId: string) => {
    try {
      const content = generatedContent.find(item => item.id === contentId);
      if (!content) return;

      // Delete the current content
      const { error: deleteError } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (deleteError) throw deleteError;

      // Start a new generation with the same campaign
      setCurrentStage('process');
      setCurrentStep(0);
      setIsProcessing(true);

      toast({
        title: "Regenerating Content",
        description: "Creating new content with improved quality...",
      });

      // Trigger regeneration by calling the edge function again
      const { error: regenError } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: {
          command: formData.command,
          title: formData.title,
          settings: formData.settings,
          scheduling_options: formData.schedulingOptions,
          publishing_controls: formData.publishingControls
        }
      });

      if (regenError) throw regenError;

    } catch (error) {
      console.error('Error regenerating content:', error);
      setIsProcessing(false);
      setCurrentStage('approval');
      
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetWorkflow = () => {
    setCurrentStage('command');
    setIsProcessing(false);
    setCurrentStep(0);
    setCurrentCampaignId(null);
    setGeneratedContent([]);
    setRealTimeStages([]);
    setFormData({
      command: '',
      title: '',
      settings: {
        tone: 'professional',
        target_audience: 'families',
        content_type: 'blog_post',
        length: 'medium'
      },
      schedulingOptions: {
        publish_immediately: true,
        scheduled_time: null
      },
      publishingControls: {
        auto_publish: false,
        require_approval: true
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Riven AI Marketing System</h1>
        <p className="text-muted-foreground text-lg">
          Advanced AI-powered content creation and marketing automation
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Marketing Workflow Control
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge variant={isProcessing ? "secondary" : "outline"}>
                {isProcessing ? "Processing" : "Ready"}
              </Badge>
            </div>
            
            {/* Stage Navigation */}
            <div className="flex items-center gap-2">
              {[
                { id: 'command', label: 'Command Centre', icon: Wand2 },
                { id: 'process', label: 'AI Processing', icon: Activity },
                { id: 'approval', label: 'Review & Approve', icon: Eye },
                { id: 'success', label: 'Published', icon: CheckCircle }
              ].map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = currentStage === stage.id;
                const isCompleted = ['command', 'process', 'approval', 'success'].indexOf(currentStage) > index;
                const isClickable = stage.id === 'command' || 
                  (stage.id === 'approval' && generatedContent.length > 0) ||
                  (stage.id === 'success' && generatedContent.some(c => c.status === 'published'));
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => isClickable && setCurrentStage(stage.id as WorkflowStage)}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'text-muted-foreground'
                      } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    >
                      <StageIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{stage.label}</span>
                    </Button>
                    {index < 3 && (
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {currentStage === 'command' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marketing Command *
                    </label>
                    <Textarea
                      placeholder="Enter your marketing command (e.g., 'Create a comprehensive blog post about emergency preparedness for families')"
                      value={formData.command}
                      onChange={(e) => setFormData({...formData, command: e.target.value})}
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campaign Title
                    </label>
                    <Input
                      placeholder="Optional: Custom title for this campaign"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  {/* Quick Templates */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quick Templates
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        {
                          title: "Emergency Preparedness Blog",
                          command: "Create a comprehensive 2500-word blog post about emergency preparedness for families, including emergency kits, evacuation plans, and safety protocols",
                          tone: "informative",
                          audience: "families"
                        },
                        {
                          title: "Security Tips Article",
                          command: "Write a detailed 2500-word article about home security best practices, including smart home technology, surveillance systems, and safety habits",
                          tone: "professional",
                          audience: "general"
                        },
                        {
                          title: "Travel Safety Guide",
                          command: "Create an engaging 2500-word travel safety guide covering international travel tips, document security, and emergency contacts",
                          tone: "friendly",
                          audience: "travelers"
                        },
                        {
                          title: "Senior Safety Article",
                          command: "Develop a comprehensive 2500-word article about safety considerations for senior citizens, including home modifications and health monitoring",
                          tone: "informative",
                          audience: "seniors"
                        }
                      ].map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto p-3"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              command: template.command,
                              title: template.title,
                              settings: {
                                ...formData.settings,
                                tone: template.tone,
                                target_audience: template.audience
                              }
                            });
                          }}
                        >
                          <div>
                            <div className="font-medium text-sm">{template.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {template.command.substring(0, 80)}...
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content Tone
                    </label>
                    <Select 
                      value={formData.settings.tone} 
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        settings: {...formData.settings, tone: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Audience
                    </label>
                    <Select 
                      value={formData.settings.target_audience} 
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        settings: {...formData.settings, target_audience: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="families">Families</SelectItem>
                        <SelectItem value="seniors">Senior Citizens</SelectItem>
                        <SelectItem value="professionals">Working Professionals</SelectItem>
                        <SelectItem value="travelers">Frequent Travelers</SelectItem>
                        <SelectItem value="general">General Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content Type
                    </label>
                    <Select 
                      value={formData.settings.content_type} 
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        settings: {...formData.settings, content_type: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog_post">Blog Post</SelectItem>
                        <SelectItem value="social_post">Social Media Post</SelectItem>
                        <SelectItem value="email_campaign">Email Campaign</SelectItem>
                        <SelectItem value="video_script">Video Script</SelectItem>
                        <SelectItem value="press_release">Press Release</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Ready to create AI-powered marketing content
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.command.trim() || isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Launch AI Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStage === 'process' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Activity className="h-6 w-6 text-primary animate-pulse" />
                  <h3 className="text-xl font-semibold">AI Processing Your Content</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Our AI is analyzing your command and generating high-quality content...
                </p>
                
                {/* API Provider Status */}
                <div className="flex justify-center gap-4 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    apiProviderStatus.openai ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${apiProviderStatus.openai ? 'bg-green-500' : 'bg-red-500'}`} />
                    OpenAI {apiProviderStatus.openai ? 'Connected' : 'Unavailable'}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    apiProviderStatus.xai ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${apiProviderStatus.xai ? 'bg-green-500' : 'bg-red-500'}`} />
                    xAI {apiProviderStatus.xai ? 'Connected' : 'Unavailable'}
                  </div>
                </div>
              </div>

              {/* Enhanced Real-Time Progress */}
              <div className="space-y-4">
                {realTimeStages.length > 0 ? (
                  realTimeStages.map((stage, index) => (
                    <div key={stage.stage_name} className="bg-card rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {stage.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : stage.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : stage.status === 'in_progress' ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="font-medium capitalize">
                            {stage.stage_name.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant={
                          stage.status === 'completed' ? 'default' :
                          stage.status === 'failed' ? 'destructive' :
                          stage.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {stage.status}
                        </Badge>
                      </div>
                      
                      {stage.started_at && (
                        <div className="text-xs text-muted-foreground">
                          Started: {new Date(stage.started_at).toLocaleTimeString()}
                          {stage.completed_at && (
                            <span className="ml-4">
                              Completed: {new Date(stage.completed_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {stage.error_message && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          Error: {stage.error_message}
                        </div>
                      )}
                      
                      {stage.output_data && Object.keys(stage.output_data).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <details className="cursor-pointer">
                            <summary>Stage Output</summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(stage.output_data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <RealTimeWorkflowVisualizer 
                    campaignId={currentCampaignId || ''}
                    workflow={workflowStages}
                  />
                )}
              </div>
              
              {isProcessing && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      Processing {realTimeStages.find(s => s.status === 'in_progress')?.stage_name?.replace('_', ' ') || 'workflow'}...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStage === 'approval' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Review & Approve Content</h3>
                </div>
                <p className="text-muted-foreground">
                  Review the AI-generated content and approve it for publishing
                </p>
              </div>

              <div className="grid gap-6">
                {generatedContent.length > 0 ? (
                  generatedContent.map((content) => (
                    <Card key={content.id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{content.title || 'Untitled Content'}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                              {content.status}
                            </Badge>
                            <Badge variant="outline">
                              {content.content_type}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {content.meta_description && (
                            <p className="text-sm text-muted-foreground">
                              {content.meta_description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {content.reading_time && (
                              <div>
                                <span className="font-medium">Reading Time:</span>
                                <div>{content.reading_time} min</div>
                              </div>
                            )}
                            {content.seo_score && (
                              <div>
                                <span className="font-medium">SEO Score:</span>
                                <div>{content.seo_score}/100</div>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Platform:</span>
                              <div className="capitalize">{content.platform}</div>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <div>{new Date(content.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewContent(content)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContent(content)}
                            >
                              Edit
                            </Button>

                            {content.status !== 'approved' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproval(content.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            )}

                            {content.status === 'approved' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePublish(content.id)}
                              >
                                Publish
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(content.id)}
                            >
                              Reject
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateContent(content.id)}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      No content generated yet. Try running the AI processing again.
                    </div>
                    <Button variant="outline" onClick={() => setCurrentStage('command')}>
                      Return to Command Centre
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStage === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h3 className="text-2xl font-semibold text-green-700">Campaign Published Successfully!</h3>
              </div>
              
              <p className="text-muted-foreground text-lg mb-6">
                Your AI-generated content has been published and is now live.
              </p>

              <div className="grid gap-4">
                {generatedContent.filter(c => c.status === 'published').map((content) => (
                  <Card key={content.id} className="border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{content.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Published on {content.platform} • {new Date(content.posted_at || content.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Published</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button onClick={resetWorkflow}>
                  Create New Campaign
                </Button>
                <Button variant="outline" onClick={() => setCurrentStage('approval')}>
                  Back to Review
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Professional Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold text-foreground">
                  {selectedContent?.title || 'Content Preview'}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Preview the generated content before approving for publication.
                </DialogDescription>
                {selectedContent && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {selectedContent.platform}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {selectedContent.content_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {selectedContent.reading_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedContent.reading_time} min read
                      </span>
                    )}
                    {selectedContent.seo_score && (
                      <span className="flex items-center gap-1">
                        📈 SEO Score: {selectedContent.seo_score}/100
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              {selectedContent?.body_text ? (
                <article className="max-w-none">
                  {/* Featured Image */}
                  {selectedContent.image_url && (
                    <div className="mb-8">
                      <img 
                        src={selectedContent.image_url} 
                        alt={selectedContent.featured_image_alt || selectedContent.title || 'Featured image'} 
                        className="w-full h-64 object-cover rounded-lg border shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {selectedContent.featured_image_alt && (
                        <p className="text-xs text-muted-foreground mt-2 italic text-center">
                          {selectedContent.featured_image_alt}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Professional article styling */}
                  <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
                    <div 
                      className="formatted-content space-y-6"
                      dangerouslySetInnerHTML={{ __html: selectedContent.body_text }} 
                    />
                  </div>
                  
                  {/* Content metadata */}
                  {(selectedContent.keywords || selectedContent.hashtags) && (
                    <div className="mt-12 pt-8 border-t border-border">
                      <h4 className="text-lg font-semibold text-foreground mb-4">Content Tags</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedContent.keywords && selectedContent.keywords.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              🔍 Keywords
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedContent.keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              # Hashtags
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedContent.hashtags.map((hashtag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  #{hashtag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* SEO Information */}
                  {(selectedContent.seo_title || selectedContent.meta_description) && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        🎯 SEO Optimization
                      </h4>
                      <div className="space-y-4">
                        {selectedContent.seo_title && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">SEO Title</label>
                            <div className="text-sm text-foreground p-3 bg-muted rounded-lg border">
                              {selectedContent.seo_title}
                            </div>
                          </div>
                        )}
                        {selectedContent.meta_description && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                            <div className="text-sm text-foreground p-3 bg-muted rounded-lg border">
                              {selectedContent.meta_description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Statistics */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      📊 Content Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedContent.reading_time && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold text-foreground">{selectedContent.reading_time}</div>
                          <div className="text-xs text-muted-foreground">Minutes</div>
                        </div>
                      )}
                      {selectedContent.seo_score && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold text-foreground">{selectedContent.seo_score}/100</div>
                          <div className="text-xs text-muted-foreground">SEO Score</div>
                        </div>
                      )}
                      {selectedContent.keywords && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold text-foreground">{selectedContent.keywords.length}</div>
                          <div className="text-xs text-muted-foreground">Keywords</div>
                        </div>
                      )}
                      {selectedContent.hashtags && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold text-foreground">{selectedContent.hashtags.length}</div>
                          <div className="text-xs text-muted-foreground">Hashtags</div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg">No content body available for preview.</div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                {selectedContent && (
                  <>Created: {new Date(selectedContent.created_at).toLocaleString()}</>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                  Close Preview
                </Button>
                {selectedContent && (
                  <Button onClick={() => { setShowPreviewModal(false); setShowEditModal(true); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Edit Content
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Make quick edits and save your changes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={selectedContent?.title || ''}
              onChange={(e) => setSelectedContent(prev => prev ? { ...prev, title: e.target.value } : prev)}
              placeholder="Title"
            />
            <Textarea
              className="min-h-[300px]"
              value={selectedContent?.body_text || ''}
              onChange={(e) => setSelectedContent(prev => prev ? { ...prev, body_text: e.target.value } : prev)}
              placeholder="Body (HTML supported)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            {selectedContent && (
              <Button onClick={() => { handleSaveEdit(selectedContent); setShowEditModal(false); }}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};