import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Activity, Eye, CheckCircle, ArrowRight, XCircle, Clock, Send, Brain, AlertTriangle, RefreshCw, Play, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RealTimeWorkflowVisualizer } from './RealTimeWorkflowVisualizer';
import { ImageGenerationToggle } from './ImageGenerationToggle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BulkEmailCRM } from './BulkEmailCRM';

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
  const [allPublishedContent, setAllPublishedContent] = useState<ContentItem[]>([]);
  const [publishedBlogs, setPublishedBlogs] = useState<ContentItem[]>([]);
  const [publishedEmails, setPublishedEmails] = useState<ContentItem[]>([]);
  const [currentContentView, setCurrentContentView] = useState<'blogs' | 'emails' | 'bulk-crm'>('blogs');
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('command');
  const [realTimeStages, setRealTimeStages] = useState<any[]>([]);
  const [apiProviderStatus, setApiProviderStatus] = useState<{ 
    openai: boolean; 
    xai: boolean; 
    openrouter: boolean; 
    fallbackUsed: boolean 
  }>({ openai: false, xai: false, openrouter: false, fallbackUsed: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState<string | null>(null);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');

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
    },
    imageGeneration: {
      enabled: false,
      customPrompt: '',
      style: 'professional'
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
    email_metrics?: {
      total_sent: number;
      total_failed: number;
      total_opened: number;
      total_clicked: number;
      open_rate: number;
      click_rate: number;
      delivery_rate: number;
    };
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
          setApiProviderStatus({
            openai: data.providers.openai,
            xai: data.providers.xai,
            openrouter: data.providers.openrouter,
            fallbackUsed: !data.providers.openai && !data.providers.xai && !data.providers.openrouter
          });
          
          if (!data.providers.openai && !data.providers.xai && !data.providers.openrouter) {
            toast({
              title: "API Provider Warning",
              description: "No AI providers are configured. Please configure AI providers for content generation.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Failed to check provider status:', error);
      }
    };
    
    checkProviderStatus();
    loadAllPublishedContent();
  }, []);

  // Load all published content for the Published stage
  const loadAllPublishedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('status', 'published')
        .order('posted_at', { ascending: false });

      if (error) throw error;
      setAllPublishedContent(data || []);
      
      // Separate blogs and emails
      const blogs = data?.filter(item => item.content_type === 'blog_post') || [];
      const emails = data?.filter(item => item.content_type === 'email_campaign') || [];
      
      setPublishedBlogs(blogs);
      setPublishedEmails(emails);
    } catch (error) {
      console.error('Error loading published content:', error);
    }
  };

  // Load published blogs only
  const loadPublishedBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('status', 'published')
        .eq('content_type', 'blog_post')
        .order('posted_at', { ascending: false });

      if (error) throw error;
      setPublishedBlogs(data || []);
    } catch (error) {
      console.error('Error loading published blogs:', error);
    }
  };

  // Load published emails only
  const loadPublishedEmails = async () => {
    try {
      // Load email campaigns and their queue data
      const { data: emailCampaigns, error: campaignError } = await supabase
        .from('marketing_content')
        .select(`
          *,
          email_queue!inner(
            id,
            recipient_email,
            status,
            sent_at,
            created_at
          )
        `)
        .eq('content_type', 'email_campaign')
        .order('created_at', { ascending: false });

      if (campaignError) throw campaignError;

      // Also get email queue statistics for metrics
      const { data: queueStats, error: statsError } = await supabase
        .from('email_queue')
        .select('status, sent_at, created_at')
        .order('created_at', { ascending: false });

      if (statsError) throw statsError;

      setPublishedEmails(emailCampaigns || []);
      
      // Store email statistics for metrics display
      if (queueStats) {
        const emailMetrics = {
          totalEmails: queueStats.length,
          sentEmails: queueStats.filter(email => email.status === 'sent').length,
          pendingEmails: queueStats.filter(email => email.status === 'pending').length,
          failedEmails: queueStats.filter(email => email.status === 'failed').length
        };
        
        // You can use these metrics in the UI
        console.log('Email metrics:', emailMetrics);
      }
    } catch (error) {
      console.error('Error loading published emails:', error);
    }
  };

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
          publishing_controls: formData.publishingControls,
          image_generation: formData.imageGeneration.enabled,
          image_prompt: formData.imageGeneration.customPrompt,
          image_style: formData.imageGeneration.style
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
      await loadAllPublishedContent(); // Refresh published content list
      
      // Refresh the specific content view
      if (currentContentView === 'blogs') {
        await loadPublishedBlogs();
      } else {
        await loadPublishedEmails();
      }
      
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
      // Delete the rejected content entirely
      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      // Update local state by removing the content
      setGeneratedContent(prev => prev.filter(item => item.id !== contentId));
      
      toast({
        title: "Content Deleted",
        description: "Rejected content has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting rejected content:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete content. Please try again.",
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

  // Handle deleting published content
  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setAllPublishedContent(prev => prev.filter(content => content.id !== contentId));
      setPublishedBlogs(prev => prev.filter(content => content.id !== contentId));
      setPublishedEmails(prev => prev.filter(content => content.id !== contentId));
      setGeneratedContent(prev => prev.filter(content => content.id !== contentId));
      setShowDeleteConfirm(null);

      toast({
        title: "Content Deleted",
        description: "Content has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle creating new content manually
  const handleCreateNewContent = () => {
    setCurrentStage('command');
    resetWorkflow();
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

      // Update local state by removing the content
      setGeneratedContent(prev => prev.filter(item => item.id !== contentId));

      // Generate new content with custom instructions
      setIsProcessing(true);
      setCurrentStage('process');

      const customCommand = regenerateInstructions.trim() 
        ? `${formData.command}\n\nAdditional instructions: ${regenerateInstructions}`
        : formData.command;

      const { data: campaignData, error: campaignError } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: {
          command: customCommand,
          title: formData.title,
          settings: formData.settings,
          scheduling_options: formData.schedulingOptions,
          publishing_controls: formData.publishingControls,
          image_generation: formData.imageGeneration.enabled,
          image_prompt: formData.imageGeneration.customPrompt,
          image_style: formData.imageGeneration.style
        }
      });

      if (campaignError) {
        throw new Error(campaignError.message || 'Failed to regenerate content');
      }

      if (campaignData?.campaignId) {
        setCurrentCampaignId(campaignData.campaignId);
        setRealTimeStages([]);
        monitorWorkflowProgress(campaignData.campaignId);
      }

      // Reset dialog state
      setShowRegenerateDialog(null);
      setRegenerateInstructions('');
      
      toast({
        title: "Content Regenerating",
        description: "New content is being generated with your instructions...",
      });

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
      },
      imageGeneration: {
        enabled: false,
        customPrompt: '',
        style: 'professional'
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Riven AI Marketing System</h1>
        <p className="text-muted-foreground text-lg mb-4">
          Advanced AI-powered content creation and marketing automation
        </p>
        
        {/* Quick Access to Published Content */}
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentStage('success');
              setCurrentContentView('blogs');
              loadPublishedBlogs();
            }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Published Blogs
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentStage('success');
              setCurrentContentView('emails');
              loadPublishedEmails();
            }}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Published Emails
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentStage('success');
              setCurrentContentView('bulk-crm');
            }}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Bulk Email CRM
          </Button>
          
          <Button
            variant="outline" 
            onClick={() => setCurrentStage('command')}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Create New Content
          </Button>
        </div>
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
                { id: 'success', label: 'Published Content', icon: CheckCircle }
              ].map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = currentStage === stage.id;
                const isCompleted = ['command', 'process', 'approval', 'success'].indexOf(currentStage) > index;
                const isClickable = stage.id === 'command' || 
                  stage.id === 'success' || // Always allow access to published content
                  (stage.id === 'approval' && generatedContent.length > 0) ||
                  (stage.id === 'process' && isProcessing);
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        if (isClickable) {
                          setCurrentStage(stage.id as WorkflowStage);
                          if (stage.id === 'success') {
                            // Load content based on current view
                            if (currentContentView === 'blogs') {
                              loadPublishedBlogs();
                            } else {
                              loadPublishedEmails();
                            }
                          }
                        }
                      }}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : isClickable
                          ? 'text-foreground hover:bg-accent'
                          : 'text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
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
              {/* AI Provider Status */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      AI Marketing Command
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {apiProviderStatus.openai && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">OpenAI Active</Badge>
                      )}
                      {apiProviderStatus.xai && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">xAI Active</Badge>
                      )}
                      {apiProviderStatus.openrouter && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">OpenRouter Active</Badge>
                      )}
                      {apiProviderStatus.fallbackUsed && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">No AI Providers</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const checkProviderStatus = async () => {
                            try {
                              const { data } = await supabase.functions.invoke('riven-marketing-enhanced', {
                                body: { action: 'provider_status' }
                              });
                              if (data?.providers) {
                                setApiProviderStatus({
                                  openai: data.providers.openai,
                                  xai: data.providers.xai,
                                  openrouter: data.providers.openrouter,
                                  fallbackUsed: !data.providers.openai && !data.providers.xai && !data.providers.openrouter
                                });
                              }
                            } catch (error) {
                              console.error('Failed to check provider status:', error);
                            }
                          };
                          checkProviderStatus();
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiProviderStatus.fallbackUsed && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        No AI providers are configured. Please configure OpenAI, xAI, or OpenRouter to enable content generation.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marketing Command
                    </label>
                    <Textarea
                      placeholder="Describe what content you want to create. Be specific about topic, audience, and format."
                      value={formData.command}
                      onChange={(e) => setFormData({...formData, command: e.target.value})}
                      className="min-h-[100px]"
                      disabled={isProcessing}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Provide detailed instructions for content creation including topic, target audience, tone, and format requirements.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campaign Title
                    </label>
                    <Input
                      placeholder="Campaign title (optional)"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
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

              {/* Image Generation Section */}
              <div className="space-y-4">
                <ImageGenerationToggle
                  enabled={formData.imageGeneration.enabled}
                  onToggle={(enabled) => setFormData({
                    ...formData,
                    imageGeneration: { ...formData.imageGeneration, enabled }
                  })}
                  customPrompt={formData.imageGeneration.customPrompt}
                  onPromptChange={(prompt) => setFormData({
                    ...formData,
                    imageGeneration: { ...formData.imageGeneration, customPrompt: prompt }
                  })}
                />
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
                  Our AI is analyzing your command and generating high-quality content{formData.imageGeneration.enabled ? ' with custom images' : ''}...
                </p>
                
                {/* Image Generation Status */}
                {formData.imageGeneration.enabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-sm font-medium">AI Image Generation Active</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Creating custom image: "{formData.imageGeneration.customPrompt?.substring(0, 60)}..."
                    </p>
                  </div>
                )}
                
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
                <p className="text-muted-foreground mb-4">
                  Review the AI-generated content and approve it for publishing
                </p>
                
                {/* Workflow Guide */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                  <h4 className="font-semibold text-blue-800 mb-2">Publishing Workflow:</h4>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="bg-white px-2 py-1 rounded font-medium">1. Review</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="bg-white px-2 py-1 rounded font-medium">2. Approve</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="bg-white px-2 py-1 rounded font-medium">3. Publish Live</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    After approval, click "Publish to Live" to make content visible on your blog.
                  </p>
                </div>
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

                          {/* Generated Image Display */}
                          {content.image_url && (
                            <div className="rounded-lg border bg-muted/30 p-4">
                              <div className="flex items-center gap-4">
                                <div className="aspect-video w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                                  <img 
                                    src={content.image_url} 
                                    alt={content.featured_image_alt || "Generated content image"}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden flex-col items-center justify-center w-full h-full">
                                    📸 Generated Image
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium flex items-center gap-2">
                                    🎨 AI Generated Image
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Ready
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {content.featured_image_alt || "Custom generated image for this content"}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2 h-6 px-2 text-xs"
                                    onClick={() => window.open(content.image_url, '_blank')}
                                  >
                                    View Full Size
                                  </Button>
                                </div>
                              </div>
                            </div>
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

                            {content.status === 'draft' && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleApproval(content.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve for Publishing
                              </Button>
                            )}

                            {content.status === 'approved' && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handlePublish(content.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Publish to Live
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
                              onClick={() => setShowRegenerateDialog(content.id)}
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
            <div className="space-y-8">
              {/* Professional Header Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 p-8 border">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-foreground mb-1">Published Content Library</h3>
                        <p className="text-muted-foreground text-lg">
                          Manage and monitor your published marketing content
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={loadAllPublishedContent} 
                        variant="outline" 
                        className="flex items-center gap-2 border-primary/20 hover:bg-primary/5"
                      >
                        <Activity className="h-4 w-4" />
                        Refresh
                      </Button>
                      <Button 
                        onClick={handleCreateNewContent} 
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg"
                      >
                        <Wand2 className="h-4 w-4" />
                        Create New Content
                      </Button>
                    </div>
                  </div>

                  {/* Separate Statistics Cards for Blogs vs Emails */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {currentContentView === 'blogs' ? (
                      <>
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">{publishedBlogs.length}</div>
                              <div className="text-sm text-muted-foreground">Published Blogs</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedBlogs.reduce((total, blog) => total + (blog.reading_time || 0), 0)}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Reading Time</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                              <Wand2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedBlogs.length > 0 ? Math.round(publishedBlogs.reduce((total, blog) => total + (blog.seo_score || 0), 0) / publishedBlogs.length) : 0}
                              </div>
                              <div className="text-sm text-muted-foreground">Avg SEO Score</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                              <Activity className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedBlogs.filter(blog => blog.keywords && blog.keywords.length > 0).length}
                              </div>
                              <div className="text-sm text-muted-foreground">SEO Optimized</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                              <Send className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">{publishedEmails.length}</div>
                              <div className="text-sm text-muted-foreground">Email Campaigns</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                              <Activity className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedEmails.reduce((total, email) => total + (email.email_metrics?.total_sent || 0), 0)}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Emails Sent</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                              <Eye className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedEmails.length > 0 ? Math.round(publishedEmails.reduce((total, email) => total + (email.email_metrics?.open_rate || 0), 0) / publishedEmails.length) : 0}%
                              </div>
                              <div className="text-sm text-muted-foreground">Avg Open Rate</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                              <Wand2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {publishedEmails.length > 0 ? Math.round(publishedEmails.reduce((total, email) => total + (email.email_metrics?.click_rate || 0), 0) / publishedEmails.length) : 0}%
                              </div>
                              <div className="text-sm text-muted-foreground">Avg Click Rate</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Grid Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Content Library
                    </h4>
                    <p className="text-muted-foreground mt-1">
                      All your published marketing content in one place
                    </p>
                  </div>
                  
                  {currentContentView !== 'bulk-crm' && (currentContentView === 'blogs' ? publishedBlogs : publishedEmails).length > 0 && (
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {(currentContentView === 'blogs' ? publishedBlogs : publishedEmails).length} item{(currentContentView === 'blogs' ? publishedBlogs : publishedEmails).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                  {currentContentView === 'bulk-crm' ? (
                    <BulkEmailCRM />
                  ) : (currentContentView === 'blogs' ? publishedBlogs : publishedEmails).length > 0 ? (
                <div className="grid gap-6">
                  {(currentContentView === 'blogs' ? publishedBlogs : publishedEmails).map((content) => (
                      <Card key={content.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-r from-white to-accent/5">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Content Thumbnail */}
                            <div className="flex-shrink-0">
                              {content.image_url ? (
                                <div className="relative overflow-hidden rounded-xl border-2 border-border">
                                  <img 
                                    src={content.image_url} 
                                    alt={content.featured_image_alt || content.title || 'Content image'} 
                                    className="w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center">
                                  <Wand2 className="h-8 w-8 text-primary/40" />
                                </div>
                              )}
                            </div>
                            
                            {/* Content Details */}
                            <div className="flex-1 min-w-0 space-y-4">
                              {/* Title and Meta */}
                              <div>
                                <h5 className="font-bold text-xl text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                  {content.title}
                                </h5>
                                
                                 <div className="flex flex-wrap items-center gap-3 mb-3">
                                   <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-medium">
                                     {content.platform}
                                   </Badge>
                                   {content.image_url && (
                                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                                       🎨 AI Image
                                     </Badge>
                                   )}
                                  <Badge 
                                    variant={content.status === 'published' ? 'default' : 'secondary'}
                                    className={
                                      content.status === 'published' 
                                        ? "bg-green-100 text-green-800 border-green-200 font-medium" 
                                        : content.status === 'approved'
                                        ? "bg-blue-100 text-blue-800 border-blue-200 font-medium"
                                        : "bg-yellow-100 text-yellow-800 border-yellow-200 font-medium"
                                    }
                                  >
                                    {content.status === 'published' ? 'Published' : 
                                     content.status === 'approved' ? 'Ready to Publish' : 
                                     'Draft'}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground font-medium">
                                    {content.content_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                  
                                  {content.reading_time && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                      <Clock className="h-3 w-3" />
                                      {content.reading_time} min read
                                    </div>
                                  )}
                                  
                                   {content.seo_score && (
                                     <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md font-medium ${
                                       content.seo_score >= 80 ? 'bg-green-100 text-green-700' :
                                       content.seo_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                       'bg-red-100 text-red-700'
                                     }`}>
                                       📈 SEO: {content.seo_score}/100
                                     </div>
                                   )}
                                   
                                   {/* Email Metrics Display */}
                                   {currentContentView === 'emails' && content.email_metrics && (
                                     <>
                                       <div className="flex items-center gap-1 text-sm px-2 py-1 rounded-md font-medium bg-blue-100 text-blue-700">
                                         📧 Sent: {content.email_metrics.total_sent}
                                       </div>
                                       <div className="flex items-center gap-1 text-sm px-2 py-1 rounded-md font-medium bg-green-100 text-green-700">
                                         📖 Opens: {content.email_metrics.open_rate}%
                                       </div>
                                       <div className="flex items-center gap-1 text-sm px-2 py-1 rounded-md font-medium bg-purple-100 text-purple-700">
                                         🔗 Clicks: {content.email_metrics.click_rate}%
                                       </div>
                                     </>
                                   )}
                                </div>
                                
                                 <p className="text-sm text-muted-foreground">
                                   {currentContentView === 'emails' ? 'Sent' : 'Published'} {new Date(content.posted_at || content.updated_at).toLocaleDateString('en-US', {
                                     year: 'numeric',
                                     month: 'long',
                                     day: 'numeric',
                                     hour: '2-digit',
                                     minute: '2-digit'
                                   })}
                                 </p>
                              </div>
                              
                              {/* Tags Section */}
                              {(content.keywords || content.hashtags) && (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {content.keywords?.slice(0, 4).map((keyword, index) => (
                                      <Badge key={`keyword-${index}`} variant="outline" className="text-xs border-primary/30 text-primary/80">
                                        🔍 {keyword}
                                      </Badge>
                                    ))}
                                    {content.hashtags?.slice(0, 3).map((hashtag, index) => (
                                      <Badge key={`hashtag-${index}`} variant="outline" className="text-xs border-blue-300 text-blue-700">
                                        #{hashtag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewContent(content)}
                                className="flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                              >
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContent(content)}
                                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                              >
                                ✏️ Edit
                              </Button>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(content.id)}
                                className="flex items-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                              >
                                <XCircle className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-muted-foreground/25 rounded-2xl bg-gradient-to-br from-muted/10 to-accent/5">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {currentContentView === 'blogs' ? (
                          <CheckCircle className="h-10 w-10 text-primary" />
                        ) : (
                          <Send className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      <h4 className="text-2xl font-bold text-foreground mb-3">
                        No Published {currentContentView === 'blogs' ? 'Blogs' : 'Emails'} Yet
                      </h4>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Start creating engaging {currentContentView === 'blogs' ? 'blog posts' : 'email campaigns'} with our AI-powered marketing system. 
                        Your published {currentContentView === 'blogs' ? 'blogs' : 'emails'} will appear here for easy management.
                      </p>
                      <Button onClick={handleCreateNewContent} size="lg" className="shadow-lg">
                        <Wand2 className="h-5 w-5 mr-2" />
                        Create Your First {currentContentView === 'blogs' ? 'Blog Post' : 'Email Campaign'}
                      </Button>
                    </div>
                  </div>
                )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteConfirm && handleDeleteContent(showDeleteConfirm)}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Dialog */}
      <Dialog open={!!showRegenerateDialog} onOpenChange={() => setShowRegenerateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Content</DialogTitle>
            <DialogDescription>
              Provide specific instructions for what you'd like changed in the regenerated content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Specify what changes you want made to the content, tone, format, or focus areas."
              value={regenerateInstructions}
              onChange={(e) => setRegenerateInstructions(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => showRegenerateDialog && handleRegenerateContent(showRegenerateDialog)}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Regenerate Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};