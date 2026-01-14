import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface SocialQueueItem {
  id: string;
  content_id: string;
  platform: string;
  status: string;
  scheduled_time: string | null;
  posted_at: string | null;
  platform_post_id: string | null;
  error_message: string | null;
  retry_count: number;
}

interface SocialPostingStatusProps {
  contentId: string;
}

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  x: '𝕏',
  linkedin: 'in',
  facebook: 'f',
  instagram: '📷',
};

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
  queued: { variant: 'secondary', icon: <Clock className="h-3 w-3" />, label: 'Queued' },
  retry_scheduled: { variant: 'outline', icon: <RefreshCw className="h-3 w-3" />, label: 'Retry' },
  posted: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Posted' },
  failed: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" />, label: 'Failed' },
};

export const SocialPostingStatus: React.FC<SocialPostingStatusProps> = ({ contentId }) => {
  const [queueItems, setQueueItems] = useState<SocialQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQueueStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('social_media_posting_queue')
          .select('*')
          .eq('content_id', contentId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading social queue:', error);
          return;
        }

        setQueueItems(data || []);
      } catch (err) {
        console.error('Failed to load social queue status:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQueueStatus();
  }, [contentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading social status...</span>
      </div>
    );
  }

  if (queueItems.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className="text-xs text-muted-foreground mr-1">Social:</span>
        {queueItems.map((item) => {
          const config = statusConfig[item.status] || statusConfig.queued;
          const platformIcon = platformIcons[item.platform.toLowerCase()] || item.platform.charAt(0).toUpperCase();

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Badge 
                  variant={config.variant} 
                  className="text-xs px-1.5 py-0.5 gap-1 cursor-default"
                >
                  <span className="font-bold">{platformIcon}</span>
                  {config.icon}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold capitalize">{item.platform} - {config.label}</div>
                  {item.status === 'posted' && item.posted_at && (
                    <div className="text-xs">
                      Posted: {new Date(item.posted_at).toLocaleString()}
                    </div>
                  )}
                  {item.status === 'posted' && item.platform_post_id && (
                    <div className="text-xs text-muted-foreground">
                      ID: {item.platform_post_id.substring(0, 20)}...
                    </div>
                  )}
                  {item.status === 'retry_scheduled' && (
                    <div className="text-xs">
                      Retry #{item.retry_count} scheduled
                    </div>
                  )}
                  {item.status === 'failed' && item.error_message && (
                    <div className="text-xs text-destructive-foreground bg-destructive/10 p-1.5 rounded mt-1">
                      {item.error_message}
                    </div>
                  )}
                  {item.scheduled_time && item.status === 'queued' && (
                    <div className="text-xs">
                      Scheduled: {new Date(item.scheduled_time).toLocaleString()}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
