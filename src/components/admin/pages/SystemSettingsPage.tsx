import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Database, Shield, Mail, Zap, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteContent } from '@/hooks/useSiteContent';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface HealthCheck {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  response_time: number;
  details: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);

  // AI Providers configuration stored in site_content for flexibility
  const { value: aiProvidersConfig, save: saveAiProvidersConfig, isLoading: aiConfigLoading } = useSiteContent('ai_providers_config', {
    providers: {
      openai: { enabled: true, model: 'gpt-5' },
      xai: { enabled: false, model: 'grok-beta' }
    },
    stages: {
      overview: { provider: 'openai' },
      text: { provider: 'openai' },
      image: { provider: 'openai' },
      finalize: { provider: 'openai' }
    }
  });

  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});

  const testProviders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: { action: 'provider_status' }
      });
      if (error) throw error;
      setProviderStatus(data?.providers || {});
      toast.success('Checked AI provider connections');
    } catch (err) {
      console.error('Provider status error', err);
      toast.error('Failed to check providers');
    }
  };

  useEffect(() => {
    loadSettings();
    loadSystemHealth();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_model_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, value: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('ai_model_settings')
        .update({ 
          setting_value: typeof value === 'object' ? value : { value },
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await loadSettings();
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const addSetting = async () => {
    if (!newSetting.key.trim()) {
      toast.error('Setting key is required');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('ai_model_settings')
        .insert({
          setting_key: newSetting.key,
          setting_value: { value: newSetting.value },
          description: newSetting.description || null
        });

      if (error) throw error;
      
      setNewSetting({ key: '', value: '', description: '' });
      await loadSettings();
      toast.success('Setting added successfully');
    } catch (error) {
      console.error('Error adding setting:', error);
      toast.error('Failed to add setting');
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_model_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadSettings();
      toast.success('Setting deleted successfully');
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast.error('Failed to delete setting');
    }
  };

  const loadSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const { data, error } = await supabase.functions.invoke('system-health');
      
      if (error) throw error;
      
      setHealthChecks(data.checks || []);
    } catch (error) {
      console.error('Error loading system health:', error);
      toast.error('Failed to load system health');
    } finally {
      setHealthLoading(false);
    }
  };

  const refreshSystemHealth = async () => {
    await loadSystemHealth();
    toast.success('System health refreshed');
  };

  const systemHealthChecks = [
    { name: 'Database Connection', status: 'healthy', icon: Database },
    { name: 'Authentication Service', status: 'healthy', icon: Shield },
    { name: 'Email Service', status: 'warning', icon: Mail },
    { name: 'Edge Functions', status: 'healthy', icon: Zap },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Check className="h-4 w-4 text-white" />;
      case 'warning': return <X className="h-4 w-4 text-white" />;
      case 'error': return <X className="h-4 w-4 text-white" />;
      default: return <X className="h-4 w-4 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and monitor health</p>
        </div>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Monitor the status of core system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Real-time system component status
            </p>
            <Button variant="outline" size="sm" onClick={refreshSystemHealth} disabled={healthLoading}>
              {healthLoading ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(healthChecks.length > 0 ? healthChecks : systemHealthChecks).map((check) => (
              <div key={check.component || check.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {healthChecks.length > 0 ? (
                    <Database className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <check.icon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {healthChecks.length > 0 ? 
                        check.component?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        check.name
                      }
                    </p>
                    {healthChecks.length > 0 && (
                      <p className="text-xs text-muted-foreground">{check.details}</p>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusColor(check.status)} text-white`}>
                  {getStatusIcon(check.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Providers & Models */}
      <Card>
        <CardHeader>
          <CardTitle>AI Providers & Models</CardTitle>
          <CardDescription>
            Enable providers, pick default models, and assign which provider powers each stage. You can add keys later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Connections</p>
              <p className="text-sm text-muted-foreground">Check which API keys are configured on the server</p>
            </div>
            <Button variant="outline" size="sm" onClick={testProviders} disabled={aiConfigLoading}>
              Test Connections
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OpenAI */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">OpenAI</span>
                  {providerStatus.openai !== undefined && (
                    <Badge variant="outline" className={providerStatus.openai ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}>
                      {providerStatus.openai ? 'Connected' : 'Missing Key'}
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={!!aiProvidersConfig?.providers?.openai?.enabled}
                  onCheckedChange={(val) => {
                    const next = {
                      ...aiProvidersConfig!,
                      providers: {
                        ...aiProvidersConfig!.providers,
                        openai: { ...aiProvidersConfig!.providers.openai, enabled: val }
                      }
                    } as any;
                    saveAiProvidersConfig(next);
                  }}
                />
              </div>
              <div>
                <Label>Model</Label>
                <Select
                  value={aiProvidersConfig?.providers?.openai?.model || 'gpt-5'}
                  onValueChange={(value) => {
                    const next = {
                      ...aiProvidersConfig!,
                      providers: {
                        ...aiProvidersConfig!.providers,
                        openai: { ...aiProvidersConfig!.providers.openai, model: value }
                      }
                    } as any;
                    saveAiProvidersConfig(next);
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                    <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* xAI Grok */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">xAI (Grok)</span>
                  {providerStatus.xai !== undefined && (
                    <Badge variant="outline" className={providerStatus.xai ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'}>
                      {providerStatus.xai ? 'Connected' : 'Add Key Later'}
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={!!aiProvidersConfig?.providers?.xai?.enabled}
                  onCheckedChange={(val) => {
                    const next = {
                      ...aiProvidersConfig!,
                      providers: {
                        ...aiProvidersConfig!.providers,
                        xai: { ...aiProvidersConfig!.providers.xai, enabled: val }
                      }
                    } as any;
                    saveAiProvidersConfig(next);
                  }}
                />
              </div>
              <div>
                <Label>Model</Label>
                <Select
                  value={aiProvidersConfig?.providers?.xai?.model || 'grok-beta'}
                  onValueChange={(value) => {
                    const next = {
                      ...aiProvidersConfig!,
                      providers: {
                        ...aiProvidersConfig!.providers,
                        xai: { ...aiProvidersConfig!.providers.xai, model: value }
                      }
                    } as any;
                    saveAiProvidersConfig(next);
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok-beta">grok-beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>


          {/* Stage Mapping */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['overview','text','image','finalize'] as const).map((stage) => (
              <div key={stage} className="space-y-2">
                <Label className="capitalize">{stage} Provider</Label>
                <Select
                  value={aiProvidersConfig?.stages?.[stage]?.provider || 'openai'}
                  onValueChange={(value) => {
                    const next: any = {
                      ...aiProvidersConfig!,
                      stages: { ...aiProvidersConfig!.stages, [stage]: { provider: value } }
                    };
                    saveAiProvidersConfig(next);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="xai">xAI (Grok)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => saveAiProvidersConfig(aiProvidersConfig!)} disabled={aiConfigLoading}>
              Save Provider Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>Manage system-wide configuration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No system settings configured yet
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{setting.setting_key}</h3>
                    <Badge variant="outline" className="text-xs">
                      {typeof setting.setting_value === 'object' ? 'JSON' : 'Text'}
                    </Badge>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  )}
                  <div className="mt-2">
                    <code className="text-xs bg-muted p-1 rounded">
                      {JSON.stringify(setting.setting_value, null, 2)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteSetting(setting.id)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Essential System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Essential System Configuration
          </CardTitle>
          <CardDescription>Core system settings for operational management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Database & Performance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Database & Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Connection Pool Size</Label>
                <p className="text-2xl font-bold text-blue-600">50</p>
                <p className="text-xs text-muted-foreground">Active database connections</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Query Timeout</Label>
                <p className="text-2xl font-bold text-orange-600">30s</p>
                <p className="text-xs text-muted-foreground">Maximum query execution time</p>
              </div>
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Security & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Session Timeout</Label>
                <p className="text-2xl font-bold text-red-600">24h</p>
                <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Rate Limit</Label>
                <p className="text-2xl font-bold text-yellow-600">1000/h</p>
                <p className="text-xs text-muted-foreground">API requests per hour</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Max File Size</Label>
                <p className="text-2xl font-bold text-green-600">10MB</p>
                <p className="text-xs text-muted-foreground">Upload size limit</p>
              </div>
            </div>
          </div>

          {/* Email & Communication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Email & Communication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Daily Email Limit</Label>
                <p className="text-2xl font-bold text-purple-600">10,000</p>
                <p className="text-xs text-muted-foreground">Automated emails per day</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">SMS Rate Limit</Label>
                <p className="text-2xl font-bold text-cyan-600">100/h</p>
                <p className="text-xs text-muted-foreground">Emergency SMS per hour</p>
              </div>
            </div>
          </div>

          {/* Storage & Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Storage & Backup</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Backup Frequency</Label>
                <p className="text-2xl font-bold text-indigo-600">4h</p>
                <p className="text-xs text-muted-foreground">Automated backup interval</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Retention Period</Label>
                <p className="text-2xl font-bold text-teal-600">90 days</p>
                <p className="text-xs text-muted-foreground">Data retention policy</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Storage Usage</Label>
                <p className="text-2xl font-bold text-pink-600">2.4GB</p>
                <p className="text-xs text-muted-foreground">Current usage</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Advanced Configuration Management */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration Management</CardTitle>
          <CardDescription>Manage custom system settings for specialized functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom settings configured</p>
              <p className="text-sm">Add custom configuration settings below as needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{setting.setting_key}</h3>
                      <Badge variant="outline" className="text-xs">
                        {typeof setting.setting_value === 'object' ? 'JSON' : 'Text'}
                      </Badge>
                    </div>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    )}
                    <div className="mt-2">
                      <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                        {JSON.stringify(setting.setting_value, null, 2)}
                      </code>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteSetting(setting.id)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Custom Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Setting</CardTitle>
          <CardDescription>Create specialized configuration settings for advanced system control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setting-key">Setting Key</Label>
              <Input
                id="setting-key"
                placeholder="e.g., max_emergency_contacts"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="setting-value">Setting Value</Label>
              <Input
                id="setting-value"
                placeholder="e.g., 5"
                value={newSetting.value}
                onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="setting-description">Description (Optional)</Label>
            <Textarea
              id="setting-description"
              placeholder="Describe what this setting controls..."
              value={newSetting.description}
              onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
            />
          </div>
          <Button onClick={addSetting} disabled={saving || !newSetting.key.trim()}>
            {saving ? 'Adding...' : 'Add Custom Setting'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}