import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus, Eye, CheckCircle2, Clock, AlertCircle, Layers,
  Loader2, RefreshCw, TrendingUp, Zap,
  ArrowRight, Video, Share2, Mail, FileText, Megaphone, Send
} from 'lucide-react';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RivenCampaign {
  id: string;
  title: string;
  topic?: string;
  output_types: string[];
  channels: string[];
  status: 'draft' | 'generating' | 'approval_needed' | 'approved' | 'publishing' | 'published' | 'failed' | 'paused';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface DashboardProps {
  onNewCampaign: () => void;
  onOpenCampaign: (id: string, view: 'pipeline' | 'approval') => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<RivenCampaign['status'], { label: string; color: string; icon: React.ElementType }> = {
  draft:           { label: 'Draft',           color: 'bg-gray-800 text-gray-400',              icon: Clock },
  generating:      { label: 'Generating',      color: 'bg-violet-900/40 text-violet-300',       icon: Zap },
  approval_needed: { label: 'Needs Approval',  color: 'bg-yellow-900/40 text-yellow-300',       icon: AlertCircle },
  approved:        { label: 'Approved',        color: 'bg-green-900/40 text-green-300',         icon: CheckCircle2 },
  publishing:      { label: 'Publishing',      color: 'bg-blue-900/40 text-blue-300',           icon: Send },
  published:       { label: 'Published',       color: 'bg-emerald-900/40 text-emerald-300',     icon: CheckCircle2 },
  failed:          { label: 'Failed',          color: 'bg-red-900/40 text-red-300',             icon: AlertCircle },
  paused:          { label: 'Paused',          color: 'bg-gray-800 text-gray-500',              icon: Clock },
};

const outputTypeIcon: Record<string, React.ElementType> = {
  video:       Video,
  social_post: Share2,
  email:       Mail,
  blog:        FileText,
  ad:          Megaphone,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ElementType; color: string }> = ({
  label, value, icon: Icon, color
}) => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
  </div>
);

// ─── Campaign row ─────────────────────────────────────────────────────────────

const CampaignRow: React.FC<{
  campaign: RivenCampaign;
  onOpen: (id: string, view: 'pipeline' | 'approval') => void;
}> = ({ campaign, onOpen }) => {
  const sc = statusConfig[campaign.status];
  const StatusIcon = sc.icon;
  const needsApproval = campaign.status === 'approval_needed';
  const isGenerating = campaign.status === 'generating';

  const defaultView = needsApproval ? 'approval' as const : 'pipeline' as const;

  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800/60 rounded-xl hover:border-gray-700 hover:bg-gray-900/60 transition-all group cursor-pointer"
      onClick={() => onOpen(campaign.id, defaultView)}
    >
      {/* Left: title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white text-sm line-clamp-1">{campaign.title}</span>
          <Badge className={`text-xs px-1.5 py-0.5 ${sc.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {sc.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {campaign.output_types.slice(0, 4).map(t => {
            const Icon = outputTypeIcon[t] ?? Layers;
            return (
              <span key={t} className="flex items-center gap-1 text-xs text-gray-600">
                <Icon className="w-3 h-3" />
                {t.replace(/_/g, ' ')}
              </span>
            );
          })}
          {campaign.output_types.length > 4 && (
            <span className="text-xs text-gray-600">+{campaign.output_types.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Right: time + status indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-600 hidden sm:block">{timeAgo(campaign.updated_at)}</span>

        {isGenerating && (
          <span className="flex items-center gap-1 text-violet-400 text-xs">
            <Eye className="w-3.5 h-3.5" />
            Pipeline
          </span>
        )}

        {needsApproval && (
          <span className="flex items-center gap-1 bg-yellow-600/30 border border-yellow-700 text-yellow-300 text-xs px-2 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5" />
            Review
          </span>
        )}

        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 transition-colors" />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RivenDashboardOverview: React.FC<DashboardProps> = ({ onNewCampaign, onOpenCampaign }) => {
  const [campaigns, setCampaigns] = useState<RivenCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await db
      .from('riven_campaigns')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);
    if (data) setCampaigns(data as RivenCampaign[]);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('riven-campaigns-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riven_campaigns' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCampaigns(prev => [payload.new as RivenCampaign, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new as RivenCampaign : c));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = {
    total: campaigns.length,
    generating: campaigns.filter(c => c.status === 'generating').length,
    needsApproval: campaigns.filter(c => c.status === 'approval_needed').length,
    published: campaigns.filter(c => c.status === 'published').length,
  };

  const active = campaigns.filter(c => ['generating', 'approval_needed', 'approved', 'publishing'].includes(c.status));
  const recent = campaigns.filter(c => ['published', 'failed', 'draft'].includes(c.status)).slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Riven</h2>
          <p className="text-gray-400 text-sm">AI Marketing, Media & Publishing Engine</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="text-gray-500 hover:text-gray-300 h-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={onNewCampaign}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Campaigns" value={stats.total} icon={Layers} color="text-white" />
        <StatCard label="Generating" value={stats.generating} icon={Zap} color="text-violet-400" />
        <StatCard label="Needs Approval" value={stats.needsApproval} icon={AlertCircle} color="text-yellow-400" />
        <StatCard label="Published" value={stats.published} icon={TrendingUp} color="text-green-400" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-violet-900/20 border border-violet-800/30 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Create your first campaign and Riven will generate all your content — videos, posts, emails, and more.
          </p>
          <Button onClick={onNewCampaign} className="bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create First Campaign
          </Button>
        </div>
      ) : (
        <>
          {/* Active campaigns */}
          {active.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Active ({active.length})
              </h3>
              <div className="space-y-2">
                {active.map(c => (
                  <CampaignRow key={c.id} campaign={c} onOpen={onOpenCampaign} />
                ))}
              </div>
            </section>
          )}

          {/* Approval queue */}
          {stats.needsApproval > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
                  Approval Queue ({stats.needsApproval})
                </h3>
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                {campaigns.filter(c => c.status === 'approval_needed').map(c => (
                  <CampaignRow key={c.id} campaign={c} onOpen={onOpenCampaign} />
                ))}
              </div>
            </section>
          )}

          {/* Recent / completed */}
          {recent.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Recent
              </h3>
              <div className="space-y-2">
                {recent.map(c => (
                  <CampaignRow key={c.id} campaign={c} onOpen={onOpenCampaign} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default RivenDashboardOverview;
