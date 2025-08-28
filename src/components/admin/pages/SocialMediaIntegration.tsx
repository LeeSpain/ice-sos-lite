import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
  account_status: string;
  follower_count: number;
  last_connected: string;
  posting_permissions: any;
  rate_limits: any;
}

interface PlatformConfig {
  id: string;
  platform: string;
  client_id: string;
  client_secret: string;
  is_active: boolean;
  rate_limits: any;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TrendingUp
};

export function SocialMediaIntegration() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadSocialAccounts();
    loadPlatformConfigs();
  }, []);

  const loadSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading social accounts:', error);
      toast.error('Failed to load social media accounts');
    }
  };

  const loadPlatformConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('social_platform_configs')
        .select('*')
        .order('platform');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading platform configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      setConnectingPlatform(platform);
      
      const { data, error } = await supabase.functions.invoke('social-oauth-handler', {
        body: {
          platform,
          action: 'initiate'
        }
      });

      if (error) throw error;

      // Open OAuth window
      const authWindow = window.open(
        data.authUrl,
        'oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          setConnectingPlatform(null);
          loadSocialAccounts(); // Refresh accounts
          toast.success(`${platform} account connected successfully!`);
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error(`Failed to connect ${platform}: ${error.message}`);
      setConnectingPlatform(null);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .update({ is_active: false, account_status: 'disconnected' })
        .eq('id', accountId);

      if (error) throw error;
      
      await loadSocialAccounts();
      toast.success('Account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const updatePlatformConfig = async (platform: string, config: Partial<PlatformConfig>) => {
    try {
      const { error } = await supabase
        .from('social_platform_configs')
        .upsert({
          platform,
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      await loadPlatformConfigs();
      toast.success('Platform configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'connecting':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', description: 'Connect your Facebook Page' },
    { id: 'instagram', name: 'Instagram', description: 'Connect your Instagram Business account' },
    { id: 'twitter', name: 'Twitter/X', description: 'Connect your Twitter/X account' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Connect your LinkedIn Company Page' },
    { id: 'youtube', name: 'YouTube', description: 'Connect your YouTube channel' },
    { id: 'tiktok', name: 'TikTok', description: 'Connect your TikTok Business account' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Social Media Integration</h2>
          <p className="text-muted-foreground">
            Connect and manage your social media platforms for automated posting
          </p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="connect">Connect New Platform</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const Icon = platformIcons[account.platform as keyof typeof platformIcons];
              
              return (
                <Card key={account.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base capitalize">{account.platform}</CardTitle>
                        <CardDescription>{account.account_name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(account.account_status)}>
                      {account.account_status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Followers</span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {account.follower_count?.toLocaleString() || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Connected</span>
                        <span>{new Date(account.last_connected).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Posting Permissions</span>
                          {account.account_status === 'connected' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Rate Limit: {account.rate_limits?.daily || 100} posts/day
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => connectPlatform(account.platform)}
                        >
                          Reconnect
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => disconnectAccount(account.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connect" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform.id as keyof typeof platformIcons];
              const isConnected = accounts.some(
                acc => acc.platform === platform.id && acc.account_status === 'connected'
              );
              const isConnecting = connectingPlatform === platform.id;
              
              return (
                <Card key={platform.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isConnected && (
                        <div className="flex items-center text-sm text-success">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </div>
                      )}

                      <Button 
                        onClick={() => connectPlatform(platform.id)}
                        disabled={isConnecting}
                        className="w-full"
                        variant={isConnected ? "outline" : "default"}
                      >
                        {isConnecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                            Connecting...
                          </>
                        ) : isConnected ? (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Reconnect
                          </>
                        ) : (
                          `Connect ${platform.name}`
                        )}
                      </Button>

                      <div className="text-xs text-muted-foreground">
                        <p>Required permissions:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Publish posts</li>
                          <li>Read analytics</li>
                          <li>Manage content</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            {platforms.map((platform) => {
              const config = configs.find(c => c.platform === platform.id);
              
              return (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {React.createElement(platformIcons[platform.id as keyof typeof platformIcons], {
                          className: "h-5 w-5"
                        })}
                        <CardTitle>{platform.name} Configuration</CardTitle>
                      </div>
                      <Switch 
                        checked={config?.is_active || false}
                        onCheckedChange={(checked) => 
                          updatePlatformConfig(platform.id, { is_active: checked })
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${platform.id}-client-id`}>Client ID</Label>
                        <Input
                          id={`${platform.id}-client-id`}
                          value={config?.client_id || ''}
                          onChange={(e) => 
                            updatePlatformConfig(platform.id, { client_id: e.target.value })
                          }
                          placeholder="Enter client ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${platform.id}-client-secret`}>Client Secret</Label>
                        <Input
                          id={`${platform.id}-client-secret`}
                          type="password"
                          value={config?.client_secret || ''}
                          onChange={(e) => 
                            updatePlatformConfig(platform.id, { client_secret: e.target.value })
                          }
                          placeholder="Enter client secret"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Label>Rate Limits</Label>
                      <div className="grid gap-2 md:grid-cols-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Posts per hour:</span>
                          <span className="ml-2">{config?.rate_limits?.posts_per_hour || 10}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posts per day:</span>
                          <span className="ml-2">{config?.rate_limits?.posts_per_day || 100}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}