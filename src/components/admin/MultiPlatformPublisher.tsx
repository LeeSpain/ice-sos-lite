import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PlatformAdapted {
  platform: string;
  adapted_text: string;
  hashtags: string[];
  character_count: number;
}

interface PlatformStatus {
  platform: string;
  status: 'idle' | 'posting' | 'posted' | 'failed';
  error?: string;
  platform_post_id?: string;
}

interface MultiPlatformPublisherProps {
  contentId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PLATFORM_CONFIG: Record<string, { label: string; icon: string; limit: number; color: string }> = {
  twitter: { label: 'Twitter / X', icon: '𝕏', limit: 280, color: 'bg-black text-white' },
  facebook: { label: 'Facebook', icon: 'f', limit: 63206, color: 'bg-blue-600 text-white' },
  linkedin: { label: 'LinkedIn', icon: 'in', limit: 3000, color: 'bg-blue-700 text-white' },
  instagram: { label: 'Instagram', icon: '📷', limit: 2200, color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
};

const ALL_PLATFORMS = ['twitter', 'facebook', 'linkedin', 'instagram'];

export function MultiPlatformPublisher({ contentId, onSuccess, onClose }: MultiPlatformPublisherProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [adapted, setAdapted] = useState<Record<string, PlatformAdapted>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(ALL_PLATFORMS));
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, PlatformStatus>>({});
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [adapterError, setAdapterError] = useState<string | null>(null);

  const loadAdaptedContent = useCallback(async () => {
    setLoading(true);
    setAdapterError(null);

    try {
      const { data, error } = await supabase.functions.invoke('platform-content-adapter', {
        body: {
          content_id: contentId,
          platforms: ALL_PLATFORMS,
        },
      });

      if (error) throw error;

      const adaptedMap: Record<string, PlatformAdapted> = {};
      const texts: Record<string, string> = {};

      for (const item of data.adapted || []) {
        adaptedMap[item.platform] = item;
        texts[item.platform] = item.adapted_text;
      }

      setAdapted(adaptedMap);
      setEditedTexts(texts);
    } catch (err: any) {
      console.error('Failed to adapt content:', err);
      setAdapterError(err.message || 'Failed to generate platform previews');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadAdaptedContent();
  }, [loadAdaptedContent]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const handlePost = async () => {
    if (selectedPlatforms.size === 0) {
      toast({ title: 'No platforms selected', description: 'Please select at least one platform to post to.', variant: 'destructive' });
      return;
    }

    setIsPosting(true);

    // Optimistically set all selected to "posting"
    const statusUpdate: Record<string, PlatformStatus> = {};
    for (const p of selectedPlatforms) {
      statusUpdate[p] = { platform: p, status: 'posting' };
    }
    setPlatformStatuses(statusUpdate);

    try {
      const platforms = Array.from(selectedPlatforms);

      if (scheduledTime) {
        // Schedule: run platform-content-adapter with scheduled_time
        const { error } = await supabase.functions.invoke('platform-content-adapter', {
          body: {
            content_id: contentId,
            platforms,
            scheduled_time: new Date(scheduledTime).toISOString(),
          },
        });

        if (error) throw error;

        const statusResult: Record<string, PlatformStatus> = {};
        for (const p of platforms) {
          statusResult[p] = { platform: p, status: 'posted' };
        }
        setPlatformStatuses(statusResult);

        toast({ title: 'Posts scheduled', description: `Scheduled for ${new Date(scheduledTime).toLocaleString()}` });
      } else {
        // Immediate publish via posting-processor publish_to_all
        const { data, error } = await supabase.functions.invoke('posting-processor', {
          body: {
            action: 'publish_to_all',
            content_id: contentId,
            platforms,
          },
        });

        if (error) throw error;

        const statusResult: Record<string, PlatformStatus> = {};
        for (const detail of data.details || []) {
          statusResult[detail.platform] = {
            platform: detail.platform,
            status: detail.status === 'posted' ? 'posted' : 'failed',
            error: detail.error,
            platform_post_id: detail.platform_post_id,
          };
        }
        setPlatformStatuses(statusResult);

        const postedCount = Object.values(statusResult).filter(s => s.status === 'posted').length;
        const failedCount = Object.values(statusResult).filter(s => s.status === 'failed').length;

        if (postedCount > 0) {
          toast({
            title: `Posted to ${postedCount} platform${postedCount > 1 ? 's' : ''}`,
            description: failedCount > 0 ? `${failedCount} platform(s) failed — check statuses below.` : 'All selected platforms posted successfully.',
          });
        }

        if (postedCount > 0 && onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('Posting error:', err);
      toast({ title: 'Posting failed', description: err.message, variant: 'destructive' });

      const statusResult: Record<string, PlatformStatus> = {};
      for (const p of selectedPlatforms) {
        statusResult[p] = { platform: p, status: 'failed', error: err.message };
      }
      setPlatformStatuses(statusResult);
    } finally {
      setIsPosting(false);
    }
  };

  const getStatusBadge = (platform: string) => {
    const s = platformStatuses[platform];
    if (!s) return null;
    if (s.status === 'posting') return <Badge variant="secondary">Posting...</Badge>;
    if (s.status === 'posted') return <Badge className="bg-green-500 text-white">Posted</Badge>;
    if (s.status === 'failed') return <Badge variant="destructive">Failed</Badge>;
    return null;
  };

  const allDone = selectedPlatforms.size > 0 &&
    Array.from(selectedPlatforms).every(p => platformStatuses[p]?.status === 'posted' || platformStatuses[p]?.status === 'failed');

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Platform selection */}
      <div>
        <p className="text-sm font-medium mb-2">Select platforms to post to:</p>
        <div className="flex flex-wrap gap-3">
          {ALL_PLATFORMS.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const checked = selectedPlatforms.has(platform);
            return (
              <label
                key={platform}
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors ${
                  checked ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => togglePlatform(platform)}
                  disabled={isPosting}
                />
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.icon}</span>
                <span className="text-sm font-medium">{cfg.label}</span>
                {getStatusBadge(platform)}
              </label>
            );
          })}
        </div>
      </div>

      {/* Platform previews */}
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : adapterError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">Could not generate platform previews</p>
            <p className="text-xs mt-1">{adapterError}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={loadAdaptedContent}>Retry</Button>
          </div>
        ) : (
          ALL_PLATFORMS.filter(p => selectedPlatforms.has(p)).map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const text = editedTexts[platform] || '';
            const status = platformStatuses[platform];
            const charCount = text.length;
            const overLimit = charCount > cfg.limit;

            return (
              <div
                key={platform}
                className={`rounded-lg border p-3 space-y-2 transition-colors ${
                  status?.status === 'posted' ? 'border-green-300 bg-green-50' :
                  status?.status === 'failed' ? 'border-red-300 bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.icon}</span>
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(platform)}
                    <span className={`text-xs ${overLimit ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                      {charCount}/{cfg.limit}
                    </span>
                  </div>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setEditedTexts(prev => ({ ...prev, [platform]: e.target.value }))}
                  disabled={isPosting || status?.status === 'posted'}
                  rows={platform === 'linkedin' ? 5 : 3}
                  className={`text-sm resize-none ${overLimit ? 'border-red-400' : ''}`}
                  placeholder={`Content for ${cfg.label}...`}
                />
                {adapted[platform]?.hashtags?.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate">
                    {adapted[platform].hashtags.slice(0, 5).join(' ')}
                    {adapted[platform].hashtags.length > 5 && ` +${adapted[platform].hashtags.length - 5} more`}
                  </p>
                )}
                {status?.status === 'failed' && status.error && (
                  <p className="text-xs text-red-600">{status.error}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Schedule options */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label htmlFor="schedule-time" className="text-sm">
            Schedule (optional — leave blank to post now)
          </Label>
          <Input
            id="schedule-time"
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={isPosting}
            className="mt-1"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button variant="outline" onClick={onClose} disabled={isPosting}>
          {allDone ? 'Close' : 'Cancel'}
        </Button>
        <Button
          onClick={handlePost}
          disabled={isPosting || selectedPlatforms.size === 0 || loading || allDone}
          className="min-w-48"
        >
          {isPosting
            ? 'Posting...'
            : scheduledTime
            ? `Schedule to ${selectedPlatforms.size} Platform${selectedPlatforms.size > 1 ? 's' : ''}`
            : `Post to ${selectedPlatforms.size} Platform${selectedPlatforms.size > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
