import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, Circle, Loader2, XCircle, SkipForward,
  FileText, Image, Mic, Video, Mail, Share2, ShieldCheck,
  Layers, Eye, Clock, AlertCircle, BookOpen, Megaphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// New riven tables aren't in generated types yet — cast for pre-migration access
const db = supabase as any;

interface PipelineStage {
  id: string;
  campaign_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  output_summary?: string;
}

interface RivenPipelineViewProps {
  campaignId: string;
  campaignTitle: string;
  onApprovalReady: () => void;
}

const STAGE_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  brief_accepted:    { label: 'Brief Accepted',       icon: FileText,    description: 'Campaign brief confirmed and queued' },
  script:            { label: 'Script Generation',    icon: FileText,    description: 'Writing scripts and copy for all output types' },
  storyboard:        { label: 'Storyboard Creation',  icon: Layers,      description: 'Building visual storyboard for video content' },
  asset_gather:      { label: 'Asset Gathering',      icon: Image,       description: 'Collecting images, screenshots, and brand media' },
  ai_assets:         { label: 'AI Asset Generation',  icon: Image,       description: 'Generating creative visuals with AI' },
  voice:             { label: 'Voice Generation',     icon: Mic,         description: 'Producing voice-over audio' },
  subtitles:         { label: 'Subtitle Generation',  icon: FileText,    description: 'Creating subtitle packages for all formats' },
  render:            { label: 'Video Render',         icon: Video,       description: 'Rendering final video outputs via Remotion + FFmpeg' },
  social_gen:        { label: 'Social Posts',         icon: Share2,      description: 'Generating social media captions and assets' },
  email_gen:         { label: 'Email Generation',     icon: Mail,        description: 'Writing email sequences and campaigns' },
  blog_gen:          { label: 'Blog Article',         icon: BookOpen,    description: 'Writing SEO blog article' },
  ad_gen:            { label: 'Ad Copy',              icon: Megaphone,   description: 'Generating Google and Meta ad copy' },
  qa:                { label: 'Quality Check',        icon: ShieldCheck, description: 'Checking brand voice, tone, and content quality' },
  approval_ready:    { label: 'Approval Ready',       icon: Eye,         description: 'All assets ready for your review and approval' },
};

const StatusIcon: React.FC<{ status: PipelineStage['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'running':   return <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />;
    case 'failed':    return <XCircle className="w-5 h-5 text-red-400" />;
    case 'skipped':   return <SkipForward className="w-5 h-5 text-gray-600" />;
    default:          return <Circle className="w-5 h-5 text-gray-700" />;
  }
};

const statusBadge: Record<PipelineStage['status'], string> = {
  pending:   'bg-gray-800 text-gray-500',
  running:   'bg-violet-900/40 text-violet-300',
  completed: 'bg-green-900/40 text-green-300',
  failed:    'bg-red-900/40 text-red-300',
  skipped:   'bg-gray-900 text-gray-600',
};

