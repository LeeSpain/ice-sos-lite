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
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{campaign.title || 'Campaign'}</h3>
                <Badge>{campaign.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};