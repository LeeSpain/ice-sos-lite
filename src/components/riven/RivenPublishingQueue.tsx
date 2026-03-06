import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Youtube, Instagram, Linkedin, Facebook, Twitter,
  Globe, Mail, FileText, Send, Clock, CheckCircle2,
  AlertCircle, X, Plus, RefreshCw, Loader2, Zap,
  ExternalLink, Share2, Calendar, ChevronDown
} from 'lucide-react';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformConnection {
  id: string;
  platform: string;
  display_name: string;
  connected: boolean;
  account_name?: string;
  test_status?: string;
}

interface PublishQueueItem {
  id: string;
  campaign_id: string;
  asset_id: string;
  platform: string;
  caption_override?: string;
  hashtags?: string[];
  scheduled_at?: string;
  published_at?: string;
  status: string;
  platform_url?: string;
  error_message?: string;
  created_at: string;
  // joined
  asset_title?: string;
  asset_type?: string;
  asset_content?: string;
  campaign_title?: string;
}

interface ApprovedAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  platform?: string;
  title?: string;
  content?: string;
  status: string;
  campaign_title?: string;
}

interface RivenPublishingQueueProps {
  onBack: () => void;
}

// ─── Platform metadata ────────────────────────────────────────────────────────

const PLATFORM_META: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  label: string;
  supportedTypes: string[];
}> = {
  youtube:         { icon: Youtube,    color: 'text-red-400',     bg: 'bg-red-950/30',      border: 'border-red-800/50',     label: 'YouTube',          supportedTypes: ['video', 'short_clip'] },
  instagram:       { icon: Instagram,  color: 'text-pink-400',    bg: 'bg-pink-950/30',     border: 'border-pink-800/50',    label: 'Instagram',        supportedTypes: ['social_post', 'thumbnail', 'video'] },
  instagram_reels: { icon: Instagram,  color: 'text-fuchsia-400', bg: 'bg-fuchsia-950/30',  border: 'border-fuchsia-800/50', label: 'Instagram Reels',  supportedTypes: ['short_clip', 'video'] },
  tiktok:          { icon: Share2,     color: 'text-cyan-400',    bg: 'bg-cyan-950/30',     border: 'border-cyan-800/50',   label: 'TikTok',           supportedTypes: ['short_clip', 'video', 'social_post'] },
  linkedin:        { icon: Linkedin,   color: 'text-blue-400',    bg: 'bg-blue-950/30',     border: 'border-blue-800/50',    label: 'LinkedIn',         supportedTypes: ['social_post', 'blog', 'video'] },
  facebook:        { icon: Facebook,   color: 'text-indigo-400',  bg: 'bg-indigo-950/30',   border: 'border-indigo-800/50',  label: 'Facebook',         supportedTypes: ['social_post', 'video', 'ad'] },
  twitter:         { icon: Twitter,    color: 'text-sky-400',     bg: 'bg-sky-950/30',      border: 'border-sky-800/50',     label: 'X / Twitter',      supportedTypes: ['social_post', 'short_clip'] },
  newsletter:      { icon: Mail,       color: 'text-green-400',   bg: 'bg-green-950/30',    border: 'border-green-800/50',   label: 'Newsletter',       supportedTypes: ['email'] },
  blog:            { icon: Globe,      color: 'text-orange-400',  bg: 'bg-orange-950/30',   border: 'border-orange-800/50',  label: 'Blog',             supportedTypes: ['blog', 'email'] },
};

function getPlatformMeta(platform: string) {
  return PLATFORM_META[platform] ?? {
    icon: Globe, color: 'text-gray-400', bg: 'bg-gray-900', border: 'border-gray-800',
    label: platform, supportedTypes: [],
  };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued:     'bg-gray-800 text-gray-400',
    scheduled:  'bg-blue-900/40 text-blue-300',
    publishing: 'bg-yellow-900/40 text-yellow-300',
    published:  'bg-emerald-900/40 text-emerald-300',
    failed:     'bg-red-900/40 text-red-300',
    cancelled:  'bg-gray-800 text-gray-600',
  };
  return (
    <Badge className={`text-xs px-1.5 py-0 ${map[status] ?? 'bg-gray-800 text-gray-500'}`}>
      {status}
    </Badge>
  );
}