function elapsed(started?: string, ended?: string): string {
  if (!started) return '';
  const start = new Date(started).getTime();
  const end = ended ? new Date(ended).getTime() : Date.now();
  const s = Math.round((end - start) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const RivenPipelineView: React.FC<RivenPipelineViewProps> = ({
  campaignId, campaignTitle, onApprovalReady
}) => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stages
  const loadStages = async () => {
    const { data } = await db
      .from('riven_pipeline_stages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('stage_order', { ascending: true });
    if (data) setStages(data as PipelineStage[]);
    setLoading(false);
  };

  useEffect(() => {
    loadStages();

    // Real-time updates
    const channel = supabase
      .channel(`riven-pipeline-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riven_pipeline_stages', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setStages(prev => {
              const idx = prev.findIndex(s => s.id === payload.new.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = payload.new as PipelineStage;
                return updated;
              }
              return [...prev, payload.new as PipelineStage].sort((a, b) => a.stage_order - b.stage_order);
            });

            // Trigger approval callback when approval_ready stage completes
            if (payload.new.stage_name === 'approval_ready' && payload.new.status === 'completed') {
              onApprovalReady();
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const totalCount = stages.filter(s => s.status !== 'skipped').length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const hasFailed = stages.some(s => s.status === 'failed');
  const isComplete = stages.some(s => s.stage_name === 'approval_ready' && s.status === 'completed');
  const runningStage = stages.find(s => s.status === 'running');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{campaignTitle}</h2>
            <p className="text-gray-400 text-sm">Generation pipeline — live status</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{overallProgress}%</div>
            <div className="text-xs text-gray-500">{completedCount} of {totalCount} stages done</div>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={overallProgress} className="h-2 bg-gray-800" />
        </div>

        {hasFailed && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            One or more stages failed. Review the details below.
          </div>
        )}

        {isComplete && (
          <div className="mt-3 flex items-center justify-between bg-green-900/20 border border-green-800/40 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              All assets generated and ready for your review
            </div>
            <Button
              onClick={onApprovalReady}
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Go to Approval Center
            </Button>
          </div>
        )}

        {runningStage && !isComplete && (
          <div className="mt-3 flex items-center gap-2 text-sm text-violet-300 bg-violet-900/20 border border-violet-800/40 rounded-lg px-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Currently running: <span className="font-medium">{STAGE_META[runningStage.stage_name]?.label ?? runningStage.stage_name}</span>
          </div>
        )}
      </div>

      {/* Stage list */}
      {stages.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Pipeline stages will appear here once generation begins.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, idx) => {
            const meta = STAGE_META[stage.stage_name];
            const Icon = meta?.icon ?? FileText;
            const isRunning = stage.status === 'running';

            return (
              <div
                key={stage.id}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border transition-all
                  ${isRunning
                    ? 'bg-violet-900/10 border-violet-800/40'
                    : stage.status === 'completed'
                    ? 'bg-gray-900/40 border-gray-800/60'
                    : stage.status === 'failed'
                    ? 'bg-red-900/10 border-red-900/30'
                    : 'bg-gray-900/20 border-gray-800/30'
                  }
                `}
              >
                {/* Status icon */}
                <div className="pt-0.5 shrink-0">
                  <StatusIcon status={stage.status} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className="w-3.5 h-3.5 text-gray-500" />
                    <span className={`text-sm font-medium ${
                      stage.status === 'completed' ? 'text-white'
                      : stage.status === 'running' ? 'text-violet-300'
                      : stage.status === 'failed' ? 'text-red-300'
                      : 'text-gray-500'
                    }`}>
                      {meta?.label ?? stage.stage_name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusBadge[stage.status]}`}>
                      {stage.status}
                    </span>
                  </div>

                  {meta?.description && (
                    <p className="text-xs text-gray-600 mb-1">{meta.description}</p>
                  )}

                  {isRunning && stage.progress > 0 && (
                    <div className="mt-2">
                      <Progress value={stage.progress} className="h-1 bg-gray-800" />
                      <span className="text-xs text-violet-400 mt-0.5 block">{stage.progress}%</span>
                    </div>
                  )}

                  {stage.output_summary && (
                    <p className="text-xs text-gray-400 mt-1 italic">{stage.output_summary}</p>
                  )}

                  {stage.status === 'failed' && stage.error_message && (
                    <p className="text-xs text-red-400 mt-1">{stage.error_message}</p>
                  )}
                </div>

                {/* Timing */}
                {(stage.started_at || stage.completed_at) && (
                  <div className="text-xs text-gray-600 shrink-0 text-right">
                    {stage.completed_at
                      ? <span className="text-gray-500">{elapsed(stage.started_at, stage.completed_at)}</span>
                      : <span className="text-violet-400 animate-pulse">{elapsed(stage.started_at)}</span>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RivenPipelineView;
