import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CampaignDetailsModal } from './CampaignDetailsModal';
import {
  Search,
  Filter,
  Eye,
  Play,
  Pause,
  Edit,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  RefreshCw,
  Plus,
  BookOpen,
  Share2,
  Mail
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  command_input: string;
  target_audience: any;
  budget_estimate: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  scheduled_at?: string;
  content_count?: number;
  blog_count?: number;
  social_count?: number;
  email_count?: number;
}

export const EnhancedMarketingCampaigns: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadCampaigns();
    setupRealtimeSubscription();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      // Load campaigns with content counts
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Load content counts for each campaign
      const campaignsWithCounts = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { data: contentData } = await supabase
            .from('marketing_content')
            .select('content_type')
            .eq('campaign_id', campaign.id);

          const contentCounts = (contentData || []).reduce((acc, item) => {
            acc.total++;
            if (item.content_type === 'blog_post') acc.blog++;
            else if (item.content_type === 'social_post') acc.social++;
            else if (item.content_type === 'email_campaign') acc.email++;
            return acc;
          }, { total: 0, blog: 0, social: 0, email: 0 });

          return {
            ...campaign,
            content_count: contentCounts.total,
            blog_count: contentCounts.blog,
            social_count: contentCounts.social,
            email_count: contentCounts.email
          };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('enhanced-campaigns-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_campaigns'
      }, () => {
        loadCampaigns();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_content'
      }, () => {
        loadCampaigns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: `Campaign ${status === 'paused' ? 'Paused' : 'Resumed'}`,
        description: `Campaign has been ${status === 'paused' ? 'paused' : 'resumed'} successfully`
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Status Update Failed",
        description: "Failed to update campaign status",
        variant: "destructive"
      });
    }
  };

  const openCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      running: "default",
      active: "default",
      paused: "secondary",
      completed: "outline",
      draft: "outline"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.command_input.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Campaigns</h2>
          <p className="text-muted-foreground">Manage and monitor your marketing campaigns</p>
        </div>
        <Button onClick={loadCampaigns} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'running' || c.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.content_count || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blog Posts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {campaigns.reduce((sum, c) => sum + (c.blog_count || 0), 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(campaign.status)}
                    <h3 className="font-semibold line-clamp-1">{campaign.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
                {getStatusBadge(campaign.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <BookOpen className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-muted-foreground">Blogs</p>
                  <p className="text-sm font-medium">{campaign.blog_count || 0}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <Share2 className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Social</p>
                  <p className="text-sm font-medium">{campaign.social_count || 0}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{campaign.email_count || 0}</p>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">€{campaign.budget_estimate || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(campaign.created_at)}</span>
                </div>
                {campaign.command_input && (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <span className="font-medium">Command:</span> {campaign.command_input.slice(0, 100)}...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCampaignDetails(campaign)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateCampaignStatus(
                    campaign.id,
                    campaign.status === 'running' || campaign.status === 'active' ? 'paused' : 'running'
                  )}
                >
                  {campaign.status === 'running' || campaign.status === 'active' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first marketing campaign to get started.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedCampaign(null);
          }}
          onCampaignUpdate={loadCampaigns}
        />
      )}
    </div>
  );
};