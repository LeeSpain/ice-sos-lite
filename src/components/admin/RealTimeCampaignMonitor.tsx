import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Users,
  Heart,
  Eye,
  RefreshCw,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface RealTimeCampaignMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealTimeCampaignMonitor: React.FC<RealTimeCampaignMonitorProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      // Auto-cleanup stale campaigns first
      await supabase.functions.invoke('campaign-manager', {
        body: { action: 'cleanup_stale' }
      });

      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Campaign Monitor
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No campaigns found. All systems operational!</p>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{campaign.title || 'Campaign'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                    {campaign.status === 'running' && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                        <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                        Generating blog content & DALL-E image...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={campaign.status === 'running' ? 'default' : campaign.status === 'failed' ? 'destructive' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                    {campaign.status === 'running' && (
                      <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                </div>
                {campaign.error_message && (
                  <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                    Error: {campaign.error_message}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};