import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Database, Shield, Mail, Zap, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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

      {/* Add New Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Setting</CardTitle>
          <CardDescription>Create a new system configuration setting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setting-key">Setting Key</Label>
              <Input
                id="setting-key"
                placeholder="e.g., max_upload_size"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="setting-value">Setting Value</Label>
              <Input
                id="setting-value"
                placeholder="e.g., 10MB"
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
            {saving ? 'Adding...' : 'Add Setting'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}