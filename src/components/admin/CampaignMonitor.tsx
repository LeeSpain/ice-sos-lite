import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  error_message?: string;
  completed_at?: string;
}

export default function CampaignMonitor() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleRetry = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'generate_content',
          campaign_id: campaignId,
          settings: {
            auto_approve_content: false,
            content_quality: 'high',
            seo_optimization: true
          }
        }
      });

      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Content generation retried successfully",
        });
        await loadCampaigns();
      } else {
        throw new Error(response.data?.error || 'Retry failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Failed to retry campaign',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('campaign-monitor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_campaigns'
      }, () => {
        loadCampaigns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Campaigns</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadCampaigns}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No campaigns found. Create your first campaign above!</p>
          </CardContent>
        </Card>
      ) : (
        campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold truncate flex-1">{campaign.title}</h4>
              <div className="flex items-center gap-2">
                <Badge variant={
                  campaign.status === 'completed' ? 'default' : 
                  campaign.status === 'failed' ? 'destructive' : 
                  campaign.status === 'running' ? 'secondary' :
                  'outline'
                }>
                  {campaign.status}
                </Badge>
                {campaign.status === 'running' && (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {campaign.description}
            </p>
            
            {campaign.error_message && (
              <div className="bg-destructive/10 text-destructive text-xs p-2 rounded mb-3">
                <strong>Error:</strong> {campaign.error_message}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created: {new Date(campaign.created_at).toLocaleDateString()}
                {campaign.completed_at && (
                  <span className="ml-2">
                    | Completed: {new Date(campaign.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {campaign.status === 'failed' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRetry(campaign.id)}
                  disabled={isLoading}
                >
                  Retry
                </Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}