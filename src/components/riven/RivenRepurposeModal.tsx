import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight, Loader2, Scissors, Mail, Share2, FileText,
  Video, Zap, RefreshCw, Layers
} from 'lucide-react';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RepurposeSourceAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  title?: string;
  content?: string;
}

interface RivenRepurposeModalProps {
  asset: RepurposeSourceAsset | null;
  open: boolean;
  onClose: () => void;
  onJobCreated?: (jobId: string) => void;
}

// ─── Repurpose type definitions ────────────────────────────────────────────────

interface RepurposeType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  sourceTypes: string[];   // asset_types this works on
  targetAssetType: string;
  platformNeeded?: boolean;
  formatNeeded?: boolean;
}

const REPURPOSE_TYPES: RepurposeType[] = [
  {
    id: 'long_to_short',
    label: 'Condense to Short Post',
    description: 'Shrink long content into a punchy 280-char social post',
    icon: Scissors,
    iconColor: 'text-violet-400',
    sourceTypes: ['blog', 'email', 'social_post', 'script'],
    targetAssetType: 'social_post',
    platformNeeded: true,
  },
  {
    id: 'video_to_post',
    label: 'Video → Social Post',
    description: 'Turn a video script into a social caption with hashtags',
    icon: Share2,
    iconColor: 'text-blue-400',
    sourceTypes: ['script', 'video', 'short_clip'],
    targetAssetType: 'social_post',
    platformNeeded: true,
  },
  {
    id: 'blog_to_social',
    label: 'Blog → Social Post',
    description: 'Extract the key insight and make it shareable',
    icon: Share2,
    iconColor: 'text-blue-400',
    sourceTypes: ['blog'],
    targetAssetType: 'social_post',
    platformNeeded: true,
  },
  {
    id: 'email_to_post',
    label: 'Email → Social Post',
    description: 'Pull the best line from an email and make it social',
    icon: Share2,
    iconColor: 'text-cyan-400',
    sourceTypes: ['email'],
    targetAssetType: 'social_post',
    platformNeeded: true,
  },
  {
    id: 'post_to_thread',
    label: 'Expand to Thread',
    description: 'Turn a single post into a 5-8 tweet/X thread',
    icon: Layers,
    iconColor: 'text-sky-400',
    sourceTypes: ['social_post'],
    targetAssetType: 'social_post',
  },
  {
    id: 'long_to_reel',
    label: 'Content → Short Reel Script',
    description: 'Distil long content into a 30-60s vertical video script',
    icon: Video,
    iconColor: 'text-purple-400',
    sourceTypes: ['blog', 'email', 'social_post'],
    targetAssetType: 'short_clip',
    formatNeeded: true,
  },
  {
    id: 'blog_to_email',
    label: 'Blog → Email',
    description: 'Transform a blog article into a nurture email',
    icon: Mail,
    iconColor: 'text-green-400',
    sourceTypes: ['blog'],
    targetAssetType: 'email',
  },
  {
    id: 'ad_to_organic',
    label: 'Ad Copy → Organic Post',
    description: 'Convert promotional ad copy into authentic organic content',
    icon: RefreshCw,
    iconColor: 'text-orange-400',
    sourceTypes: ['ad'],
    targetAssetType: 'social_post',
    platformNeeded: true,
  },
];

const PLATFORMS = [
  'instagram', 'instagram_reels', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube',
];

// ─── Component ────────────────────────────────────────────────────────────────

const RivenRepurposeModal: React.FC<RivenRepurposeModalProps> = ({
  asset, open, onClose, onJobCreated
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [format, setFormat] = useState<string>('9:16');
  const [instructions, setInstructions] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!asset) return null;

  // Filter to types that work with this asset type
  const compatible = REPURPOSE_TYPES.filter(rt =>
    rt.sourceTypes.includes(asset.asset_type)
  );

  const chosen = REPURPOSE_TYPES.find(rt => rt.id === selectedType);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      // Create job record
      const { data: job, error } = await db.from('riven_repurpose_jobs').insert({
        campaign_id:     asset.campaign_id,
        source_asset_id: asset.id,
        repurpose_type:  selectedType,
        target_platform: platform || null,
        target_format:   format || null,
        instructions:    instructions || null,
        status:          'queued',
      }).select().single();

      if (error) throw error;

      toast({
        title: 'Repurpose job queued',
        description: `"${chosen?.label}" is generating. Check the content library in a moment.`,
      });

      // Fire edge function (async, don't block)
      supabase.functions.invoke('riven-repurpose', {
        body: { job_id: job.id },
      }).catch(() => {/* Edge function may not be deployed yet */});

      onJobCreated?.(job.id);
      onClose();
      setSelectedType('');
      setPlatform('');
      setInstructions('');

    } catch (err: any) {
      toast({
        title: 'Failed to create repurpose job',
        description: err?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            Repurpose Content
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Transform <span className="text-gray-200">"{asset.title ?? asset.asset_type}"</span> into a new format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Source preview */}
          {asset.content && (
            <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Source</p>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{asset.content}</p>
            </div>
          )}

          {/* Repurpose type grid */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">What would you like to create?</p>
            {compatible.length === 0 ? (
              <p className="text-sm text-gray-600 italic">
                No repurpose options available for {asset.asset_type.replace(/_/g, ' ')} assets yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {compatible.map(rt => {
                  const Icon = rt.icon;
                  const selected = selectedType === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setSelectedType(rt.id)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        selected
                          ? 'bg-violet-600/20 border-violet-500'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${rt.iconColor}`} />
                        <span className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>
                          {rt.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rt.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conditional fields */}
          {chosen?.platformNeeded && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Target platform</p>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-all ${
                      platform === p
                        ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {p.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chosen?.formatNeeded && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Video format</p>
              <div className="flex gap-2">
                {['9:16', '16:9', '1:1'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      format === f
                        ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional instructions */}
          {selectedType && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Additional instructions (optional)</p>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={2}
                placeholder="E.g. Focus on the safety aspect, keep it under 200 chars, use informal tone..."
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-violet-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1 text-gray-400">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedType || loading}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 mr-1" />
            )}
            {loading ? 'Creating...' : 'Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RivenRepurposeModal;
