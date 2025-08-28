import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  BookOpen,
  Settings,
  FileText,
  Palette,
  Shield,
  Target,
  Upload,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Database,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeBase {
  id?: string;
  title: string;
  content: string;
  type: 'document' | 'url' | 'product_info' | 'faq' | 'training_example';
  tags: string[];
}

interface PromptTemplate {
  id?: string;
  name: string;
  type: 'system' | 'marketing' | 'sales' | 'technical' | 'customer_service';
  prompt: string;
  variables: string[];
  description: string;
}

interface BrandGuidelines {
  voice_tone: string;
  personality_traits: string[];
  do_say: string[];
  dont_say: string[];
  brand_values: string[];
  target_audience: string;
  communication_style: string;
  visual_brand_elements: {
    colors: string[];
    fonts: string[];
    imagery_style: string;
  };
}

interface AIModelSettings {
  model: string;
  temperature: number;
  max_tokens: number;
  creativity_level: number;
  accuracy_threshold: number;
  response_style: string;
  safety_level: string;
}

interface RivenConfiguration {
  knowledge_base: KnowledgeBase[];
  prompt_templates: PromptTemplate[];
  brand_guidelines: BrandGuidelines;
  ai_model_settings: AIModelSettings;
  content_moderation: {
    enabled: boolean;
    filters: string[];
    approval_workflow: boolean;
    auto_moderate: boolean;
  };
  industry_knowledge: {
    emergency_services: boolean;
    family_safety: boolean;
    regional_compliance: Record<string, boolean>;
  };
}

