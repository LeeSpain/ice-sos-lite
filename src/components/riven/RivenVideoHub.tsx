import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Video, Plus, Play, Clock, CheckCircle2, Loader2, AlertCircle,
  Monitor, Smartphone, Square, Film, BookOpen, Users, Shield,
  Clapperboard, FileText, RefreshCw, ChevronRight, Zap, Globe
} from 'lucide-react';

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoJob {
  id: string;
  campaign_id?: string;
  title: string;
  video_type: string;
  format: string;
  duration_target: string;
  source_url?: string;
  script?: string;
  status: 'queued' | 'scripting' | 'storyboard' | 'assets' | 'rendering' | 'complete' | 'failed';
  progress: number;
  output_url?: string;
  created_at: string;
  updated_at: string;
}

interface RivenVideoHubProps {
  onCreateCampaign: () => void;
  onOpenPipeline: (id: string, title: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VIDEO_TYPES = [
  { id: 'product_promo',    label: 'Product Promo',        icon: Zap,         description: 'Showcase ICE SOS Lite features and benefits' },
  { id: 'walkthrough',      label: 'Member Walkthrough',   icon: Users,       description: 'Guide users through the app step by step' },
  { id: 'explainer',        label: 'Feature Explainer',    icon: BookOpen,    description: 'Deep-dive into a specific feature or use case' },
  { id: 'social_reel',      label: 'Social Reel',          icon: Film,        description: 'Short-form content for Instagram, TikTok, YouTube Shorts' },
  { id: 'educational',      label: 'Educational Tutorial', icon: FileText,    description: 'Teach safety concepts and best practices' },
  { id: 'trust',            label: 'Trust & Safety',       icon: Shield,      description: 'Build confidence with reassurance messaging' },
  { id: 'onboarding',       label: 'Onboarding Video',     icon: Play,        description: 'Welcome and activate new members' },
  { id: 'announcement',     label: 'Feature Announcement', icon: Clapperboard,description: 'Launch a new feature or product update' },
];

const FORMATS = [
  { id: '16:9',  label: 'Landscape 16:9',  icon: Monitor,    hint: 'YouTube, Website' },
  { id: '9:16',  label: 'Portrait 9:16',   icon: Smartphone, hint: 'Reels, TikTok, Shorts' },
  { id: '1:1',   label: 'Square 1:1',      icon: Square,     hint: 'Instagram Feed' },
];

const DURATIONS = [
  { id: '30s',    label: '30 seconds',  hint: 'Social ads, quick promos' },
  { id: '60s',    label: '60 seconds',  hint: 'Instagram, product overview' },
  { id: '90s',    label: '90 seconds',  hint: 'Feature explainer' },
  { id: '3-5min', label: '3–5 minutes', hint: 'Walkthrough, tutorial' },
  { id: '5min+',  label: '5+ minutes',  hint: 'Long-form educational' },
];

const SOURCE_OPTIONS = [
  { id: 'brief',     label: 'Written brief',       description: 'Describe what the video should say and Riven writes the script' },
  { id: 'url',       label: 'Page / URL',           description: 'Riven reads a page and builds a video from its content' },
  { id: 'existing',  label: 'Existing campaign',    description: 'Pull script and assets from an already-created campaign' },
];

const STATUS_CONFIG: Record<VideoJob['status'], { label: string; color: string; icon: React.ElementType }> = {
  queued:     { label: 'Queued',      color: 'text-gray-400 bg-gray-800',              icon: Clock },
  scripting:  { label: 'Scripting',   color: 'text-blue-300 bg-blue-900/30',           icon: FileText },
  storyboard: { label: 'Storyboard',  color: 'text-purple-300 bg-purple-900/30',       icon: Clapperboard },
  assets:     { label: 'Assets',      color: 'text-orange-300 bg-orange-900/30',       icon: Globe },
  rendering:  { label: 'Rendering',   color: 'text-violet-300 bg-violet-900/30',       icon: Loader2 },
  complete:   { label: 'Complete',    color: 'text-green-300 bg-green-900/30',         icon: CheckCircle2 },
  failed:     { label: 'Failed',      color: 'text-red-300 bg-red-900/30',             icon: AlertCircle },
};

function timeAgo(str: string) {
  const m = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ─── Video request form ───────────────────────────────────────────────────────

const VideoRequestForm: React.FC<{ onSubmit: (job: Partial<VideoJob>) => void; onCancel: () => void }> = ({
  onSubmit, onCancel
}) => {
  const [step, setStep] = useState<'type' | 'format' | 'source' | 'brief'>('type');
  const [form, setForm] = useState({
    video_type: '',
    format: '16:9',
    duration_target: '60s',
    source_type: 'brief',
    source_url: '',
    title: '',
    brief: '',
  });

  const selectedType = VIDEO_TYPES.find(t => t.id === form.video_type);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Create Video</h3>
      </div>

      {/* Step: Video Type */}
      {step === 'type' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">What kind of video do you need?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VIDEO_TYPES.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => { setForm(f => ({ ...f, video_type: id })); setStep('format'); }}
                className={`text-left p-4 rounded-xl border transition-all group ${
                  form.video_type === id
                    ? 'bg-violet-600/20 border-violet-500'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 text-violet-400 mb-2" />
                <div className="text-sm font-medium text-white mb-0.5">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-300">Cancel</Button>
          </div>
        </div>
      )}

      {/* Step: Format */}
      {step === 'format' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-violet-400 font-medium">{selectedType?.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Format</span>
          </div>

          <div>
            <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider">Aspect ratio</Label>
            <div className="flex gap-3">
              {FORMATS.map(({ id, label, icon: Icon, hint }) => (
                <button
                  key={id}
                  onClick={() => setForm(f => ({ ...f, format: id }))}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    form.format === id
                      ? 'bg-violet-600/20 border-violet-500'
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1.5 text-gray-400" />
                  <div className="text-xs font-medium text-white">{label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider">Target length</Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(({ id, label, hint }) => (
                <button
                  key={id}
                  onClick={() => setForm(f => ({ ...f, duration_target: id }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    form.duration_target === id
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                  }`}
                >
                  {label}
                  <span className="text-xs text-gray-600 ml-1.5">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep('type')} className="text-gray-500 hover:text-gray-300">Back</Button>
            <Button onClick={() => setStep('source')} className="bg-violet-600 hover:bg-violet-500 text-white">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Source */}
      {step === 'source' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-violet-400 font-medium">{selectedType?.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{form.format}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Source</span>
          </div>

          <p className="text-sm text-gray-400">Where should Riven get the source content from?</p>
          <div className="space-y-2">
            {SOURCE_OPTIONS.map(({ id, label, description }) => (
              <button
                key={id}
                onClick={() => setForm(f => ({ ...f, source_type: id }))}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  form.source_type === id
                    ? 'bg-violet-600/20 border-violet-500'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="text-sm font-medium text-white mb-0.5">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </button>
            ))}
          </div>

          {form.source_type === 'url' && (
            <div>
              <Label className="text-gray-400 mb-1.5 block text-sm">Page URL</Label>
              <Input
                placeholder="https://..."
                value={form.source_url}
                onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))}
                className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600"
              />
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep('format')} className="text-gray-500 hover:text-gray-300">Back</Button>
            <Button onClick={() => setStep('brief')} className="bg-violet-600 hover:bg-violet-500 text-white">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Brief */}
      {step === 'brief' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <span className="text-violet-400 font-medium">{selectedType?.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{form.format} · {form.duration_target}</span>
          </div>

          <div>
            <Label className="text-gray-300 mb-1.5 block">Video title *</Label>
            <Input
              placeholder="e.g. ICE SOS Lite — How it works in 60 seconds"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-1.5 block">Brief / key messages</Label>
            <Textarea
              placeholder={
                form.source_type === 'brief'
                  ? "Describe what this video should communicate. Key messages, tone, CTA..."
                  : "Any additional context or specific messages to include..."
              }
              value={form.brief}
              onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
              className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 resize-none"
              rows={4}
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep('source')} className="text-gray-500 hover:text-gray-300">Back</Button>
            <Button
              disabled={!form.title.trim()}
              onClick={() => onSubmit({
                title: form.title,
                video_type: form.video_type,
                format: form.format,
                duration_target: form.duration_target,
                source_type: form.source_type,
                source_url: form.source_url || undefined,
                script: form.brief || undefined,
                status: 'queued',
                progress: 0,
              } as any)}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Video job card ───────────────────────────────────────────────────────────

const VideoJobCard: React.FC<{ job: VideoJob; onPlay: (url: string) => void }> = ({ job, onPlay }) => {
  const sc = STATUS_CONFIG[job.status];
  const StatusIcon = sc.icon;
  const isActive = ['queued', 'scripting', 'storyboard', 'assets', 'rendering'].includes(job.status);

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white line-clamp-1">{job.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">{job.video_type?.replace(/_/g, ' ')}</span>
            <span className="text-xs text-gray-700">·</span>
            <span className="text-xs text-gray-500">{job.format}</span>
            <span className="text-xs text-gray-700">·</span>
            <span className="text-xs text-gray-500">{job.duration_target}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${sc.color}`}>
          <StatusIcon className={`w-3 h-3 ${isActive && job.status === 'rendering' ? 'animate-spin' : ''}`} />
          {sc.label}
        </div>
      </div>

      {isActive && (
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-violet-500 transition-all duration-1000"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{timeAgo(job.updated_at)}</span>
        {job.status === 'complete' && job.output_url && (
          <Button
            size="sm"
            onClick={() => onPlay(job.output_url!)}
            className="bg-green-700/50 hover:bg-green-700 text-green-300 h-6 text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Play
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RivenVideoHub: React.FC<RivenVideoHubProps> = ({ onCreateCampaign, onOpenPipeline }) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const load = async () => {
    const { data } = await db
      .from('riven_video_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setJobs(data as VideoJob[]);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('riven-video-jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riven_video_jobs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as VideoJob, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(j => j.id === payload.new.id ? payload.new as VideoJob : j));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (jobData: Partial<VideoJob>) => {
    setShowForm(false);
    try {
      const { data, error } = await db.from('riven_video_jobs').insert({
        ...jobData,
        status: 'queued',
        progress: 0,
      }).select().single();

      if (error) throw error;

      toast({
        title: 'Video job queued',
        description: `"${jobData.title}" is in the video generation queue.`,
      });

      // Trigger script + storyboard generation via edge function
      supabase.functions.invoke('riven-video-generator', {
        body: { job_id: data.id },
      }).catch(() => {/* Edge function not deployed yet — will activate on deploy */});

    } catch (err: any) {
      toast({ title: 'Failed to create video job', description: err?.message, variant: 'destructive' });
    }
  };

  const statuses = ['all', 'queued', 'scripting', 'storyboard', 'assets', 'rendering', 'complete', 'failed'];
  const filtered = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus);

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => ['queued','scripting','storyboard','assets','rendering'].includes(j.status)).length,
    complete: jobs.filter(j => j.status === 'complete').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Video Hub</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Create promo videos, walkthroughs, explainers, social reels, and more.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} className="text-gray-500 hover:text-gray-300 h-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Video
          </Button>
        </div>
      </div>

      {/* Video type showcase */}
      {!showForm && jobs.length === 0 && !loading && (
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">What can you create?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VIDEO_TYPES.slice(0, 8).map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setShowForm(true)}
                className="text-left p-4 bg-gray-900/40 border border-gray-800/60 rounded-xl hover:border-violet-700/50 hover:bg-violet-900/10 transition-all group"
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-violet-400 mb-2 transition-colors" />
                <div className="text-xs font-medium text-gray-400 group-hover:text-white mb-0.5 transition-colors">{label}</div>
                <div className="text-xs text-gray-700 line-clamp-2">{description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-8">
          <VideoRequestForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Jobs</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{stats.active}</div>
            <div className="text-xs text-gray-500 mt-0.5">In Progress</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.complete}</div>
            <div className="text-xs text-gray-500 mt-0.5">Complete</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
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
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      )}

      {/* Jobs grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-violet-900/20 border border-violet-800/30 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No videos yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            The Video Hub generates professional videos from your briefs, page content, and brand assets.
          </p>
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <VideoJobCard key={job.id} job={job} onPlay={setPlayUrl} />
          ))}
        </div>
      )}

      {/* Video player modal */}
      {playUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPlayUrl(null)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <video src={playUrl} controls autoPlay className="w-full rounded-xl" />
          </div>
        </div>
      )}

      {/* Phase 2 notice */}
      <div className="mt-10 p-4 rounded-xl bg-violet-950/20 border border-violet-900/30">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-violet-300">Phase 2 — Remotion + FFmpeg rendering</span>
        </div>
        <p className="text-xs text-gray-500">
          Full video rendering with Remotion, FFmpeg processing, and AI voiceover generation will be activated in Phase 2.
          Jobs queued now will process automatically once the render pipeline is deployed.
        </p>
      </div>
    </div>
  );
};

export default RivenVideoHub;