function timeAgo(str: string) {
  const m = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Schedule modal ────────────────────────────────────────────────────────────

const ScheduleModal: React.FC<{
  asset: ApprovedAsset | null;
  connections: PlatformConnection[];
  onClose: () => void;
  onScheduled: () => void;
}> = ({ asset, connections, onClose, onScheduled }) => {
  const [platform, setPlatform] = useState('');
  const [caption, setCaption] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saving, setSaving] = useState(false);

  const connectedPlatforms = connections.filter(c => c.connected);
  const allPlatforms = Object.keys(PLATFORM_META);

  // Pre-fill from asset
  useEffect(() => {
    if (asset) {
      setCaption(asset.content?.slice(0, 280) ?? '');
      // Pick best matching platform
      if (asset.platform && allPlatforms.includes(asset.platform)) {
        setPlatform(asset.platform);
      } else if (asset.asset_type === 'email') {
        setPlatform('newsletter');
      } else if (asset.asset_type === 'blog') {
        setPlatform('blog');
      } else if (asset.asset_type === 'social_post') {
        setPlatform('instagram');
      }
    }
  }, [asset]);

  const handleSubmit = async () => {
    if (!platform || !asset) return;
    setSaving(true);
    try {
      let scheduledAt: string | null = null;
      if (scheduleMode === 'later' && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      await db.from('riven_publish_queue').insert({
        campaign_id: asset.campaign_id,
        asset_id: asset.id,
        platform,
        caption_override: caption || null,
        scheduled_at: scheduledAt,
        status: scheduledAt ? 'scheduled' : 'queued',
      });

      onScheduled();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Schedule for Publishing</DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {asset.title ?? asset.asset_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Platform picker */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {allPlatforms.map(p => {
                const meta = getPlatformMeta(p);
                const Icon = meta.icon;
                const isConnected = connectedPlatforms.some(c => c.platform === p);
                const selected = platform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                      selected
                        ? `${meta.bg} ${meta.border} ${meta.color}`
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{meta.label}</span>
                    {!isConnected && (
                      <span className="ml-auto text-gray-700 shrink-0">*</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-700 mt-1.5">* Not connected — will queue for manual publish</p>
          </div>

          {/* Caption override */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Caption (optional override)</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-violet-500"
              placeholder="Leave blank to use generated content..."
            />
          </div>

          {/* Schedule mode */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">When to publish</label>
            <div className="flex gap-2">
              {[
                { val: 'now', label: 'Queue now', icon: Zap },
                { val: 'later', label: 'Schedule', icon: Calendar },
              ].map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => setScheduleMode(val as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs transition-all ${
                    scheduleMode === val
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {scheduleMode === 'later' && (
              <div className="flex gap-2 mt-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-28 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1 text-gray-400">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!platform || saving}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
            {scheduleMode === 'later' ? 'Schedule' : 'Add to Queue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Queue item row ────────────────────────────────────────────────────────────

const QueueRow: React.FC<{
  item: PublishQueueItem;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}> = ({ item, onCancel, onRetry }) => {
  const meta = getPlatformMeta(item.platform);
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
      {/* Platform icon */}
      <div className={`w-8 h-8 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {item.asset_title ?? item.asset_type ?? 'Asset'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-600">{meta.label}</span>
          {item.campaign_title && (
            <>
              <span className="text-gray-800">·</span>
              <span className="text-xs text-gray-600 truncate">{item.campaign_title}</span>
            </>
          )}
          {item.scheduled_at && item.status === 'scheduled' && (
            <>
              <span className="text-gray-800">·</span>
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.scheduled_at).toLocaleString()}
              </span>
            </>
          )}
          {item.published_at && (
            <>
              <span className="text-gray-800">·</span>
              <span className="text-xs text-emerald-400">{timeAgo(item.published_at)}</span>
            </>
          )}
        </div>
        {item.error_message && (
          <p className="text-xs text-red-400 mt-0.5 truncate">{item.error_message}</p>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={item.status} />
        {item.platform_url && (
          <a href={item.platform_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
          </a>
        )}
        {item.status === 'failed' && (
          <button
            onClick={() => onRetry(item.id)}
            className="text-xs text-yellow-400 hover:text-yellow-300 px-1.5"
          >
            Retry
          </button>
        )}
        {['queued', 'scheduled'].includes(item.status) && (
          <button
            onClick={() => onCancel(item.id)}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X className="w-3 h-3 text-gray-600 hover:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Platform connection card ──────────────────────────────────────────────────

const PlatformCard: React.FC<{ conn: PlatformConnection }> = ({ conn }) => {
  const meta = getPlatformMeta(conn.platform);
  const Icon = meta.icon;

  return (
    <div className={`rounded-xl border p-3 ${conn.connected ? `${meta.bg} ${meta.border}` : 'bg-gray-900/40 border-gray-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${conn.connected ? meta.color : 'text-gray-600'}`} />
          <span className={`text-xs font-medium ${conn.connected ? 'text-white' : 'text-gray-500'}`}>
            {conn.display_name}
          </span>
        </div>
        {conn.connected
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          : <div className="w-2 h-2 rounded-full bg-gray-700" />
        }
      </div>
      {conn.connected && conn.account_name && (
        <p className="text-xs text-gray-500 mb-2 truncate">@{conn.account_name}</p>
      )}
      <Button
        size="sm"
        variant="ghost"
        className={`w-full h-6 text-xs ${
          conn.connected
            ? 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
            : 'bg-violet-600/20 border border-violet-700 text-violet-300 hover:bg-violet-600/30'
        }`}
      >
        {conn.connected ? 'Manage' : 'Connect'}
      </Button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RivenPublishingQueue: React.FC<RivenPublishingQueueProps> = ({ onBack }) => {
  const [queue, setQueue] = useState<PublishQueueItem[]>([]);
  const [approvedAssets, setApprovedAssets] = useState<ApprovedAsset[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleTarget, setScheduleTarget] = useState<ApprovedAsset | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showConnections, setShowConnections] = useState(false);

  const load = async () => {
    setLoading(true);

    const [
      { data: queueData },
      { data: assetsData },
      { data: campaigns },
      { data: connData },
    ] = await Promise.all([
      db.from('riven_publish_queue').select('*, riven_assets(title, asset_type, content), riven_campaigns(title)')
        .order('created_at', { ascending: false }).limit(100),
      db.from('riven_assets').select('*, riven_campaigns(title)').eq('status', 'approved').order('created_at', { ascending: false }).limit(100),
      db.from('riven_campaigns').select('id, title'),
      db.from('riven_platform_connections').select('*').order('platform'),
    ]);

    if (queueData) {
      const enriched = (queueData as any[]).map(q => ({
        ...q,
        asset_title:    q.riven_assets?.title,
        asset_type:     q.riven_assets?.asset_type,
        asset_content:  q.riven_assets?.content,
        campaign_title: q.riven_campaigns?.title,
      }));
      setQueue(enriched);
    }

    if (assetsData && campaigns) {
      const campMap: Record<string, string> = {};
      (campaigns as any[]).forEach((c: any) => { campMap[c.id] = c.title; });
      const enriched = (assetsData as any[]).map(a => ({
        ...a,
        campaign_title: a.riven_campaigns?.title ?? campMap[a.campaign_id],
      }));
      setApprovedAssets(enriched);
    }

    if (connData) setConnections(connData as PlatformConnection[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('riven-publish-queue-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riven_publish_queue' }, () => {
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCancel = async (id: string) => {
    await db.from('riven_publish_queue').update({ status: 'cancelled' }).eq('id', id);
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'cancelled' } : q));
  };

  const handleRetry = async (id: string) => {
    await db.from('riven_publish_queue').update({ status: 'queued', error_message: null, retry_count: db.raw('retry_count + 1') }).eq('id', id);
    load();
  };

  const filtered = useMemo(() =>
    statusFilter === 'all' ? queue : queue.filter(q => q.status === statusFilter),
    [queue, statusFilter]
  );

  const stats = {
    total:      queue.length,
    queued:     queue.filter(q => q.status === 'queued').length,
    scheduled:  queue.filter(q => q.status === 'scheduled').length,
    published:  queue.filter(q => q.status === 'published').length,
    failed:     queue.filter(q => q.status === 'failed').length,
  };

  const connectedCount = connections.filter(c => c.connected).length;

  // Assets not yet queued on any platform
  const unqueuedAssets = approvedAssets.filter(a =>
    !queue.some(q => q.asset_id === a.id && !['cancelled', 'failed'].includes(q.status))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Publishing Queue</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Schedule and publish approved content across all connected platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConnections(prev => !prev)}
            className="text-gray-400 hover:text-white text-xs h-8 border border-gray-800"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            {connectedCount}/{connections.length} connected
            <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${showConnections ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="text-gray-500 hover:text-gray-300 h-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Platform connections panel */}
      {showConnections && (
        <div className="mb-6 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
            Platform Connections
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {connections.map(conn => (
              <PlatformCard key={conn.platform} conn={conn} />
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-3">
            Full OAuth integration coming in Phase 5. Connect your accounts to enable one-click publishing.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Queued', value: stats.queued, color: 'text-gray-400' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-400' },
          { label: 'Published', value: stats.published, color: 'text-emerald-400' },
          { label: 'Failed', value: stats.failed, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue list */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
            {/* Filters */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <span className="text-xs text-gray-500 font-medium mr-1">Filter:</span>
              {['all', 'queued', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-2 py-0.5 rounded-md transition-all capitalize ${
                    statusFilter === s
                      ? 'bg-violet-600/30 text-violet-300'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Send className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {statusFilter !== 'all' ? `No ${statusFilter} items` : 'Queue is empty'}
                </p>
                <p className="text-gray-700 text-xs mt-1">
                  Approve assets and schedule them to start publishing
                </p>
              </div>
            ) : (
              <div className="divide-y-0">
                {filtered.map(item => (
                  <QueueRow
                    key={item.id}
                    item={item}
                    onCancel={handleCancel}
                    onRetry={handleRetry}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ready to publish sidebar */}
        <div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Ready to Publish</span>
              <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                {unqueuedAssets.length}
              </span>
            </div>

            {unqueuedAssets.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">All approved assets are queued</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50 max-h-96 overflow-y-auto">
                {unqueuedAssets.map(asset => {
                  const typeColors: Record<string, string> = {
                    social_post: 'text-blue-400',
                    email: 'text-green-400',
                    blog: 'text-orange-400',
                    video: 'text-purple-400',
                    ad: 'text-red-400',
                  };
                  return (
                    <div key={asset.id} className="px-4 py-2.5 hover:bg-gray-800/30 transition-colors">
                      <p className={`text-xs font-medium ${typeColors[asset.asset_type] ?? 'text-gray-400'} capitalize`}>
                        {asset.asset_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-300 truncate mt-0.5">
                        {asset.title ?? 'Untitled'}
                      </p>
                      {asset.campaign_title && (
                        <p className="text-xs text-gray-600 truncate">{asset.campaign_title}</p>
                      )}
                      <Button
                        size="sm"
                        onClick={() => setScheduleTarget(asset)}
                        className="mt-1.5 h-6 text-xs w-full bg-violet-600/20 border border-violet-700 text-violet-300 hover:bg-violet-600/30"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phase 5 notice */}
          <div className="mt-4 p-3 bg-blue-950/20 border border-blue-800/30 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">Phase 5 — Auto Publishing</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Direct API publishing to YouTube, Instagram, TikTok, LinkedIn and Facebook will be activated in Phase 5. Queued items are tracked and ready.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule modal */}
      {scheduleTarget && (
        <ScheduleModal
          asset={scheduleTarget}
          connections={connections}
          onClose={() => setScheduleTarget(null)}
          onScheduled={load}
        />
      )}
    </div>
  );
};

export default RivenPublishingQueue;
