import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot,
  MessageSquare,
  Activity,
  Settings,
  Database,
  Save,
  Trash2,
  Edit3,
  RotateCcw,
  Plus,
  Brain,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AIAgentPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [aiSettings, setAiSettings] = useState({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: '',
    responseStyle: 'helpful',
    contextWindow: 4000,
    memoryEnabled: true,
    learningMode: true
  });

  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [newTrainingItem, setNewTrainingItem] = useState({
    content_type: 'faq',
    title: '',
    content: '',
    tags: [],
    is_active: true
  });

  const [emmaMetrics] = useState({
    total_conversations: 1234,
    avg_response_time: 2.3,
    satisfaction_score: 4.8,
    resolution_rate: 94.2,
    active_sessions: 12
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadAISettings(), loadTrainingData()]);
    setLoading(false);
  };

  const loadAISettings = async () => {
    try {
      const { data, error } = await supabase.from('ai_model_settings').select('*');
      if (error) throw error;
      
      if (data?.length > 0) {
        const settings = data.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as any);

        setAiSettings({
          model: settings.model || 'gpt-4o-mini',
          temperature: Number(settings.temperature) || 0.7,
          maxTokens: Number(settings.max_tokens) || 500,
          systemPrompt: settings.system_prompt || '',
          responseStyle: settings.response_style || 'helpful',
          contextWindow: Number(settings.context_window) || 4000,
          memoryEnabled: Boolean(settings.memory_enabled),
          learningMode: Boolean(settings.learning_mode)
        });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const loadTrainingData = async () => {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });
      
      if (error) throw error;
      setTrainingData(data || []);
    } catch (error) {
      console.error('Error loading training data:', error);
      setTrainingData([]);
    }
  };

  const saveAISettings = async () => {
    try {
      setSaving(true);
      const settingsToSave = [
        { setting_key: 'model', setting_value: aiSettings.model },
        { setting_key: 'temperature', setting_value: aiSettings.temperature },
        { setting_key: 'max_tokens', setting_value: aiSettings.maxTokens },
        { setting_key: 'system_prompt', setting_value: aiSettings.systemPrompt },
        { setting_key: 'response_style', setting_value: aiSettings.responseStyle },
        { setting_key: 'context_window', setting_value: aiSettings.contextWindow },
        { setting_key: 'memory_enabled', setting_value: aiSettings.memoryEnabled },
        { setting_key: 'learning_mode', setting_value: aiSettings.learningMode }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase.from('ai_model_settings').upsert(setting, { onConflict: 'setting_key' });
        if (error) throw error;
      }

      toast({ title: 'Settings Saved', description: 'Emma\'s AI settings updated successfully.' });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({ title: 'Error', description: 'Failed to save AI settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">Loading Emma AI Agent...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emma AI Agent</h1>
            <p className="text-muted-foreground">Complete AI assistant management - settings, training, and performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/#chat', '_blank')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Test Emma Chat
          </Button>
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Model Settings</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                    <p className="text-2xl font-bold">{emmaMetrics.total_conversations.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{emmaMetrics.avg_response_time}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                    <p className="text-2xl font-bold">{emmaMetrics.satisfaction_score}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                    <p className="text-2xl font-bold">{emmaMetrics.resolution_rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold">{emmaMetrics.active_sessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Model Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Emma's AI Model Configuration
              </CardTitle>
              <CardDescription>Configure Emma's AI behavior and model settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>AI Model</Label>
                  <Select value={aiSettings.model} onValueChange={(value) => setAiSettings({...aiSettings, model: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1</SelectItem>
                      <SelectItem value="gpt-5-2025-08-07">GPT-5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperature: {aiSettings.temperature}</Label>
                  <Slider
                    value={[aiSettings.temperature]}
                    onValueChange={([value]) => setAiSettings({...aiSettings, temperature: value})}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAiSettings({...aiSettings, systemPrompt: e.target.value})}
                  rows={8}
                  className="mt-2"
                />
              </div>
              <Button onClick={saveAISettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Data Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Emma's Training Data & Knowledge Base
              </CardTitle>
              <CardDescription>
                Manage Emma's knowledge base with {trainingData.length} active training entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Training Data */}
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <h3 className="text-sm font-medium mb-4">Add New Training Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newTrainingItem.content_type} onValueChange={(value) => setNewTrainingItem({...newTrainingItem, content_type: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product_info">Product Information</SelectItem>
                        <SelectItem value="pricing">Pricing & Plans</SelectItem>
                        <SelectItem value="emergency_response">Emergency Response</SelectItem>
                        <SelectItem value="family_features">Family Features</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="regional">Regional Services</SelectItem>
                        <SelectItem value="health">Health Monitoring</SelectItem>
                        <SelectItem value="business">Business Solutions</SelectItem>
                        <SelectItem value="privacy">Privacy & Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Question/Topic</Label>
                    <Input
                      value={newTrainingItem.title}
                      onChange={(e) => setNewTrainingItem({...newTrainingItem, title: e.target.value})}
                      placeholder="Enter the question or topic"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label>Answer/Content</Label>
                  <Textarea
                    value={newTrainingItem.content}
                    onChange={(e) => setNewTrainingItem({...newTrainingItem, content: e.target.value})}
                    rows={4}
                    placeholder="Enter Emma's response or knowledge content"
                    className="mt-2"
                  />
                </div>
                <Button onClick={() => console.log('Add training data')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Training Data
                </Button>
              </div>

              {/* Training Data List */}
              <div>
                <h3 className="text-sm font-medium mb-4">Current Training Data</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {trainingData.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{item.category}</Badge>
                              <Badge variant="outline">Score: {item.confidence_score}</Badge>
                              {item.usage_count > 0 && (
                                <Badge variant="outline">Used: {item.usage_count}x</Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm mb-2">{item.question}</h4>
                            <p className="text-sm text-muted-foreground">{item.answer.substring(0, 150)}...</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Emma's Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground">Detailed performance metrics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAgentPage;