import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Brain, Lightbulb, Calendar, Target, TrendingUp, ChevronRight,
  Loader2, RefreshCw, Sparkles, Clock, Users, Zap, BarChart3,
  CheckCircle2, ArrowRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrategyItem {
  week?: number;
  day?: number;
  theme: string;
  content_type: string;
  channel: string;
  topic: string;
  goal: string;
}

interface AIRecommendation {
  type: 'campaign_idea' | 'trending_topic' | 'seasonal' | 'performance' | 'repurpose';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  outputTypes: string[];
}

const AUDIENCE_SEGMENTS = [
  { id: 'families_elderly', label: 'Families with elderly parents', color: 'text-blue-400' },
  { id: 'older_adults', label: 'Older adults (65+)', color: 'text-green-400' },
  { id: 'carers', label: 'Family carers', color: 'text-purple-400' },
  { id: 'healthcare', label: 'Healthcare professionals', color: 'text-orange-400' },
  { id: 'organisations', label: 'Care organisations', color: 'text-red-400' },
  { id: 'b2b', label: 'B2B partners', color: 'text-yellow-400' },
];

const STATIC_RECOMMENDATIONS: AIRecommendation[] = [
  {
    type: 'campaign_idea',
    title: 'Spring Family Safety Campaign',
    description: 'Seasonal awareness campaign linking spring travel and outdoor activities with emergency preparedness. High engagement period for family safety content.',
    priority: 'high',
    outputTypes: ['video', 'social_post', 'email', 'blog'],
  },
  {
    type: 'trending_topic',
    title: 'AI in Emergency Response',
    description: 'Trending topic — AI voice assistants in emergency scenarios. Position Clara AI as a leader. Blog + social content opportunity.',
    priority: 'high',
    outputTypes: ['blog', 'social_post'],
  },
  {
    type: 'seasonal',
    title: 'Carers Week Awareness',
    description: 'Carers Week is a major event for your target audience. Create a dedicated content series showcasing how ICE SOS supports carers.',
    priority: 'medium',
    outputTypes: ['email', 'social_post', 'video'],
  },
  {
    type: 'repurpose',
    title: 'Repurpose Blog Content to Reels',
    description: 'Your top blog posts can be repurposed into 5-7 Instagram Reels and TikTok videos. High ROI with minimal new content needed.',
    priority: 'medium',
    outputTypes: ['video', 'social_post'],
  },
  {
    type: 'performance',
    title: 'Onboarding Email Sequence Refresh',
    description: 'Nurture sequences showing the most improvement when updated quarterly. Consider a 5-email onboarding refresh targeting new trial users.',
    priority: 'low',
    outputTypes: ['email'],
  },
];

const PRIORITY_CONFIG = {
  high:   { label: 'High Priority', color: 'bg-red-900/30 text-red-300 border-red-800/40' },
  medium: { label: 'Medium',        color: 'bg-yellow-900/30 text-yellow-300 border-yellow-800/40' },
  low:    { label: 'Low',           color: 'bg-gray-800 text-gray-400' },
};

const TYPE_ICON: Record<AIRecommendation['type'], React.ElementType> = {
  campaign_idea:  Lightbulb,
  trending_topic: TrendingUp,
  seasonal:       Calendar,
  performance:    BarChart3,
  repurpose:      RefreshCw,
};

// ─── 30-day planner generator ─────────────────────────────────────────────────

function generate30DayPlan(audience: string, focus: string): StrategyItem[] {
  const themes = [
    { theme: 'Trust & Safety',       types: ['blog', 'social_post'], channels: ['linkedin', 'facebook'] },
    { theme: 'Feature Spotlight',    types: ['video', 'social_post'], channels: ['instagram', 'youtube'] },
    { theme: 'Customer Story',       types: ['social_post', 'email'], channels: ['instagram', 'newsletter'] },
    { theme: 'Educational Guide',    types: ['blog', 'email'],        channels: ['blog', 'newsletter'] },
    { theme: 'Product Demo',         types: ['video', 'social_post'], channels: ['youtube', 'linkedin'] },
    { theme: 'Audience Insight',     types: ['blog', 'social_post'],  channels: ['linkedin', 'twitter'] },
    { theme: 'CTA Campaign',         types: ['ad', 'social_post'],    channels: ['instagram', 'facebook'] },
  ];

  const plan: StrategyItem[] = [];
  for (let week = 1; week <= 4; week++) {
    const weekTheme = themes[(week - 1) % themes.length];
    // 3 pieces per week
    for (let d = 0; d < 3; d++) {
      const type = weekTheme.types[d % weekTheme.types.length];
      const channel = weekTheme.channels[d % weekTheme.channels.length];
      plan.push({
        week,
        day: (week - 1) * 7 + [1, 3, 5][d],
        theme: weekTheme.theme,
        content_type: type,
        channel,
        topic: `${weekTheme.theme} — ${focus || 'ICE SOS Lite'} for ${audience || 'families'}`,
        goal: week <= 2 ? 'Awareness' : week === 3 ? 'Engagement' : 'Conversion',
      });
    }
  }
  return plan;
}

// ─── Recommendation card ──────────────────────────────────────────────────────

const RecommendationCard: React.FC<{
  rec: AIRecommendation;
  onUse: (rec: AIRecommendation) => void;
}> = ({ rec, onUse }) => {
  const Icon = TYPE_ICON[rec.type];
  const pc = PRIORITY_CONFIG[rec.priority];
  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4 hover:border-gray-700 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-violet-900/30 border border-violet-800/30 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-medium text-white">{rec.title}</span>
            <Badge className={`text-xs px-1.5 py-0 border ${pc.color}`}>{pc.label}</Badge>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{rec.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {rec.outputTypes.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => onUse(rec)}
          className="bg-violet-600/30 hover:bg-violet-600/60 border border-violet-700 text-violet-300 h-6 text-xs"
        >
          Use this <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface RivenStrategyBrainProps {
  onCreateCampaign: (presets?: { outputTypes: string[]; topic: string }) => void;
}

const RivenStrategyBrain: React.FC<RivenStrategyBrainProps> = ({ onCreateCampaign }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'planner' | 'audience'>('suggestions');
  const [plannerAudience, setPlannerAudience] = useState('families');
  const [plannerFocus, setPlannerFocus] = useState('');
  const [plan, setPlan] = useState<StrategyItem[]>([]);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generatePlan = () => {
    setGenerating(true);
    setTimeout(() => {
      const p = generate30DayPlan(plannerAudience, plannerFocus);
      setPlan(p);
      setPlanGenerated(true);
      setGenerating(false);
    }, 1200);
  };

  const handleUseRecommendation = (rec: AIRecommendation) => {
    onCreateCampaign({
      outputTypes: rec.outputTypes,
      topic: rec.title,
    });
  };

  const tabs = [
    { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles },
    { id: 'planner',     label: '30-Day Planner', icon: Calendar },
    { id: 'audience',    label: 'Audiences',       icon: Users },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-900/30 border border-violet-800/30 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Strategy Brain</h2>
          <p className="text-sm text-gray-400">AI-powered campaign ideas, plans, and audience insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: AI Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">
              Riven recommends these campaigns based on your audience, season, and platform patterns.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-300 h-7 text-xs"
              onClick={() => toast({ title: 'Refreshing suggestions...', description: 'AI suggestions regenerate with each full data sync.' })}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-3">
            {STATIC_RECOMMENDATIONS.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} onUse={handleUseRecommendation} />
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-violet-950/20 border border-violet-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-300">Live Intelligence — Phase 6</span>
            </div>
            <p className="text-xs text-gray-500">
              Phase 6 will connect real performance data, trend APIs, and competitor monitoring to generate fully dynamic suggestions based on what's actually working.
            </p>
          </div>
        </div>
      )}

      {/* Tab: 30-Day Planner */}
      {activeTab === 'planner' && (
        <div>
          {!planGenerated ? (
            <div className="max-w-lg">
              <p className="text-sm text-gray-400 mb-5">
                Generate a structured 30-day content plan with themes, content types, channels, and goals.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Primary audience</label>
                  <div className="flex flex-wrap gap-2">
                    {['families', 'older adults', 'carers', 'healthcare', 'B2B'].map(a => (
                      <button
                        key={a}
                        onClick={() => setPlannerAudience(a)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          plannerAudience === a
                            ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                            : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Campaign focus (optional)</label>
                  <Textarea
                    placeholder="e.g. Q2 product launch, Carer awareness month, Summer safety..."
                    value={plannerFocus}
                    onChange={e => setPlannerFocus(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={generatePlan}
                  disabled={generating}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating plan...</>
                  ) : (
                    <><Calendar className="w-4 h-4 mr-2" />Generate 30-Day Plan</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">30-Day plan generated</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setPlanGenerated(false); setPlan([]); }}
                    className="text-gray-500 hover:text-gray-300 h-7 text-xs"
                  >
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onCreateCampaign({ outputTypes: ['social_post', 'blog', 'email'], topic: plannerFocus || '30-day content plan' })}
                    className="bg-violet-600 hover:bg-violet-500 text-white h-7 text-xs"
                  >
                    Launch as Campaign
                  </Button>
                </div>
              </div>

              {/* Week views */}
              {[1, 2, 3, 4].map(week => {
                const weekItems = plan.filter(p => p.week === week);
                const theme = weekItems[0]?.theme;
                return (
                  <div key={week} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Week {week}</span>
                      <span className="text-xs text-gray-600">—</span>
                      <span className="text-xs text-gray-400">{theme}</span>
                    </div>
                    <div className="space-y-2">
                      {weekItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/40 border border-gray-800/60 rounded-xl">
                          <div className="text-xs text-gray-600 w-12 shrink-0">Day {item.day}</div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-300 line-clamp-1">{item.topic}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                              {item.content_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-600">{item.channel}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              item.goal === 'Awareness' ? 'text-blue-400 bg-blue-900/20'
                              : item.goal === 'Engagement' ? 'text-orange-400 bg-orange-900/20'
                              : 'text-green-400 bg-green-900/20'
                            }`}>
                              {item.goal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audiences */}
      {activeTab === 'audience' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            Riven adapts messaging tone, language, and format for each audience segment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AUDIENCE_SEGMENTS.map(({ id, label, color }) => (
              <div key={id} className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-5">
                <div className={`text-sm font-semibold mb-2 ${color}`}>{label}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  {id === 'families_elderly' && <>
                    <div>Tone: warm, reassuring, practical</div>
                    <div>Best channels: Facebook, email, YouTube</div>
                    <div>Top content: guides, testimonials, explainers</div>
                  </>}
                  {id === 'older_adults' && <>
                    <div>Tone: clear, simple, empowering</div>
                    <div>Best channels: Facebook, email</div>
                    <div>Top content: simple how-tos, reassurance</div>
                  </>}
                  {id === 'carers' && <>
                    <div>Tone: empathetic, supportive, practical</div>
                    <div>Best channels: Facebook groups, LinkedIn, email</div>
                    <div>Top content: tips, resources, stories</div>
                  </>}
                  {id === 'healthcare' && <>
                    <div>Tone: professional, evidence-based</div>
                    <div>Best channels: LinkedIn, email</div>
                    <div>Top content: clinical use cases, data, B2B offers</div>
                  </>}
                  {id === 'organisations' && <>
                    <div>Tone: formal, ROI-focused</div>
                    <div>Best channels: LinkedIn, email, direct</div>
                    <div>Top content: case studies, pricing guides, demos</div>
                  </>}
                  {id === 'b2b' && <>
                    <div>Tone: strategic, partnership-focused</div>
                    <div>Best channels: LinkedIn, email</div>
                    <div>Top content: white papers, partner proposals</div>
                  </>}
                </div>
                <Button
                  size="sm"
                  onClick={() => onCreateCampaign({ outputTypes: ['social_post', 'email'], topic: `Campaign for ${label}` })}
                  className="mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 h-7 text-xs w-full"
                >
                  Create campaign for this segment
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RivenStrategyBrain;
