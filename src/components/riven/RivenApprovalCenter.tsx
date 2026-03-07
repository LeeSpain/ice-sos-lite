import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2, XCircle, RefreshCw, Eye,
  Video, Share2, Mail, FileText, Megaphone, Image, Captions, Scissors,
  Loader2, LayoutGrid, Globe, Clock, Send, Zap, FlaskConical
} from 'lucide-react';
import RivenRepurposeModal, { type RepurposeSourceAsset } from './RivenRepurposeModal';
import RivenABVariantModal, { type ABVariantSourceAsset } from './RivenABVariantModal';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RivenAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  platform?: string;
  title?: string;
  content?: string;
  media_url?: string;
  version: number;
  status: 'generating' | 'ready' | 'approved' | 'rejected' | 'published' | 'archived';
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

interface RivenApprovalCenterProps {
  campaignId: string;
  campaignTitle: string;
  onAllApproved?: () => void;
  onGoToPublishing?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const assetTypeIcon: Record<string, React.ElementType> = {
  video:       Video,
  social_post: Share2,
  email:       Mail,
  blog:        FileText,
  ad:          Megaphone,
  thumbnail:   Image,
  subtitle:    Captions,
  short_clip:  Scissors,
  script:      FileText,
  storyboard:  LayoutGrid,
};

const assetTypeColor: Record<string, string> = {
  video:       'text-purple-400 bg-purple-900/20 border-purple-800/40',
  social_post: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  email:       'text-green-400 bg-green-900/20 border-green-800/40',
  blog:        'text-orange-400 bg-orange-900/20 border-orange-800/40',
  ad:          'text-red-400 bg-red-900/20 border-red-800/40',
  thumbnail:   'text-pink-400 bg-pink-900/20 border-pink-800/40',
  subtitle:    'text-cyan-400 bg-cyan-900/20 border-cyan-800/40',
  short_clip:  'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',
  default:     'text-gray-400 bg-gray-900/20 border-gray-800/40',
};

const statusBadge: Record<RivenAsset['status'], string> = {
  generating: 'bg-yellow-900/30 text-yellow-300 border-yellow-800/40',
  ready:      'bg-blue-900/30 text-blue-300 border-blue-800/40',
  approved:   'bg-green-900/30 text-green-300 border-green-800/40',
  rejected:   'bg-red-900/30 text-red-300 border-red-800/40',
  published:  'bg-violet-900/30 text-violet-300 border-violet-800/40',
  archived:   'bg-gray-900/30 text-gray-500',
};

// ─── Preview modal ────────────────────────────────────────────────────────────

const PreviewModal: React.FC<{
  asset: RivenAsset | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
  onRegenerate: (id: string) => void;
}> = ({ asset, open, onClose, onApprove, onReject, onRegenerate }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (asset) setNotes(asset.approval_notes || '');
  }, [asset]);

  if (!asset) return null;

  const Icon = assetTypeIcon[asset.asset_type] ?? FileText;
  const colorClass = assetTypeColor[asset.asset_type] ?? assetTypeColor.default;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
            {asset.title || `${asset.asset_type.replace(/_/g, ' ')} — v${asset.version}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={`border ${colorClass}`}>{asset.asset_type.replace(/_/g, ' ')}</Badge>
            {asset.platform && (
              <Badge variant="outline" className="border-gray-700 text-gray-400">
                <Globe className="w-3 h-3 mr-1" />
                {asset.platform.replace(/_/g, ' ')}
              </Badge>
            )}
            <Badge className={`border ${statusBadge[asset.status]}`}>{asset.status}</Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-500">v{asset.version}</Badge>
          </div>

          {/* Content */}
          {asset.content && (
            <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {asset.content}
              </pre>
            </div>
          )}

          {/* Media */}
          {asset.media_url && (
            <div className="rounded-xl overflow-hidden border border-gray-800">
              {asset.asset_type === 'video' || asset.asset_type === 'short_clip' ? (
                <video src={asset.media_url} controls className="w-full" />
              ) : (
                <img src={asset.media_url} alt={asset.title} className="w-full object-cover" />
              )}
            </div>
          )}

          {/* Approval notes */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add feedback or approval notes..."
              className="bg-gray-950 border-gray-700 text-gray-300 placeholder:text-gray-600 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-wrap mt-4">
          <Button
            variant="outline"
            onClick={() => onRegenerate(asset.id)}
            className="border-gray-700 text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="destructive"
            onClick={() => { onReject(asset.id, notes); onClose(); }}
            className="bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={() => { onApprove(asset.id, notes); onClose(); }}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Asset card ───────────────────────────────────────────────────────────────

const AssetCard: React.FC<{
  asset: RivenAsset;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview: (asset: RivenAsset) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRepurpose: (asset: RivenAsset) => void;
  onAbVariant: (asset: RivenAsset) => void;
}> = ({ asset, selected, onSelect, onPreview, onApprove, onReject, onRepurpose, onAbVariant }) => {
  const Icon = assetTypeIcon[asset.asset_type] ?? FileText;
  const colorClass = assetTypeColor[asset.asset_type] ?? assetTypeColor.default;
  const canAct = asset.status === 'ready' || asset.status === 'generating';

  return (
    <div
      className={`
        relative rounded-xl border p-4 transition-all
        ${selected ? 'ring-2 ring-violet-500 border-violet-600' : 'border-gray-800/60'}
        ${asset.status === 'approved' ? 'bg-green-950/10' : asset.status === 'rejected' ? 'bg-red-950/10' : 'bg-gray-900/40'}
      `}
    >
      {/* Select checkbox */}
      {canAct && (
        <button
          onClick={() => onSelect(asset.id)}
          className="absolute top-3 left-3 w-4 h-4 rounded border border-gray-700 flex items-center justify-center bg-gray-900 hover:border-violet-500 transition-colors"
        >
          {selected && <CheckCircle2 className="w-3 h-3 text-violet-400" />}
        </button>
      )}

      <div className={`pl-${canAct ? '5' : '0'}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
            <span className="text-xs font-medium text-gray-400">
              {asset.asset_type.replace(/_/g, ' ')}
              {asset.platform && ` · ${asset.platform.replace(/_/g, ' ')}`}
            </span>
          </div>
          <Badge className={`text-xs border ${statusBadge[asset.status]}`}>{asset.status}</Badge>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-white mb-2 line-clamp-1">
          {asset.title || `${asset.asset_type.replace(/_/g, ' ')} v${asset.version}`}
        </p>

        {/* Content preview */}
        {asset.content && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{asset.content}</p>
        )}

        {/* Thumbnail preview */}
        {asset.media_url && asset.asset_type === 'thumbnail' && (
          <div className="rounded-lg overflow-hidden mb-3 bg-gray-950 border border-gray-800">
            <img src={asset.media_url} alt={asset.title} className="w-full h-20 object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(asset)}
            className="text-gray-400 hover:text-white h-7 px-2 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview
          </Button>

          {canAct && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(asset.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2 text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(asset.id)}
                className="bg-green-700 hover:bg-green-600 text-white h-7 px-2 text-xs ml-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
            </>
          )}

          {asset.status === 'approved' && (
            <>
              <span className="flex items-center gap-1 text-xs text-green-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
              <div className="flex gap-1 ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAbVariant(asset)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-7 px-2 text-xs"
                  title="Create A/B variant"
                >
                  <FlaskConical className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRepurpose(asset)}
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/20 h-7 px-2 text-xs"
                  title="Repurpose content"
                >
                  <Zap className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
          {asset.status === 'rejected' && (
            <span className="flex items-center gap-1 text-xs text-red-400 ml-auto">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RivenApprovalCenter: React.FC<RivenApprovalCenterProps> = ({
  campaignId, campaignTitle, onAllApproved, onGoToPublishing
}) => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<RivenAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [previewAsset, setPreviewAsset] = useState<RivenAsset | null>(null);
  const [repurposeAsset, setRepurposeAsset] = useState<RepurposeSourceAsset | null>(null);
  const [abAsset, setAbAsset] = useState<ABVariantSourceAsset | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadAssets = async () => {
    const { data } = await db
      .from('riven_assets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });
    if (data) setAssets(data as RivenAsset[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAssets();

    const channel = supabase
      .channel(`riven-assets-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riven_assets', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAssets(prev => [...prev, payload.new as RivenAsset]);
          } else if (payload.eventType === 'UPDATE') {
            setAssets(prev => prev.map(a => a.id === payload.new.id ? payload.new as RivenAsset : a));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const updateAssetStatus = async (
    id: string,
    status: RivenAsset['status'],
    notes = ''
  ) => {
    const { error } = await db
      .from('riven_assets')
      .update({ status, approval_notes: notes, approved_at: status === 'approved' ? new Date().toISOString() : null })
      .eq('id', id);
    if (!error) {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, status, approval_notes: notes } : a));
    }
    return error;
  };

  const handleApprove = async (id: string, notes = '') => {
    setProcessing(true);
    const err = await updateAssetStatus(id, 'approved', notes);
    if (!err) {
      toast({ title: 'Asset approved', description: 'Ready for publishing.' });
      checkAllApproved();
    }
    setProcessing(false);
  };

  const handleReject = async (id: string, notes = '') => {
    setProcessing(true);
    await updateAssetStatus(id, 'rejected', notes);
    toast({ title: 'Asset rejected', variant: 'destructive' });
    setProcessing(false);
  };

  const handleRegenerate = async (id: string) => {
    await db.from('riven_assets').update({ status: 'generating', version: assets.find(a => a.id === id)!.version + 1 }).eq('id', id);
    toast({ title: 'Regenerating asset...', description: 'This may take a moment.' });
    setPreviewAsset(null);
  };

  const checkAllApproved = () => {
    const actionable = assets.filter(a => a.status !== 'generating' && a.status !== 'archived');
    const allApproved = actionable.every(a => a.status === 'approved');
    if (allApproved && onAllApproved) onAllApproved();
  };

  const handleBulkApprove = async () => {
    setProcessing(true);
    await Promise.all(selectedIds.map(id => updateAssetStatus(id, 'approved')));
    toast({ title: `${selectedIds.length} assets approved` });
    setSelectedIds([]);
    checkAllApproved();
    setProcessing(false);
  };

  const handleBulkReject = async () => {
    setProcessing(true);
    await Promise.all(selectedIds.map(id => updateAssetStatus(id, 'rejected')));
    toast({ title: `${selectedIds.length} assets rejected`, variant: 'destructive' });
    setSelectedIds([]);
    setProcessing(false);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Asset type tabs
  const types = ['all', ...Array.from(new Set(assets.map(a => a.asset_type)))];
  const statuses = ['all', 'ready', 'approved', 'rejected', 'generating'];

  const filtered = assets.filter(a => {
    if (filterType !== 'all' && a.asset_type !== filterType) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const selectAll = () =>
    setSelectedIds(filtered.filter(a => a.status === 'ready').map(a => a.id));

  const stats = {
    total: assets.length,
    ready: assets.filter(a => a.status === 'ready').length,
    approved: assets.filter(a => a.status === 'approved').length,
    rejected: assets.filter(a => a.status === 'rejected').length,
    generating: assets.filter(a => a.status === 'generating').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Approval Center</h2>
          <p className="text-gray-400 text-sm">{campaignTitle}</p>
        </div>
        {stats.approved > 0 && onGoToPublishing && (
          <Button
            size="sm"
            onClick={onGoToPublishing}
            className="bg-violet-600 hover:bg-violet-500 text-white h-8 text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Schedule {stats.approved} for Publishing
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Awaiting', value: stats.ready, color: 'text-blue-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + bulk actions */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                filterType === t
                  ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {t === 'all' ? 'All types' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                filterStatus === s
                  ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {stats.ready > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={selectAll}
              className="text-gray-400 hover:text-white text-xs h-7"
            >
              Select all awaiting ({stats.ready})
            </Button>
          )}

          {selectedIds.length > 0 && (
            <>
              <Button
                size="sm"
                disabled={processing}
                onClick={handleBulkApprove}
                className="bg-green-700 hover:bg-green-600 text-white h-7 text-xs"
              >
                {processing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                Approve {selectedIds.length}
              </Button>
              <Button
                size="sm"
                disabled={processing}
                onClick={handleBulkReject}
                className="bg-red-900/40 border border-red-800 text-red-300 hover:bg-red-900/70 h-7 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject {selectedIds.length}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No assets match the current filters.</p>
          {stats.generating > 0 && (
            <p className="text-sm mt-2 text-violet-400">
              {stats.generating} asset{stats.generating > 1 ? 's are' : ' is'} still generating...
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedIds.includes(asset.id)}
              onSelect={toggleSelect}
              onPreview={setPreviewAsset}
              onApprove={id => handleApprove(id)}
              onReject={id => handleReject(id)}
              onRepurpose={a => setRepurposeAsset({ id: a.id, campaign_id: a.campaign_id, asset_type: a.asset_type, title: a.title, content: a.content })}
              onAbVariant={a => setAbAsset({ id: a.id, campaign_id: a.campaign_id, asset_type: a.asset_type, title: a.title, content: a.content })}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      <PreviewModal
        asset={previewAsset}
        open={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRegenerate={handleRegenerate}
      />

      {/* Repurpose modal */}
      <RivenRepurposeModal
        asset={repurposeAsset}
        open={!!repurposeAsset}
        onClose={() => setRepurposeAsset(null)}
        onJobCreated={() => {
          toast({ title: 'Repurpose job started', description: 'New asset will appear in the Content Library shortly.' });
        }}
      />

      {/* A/B Variant modal */}
      <RivenABVariantModal
        asset={abAsset}
        open={!!abAsset}
        onClose={() => setAbAsset(null)}
        onVariantCreated={() => {
          toast({ title: 'A/B variant generating', description: 'Version B will be ready in a moment.' });
          loadAssets();
        }}
      />
    </div>
  );
};

export default RivenApprovalCenter;
