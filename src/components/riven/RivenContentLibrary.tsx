import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Search, Video, Share2, Mail, FileText, Megaphone, Image,
  CheckCircle2, Clock, AlertCircle, Zap, Eye, Send,
  Filter, RefreshCw, Loader2, Library, Download, Globe
} from 'lucide-react';
import RivenRepurposeModal, { type RepurposeSourceAsset } from './RivenRepurposeModal';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RivenCampaign {
  id: string;
  title: string;
  topic?: string;
  output_types: string[];
  channels: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface RivenAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  platform?: string;
  title?: string;
  content?: string;
  media_url?: string;
  version: number;
  status: string;
  created_at: string;
}

interface LibraryItem {
  type: 'campaign' | 'asset';
  id: string;
  campaignId: string;
  title: string;
  subtype: string;
  platform?: string;
  status: string;
  content?: string;
  mediaUrl?: string;
  version?: number;
  createdAt: string;
}

interface RivenContentLibraryProps {
  onOpenApproval: (id: string, title: string) => void;
  onOpenPipeline: (id: string, title: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeIcon: Record<string, React.ElementType> = {
  video:       Video,
  social_post: Share2,
  email:       Mail,
  blog:        FileText,
  ad:          Megaphone,
  thumbnail:   Image,
  subtitle:    FileText,
  short_clip:  Video,
  campaign:    Library,
};

const typeColor: Record<string, string> = {
  video:       'text-purple-400',
  social_post: 'text-blue-400',
  email:       'text-green-400',
  blog:        'text-orange-400',
  ad:          'text-red-400',
  thumbnail:   'text-pink-400',
  short_clip:  'text-yellow-400',
  campaign:    'text-violet-400',
};

const statusBadge: Record<string, string> = {
  generating:      'bg-yellow-900/30 text-yellow-300',
  draft:           'bg-gray-800 text-gray-500',
  ready:           'bg-blue-900/30 text-blue-300',
  approved:        'bg-green-900/30 text-green-300',
  rejected:        'bg-red-900/30 text-red-300',
  published:       'bg-emerald-900/30 text-emerald-300',
  approval_needed: 'bg-yellow-900/30 text-yellow-300',
  generating_camp: 'bg-violet-900/30 text-violet-300',
  complete:        'bg-green-900/30 text-green-300',
  failed:          'bg-red-900/30 text-red-300',
};

function timeAgo(str: string) {
  const m = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Library card ─────────────────────────────────────────────────────────────

const LibraryCard: React.FC<{
  item: LibraryItem;
  onAction: (item: LibraryItem) => void;
  onRepurpose?: (item: LibraryItem) => void;
}> = ({ item, onAction, onRepurpose }) => {
  const Icon = typeIcon[item.subtype] ?? FileText;
  const color = typeColor[item.subtype] ?? 'text-gray-400';
  const normalizedStatus = item.status === 'generating' && item.type === 'campaign'
    ? 'generating_camp' : item.status;
  const badge = statusBadge[normalizedStatus] ?? 'bg-gray-800 text-gray-500';

  const actionLabel = () => {
    if (item.type === 'campaign') {
      if (item.status === 'approval_needed') return 'Review';
      if (item.status === 'generating') return 'Pipeline';
    }
    if (item.status === 'approved') return 'Publish';
    if (item.status === 'ready') return 'Approve';
    return null;
  };

  const label = actionLabel();

  return (
    <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-4 hover:border-gray-700 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className="text-xs text-gray-500 capitalize">
            {item.subtype.replace(/_/g, ' ')}
            {item.platform && ` · ${item.platform.replace(/_/g, ' ')}`}
          </span>
          {item.version && item.version > 1 && (
            <span className="text-xs text-gray-700">v{item.version}</span>
          )}
        </div>
        <Badge className={`text-xs px-1.5 py-0 ${badge}`}>{item.status.replace(/_/g, ' ')}</Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-white mb-1.5 line-clamp-1 group-hover:text-violet-200 transition-colors">
        {item.title}
      </p>

      {/* Content preview */}
      {item.content && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">{item.content}</p>
      )}

      {/* Media thumb */}
      {item.mediaUrl && (item.subtype === 'thumbnail' || item.subtype === 'video') && (
        <div className="rounded-lg overflow-hidden bg-gray-950 border border-gray-800 mb-3">
          {item.subtype === 'thumbnail'
            ? <img src={item.mediaUrl} alt="" className="w-full h-16 object-cover" />
            : (
              <div className="w-full h-16 flex items-center justify-center bg-gray-900">
                <Video className="w-6 h-6 text-gray-700" />
              </div>
            )
          }
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto gap-1">
        <span className="text-xs text-gray-700">{timeAgo(item.createdAt)}</span>
        <div className="flex items-center gap-1">
          {/* Repurpose button — only for asset types with content */}
          {item.type === 'asset' && item.content && onRepurpose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRepurpose(item)}
              className="h-6 text-xs text-violet-500 hover:text-violet-300 hover:bg-violet-900/20 px-1.5"
              title="Repurpose this asset"
            >
              <Zap className="w-3 h-3" />
            </Button>
          )}
          {label && (
            <Button
              size="sm"
              onClick={() => onAction(item)}
              className={`h-6 text-xs ${
                label === 'Review' || label === 'Approve'
                  ? 'bg-yellow-600/30 border border-yellow-700 text-yellow-300 hover:bg-yellow-600/50'
                  : label === 'Pipeline'
                  ? 'bg-violet-600/30 border border-violet-700 text-violet-300 hover:bg-violet-600/50'
                  : 'bg-green-700/30 border border-green-700 text-green-300 hover:bg-green-700/50'
              }`}
            >
              {label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RivenContentLibrary: React.FC<RivenContentLibraryProps> = ({ onOpenApproval, onOpenPipeline }) => {
  const [campaigns, setCampaigns] = useState<RivenCampaign[]>([]);
  const [assets, setAssets] = useState<RivenAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [repurposeAsset, setRepurposeAsset] = useState<RepurposeSourceAsset | null>(null);

  const load = async () => {
    const [{ data: camps }, { data: assts }] = await Promise.all([
      db.from('riven_campaigns').select('*').order('created_at', { ascending: false }).limit(100),
      db.from('riven_assets').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    if (camps) setCampaigns(camps as RivenCampaign[]);
    if (assts) setAssets(assts as RivenAsset[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Build unified library items
  const allItems: LibraryItem[] = useMemo(() => {
    const campaignItems: LibraryItem[] = campaigns.map(c => ({
      type: 'campaign',
      id: c.id,
      campaignId: c.id,
      title: c.title,
      subtype: 'campaign',
      status: c.status,
      content: c.topic,
      createdAt: c.created_at,
    }));

    const assetItems: LibraryItem[] = assets.map(a => {
      const camp = campaigns.find(c => c.id === a.campaign_id);
      return {
        type: 'asset',
        id: a.id,
        campaignId: a.campaign_id,
        title: a.title || `${a.asset_type.replace(/_/g, ' ')}${camp ? ` — ${camp.title}` : ''}`,
        subtype: a.asset_type,
        platform: a.platform,
        status: a.status,
        content: a.content,
        mediaUrl: a.media_url,
        version: a.version,
        createdAt: a.created_at,
      };
    });

    return [...campaignItems, ...assetItems];
  }, [campaigns, assets]);

  // Filter
  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (typeFilter !== 'all' && item.subtype !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !(item.content ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allItems, typeFilter, statusFilter, search]);

  const handleAction = (item: LibraryItem) => {
    const campTitle = item.type === 'campaign'
      ? item.title
      : campaigns.find(c => c.id === item.campaignId)?.title ?? 'Campaign';

    if (item.status === 'approval_needed' || item.status === 'ready' || item.status === 'approved') {
      onOpenApproval(item.campaignId, campTitle);
    } else if (item.status === 'generating') {
      onOpenPipeline(item.campaignId, campTitle);
    }
  };

  // Available filter options
  const types = ['all', 'campaign', ...Array.from(new Set(assets.map(a => a.asset_type)))];
  const statuses = ['all', ...Array.from(new Set(allItems.map(i => i.status)))];

  const stats = {
    total: allItems.length,
    campaigns: campaigns.length,
    assets: assets.length,
    approved: assets.filter(a => a.status === 'approved').length,
    published: assets.filter(a => a.status === 'published').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Content Library</h2>
          </div>
          <p className="text-gray-400 text-sm">All campaigns, assets, scripts, and generated content</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-gray-500 hover:text-gray-300 h-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Campaigns', value: stats.campaigns, color: 'text-violet-400' },
          { label: 'Assets', value: stats.assets, color: 'text-blue-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
          { label: 'Published', value: stats.published, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search campaigns and assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                typeFilter === t
                  ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {t === 'all' ? 'All types' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-1 flex-wrap">
          {statuses.slice(0, 6).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                statusFilter === s
                  ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-gray-600 mb-4">
          Showing {filtered.length} of {allItems.length} items
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-20">
          <Library className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Library is empty</h3>
          <p className="text-gray-500 text-sm">
            Create your first campaign to start building your content library.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No items match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <LibraryCard
              key={`${item.type}-${item.id}`}
              item={item}
              onAction={handleAction}
              onRepurpose={item.type === 'asset' ? (i) => setRepurposeAsset({
                id: i.id,
                campaign_id: i.campaignId,
                asset_type: i.subtype,
                title: i.title,
                content: i.content,
              }) : undefined}
            />
          ))}
        </div>
      )}

      {/* Repurpose modal */}
      <RivenRepurposeModal
        asset={repurposeAsset}
        open={!!repurposeAsset}
        onClose={() => setRepurposeAsset(null)}
        onJobCreated={() => {
          setTimeout(load, 3000); // Reload library after a moment to pick up new asset
        }}
      />
    </div>
  );
};

export default RivenContentLibrary;
