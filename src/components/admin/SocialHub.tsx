import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SocialMediaOAuth from './SocialMediaOAuth';
import {
  Share2,
  Plus,
  Users,
  TrendingUp,
  Calendar,
  Activity,
  RefreshCw,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Globe,
  Clock,
  MessageCircle,
  Heart,
  Repeat2
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  platform_name?: string;
  platform_username?: string;
  connection_status: string;
  updated_at: string;
  follower_count?: number;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  posted_at: string;
  engagement_metrics?: {
    likes: number;
    shares: number;
    comments: number;
  };
  status: string;
}

interface SocialHubProps {
  socialAccounts: SocialAccount[];
  onAccountsUpdate: () => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({ socialAccounts, onAccountsUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    loadSocialPosts();
  }, []);

  const loadSocialPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .neq('platform', 'Blog')
        .neq('platform', 'Email')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform to social posts format
      const posts: SocialPost[] = (data || []).map(item => ({
        id: item.id,
        platform: item.platform,
        content: item.body_text || item.title || '',
        posted_at: item.posted_at || item.created_at,
        status: item.status,
        engagement_metrics: (typeof item.engagement_metrics === 'object' && item.engagement_metrics !== null) 
          ? item.engagement_metrics as { likes: number; shares: number; comments: number; }
          : {
              likes: 0,
              shares: 0,
              comments: 0
            }
      }));

      setSocialPosts(posts);
    } catch (error) {
      console.error('Error loading social posts:', error);
    }
  };

  const handleDisconnectAccount = async () => {
    if (!selectedAccount) return;

    setDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke('social-media-oauth', {
        body: {
          action: 'disconnect',
          platform: selectedAccount.platform,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Account Disconnected",
        description: `Your ${selectedAccount.platform} account has been disconnected`,
      });

      setDisconnectModalOpen(false);
      setSelectedAccount(null);
      onAccountsUpdate();
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const confirmDisconnect = (account: SocialAccount) => {
    setSelectedAccount(account);
    setDisconnectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Facebook: 'from-blue-500 to-blue-600',
      Instagram: 'from-pink-500 to-purple-600',
      Twitter: 'from-blue-400 to-blue-500',
      LinkedIn: 'from-blue-700 to-blue-800',
      YouTube: 'from-red-500 to-red-600'
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const connectedAccounts = socialAccounts.filter(acc => acc.connection_status === 'connected');
  const totalFollowers = connectedAccounts.reduce((sum, acc) => sum + (acc.follower_count || 0), 0);
  const totalEngagement = socialPosts.reduce((sum, post) => 
    sum + (post.engagement_metrics?.likes || 0) + 
    (post.engagement_metrics?.shares || 0) + 
    (post.engagement_metrics?.comments || 0), 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Family Safety Social Hub
          </h2>
          <p className="text-muted-foreground">
            Manage social media accounts and share emergency preparedness content across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadSocialPosts} variant="outline" className="hover-scale">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Connected Accounts</p>
                <p className="text-3xl font-bold text-blue-900">{connectedAccounts.length}</p>
                <p className="text-xs text-blue-600">Active connections</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Total Followers</p>
                <p className="text-3xl font-bold text-green-900">{totalFollowers.toLocaleString()}</p>
                <p className="text-xs text-green-600">Across platforms</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700">Published Posts</p>
                <p className="text-3xl font-bold text-purple-900">{socialPosts.length}</p>
                <p className="text-xs text-purple-600">This month</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50 hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700">Total Engagement</p>
                <p className="text-3xl font-bold text-orange-900">{totalEngagement}</p>
                <p className="text-xs text-orange-600">Likes, shares, comments</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Social Media Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-24 w-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-12 w-12 text-primary/40" />
              </div>
              <h3 className="text-lg font-medium mb-2">No social accounts connected</h3>
              <p className="text-muted-foreground mb-6">
                Connect your social media accounts to start sharing family safety and emergency preparedness content
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedAccounts.map((account) => (
                <Card key={account.id} className="overflow-hidden hover-scale">
                  <div className={`h-2 bg-gradient-to-r ${getPlatformColor(account.platform)}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 bg-gradient-to-r ${getPlatformColor(account.platform)} rounded-full flex items-center justify-center`}>
                          <Share2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.platform}</h3>
                          <p className="text-xs text-muted-foreground">
                            {account.platform_name || account.platform_username}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Followers:</span>
                        <span className="font-medium">{(account.follower_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{formatDate(account.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => confirmDisconnect(account)}
                        className="hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Social Media Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SocialMediaOAuth 
            accounts={socialAccounts} 
            onAccountsUpdate={onAccountsUpdate} 
          />
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Social Media Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {socialPosts.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No safety content posted yet</h3>
              <p className="text-muted-foreground">
                Create family safety content using the Riven Command Center to see posts here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {socialPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="border-l-4 border-l-primary/30 hover:border-l-primary transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-6 w-6 bg-gradient-to-r ${getPlatformColor(post.platform)} rounded-full flex items-center justify-center`}>
                            <Share2 className="h-3 w-3 text-white" />
                          </div>
                          <Badge variant="outline">{post.platform}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(post.posted_at)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.content}
                        </p>

                        {post.engagement_metrics && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.engagement_metrics.likes} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <Repeat2 className="h-3 w-3" />
                              {post.engagement_metrics.shares} shares
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.engagement_metrics.comments} comments
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Disconnect Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your {selectedAccount?.platform} account? 
              You'll need to reconnect it to continue posting to this platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectModalOpen(false)} disabled={disconnecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnectAccount} disabled={disconnecting}>
              {disconnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};