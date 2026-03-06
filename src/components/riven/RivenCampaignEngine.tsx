import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell, Home, Plus, X, Loader2, Sparkles, Video, Library, Brain, Send
} from 'lucide-react';

import RivenLandingScreen, { type CreationType } from './RivenLandingScreen';
import RivenCampaignWizard, { type CampaignFormData } from './RivenCampaignWizard';
import RivenPipelineView from './RivenPipelineView';
import RivenApprovalCenter from './RivenApprovalCenter';
import RivenDashboardOverview from './RivenDashboardOverview';
import RivenVideoHub from './RivenVideoHub';
import RivenContentLibrary from './RivenContentLibrary';
import RivenStrategyBrain from './RivenStrategyBrain';
import RivenPublishingQueue from './RivenPublishingQueue';

// riven_* tables not yet in generated types — cast for pre-migration access
const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | { type: 'dashboard' }
  | { type: 'landing' }
  | { type: 'wizard'; initialTypes: CreationType[] }
  | { type: 'pipeline'; campaignId: string; campaignTitle: string }
  | { type: 'approval'; campaignId: string; campaignTitle: string }
  | { type: 'video_hub' }
  | { type: 'library' }
  | { type: 'strategy' }
  | { type: 'publish' };

interface RivenNotification {
  id: string;
  campaign_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ─── Pipeline stage builder ───────────────────────────────────────────────────

function buildPipelineStages(outputTypes: string[]) {
  const stages: Array<{ stage_name: string; stage_order: number }> = [
    { stage_name: 'brief_accepted', stage_order: 1 },
    { stage_name: 'script', stage_order: 2 },
  ];

  if (outputTypes.some(t => ['video', 'short_clip'].includes(t))) {
    stages.push({ stage_name: 'storyboard', stage_order: 3 });
  }

  stages.push({ stage_name: 'asset_gather', stage_order: 4 });

  if (outputTypes.some(t => ['video', 'thumbnail'].includes(t))) {
    stages.push({ stage_name: 'ai_assets', stage_order: 5 });
  }

  if (outputTypes.some(t => ['video', 'short_clip'].includes(t))) {
    stages.push({ stage_name: 'voice', stage_order: 6 });
    stages.push({ stage_name: 'subtitles', stage_order: 7 });
    stages.push({ stage_name: 'render', stage_order: 8 });
  }

  if (outputTypes.includes('social_post')) {
    stages.push({ stage_name: 'social_gen', stage_order: 9 });
  }

  if (outputTypes.includes('email')) {
    stages.push({ stage_name: 'email_gen', stage_order: 10 });
  }

  stages.push({ stage_name: 'qa', stage_order: 11 });
  stages.push({ stage_name: 'approval_ready', stage_order: 12 });

  return stages;
}

// ─── Notification panel ───────────────────────────────────────────────────────

const NotificationPanel: React.FC<{
  notifications: RivenNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (campaignId: string, view: 'pipeline' | 'approval') => void;
}> = ({ notifications, onClose, onMarkRead, onMarkAllRead, onNavigate }) => {
  const unread = notifications.filter(n => !n.read);
  const typeColor: Record<string, string> = {
    approval_needed:    'text-yellow-400',
    generation_complete:'text-green-400',
    generation_started: 'text-violet-400',
    failed:             'text-red-400',
    published:          'text-emerald-400',
    default:            'text-gray-400',
  };

  function timeAgo(str: string) {
    const m = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  }

  return (
    <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-violet-400 hover:text-violet-300">
              Mark all read
            </button>
          )}
          <button onClick={onClose}>
            <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/60">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-600 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`px-4 py-3 hover:bg-gray-800/40 transition-colors ${!n.read ? 'bg-violet-950/20' : ''}`}
              onClick={() => {
                onMarkRead(n.id);
                if (n.campaign_id) {
                  onNavigate(n.campaign_id, n.type === 'approval_needed' ? 'approval' : 'pipeline');
                  onClose();
                }
              }}
            >
              <div className="flex items-start gap-2">
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${typeColor[n.type] ?? typeColor.default}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-700 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Top nav bar ──────────────────────────────────────────────────────────────

const RivenTopNav: React.FC<{
  view: View;
  unreadCount: number;
  showNotifications: boolean;
  notifications: RivenNotification[];
  onHome: () => void;
  onNewCampaign: () => void;
  onVideoHub: () => void;
  onLibrary: () => void;
  onStrategy: () => void;
  onPublish: () => void;
  onToggleNotifications: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (campaignId: string, view: 'pipeline' | 'approval') => void;
}> = ({
  view, unreadCount, showNotifications, notifications,
  onHome, onNewCampaign, onVideoHub, onLibrary, onStrategy, onPublish,
  onToggleNotifications, onMarkRead, onMarkAllRead, onNavigate
}) => {
  const breadcrumb = () => {
    switch (view.type) {
      case 'landing':    return 'New Campaign';
      case 'wizard':     return 'New Campaign — Setup';
      case 'pipeline':   return `Pipeline — ${(view as any).campaignTitle}`;
      case 'approval':   return `Approval — ${(view as any).campaignTitle}`;
      case 'video_hub':  return 'Video Hub';
      case 'library':    return 'Content Library';
      case 'strategy':   return 'Strategy Brain';
      case 'publish':    return 'Publishing Queue';
      default: return null;
    }
  };

  const bc = breadcrumb();
  const topLevelViews = ['dashboard', 'video_hub', 'library', 'strategy', 'publish'];

  return (
    <div className="bg-gray-950/90 backdrop-blur border-b border-gray-800/60 px-4 h-12 flex items-center gap-3 sticky top-0 z-40">
      {/* Logo */}
      <button
        onClick={onHome}
        className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
      >
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">Riven</span>
      </button>

      {/* Primary nav links */}
      <div className="hidden sm:flex items-center gap-1 ml-2">
        {[
          { label: 'Dashboard', type: 'dashboard', icon: Home,    action: onHome },
          { label: 'Video Hub', type: 'video_hub', icon: Video,   action: onVideoHub },
          { label: 'Library',   type: 'library',   icon: Library, action: onLibrary },
          { label: 'Strategy',  type: 'strategy',  icon: Brain,   action: onStrategy },
          { label: 'Publish',   type: 'publish',   icon: Send,    action: onPublish },
        ].map(item => {
          const Icon = item.icon;
          const active = view.type === item.type;
          return (
            <button
              key={item.type}
              onClick={item.action}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                active
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb for deep views */}
      {bc && !topLevelViews.includes(view.type) && (
        <>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-400 truncate">{bc}</span>
        </>
      )}

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 relative">
        <Button
          size="sm"
          onClick={onNewCampaign}
          className="bg-violet-600 hover:bg-violet-500 text-white h-7 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>

        {/* Notification bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-4 h-4 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={onToggleNotifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
};

// ─── Main engine ──────────────────────────────────────────────────────────────

const RivenCampaignEngine: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [notifications, setNotifications] = useState<RivenNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    const { data } = await db
      .from('riven_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setNotifications(data as RivenNotification[]);
  };

  useEffect(() => {
    loadNotifications();

    // Real-time for new notifications
    const channel = supabase
      .channel('riven-notifications-engine')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'riven_notifications' },
        (payload) => {
          const n = payload.new as RivenNotification;
          setNotifications(prev => [n, ...prev]);
          // In-app toast for important events
          if (n.type === 'approval_needed') {
            toast({
              title: n.title,
              description: n.message,
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await db.from('riven_notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    if (ids.length === 0) return;
    await db.from('riven_notifications').update({ read: true }).in('id', ids);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Create a campaign from wizard data
  const handleWizardSubmit = useCallback(async (data: CampaignFormData) => {
    setCreating(true);
    try {
      // 1. Create the campaign record
      const { data: campaign, error: campErr } = await db
        .from('riven_campaigns')
        .insert({
          title: data.title,
          topic: data.topic,
          goal: data.goal,
          cta: data.cta,
          target_audience: data.target_audience,
          tone: data.tone,
          primary_language: data.primary_language,
          extra_languages: data.extra_languages,
          output_types: data.output_types,
          channels: data.channels,
          format_preferences: data.format_preferences,
          asset_sources: data.asset_sources,
          status: 'generating',
        })
        .select()
        .single();

      if (campErr || !campaign) throw campErr ?? new Error('Failed to create campaign');

      // 2. Build and insert pipeline stages
      const pipelineStages = buildPipelineStages(data.output_types).map(s => ({
        ...s,
        campaign_id: campaign.id,
        status: s.stage_order === 1 ? 'completed' : 'pending',
        progress: s.stage_order === 1 ? 100 : 0,
        started_at: s.stage_order === 1 ? new Date().toISOString() : null,
        completed_at: s.stage_order === 1 ? new Date().toISOString() : null,
        output_summary: s.stage_order === 1 ? 'Campaign brief accepted and pipeline initialised' : null,
      }));

      await db.from('riven_pipeline_stages').insert(pipelineStages);

      // 3. Create a "generation started" notification
      await db.from('riven_notifications').insert({
        campaign_id: campaign.id,
        type: 'generation_started',
        title: 'Generation started',
        message: `"${data.title}" is being generated. We'll notify you when it's ready for approval.`,
        read: false,
      });

      // 4. Invoke the campaign generator edge function (runs async)
      supabase.functions.invoke('riven-campaign-generator', {
        body: {
          campaign_id: campaign.id,
          campaign_data: {
            title: data.title,
            topic: data.topic,
            goal: data.goal,
            cta: data.cta,
            target_audience: data.target_audience,
            tone: data.tone,
            output_types: data.output_types,
            channels: data.channels,
          },
        },
      }).catch(err => {
        console.warn('[Riven] Generator invoke failed — may need deployment:', err);
      });

      toast({
        title: 'Campaign launched!',
        description: `"${data.title}" is now generating. Watch the pipeline for live progress.`,
      });

      // Navigate to pipeline view
      setView({ type: 'pipeline', campaignId: campaign.id, campaignTitle: campaign.title });

    } catch (err: any) {
      toast({
        title: 'Failed to create campaign',
        description: err?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }, [toast]);

  const handleApprovalReady = useCallback((campaignId: string, campaignTitle: string) => {
    setView({ type: 'approval', campaignId, campaignTitle });
  }, []);

  const handleOpenCampaign = useCallback((id: string, viewType: 'pipeline' | 'approval') => {
    // Fetch the campaign title
    db.from('riven_campaigns').select('title').eq('id', id).single().then(({ data }: any) => {
      const title = data?.title ?? 'Campaign';
      setView(viewType === 'pipeline'
        ? { type: 'pipeline', campaignId: id, campaignTitle: title }
        : { type: 'approval', campaignId: id, campaignTitle: title }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <RivenTopNav
        view={view}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        notifications={notifications}
        onHome={() => setView({ type: 'dashboard' })}
        onNewCampaign={() => setView({ type: 'landing' })}
        onVideoHub={() => setView({ type: 'video_hub' })}
        onLibrary={() => setView({ type: 'library' })}
        onStrategy={() => setView({ type: 'strategy' })}
        onPublish={() => setView({ type: 'publish' })}
        onToggleNotifications={() => setShowNotifications(prev => !prev)}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onNavigate={handleOpenCampaign}
      />

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {creating && (
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-900/30 border border-violet-800/40 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
              </div>
              <div>
                <p className="text-white font-semibold">Launching campaign...</p>
                <p className="text-sm text-gray-500 mt-1">Setting up pipeline and kicking off generation</p>
              </div>
            </div>
          </div>
        )}

        {view.type === 'dashboard' && (
          <RivenDashboardOverview
            onNewCampaign={() => setView({ type: 'landing' })}
            onOpenCampaign={handleOpenCampaign}
          />
        )}

        {view.type === 'landing' && (
          <RivenLandingScreen
            onStart={(types) => setView({ type: 'wizard', initialTypes: types })}
          />
        )}

        {view.type === 'wizard' && (
          <RivenCampaignWizard
            initialTypes={(view as any).initialTypes}
            onSubmit={handleWizardSubmit}
            onBack={() => setView({ type: 'landing' })}
          />
        )}

        {view.type === 'pipeline' && (
          <RivenPipelineView
            campaignId={(view as any).campaignId}
            campaignTitle={(view as any).campaignTitle}
            onApprovalReady={() =>
              handleApprovalReady((view as any).campaignId, (view as any).campaignTitle)
            }
          />
        )}

        {view.type === 'approval' && (
          <RivenApprovalCenter
            campaignId={(view as any).campaignId}
            campaignTitle={(view as any).campaignTitle}
            onAllApproved={() => {
              toast({ title: 'All assets approved!', description: 'Schedule them in the Publishing Queue.' });
            }}
            onGoToPublishing={() => setView({ type: 'publish' })}
          />
        )}

        {view.type === 'video_hub' && (
          <RivenVideoHub
            onCreateCampaign={() => setView({ type: 'landing' })}
            onOpenPipeline={(id, title) => setView({ type: 'pipeline', campaignId: id, campaignTitle: title })}
          />
        )}

        {view.type === 'library' && (
          <RivenContentLibrary
            onOpenApproval={(id, title) => setView({ type: 'approval', campaignId: id, campaignTitle: title })}
            onOpenPipeline={(id, title) => setView({ type: 'pipeline', campaignId: id, campaignTitle: title })}
          />
        )}

        {view.type === 'strategy' && (
          <RivenStrategyBrain
            onCreateCampaign={(presets) => {
              if (presets) {
                // Pre-fill the wizard with strategy recommendation data
                // For now, go to landing — wizard pre-fill wired in Phase 3
              }
              setView({ type: 'landing' });
            }}
          />
        )}

        {view.type === 'publish' && (
          <RivenPublishingQueue
            onBack={() => setView({ type: 'dashboard' })}
          />
        )}
      </div>
    </div>
  );
};

export default RivenCampaignEngine;