const RivenAIConfiguration: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('knowledge-base');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configuration state
  const [config, setConfig] = useState<RivenConfiguration>({
    knowledge_base: [],
    prompt_templates: [],
    brand_guidelines: {
      voice_tone: 'Professional, caring, safety-focused',
      personality_traits: ['Helpful', 'Knowledgeable', 'Trustworthy', 'Empathetic'],
      do_say: ['Stay safe', 'We care about your wellbeing', 'Emergency services are here to help'],
      dont_say: ['Ignore safety protocols', 'Take unnecessary risks'],
      brand_values: ['Safety First', 'Family Protection', 'Reliable Support', 'Innovation'],
      target_audience: 'Families, elderly individuals, safety-conscious people',
      communication_style: 'Clear, reassuring, action-oriented',
      visual_brand_elements: {
        colors: ['#1e40af', '#dc2626', '#16a34a'],
        fonts: ['Inter', 'Roboto'],
        imagery_style: 'Clean, modern, family-focused'
      }
    },
    ai_model_settings: {
      model: 'gpt-5-2025-08-07',
      temperature: 0.7,
      max_tokens: 1000,
      creativity_level: 0.6,
      accuracy_threshold: 0.8,
      response_style: 'balanced',
      safety_level: 'high'
    },
    content_moderation: {
      enabled: true,
      filters: ['inappropriate_content', 'misinformation', 'off_brand'],
      approval_workflow: true,
      auto_moderate: false
    },
    industry_knowledge: {
      emergency_services: true,
      family_safety: true,
      regional_compliance: {
        'EU_GDPR': true,
        'US_HIPAA': false,
        'UK_Data_Protection': true
      }
    }
  });

  // New item states
  const [newKnowledge, setNewKnowledge] = useState<Partial<KnowledgeBase>>({
    title: '',
    content: '',
    type: 'document',
    tags: []
  });

  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate>>({
    name: '',
    type: 'system',
    prompt: '',
    variables: [],
    description: ''
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      
      // Load from site_content table or create defaults
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', 'riven_ai_configuration')
        .single();

      if (data && data.value) {
        setConfig(data.value as unknown as RivenConfiguration);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_content')
        .upsert({
          key: 'riven_ai_configuration',
          value: config as any,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: "Riven's AI configuration has been updated successfully!",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addKnowledgeItem = () => {
    if (!newKnowledge.title || !newKnowledge.content) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content.",
        variant: "destructive",
      });
      return;
    }

    const knowledgeItem: KnowledgeBase = {
      id: crypto.randomUUID(),
      title: newKnowledge.title!,
      content: newKnowledge.content!,
      type: newKnowledge.type as any,
      tags: newKnowledge.tags || []
    };

    setConfig(prev => ({
      ...prev,
      knowledge_base: [...prev.knowledge_base, knowledgeItem]
    }));

    setNewKnowledge({ title: '', content: '', type: 'document', tags: [] });
  };

  const addPromptTemplate = () => {
    if (!newTemplate.name || !newTemplate.prompt) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and prompt.",
        variant: "destructive",
      });
      return;
    }

    const template: PromptTemplate = {
      id: crypto.randomUUID(),
      name: newTemplate.name!,
      type: newTemplate.type as any,
      prompt: newTemplate.prompt!,
      variables: newTemplate.variables || [],
      description: newTemplate.description || ''
    };

    setConfig(prev => ({
      ...prev,
      prompt_templates: [...prev.prompt_templates, template]
    }));

    setNewTemplate({ name: '', type: 'system', prompt: '', variables: [], description: '' });
  };

  const removeKnowledgeItem = (id: string) => {
    setConfig(prev => ({
      ...prev,
      knowledge_base: prev.knowledge_base.filter(item => item.id !== id)
    }));
  };

  const removePromptTemplate = (id: string) => {
    setConfig(prev => ({
      ...prev,
      prompt_templates: prev.prompt_templates.filter(template => template.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">Loading Riven AI Configuration...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Riven AI Configuration</h1>
            <p className="text-muted-foreground">
              Train and configure Riven's intelligence, knowledge, and behavior
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfiguration} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Model
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="industry" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Industry
          </TabsTrigger>
        </TabsList>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base Management
              </CardTitle>
              <CardDescription>
                Upload documents, URLs, and information for Riven to learn from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Knowledge */}
              <div className="p-4 border border-dashed rounded-lg space-y-4">
                <h3 className="font-medium">Add New Knowledge</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={newKnowledge.title || ''}
                      onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                      placeholder="e.g., Emergency Response Procedures"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newKnowledge.type} 
                      onValueChange={(value) => setNewKnowledge({...newKnowledge, type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="url">URL/Website</SelectItem>
                        <SelectItem value="product_info">Product Information</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="training_example">Training Example</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea 
                    value={newKnowledge.content || ''}
                    onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                    placeholder="Enter the knowledge content or paste URL..."
                    rows={4}
                  />
                </div>
                <Button onClick={addKnowledgeItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Knowledge Item
                </Button>
              </div>

              {/* Existing Knowledge Items */}
              <div className="space-y-3">
                <h3 className="font-medium">Current Knowledge Base ({config.knowledge_base.length} items)</h3>
                {config.knowledge_base.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No knowledge items added yet. Start by adding some documents or information above.
                  </p>
                ) : (
                  <ScrollArea className="h-64">
                    {config.knowledge_base.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.content.substring(0, 100)}...
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeKnowledgeItem(item.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt Templates Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Prompt Templates
              </CardTitle>
              <CardDescription>
                Create and manage prompt templates for different AI behaviors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Template */}
              <div className="p-4 border border-dashed rounded-lg space-y-4">
                <h3 className="font-medium">Create New Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input 
                      value={newTemplate.name || ''}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      placeholder="e.g., Emergency Response Assistant"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newTemplate.type} 
                      onValueChange={(value) => setNewTemplate({...newTemplate, type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input 
                    value={newTemplate.description || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Brief description of when to use this template"
                  />
                </div>
                <div>
                  <Label>Prompt Template</Label>
                  <Textarea 
                    value={newTemplate.prompt || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, prompt: e.target.value})}
                    placeholder="You are Riven, an AI assistant specialized in..."
                    rows={6}
                  />
                </div>
                <Button onClick={addPromptTemplate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>

              {/* Existing Templates */}
              <div className="space-y-3">
                <h3 className="font-medium">Saved Templates ({config.prompt_templates.length})</h3>
                {config.prompt_templates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No prompt templates created yet.
                  </p>
                ) : (
                  <ScrollArea className="h-64">
                    {config.prompt_templates.map((template) => (
                      <div key={template.id} className="flex items-start justify-between p-3 border rounded-lg mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePromptTemplate(template.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Guidelines Tab */}
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Guidelines
              </CardTitle>
              <CardDescription>
                Define your brand voice, personality, and communication style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Voice & Tone</Label>
                    <Textarea
                      value={config.brand_guidelines.voice_tone}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { ...prev.brand_guidelines, voice_tone: e.target.value }
                      }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Target Audience</Label>
                    <Textarea
                      value={config.brand_guidelines.target_audience}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { ...prev.brand_guidelines, target_audience: e.target.value }
                      }))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Communication Style</Label>
                    <Input
                      value={config.brand_guidelines.communication_style}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { ...prev.brand_guidelines, communication_style: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Personality Traits</Label>
                    <Textarea
                      value={config.brand_guidelines.personality_traits.join(', ')}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { 
                          ...prev.brand_guidelines, 
                          personality_traits: e.target.value.split(', ').filter(t => t.trim()) 
                        }
                      }))}
                      placeholder="Helpful, Trustworthy, Knowledgeable"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Brand Values</Label>
                    <Textarea
                      value={config.brand_guidelines.brand_values.join(', ')}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { 
                          ...prev.brand_guidelines, 
                          brand_values: e.target.value.split(', ').filter(v => v.trim()) 
                        }
                      }))}
                      placeholder="Safety First, Innovation, Reliability"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Imagery Style</Label>
                    <Input
                      value={config.brand_guidelines.visual_brand_elements.imagery_style}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        brand_guidelines: { 
                          ...prev.brand_guidelines, 
                          visual_brand_elements: {
                            ...prev.brand_guidelines.visual_brand_elements,
                            imagery_style: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Things to Say</Label>
                  <Textarea
                    value={config.brand_guidelines.do_say.join('\n')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      brand_guidelines: { 
                        ...prev.brand_guidelines, 
                        do_say: e.target.value.split('\n').filter(item => item.trim()) 
                      }
                    }))}
                    placeholder="One phrase per line"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Things to Avoid</Label>
                  <Textarea
                    value={config.brand_guidelines.dont_say.join('\n')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      brand_guidelines: { 
                        ...prev.brand_guidelines, 
                        dont_say: e.target.value.split('\n').filter(item => item.trim()) 
                      }
                    }))}
                    placeholder="One phrase per line"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Model Settings Tab */}
        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
              <CardDescription>
                Configure advanced AI model parameters and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>AI Model</Label>
                    <Select 
                      value={config.ai_model_settings.model} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, model: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5-2025-08-07">GPT-5 (Latest)</SelectItem>
                        <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Reliable)</SelectItem>
                        <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini (Fast)</SelectItem>
                        <SelectItem value="o3-2025-04-16">O3 (Reasoning)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Max Tokens</Label>
                    <Input 
                      type="number"
                      value={config.ai_model_settings.max_tokens}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, max_tokens: parseInt(e.target.value) }
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Response Style</Label>
                    <Select 
                      value={config.ai_model_settings.response_style} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, response_style: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Creativity Level: {config.ai_model_settings.creativity_level}</Label>
                    <Slider
                      value={[config.ai_model_settings.creativity_level]}
                      onValueChange={([value]) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, creativity_level: value }
                      }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">0 = Conservative, 1 = Creative</p>
                  </div>

                  <div>
                    <Label>Accuracy Threshold: {config.ai_model_settings.accuracy_threshold}</Label>
                    <Slider
                      value={[config.ai_model_settings.accuracy_threshold]}
                      onValueChange={([value]) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, accuracy_threshold: value }
                      }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Minimum confidence for responses</p>
                  </div>

                  <div>
                    <Label>Safety Level</Label>
                    <Select 
                      value={config.ai_model_settings.safety_level} 
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        ai_model_settings: { ...prev.ai_model_settings, safety_level: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>
                Configure content filtering, safety measures, and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">Automatically filter inappropriate content</p>
                  </div>
                  <Switch 
                    checked={config.content_moderation.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      content_moderation: { ...prev.content_moderation, enabled: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Approval Workflow</Label>
                    <p className="text-sm text-muted-foreground">Require manual approval before publishing</p>
                  </div>
                  <Switch 
                    checked={config.content_moderation.approval_workflow}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      content_moderation: { ...prev.content_moderation, approval_workflow: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Moderate</Label>
                    <p className="text-sm text-muted-foreground">Automatically reject flagged content</p>
                  </div>
                  <Switch 
                    checked={config.content_moderation.auto_moderate}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      content_moderation: { ...prev.content_moderation, auto_moderate: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label>Active Filters</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.content_moderation.filters.map((filter, index) => (
                      <Badge key={index} variant="secondary">
                        {filter.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry Knowledge Tab */}
        <TabsContent value="industry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Industry Expertise
              </CardTitle>
              <CardDescription>
                Enable specialized knowledge domains and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Knowledge Domains</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Services</Label>
                    <p className="text-sm text-muted-foreground">Emergency response protocols and procedures</p>
                  </div>
                  <Switch 
                    checked={config.industry_knowledge.emergency_services}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      industry_knowledge: { ...prev.industry_knowledge, emergency_services: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Family Safety</Label>
                    <p className="text-sm text-muted-foreground">Family protection and safety measures</p>
                  </div>
                  <Switch 
                    checked={config.industry_knowledge.family_safety}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      industry_knowledge: { ...prev.industry_knowledge, family_safety: checked }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Regional Compliance</h3>
                  
                  {Object.entries(config.industry_knowledge.regional_compliance).map(([region, enabled]) => (
                    <div key={region} className="flex items-center justify-between">
                      <div>
                        <Label>{region.replace('_', ' ')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {region.includes('GDPR') && 'European data protection compliance'}
                          {region.includes('HIPAA') && 'US healthcare privacy compliance'}
                          {region.includes('Data_Protection') && 'UK data protection compliance'}
                        </p>
                      </div>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          industry_knowledge: { 
                            ...prev.industry_knowledge, 
                            regional_compliance: { 
                              ...prev.industry_knowledge.regional_compliance, 
                              [region]: checked 
                            }
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RivenAIConfiguration;
