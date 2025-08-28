import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  DollarSign, 
  Zap,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle,
  Loader2,
  Wand2,
  Share2,
  Users,
  TrendingUp,
  Brain,
  Sparkles,
  Timer,
  Play,
  Calendar as ScheduleIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SchedulingOptions {
  mode: 'immediate' | 'optimal' | 'custom' | 'spread' | 'test';
  custom_date?: Date;
  custom_time?: string;
  spread_days?: number;
  test_percentage?: number;
  optimal_times?: boolean;
}

interface PublishingControls {
  platforms: string[];
  content_types: string[];
  approval_required: boolean;
  ab_testing: boolean;
  ab_variants?: number;
}

interface CommandTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
  description: string;
  default_scheduling?: SchedulingOptions;
}

interface AdvancedOptions {
  audience_targeting: {
    demographics: string[];
    interests: string[];
    location: string[];
  };
  budget_allocation: Record<string, number>;
  performance_goals: {
    type: 'engagement' | 'conversions' | 'reach' | 'awareness';
    target_value: number;
  };
  content_series: {
    enabled: boolean;
    parts: number;
    interval_days: number;
  };
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

const EnhancedCommandCenter: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rivenResponse, setRivenResponse] = useState('');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  // Scheduling & Publishing state
  const [schedulingOptions, setSchedulingOptions] = useState<SchedulingOptions>({
    mode: 'immediate',
    optimal_times: true
  });

  const [publishingControls, setPublishingControls] = useState<PublishingControls>({
    platforms: ['facebook', 'instagram'],
    content_types: ['post'],
    approval_required: true,
    ab_testing: false
  });

  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    audience_targeting: {
      demographics: [],
      interests: [],
      location: []
    },
    budget_allocation: {},
    performance_goals: {
      type: 'engagement',
      target_value: 1000
    },
    content_series: {
      enabled: false,
      parts: 1,
      interval_days: 1
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Command templates with scheduling
  const commandTemplates: CommandTemplate[] = [
    {
      id: '1',
      name: 'Weekly Content Series',
      template: 'Create and schedule a week of posts about family safety tips, posting one each day at optimal times',
      category: 'Content Series',
      description: 'Generate 7 related posts scheduled throughout the week',
      default_scheduling: { mode: 'spread', spread_days: 7, optimal_times: true }
    },
    {
      id: '2',
      name: 'Immediate Campaign',
      template: 'Generate content for immediate publishing about our emergency response services',
      category: 'Urgent',
      description: 'Create and publish content right away',
      default_scheduling: { mode: 'immediate' }
    },
    {
      id: '3',
      name: 'Black Friday Campaign',
      template: 'Plan campaign for Black Friday with countdown scheduling - create 5 posts leading up to the sale',
      category: 'Seasonal',
      description: 'Multi-part campaign with countdown timing',
      default_scheduling: { mode: 'spread', spread_days: 5, optimal_times: true }
    },
    {
      id: '4',
      name: 'Product Launch',
      template: 'Create product announcement with A/B testing for different messaging approaches',
      category: 'Product',
      description: 'Test different messages to see what resonates',
      default_scheduling: { mode: 'test', test_percentage: 20 }
    },
    {
      id: '5',
      name: 'Educational Series',
      template: 'Generate educational content about emergency preparedness, schedule for peak engagement times',
      category: 'Education',
      description: 'Informative content at optimal times',
      default_scheduling: { mode: 'optimal', optimal_times: true }
    }
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'youtube', name: 'YouTube', icon: Youtube }
  ];

  const contentTypes = [
    { id: 'post', name: 'Post', description: 'Regular social media post' },
    { id: 'story', name: 'Story', description: '24-hour story content' },
    { id: 'reel', name: 'Reel/Video', description: 'Short-form video content' },
    { id: 'carousel', name: 'Carousel', description: 'Multi-image post' }
  ];

  const audienceTargeting = {
    demographics: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    interests: ['Family Safety', 'Emergency Preparedness', 'Health & Wellness', 'Technology', 'Travel'],
    locations: ['United States', 'Canada', 'United Kingdom', 'Europe', 'Australia']
  };

  useEffect(() => {
    if (currentWorkflowId) {
      loadWorkflowSteps(currentWorkflowId);
    }
  }, [currentWorkflowId]);

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

  const useTemplate = (template: CommandTemplate) => {
    setCurrentCommand(template.template);
    setSelectedTemplate(template.id);
    
    // Apply default scheduling if available
    if (template.default_scheduling) {
      setSchedulingOptions(template.default_scheduling);
    }

    // Suggest platforms based on template category
    if (template.category === 'Urgent') {
      setPublishingControls(prev => ({ 
        ...prev, 
        platforms: ['facebook', 'twitter'],
        approval_required: false 
      }));
    } else if (template.category === 'Product') {
      setPublishingControls(prev => ({ 
        ...prev, 
        ab_testing: true,
        ab_variants: 2 
      }));
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
          scheduling_options: schedulingOptions,
          publishing_controls: publishingControls,
          advanced_options: advancedOptions
        }
      });

      if (error) throw error;

      setRivenResponse(data.response);
      
      // Load workflow steps for real-time tracking
      if (workflowId) {
        await loadWorkflowSteps(workflowId);
      }

      toast({
        title: "Riven Processing",
        description: "Command submitted successfully! Processing with your scheduling preferences.",
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
        return `Content will be published on ${schedulingOptions.custom_date ? format(schedulingOptions.custom_date, 'PPP') : 'selected date'}`;
      case 'spread':
        return `Content will be spread over ${schedulingOptions.spread_days} days`;
      case 'test':
        return `Content will be tested with ${schedulingOptions.test_percentage}% of audience first`;
      default:
        return 'Scheduling mode not selected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Enhanced Command Center</h1>
            <p className="text-muted-foreground">
              Give Riven detailed commands with scheduling and publishing control
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
          <Settings className="h-4 w-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Command Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Command Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Command Riven
              </CardTitle>
              <CardDescription>
                Tell Riven what marketing content you want to create and how to schedule it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Command</Label>
                <Textarea
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  placeholder="e.g., Create a week-long campaign about family emergency preparedness, posting daily at optimal times across Facebook and Instagram..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{publishingControls.platforms.length}</div>
                  <div className="text-sm text-muted-foreground">Platforms</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{contentTypes.filter(ct => publishingControls.content_types.includes(ct.id)).length}</div>
                  <div className="text-sm text-muted-foreground">Content Types</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{schedulingOptions.mode === 'spread' ? schedulingOptions.spread_days : 1}</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={sendCommandToRiven} 
                  disabled={isProcessing || !currentCommand.trim()}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Riven
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setCurrentCommand('')}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScheduleIcon className="h-5 w-5" />
                Scheduling & Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scheduling Mode */}
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
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Custom Date/Time
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

                {/* Platform Selection */}
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
                        <Label htmlFor={platform.id} className="flex items-center gap-2 text-sm">
                          <platform.icon className="h-4 w-4" />
                          {platform.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Scheduling Options */}
              {schedulingOptions.mode === 'custom' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-2 justify-start">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {schedulingOptions.custom_date ? format(schedulingOptions.custom_date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={schedulingOptions.custom_date}
                          onSelect={(date) => setSchedulingOptions({...schedulingOptions, custom_date: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={schedulingOptions.custom_time || ''}
                      onChange={(e) => setSchedulingOptions({...schedulingOptions, custom_time: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {schedulingOptions.mode === 'spread' && (
                <div>
                  <Label>Number of Days</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={schedulingOptions.spread_days || 7}
                    onChange={(e) => setSchedulingOptions({...schedulingOptions, spread_days: parseInt(e.target.value)})}
                    className="mt-2"
                  />
                </div>
              )}

              {schedulingOptions.mode === 'test' && (
                <div>
                  <Label>Test Audience Percentage</Label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={schedulingOptions.test_percentage || 20}
                    onChange={(e) => setSchedulingOptions({...schedulingOptions, test_percentage: parseInt(e.target.value)})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Test with {schedulingOptions.test_percentage}% of your audience before full rollout
                  </p>
                </div>
              )}

              {/* Content Types */}
              <div>
                <Label>Content Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {contentTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={publishingControls.content_types.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPublishingControls(prev => ({
                              ...prev,
                              content_types: [...prev.content_types, type.id]
                            }));
                          } else {
                            setPublishingControls(prev => ({
                              ...prev,
                              content_types: prev.content_types.filter(ct => ct !== type.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type.id} className="text-sm">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publishing Controls */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="approval-required"
                    checked={publishingControls.approval_required}
                    onCheckedChange={(checked) => setPublishingControls({...publishingControls, approval_required: checked})}
                  />
                  <Label htmlFor="approval-required" className="text-sm">Require approval</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ab-testing"
                    checked={publishingControls.ab_testing}
                    onCheckedChange={(checked) => setPublishingControls({...publishingControls, ab_testing: checked})}
                  />
                  <Label htmlFor="ab-testing" className="text-sm">A/B testing</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options (conditionally shown) */}
          {showAdvanced && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Advanced Targeting & Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Audience Targeting */}
                <div>
                  <Label>Target Demographics</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {audienceTargeting.demographics.map((demo) => (
                      <Badge 
                        key={demo} 
                        variant={advancedOptions.audience_targeting.demographics.includes(demo) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const demographics = advancedOptions.audience_targeting.demographics.includes(demo)
                            ? advancedOptions.audience_targeting.demographics.filter(d => d !== demo)
                            : [...advancedOptions.audience_targeting.demographics, demo];
                          setAdvancedOptions(prev => ({
                            ...prev,
                            audience_targeting: { ...prev.audience_targeting, demographics }
                          }));
                        }}
                      >
                        {demo}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Performance Goals */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Performance Goal</Label>
                    <Select 
                      value={advancedOptions.performance_goals.type} 
                      onValueChange={(value: any) => setAdvancedOptions(prev => ({
                        ...prev,
                        performance_goals: { ...prev.performance_goals, type: value }
                      }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="reach">Reach</SelectItem>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      value={advancedOptions.performance_goals.target_value}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        performance_goals: { ...prev.performance_goals, target_value: parseInt(e.target.value) }
                      }))}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Content Series */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="content-series"
                      checked={advancedOptions.content_series.enabled}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                        ...prev,
                        content_series: { ...prev.content_series, enabled: checked }
                      }))}
                    />
                    <Label htmlFor="content-series">Generate content series</Label>
                  </div>
                  
                  {advancedOptions.content_series.enabled && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div>
                        <Label>Number of Parts</Label>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          value={advancedOptions.content_series.parts}
                          onChange={(e) => setAdvancedOptions(prev => ({
                            ...prev,
                            content_series: { ...prev.content_series, parts: parseInt(e.target.value) }
                          }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Interval (days)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          value={advancedOptions.content_series.interval_days}
                          onChange={(e) => setAdvancedOptions(prev => ({
                            ...prev,
                            content_series: { ...prev.content_series, interval_days: parseInt(e.target.value) }
                          }))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Riven Response & Workflow */}
          {(rivenResponse || isProcessing || workflowSteps.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Riven's Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Riven is processing your command...</span>
                  </div>
                )}
                
                {rivenResponse && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="whitespace-pre-wrap">{rivenResponse}</p>
                  </div>
                )}

                {workflowSteps.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Workflow Progress</h4>
                      <Badge variant="outline">{Math.round(getWorkflowProgress())}% Complete</Badge>
                    </div>
                    <Progress value={getWorkflowProgress()} className="w-full" />
                    
                    <ScrollArea className="h-32">
                      {workflowSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 py-2">
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : step.status === 'failed' ? (
                            <div className="h-4 w-4 rounded-full bg-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{step.step_name}</span>
                          <Badge 
                            variant={step.status === 'completed' ? 'default' : 'outline'}
                            className="ml-auto"
                          >
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Command Templates Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Command Templates
              </CardTitle>
              <CardDescription>
                Quick-start templates with smart scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {commandTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => useTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      {template.default_scheduling && (
                        <Badge variant="secondary" className="text-xs">
                          {template.default_scheduling.mode === 'immediate' && 'Immediate'}
                          {template.default_scheduling.mode === 'optimal' && 'Optimal timing'}
                          {template.default_scheduling.mode === 'spread' && `${template.default_scheduling.spread_days} days`}
                          {template.default_scheduling.mode === 'test' && 'A/B test'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommandCenter;