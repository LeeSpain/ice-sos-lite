import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Users,
  ExternalLink
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  followers_count?: number;
  status: 'connected' | 'disconnected' | 'pending';
  last_post_at?: string;
  access_token?: string;
  profile_url?: string;
}

interface PostingQueueItem {
  id: string;
  content_id: string;
  platform: string;
  scheduled_time: string;
  status: string;
  platform_post_id?: string;
  error_message?: string;
}

export const SocialMediaManager: React.FC = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [queueItems, setQueueItems] = useState<PostingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const platformColors = {
    facebook: 'text-blue-600',
    instagram: 'text-pink-600', 
    twitter: 'text-sky-600',
    linkedin: 'text-blue-700',
    youtube: 'text-red-600'
  };

  useEffect(() => {
    loadSocialAccounts();
    loadPostingQueue();
  }, []);

  const loadSocialAccounts = async () => {
    try {
      // Mock data since table doesn't exist yet
      const mockAccounts = [
        { id: '1', platform: 'facebook', account_name: 'ICE SOS Emergency', followers_count: 12500, status: 'connected' as const, profile_url: '#' },
        { id: '2', platform: 'instagram', account_name: '@icesosfamily', followers_count: 8200, status: 'connected' as const, profile_url: '#' },
        { id: '3', platform: 'twitter', account_name: '@ICESafety', followers_count: 5800, status: 'disconnected' as const, profile_url: '#' },
      ];
      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Error loading social accounts:', error);
    }
  };

  const loadPostingQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('posting_queue')
        .select(`
          *,
          marketing_content (
            title,
            body_text
          )
        `)
        .order('scheduled_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error loading posting queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-oauth', {
        body: { platform, action: 'connect' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
      }

      toast({
        title: "Connecting Account",
        description: `Redirecting to ${platform} for authorization`,
      });
    } catch (error) {
      console.error('Error connecting account:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect social media account",
        variant: "destructive"
      });
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      // Mock update
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, status: 'disconnected' as const } : acc
      ));

      toast({
        title: "Account Disconnected",
        description: "Social media account has been disconnected",
      });

      loadSocialAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect account",
        variant: "destructive"
      });
    }
  };

  const retryPost = async (queueItemId: string) => {
    try {
      const { error } = await supabase
        .from('posting_queue')
        .update({ 
          status: 'pending',
          retry_count: 0,
          error_message: null
        })
        .eq('id', queueItemId);

      if (error) throw error;

      toast({
        title: "Post Queued for Retry",
        description: "Post will be retried shortly",
      });

      loadPostingQueue();
    } catch (error) {
      console.error('Error retrying post:', error);
      toast({
        title: "Retry Failed", 
        description: "Failed to queue post for retry",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'pending': return 'secondary';
      case 'disconnected': return 'destructive';
      case 'posted': return 'default';
      case 'failed': return 'destructive';
      case 'scheduled': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin" />
          <span>Loading social media accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(platformIcons).map((platform) => {
              const account = accounts.find(acc => acc.platform === platform);
              const IconComponent = platformIcons[platform as keyof typeof platformIcons];
              const iconColor = platformColors[platform as keyof typeof platformColors];

              return (
                <Card key={platform} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-8 w-8 ${iconColor}`} />
                        <div>
                          <h4 className="font-medium capitalize">{platform}</h4>
                          <p className="text-sm text-muted-foreground">
                            {account?.account_name || 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(account?.status || 'disconnected')}>
                        {account?.status || 'disconnected'}
                      </Badge>
                    </div>
                    
                    {account?.followers_count && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Followers</span>
                        <span className="font-medium">{account.followers_count.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {account?.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Settings
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => disconnectAccount(account.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => connectAccount(platform)}
                          className="w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {account?.profile_url && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" asChild className="w-full">
                          <a href={account.profile_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Profile
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Posting Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Posting Queue ({queueItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queueItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => {
                const IconComponent = platformIcons[item.platform as keyof typeof platformIcons];
                const iconColor = platformColors[item.platform as keyof typeof platformColors];
                
                return (
                  <Card key={item.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${iconColor}`} />
                          <div>
                            <p className="font-medium capitalize">{item.platform}</p>
                            <p className="text-sm text-muted-foreground">
                              Scheduled: {formatDate(item.scheduled_time)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          
                          {item.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryPost(item.id)}
                            >
                              Retry
                            </Button>
                          )}
                          
                          {item.platform_post_id && (
                            <Button variant="outline" size="sm" asChild>
                              <a href="#" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {item.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {item.error_message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};