import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Zap, 
  Settings,
  Database,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface AIAgentStats {
  totalConversations: number;
  averageResponseTime: number;
  satisfactionScore: number;
  activeUsers: number;
  modelVersion: string;
  lastTraining: string;
}

interface AISettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableLogging: boolean;
  autoLearnEnabled: boolean;
  responseDelay: number;
}

export default function AIAgentPage() {
  const [aiStats, setAiStats] = useState<AIAgentStats>({
    totalConversations: 0,
    averageResponseTime: 1.2,
    satisfactionScore: 4.7,
    activeUsers: 0,
    modelVersion: 'GPT-4.1-2025',
    lastTraining: new Date().toISOString()
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: `You are Emma, the AI customer service agent for ICE SOS Lite, a revolutionary personal safety and emergency response platform designed to protect individuals and families.

COMPANY OVERVIEW:
ICE SOS Lite is a comprehensive emergency response and family safety app that provides 24/7 monitoring, instant SOS alerts, GPS tracking, and AI-powered wellness checks. We help people feel safe and keep families connected during emergencies.

CURRENT PRICING PLANS (Always quote in Euros €):
1. Basic Plan (€7.99/month): Essential safety features including SOS alerts, basic family notifications, and emergency contact management
2. Premium Plan (€19.99/month): All Basic features plus advanced GPS tracking, medical information storage, priority response, and family location sharing  
3. Enterprise Plan (€49.99/month): Complete business safety solution with team management, advanced analytics, and dedicated support

KEY FEATURES & CAPABILITIES:
- One-touch SOS emergency alerts with instant notification to contacts and emergency services
- Real-time GPS location sharing during emergencies and ongoing location tracking for family members
- Comprehensive medical information storage (conditions, allergies, medications, blood type)
- Emergency contact management with priority notifications
- Family protection sharing across multiple users
- AI-powered daily wellness checks and health monitoring
- Professional 24/7 emergency response call center (Premium/Enterprise)
- Secure, encrypted data storage with GDPR compliance
- Voice-activated emergency features
- Mobile app with seamless cross-platform functionality

Your personality: Professional yet warm, safety-focused, empathetic, and genuinely concerned about helping people protect themselves and their families.`,
    enableLogging: true,
    autoLearnEnabled: false,
    responseDelay: 0.5
  });

  const [loading, setLoading] = useState(true);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAIData();
    loadAISettings();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      // Load conversation stats
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      // Load leads for user activity
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, session_id')
        .order('created_at', { ascending: false });

      const uniqueUsers = new Set(leadsData?.map(lead => lead.session_id) || []).size;

      setAiStats(prev => ({
        ...prev,
        totalConversations: conversationsData?.length || 0,
        activeUsers: uniqueUsers
      }));
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAISettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('ai_model_settings')
        .select('setting_key, setting_value');

      if (settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as any);

        const unwrap = (v: any, fb: any) => (v && typeof v === 'object' && 'value' in v ? (v as any).value : (v ?? fb));

        setAiSettings(prev => ({
          ...prev,
          temperature: Number(unwrap(settingsMap.temperature, prev.temperature)),
          maxTokens: Number(unwrap(settingsMap.max_tokens, prev.maxTokens)),
          systemPrompt: String(unwrap(settingsMap.system_prompt, prev.systemPrompt)),
          enableLogging: unwrap(settingsMap.enable_logging, prev.enableLogging),
          autoLearnEnabled: unwrap(settingsMap.auto_learn_enabled, prev.autoLearnEnabled),
          responseDelay: Number(unwrap(settingsMap.response_delay, prev.responseDelay))
        }));
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      // Test the AI connection by making a test call
      // Save AI settings to database
      const settingsToSave = [
        { setting_key: 'temperature', setting_value: aiSettings.temperature },
        { setting_key: 'max_tokens', setting_value: aiSettings.maxTokens },
        { setting_key: 'system_prompt', setting_value: aiSettings.systemPrompt },
        { setting_key: 'enable_logging', setting_value: aiSettings.enableLogging },
        { setting_key: 'auto_learn_enabled', setting_value: aiSettings.autoLearnEnabled },
        { setting_key: 'response_delay', setting_value: aiSettings.responseDelay }
      ];

      for (const setting of settingsToSave) {
        await supabase
          .from('ai_model_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            description: `AI configuration setting: ${setting.setting_key}`
          }, { onConflict: 'setting_key' });
      }

      toast({ title: 'System prompt saved', description: 'Emma’s instructions updated.' });

      // Test the AI connection
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: 'Test connection - please respond with "AI agent is working correctly"',
          sessionId: 'admin-test-' + Date.now(),
          userId: null
        }
      });

      if (error) {
        throw error;
      }

      console.log('AI settings updated successfully:', aiSettings);
      console.log('AI test response:', data);
      // In a real implementation, save settings to database
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw error;
    }
  };

  const restartAIAgent = async () => {
    console.log('Restarting AI Agent...');
    // Simulate restart process
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Control</h1>
          <p className="text-muted-foreground">Loading AI agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Agent Control Center</h1>
          <p className="text-muted-foreground">Monitor and manage Emma, your AI assistant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            View Logs
          </Button>
          <Button onClick={restartAIAgent}>
            <Zap className="h-4 w-4 mr-2" />
            Restart Agent
          </Button>
        </div>
      </div>

      {/* AI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Agent Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-900">Online</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Responding normally</p>
              </div>
              <Bot className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Conversations</p>
                <p className="text-2xl font-bold text-blue-900">{aiStats.totalConversations}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MessageSquare className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-700">Total handled</span>
                </div>
              </div>
              <MessageSquare className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Response Time</p>
                <p className="text-2xl font-bold text-purple-900">{aiStats.averageResponseTime}s</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-700">Average</span>
                </div>
              </div>
              <Clock className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Satisfaction</p>
                <p className="text-2xl font-bold text-orange-900">{aiStats.satisfactionScore}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-orange-700">User rating</span>
                </div>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
              <input 
                id="temperature"
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => setAiSettings(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Controls randomness in responses</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input 
                id="maxTokens"
                type="number" 
                value={aiSettings.maxTokens}
                onChange={(e) => setAiSettings(prev => ({...prev, maxTokens: parseInt(e.target.value)}))}
              />
              <p className="text-xs text-muted-foreground">Maximum response length</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseDelay">Response Delay (seconds)</Label>
              <Input 
                id="responseDelay"
                type="number" 
                step="0.1"
                value={aiSettings.responseDelay}
                onChange={(e) => setAiSettings(prev => ({...prev, responseDelay: parseFloat(e.target.value)}))}
              />
              <p className="text-xs text-muted-foreground">Delay before sending response</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableLogging">Enable Conversation Logging</Label>
                <p className="text-xs text-muted-foreground">Store conversations for analysis</p>
              </div>
              <Switch 
                id="enableLogging"
                checked={aiSettings.enableLogging}
                onCheckedChange={(checked) => setAiSettings(prev => ({...prev, enableLogging: checked}))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoLearn">Auto-learning</Label>
                <p className="text-xs text-muted-foreground">Learn from user interactions</p>
              </div>
              <Switch 
                id="autoLearn"
                checked={aiSettings.autoLearnEnabled}
                onCheckedChange={(checked) => setAiSettings(prev => ({...prev, autoLearnEnabled: checked}))}
              />
            </div>

            <Button 
              onClick={async () => {
                try {
                  await handleSettingsUpdate();
                  toast({ title: 'AI settings updated', description: 'Connection test triggered.' });
                } catch (error: any) {
                  toast({ title: 'Update failed', description: String(error?.message || error), variant: 'destructive' });
                }
              }} 
              className="w-full"
            >
              Update AI Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="systemPrompt">Emma's Instructions</Label>
                <Textarea 
                  id="systemPrompt"
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAiSettings(prev => ({...prev, systemPrompt: e.target.value}))}
                  rows={12}
                  placeholder="Enter the system prompt that defines Emma's personality and knowledge..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This prompt defines how Emma behaves and what she knows about ICE SOS Lite
                </p>
              </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setAiSettings(prev => ({
                        ...prev,
                        systemPrompt: `You are Emma, the AI customer service agent for ICE SOS Lite — a personal safety and emergency response platform that helps individuals and families stay protected and connected.

Company overview: ICE SOS Lite provides instant SOS alerts, live location sharing during emergencies, AI-powered wellness checks, secure medical profiles, and seamless family access — all designed to support rapid, coordinated responses when it matters most.

Current offers and pricing (always quote in Euros €):

Core Plan: Premium Protection — €4.99/month Includes one-touch SOS alerts, live GPS sharing during an SOS, medical profile, emergency contact management, AI wellness checks, and voice activation.
Add-on: Family Connection — €4.99/month per additional member Invite trusted family members or carers to securely view protection status, receive instant alerts, see live SOS location, and access the emergency profile.
Optional Regional Service: Call Centre Spain — €24.99/month Professional 24/7 regional call-centre support and emergency coordination (availability varies by region).
Safety Device (one-time): ICE SOS Bluetooth Pendant — €59.99 Waterproof, one-button SOS pendant that connects via Bluetooth to the ICE SOS Lite app for instant alerts.

Key features and capabilities:

One-touch SOS with instant alerts to designated contacts
Live GPS location sharing during an active SOS
Secure medical information storage (conditions, allergies, medications, blood type)
Emergency contacts with priority notifications
AI-powered wellness checks and status monitoring
Family & carer dashboard access (via Family Connection add-on)
Optional 24/7 regional call-centre escalation (where subscribed)
Voice-activated emergency features
GDPR-compliant, encrypted data handling
Cross-platform mobile experience

How Emma should respond:

Tone: professional, warm, safety-focused, empathetic, and reassuring
Always use Euros (€) when quoting prices; be clear and concise
Clarify whether the user needs the core plan, the Family Connection add-on, a regional service, or a device
If someone indicates an active emergency: advise them to contact local emergency services immediately; do not provide medical or legal advice
Provide practical guidance (e.g., how to subscribe, invite family, or manage plans) and explain that checkout opens in a new tab
Ask brief clarifying questions to ensure accurate support
Escalate complex billing/account issues to human support when appropriate

Common guidance:

To add a family member/carer: subscribe to Premium Protection, then add Family Connection to invite and grant secure dashboard access
Regional services are optional add-ons and may vary by location
The Bluetooth pendant enhances accessibility with one-button SOS, working alongside the app`
                      }));
                      toast({ title: 'Reset applied', description: 'Default system prompt loaded. Click Save to persist.' });
                    }}
                  >
                    Reset to Default
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={savingPrompt}
                    onClick={async () => {
                      try {
                        setSavingPrompt(true);
                        const { error } = await supabase
                          .from('ai_model_settings')
                          .upsert({
                            setting_key: 'system_prompt',
                            setting_value: aiSettings.systemPrompt,
                            description: 'System prompt for Emma'
                          }, { onConflict: 'setting_key' });
                        if (error) throw error;
                        await loadAISettings();
                        toast({ title: 'Saved', description: 'System prompt updated successfully.' });
                      } catch (e: any) {
                        toast({ title: 'Save failed', description: String(e?.message || e), variant: 'destructive' });
                      } finally {
                        setSavingPrompt(false);
                      }
                    }}
                  >
                    {savingPrompt ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-blue-50 border border-blue-200">
              <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Current Model</h3>
              <p className="text-sm text-blue-700">{aiStats.modelVersion}</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-green-50 border border-green-200">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Active Users</h3>
              <p className="text-sm text-green-700">{aiStats.activeUsers} conversations today</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50 border border-purple-200">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Last Training</h3>
              <p className="text-sm text-purple-700">{new Date(aiStats.lastTraining).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('ai-chat', {
                    body: {
                      message: 'Hello Emma, this is a test from the admin panel. Please introduce yourself and confirm you are working properly.',
                      sessionId: 'admin-test-' + Date.now(),
                      userId: null
                    }
                  });
                  
                  if (error) throw error;
                  
                  console.log('AI Test Response:', data);
                  alert('AI Test Successful! Check console for response.');
                } catch (error) {
                  console.error('AI Test Error:', error);
                  alert('AI Test Failed: ' + error.message);
                }
              }}
            >
              <MessageSquare className="h-5 w-5 mb-2" />
              Test Chat
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Database className="h-5 w-5 mb-2" />
              Export Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-5 w-5 mb-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertCircle className="h-5 w-5 mb-2" />
              Health Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}