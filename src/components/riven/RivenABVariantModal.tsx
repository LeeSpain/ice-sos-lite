import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Zap, FlaskConical, Trophy
} from 'lucide-react';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ABVariantSourceAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  title?: string;
  content?: string;
}

interface ABVariant {
  id: string;
  campaign_id: string;
  original_asset_id: string;
  variant_asset_id?: string;
  variant_label: string;
  hypothesis: string;
  status: string;
  winner_asset_id?: string;
  impressions_a: number;
  impressions_b: number;
  clicks_a: number;
  clicks_b: number;
  conversions_a: number;
  conversions_b: number;
  started_at?: string;
  created_at: string;
}

interface RivenABVariantModalProps {
  asset: ABVariantSourceAsset | null;
  open: boolean;
  onClose: () => void;
  onVariantCreated?: () => void;
}

// ─── Variant difference options ───────────────────────────────────────────────

const VARIANT_STRATEGIES = [
  {
    id: 'hook_change',
    label: 'Different Hook',
    description: 'Same message, completely different opening line/hook',
  },
  {
    id: 'tone_shift',
    label: 'Tone Shift',
    description: 'More urgent / more relaxed / more emotional',
  },
  {
    id: 'cta_change',
    label: 'Different CTA',
    description: 'Alternative call-to-action phrasing or placement',
  },
  {
    id: 'length_change',
    label: 'Shorter / Longer',
    description: 'Condensed or expanded version of the content',
  },
  {
    id: 'angle_change',
    label: 'Different Angle',
    description: 'Same product/feature, approached from a different benefit angle',
  },
  {
    id: 'social_proof',
    label: 'Add Social Proof',
    description: 'Rewrite to lead with a stat, testimonial concept, or trust signal',
  },
  {
    id: 'question_format',
    label: 'Question Format',
    description: 'Lead with a question that makes the reader self-identify',
  },
  {
    id: 'story_format',
    label: 'Story Format',
    description: 'Tell it as a micro-story or scenario',
  },
];

const BRAND_CONTEXT = `
You are Riven, the AI content engine for ICE SOS Lite — a family emergency safety platform.
Brand voice: professional, empathetic, trustworthy, reassuring, clear. Never alarmist. Always human.
`.trim();

// ─── Component ────────────────────────────────────────────────────────────────

const RivenABVariantModal: React.FC<RivenABVariantModalProps> = ({
  asset, open, onClose, onVariantCreated
}) => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingVariants, setExistingVariants] = useState<ABVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  useEffect(() => {
    if (asset && open) loadExistingVariants();
  }, [asset, open]);

  const loadExistingVariants = async () => {
    if (!asset) return;
    setVariantsLoading(true);
    const { data } = await db
      .from('riven_ab_variants')
      .select('*')
      .eq('original_asset_id', asset.id)
      .order('created_at', { ascending: false });
    if (data) setExistingVariants(data as ABVariant[]);
    setVariantsLoading(false);
  };

  const handleCreate = async () => {
    if (!asset || !strategy) return;
    setLoading(true);
    try {
      const chosen = VARIANT_STRATEGIES.find(s => s.id === strategy);
      const hyp = hypothesis || chosen?.description || strategy;

      // 1. Create the variant record (without variant_asset_id yet)
      const { data: variant, error: varErr } = await db.from('riven_ab_variants').insert({
        campaign_id:       asset.campaign_id,
        original_asset_id: asset.id,
        variant_label:     String.fromCharCode(65 + existingVariants.length + 1), // B, C, D...
        hypothesis:        hyp,
        status:            'draft',
      }).select().single();

      if (varErr) throw varErr;

      toast({
        title: 'A/B variant generating...',
        description: 'Claude is creating the variant content. Check back in a moment.',
      });

      // 2. Trigger generation via edge function
      supabase.functions.invoke('riven-ab-generator', {
        body: {
          variant_id:      variant.id,
          asset_id:        asset.id,
          strategy_id:     strategy,
          strategy_label:  chosen?.label,
          hypothesis:      hyp,
          original_content: asset.content,
          asset_type:      asset.asset_type,
        },
      }).catch(() => {/* Not deployed yet — variant saved, will generate on deploy */});

      onVariantCreated?.();
      onClose();
      setStrategy('');
      setHypothesis('');

    } catch (err: any) {
      toast({
        title: 'Failed to create variant',
        description: err?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const ctrA = (v: ABVariant) => v.impressions_a > 0 ? ((v.clicks_a / v.impressions_a) * 100).toFixed(1) : '-';
  const ctrB = (v: ABVariant) => v.impressions_b > 0 ? ((v.clicks_b / v.impressions_b) * 100).toFixed(1) : '-';

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-violet-400" />
            A/B Variant
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create an alternative version of{' '}
            <span className="text-gray-200">"{asset.title ?? asset.asset_type}"</span> to test
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Original preview */}
          {asset.content && (
            <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Badge className="bg-blue-900/30 text-blue-300 text-xs px-1.5 py-0">Version A (Original)</Badge>
              </div>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{asset.content}</p>
            </div>
          )}

          {/* Strategy picker */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">What should Version B change?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {VARIANT_STRATEGIES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    strategy === s.id
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  <div className="font-medium mb-0.5">{s.label}</div>
                  <div className="text-gray-600 leading-relaxed">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom hypothesis */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5 font-medium">
              Hypothesis (optional — describe what you expect to perform better)
            </p>
            <textarea
              value={hypothesis}
              onChange={e => setHypothesis(e.target.value)}
              rows={2}
              placeholder="E.g. A more emotional hook will increase click-through for parent audiences..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Existing variants */}
          {existingVariants.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Existing Variants</p>
              <div className="space-y-2">
                {existingVariants.map(v => (
                  <div key={v.id} className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-violet-900/30 text-violet-300 text-xs px-1.5 py-0">
                          Version {v.variant_label}
                        </Badge>
                        <Badge className={`text-xs px-1.5 py-0 ${
                          v.status === 'running' ? 'bg-green-900/30 text-green-300' :
                          v.status === 'completed' ? 'bg-blue-900/30 text-blue-300' :
                          'bg-gray-800 text-gray-500'
                        }`}>
                          {v.status}
                        </Badge>
                        {v.winner_asset_id && (
                          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{v.hypothesis}</p>
                    {(v.impressions_a > 0 || v.impressions_b > 0) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { label: 'A', impressions: v.impressions_a, clicks: v.clicks_a, ctr: ctrA(v) },
                          { label: 'B', impressions: v.impressions_b, clicks: v.clicks_b, ctr: ctrB(v) },
                        ].map(side => (
                          <div key={side.label} className="bg-gray-900 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">Version {side.label}</div>
                            <div className="flex gap-3">
                              <div>
                                <div className="text-xs font-bold text-white">{side.impressions.toLocaleString()}</div>
                                <div className="text-xs text-gray-700">impr.</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{side.ctr}%</div>
                                <div className="text-xs text-gray-700">CTR</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1 text-gray-400">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!strategy || loading}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Zap className="w-3.5 h-3.5 mr-1" />
            )}
            Generate Version B
          </Button>
        </div>

        {/* Phase 6 note */}
        <p className="text-xs text-gray-700 text-center mt-2">
          Automated performance tracking activates in Phase 6 — Performance Learning.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default RivenABVariantModal;
