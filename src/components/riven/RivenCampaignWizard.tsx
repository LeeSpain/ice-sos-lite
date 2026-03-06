import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft, ChevronRight, Check,
  Video, Share2, Mail, FileText, Megaphone, Image, Captions, Scissors, BookOpen,
  Youtube, Instagram, Facebook, Linkedin, Globe, AtSign,
  Monitor, Smartphone, Square, Clock, Languages,
  Link, Upload, Cpu, Package, Film
} from 'lucide-react';
import type { CreationType } from './RivenLandingScreen';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CampaignFormData {
  // Step 1
  title: string;
  topic: string;
  goal: string;
  cta: string;
  target_audience: string;
  tone: string;
  primary_language: string;
  extra_languages: string[];
  // Step 2
  output_types: string[];
  // Step 3
  channels: string[];
  // Step 4
  format_preferences: {
    orientations: string[];
    lengths: string[];
    multilingual: boolean;
  };
  // Step 5
  asset_sources: string[];
}

interface WizardProps {
  initialTypes: CreationType[];
  onSubmit: (data: CampaignFormData) => void;
  onBack: () => void;
}

// ─── Option sets ─────────────────────────────────────────────────────────────

const OUTPUT_TYPES = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'social_post', label: 'Social Posts', icon: Share2 },
  { id: 'email', label: 'Email Sequence', icon: Mail },
  { id: 'blog', label: 'Blog Article', icon: FileText },
  { id: 'ad', label: 'Ad Copy', icon: Megaphone },
  { id: 'thumbnail', label: 'Thumbnail Package', icon: Image },
  { id: 'subtitle', label: 'Subtitle Package', icon: Captions },
  { id: 'short_clip', label: 'Short Clips', icon: Scissors },
  { id: 'landing_page', label: 'Landing Page Copy', icon: BookOpen },
];

const VIDEO_CHANNELS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'instagram_reels', label: 'Instagram Reels', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Film },
  { id: 'facebook_video', label: 'Facebook Video', icon: Facebook },
  { id: 'linkedin_video', label: 'LinkedIn Video', icon: Linkedin },
];

const POST_CHANNELS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'twitter', label: 'X / Twitter', icon: AtSign },
];

const EMAIL_CHANNELS = [
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'product_launch', label: 'Product Launch' },
  { id: 'educational_series', label: 'Educational Series' },
  { id: 'nurture_sequence', label: 'Nurture Sequence' },
];

const WEBSITE_CHANNELS = [
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'landing_page', label: 'Landing Page', icon: Globe },
  { id: 'help_article', label: 'Help Article', icon: BookOpen },
];

const ORIENTATIONS = [
  { id: 'landscape', label: 'Landscape (16:9)', icon: Monitor },
  { id: 'portrait', label: 'Portrait (9:16)', icon: Smartphone },
  { id: 'square', label: 'Square (1:1)', icon: Square },
];

const LENGTHS = [
  { id: 'short', label: 'Short-form (< 60s / < 500 words)', icon: Clock },
  { id: 'medium', label: 'Medium (1–3 min / 500–1000 words)' },
  { id: 'long', label: 'Long-form (3+ min / 1000+ words)' },
];

const ASSET_SOURCES = [
  { id: 'website_pages', label: 'Existing website pages', icon: Globe },
  { id: 'app_pages', label: 'App pages / screenshots', icon: Monitor },
  { id: 'uploaded_images', label: 'Uploaded images', icon: Upload },
  { id: 'brand_media', label: 'Stored brand media', icon: Package },
  { id: 'existing_videos', label: 'Existing videos', icon: Video },
  { id: 'ai_generated', label: 'AI-generated scenes', icon: Cpu },
  { id: 'product_visuals', label: 'Product visuals', icon: Image },
  { id: 'mixed', label: 'Mixed mode', icon: Film },
];

const TONE_OPTIONS = ['professional', 'friendly', 'authoritative', 'empathetic', 'urgent', 'educational', 'conversational'];
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'nl', label: 'Dutch' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
];

const AUDIENCE_PRESETS = [
  'Families with elderly parents',
  'Older adults (65+)',
  'Family carers',
  'Healthcare professionals',
  'Care organisations',
  'B2B partners',
  'General public',
];

const GOAL_PRESETS = [
  'Increase brand awareness',
  'Drive app sign-ups',
  'Educate about emergency safety',
  'Build trust and credibility',
  'Launch a new feature',
  'Re-engage existing users',
  'Generate B2B leads',
];

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Basics', 'Output Types', 'Channels', 'Formats', 'Asset Sources'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
    {STEPS.map((step, i) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center gap-1">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
            ${i < current ? 'bg-violet-500 text-white' : i === current ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-gray-950' : 'bg-gray-800 text-gray-500'}
          `}>
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? 'text-violet-400' : i < current ? 'text-gray-400' : 'text-gray-600'}`}>
            {step}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-violet-500' : 'bg-gray-800'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Multi-select chip ────────────────────────────────────────────────────────

function ToggleChip({
  id, label, icon: Icon, selected, onToggle
}: { id: string; label: string; icon?: React.ElementType; selected: boolean; onToggle: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all
        ${selected
          ? 'bg-violet-600/30 border-violet-500 text-violet-300'
          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {selected && <Check className="w-3 h-3 ml-auto" />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{children}</p>;
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

const creationTypeToOutputTypes: Record<CreationType, string[]> = {
  video: ['video', 'thumbnail', 'subtitle', 'short_clip'],
  social_post: ['social_post'],
  email: ['email'],
  blog: ['blog'],
  ads: ['ad'],
  full_campaign: ['video', 'social_post', 'email', 'blog', 'ad', 'thumbnail'],
};

const RivenCampaignWizard: React.FC<WizardProps> = ({ initialTypes, onSubmit, onBack }) => {
  const defaultOutputTypes = Array.from(
    new Set(initialTypes.flatMap(t => creationTypeToOutputTypes[t]))
  );

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CampaignFormData>({
    title: '',
    topic: '',
    goal: '',
    cta: '',
    target_audience: '',
    tone: 'professional',
    primary_language: 'en',
    extra_languages: [],
    output_types: defaultOutputTypes,
    channels: [],
    format_preferences: { orientations: ['landscape'], lengths: ['medium'], multilingual: false },
    asset_sources: ['website_pages', 'ai_generated'],
  });

  const update = <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleArr = (key: 'output_types' | 'channels' | 'asset_sources', id: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? (prev[key] as string[]).filter(x => x !== id)
        : [...(prev[key] as string[]), id],
    }));
  };

  const toggleFormatPref = (key: 'orientations' | 'lengths', id: string) => {
    setForm(prev => ({
      ...prev,
      format_preferences: {
        ...prev.format_preferences,
        [key]: prev.format_preferences[key].includes(id)
          ? prev.format_preferences[key].filter((x: string) => x !== id)
          : [...prev.format_preferences[key], id],
      },
    }));
  };

  const canNext = (): boolean => {
    if (step === 0) return form.title.trim().length > 0 && form.topic.trim().length > 0;
    if (step === 1) return form.output_types.length > 0;
    if (step === 2) return form.channels.length > 0;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onSubmit(form);
  };

  const prev = () => {
    if (step === 0) onBack();
    else setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col px-6 py-12">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-violet-400 text-sm font-medium">New Campaign</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {STEPS[step]}
          </h2>
        </div>

        <StepIndicator current={step} />
        <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1 mb-8 bg-gray-800" />

        {/* ── Step content ── */}
        <div className="flex-1">

          {/* Step 1: Campaign Basics */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label className="text-gray-300 mb-1.5 block">Campaign name *</Label>
                <Input
                  placeholder="e.g. Spring Safety Awareness 2026"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-1.5 block">Topic / primary message *</Label>
                <Textarea
                  placeholder="e.g. Help families feel safe and prepared with ICE SOS Lite's emergency response features"
                  value={form.topic}
                  onChange={e => update('topic', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-1.5 block">Campaign goal</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {GOAL_PRESETS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => update('goal', g)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        form.goal === g
                          ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                          : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Or describe your own goal..."
                  value={form.goal}
                  onChange={e => update('goal', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Call-to-action</Label>
                  <Input
                    placeholder="e.g. Start your free trial"
                    value={form.cta}
                    onChange={e => update('cta', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Tone of voice</Label>
                  <Select value={form.tone} onValueChange={v => update('tone', v)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {TONE_OPTIONS.map(t => (
                        <SelectItem key={t} value={t} className="text-gray-300 capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 mb-1.5 block">Target audience</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AUDIENCE_PRESETS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => update('target_audience', a)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        form.target_audience === a
                          ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                          : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Or describe your audience..."
                  value={form.target_audience}
                  onChange={e => update('target_audience', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Primary language</Label>
                  <Select value={form.primary_language} onValueChange={v => update('primary_language', v)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {LANGUAGE_OPTIONS.map(l => (
                        <SelectItem key={l.code} value={l.code} className="text-gray-300">{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Also generate in</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_OPTIONS.filter(l => l.code !== form.primary_language).map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          const langs = form.extra_languages.includes(l.code)
                            ? form.extra_languages.filter(x => x !== l.code)
                            : [...form.extra_languages, l.code];
                          update('extra_languages', langs);
                        }}
                        className={`text-xs px-2 py-1 rounded border transition-all ${
                          form.extra_languages.includes(l.code)
                            ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                            : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Output Types */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Choose what Riven should generate. You can pick one or combine multiple output types.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {OUTPUT_TYPES.map(({ id, label, icon }) => (
                  <ToggleChip
                    key={id}
                    id={id}
                    label={label}
                    icon={icon}
                    selected={form.output_types.includes(id)}
                    onToggle={id => toggleArr('output_types', id)}
                  />
                ))}
              </div>
              {form.output_types.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Select at least one output type to continue.</p>
              )}
            </div>
          )}

          {/* Step 3: Channels */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">
                Choose the platforms and channels where this content will be published.
              </p>

              {form.output_types.some(t => ['video', 'short_clip'].includes(t)) && (
                <div>
                  <SectionLabel>Video Channels</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {VIDEO_CHANNELS.map(({ id, label, icon }) => (
                      <ToggleChip key={id} id={id} label={label} icon={icon}
                        selected={form.channels.includes(id)} onToggle={id => toggleArr('channels', id)} />
                    ))}
                  </div>
                </div>
              )}

              {form.output_types.includes('social_post') && (
                <div>
                  <SectionLabel>Social Post Channels</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {POST_CHANNELS.map(({ id, label, icon }) => (
                      <ToggleChip key={id} id={id} label={label} icon={icon}
                        selected={form.channels.includes(id)} onToggle={id => toggleArr('channels', id)} />
                    ))}
                  </div>
                </div>
              )}

              {form.output_types.includes('email') && (
                <div>
                  <SectionLabel>Email Channels</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {EMAIL_CHANNELS.map(({ id, label }) => (
                      <ToggleChip key={id} id={id} label={label}
                        selected={form.channels.includes(id)} onToggle={id => toggleArr('channels', id)} />
                    ))}
                  </div>
                </div>
              )}

              {form.output_types.some(t => ['blog', 'landing_page'].includes(t)) && (
                <div>
                  <SectionLabel>Website Channels</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {WEBSITE_CHANNELS.map(({ id, label, icon }) => (
                      <ToggleChip key={id} id={id} label={label} icon={icon}
                        selected={form.channels.includes(id)} onToggle={id => toggleArr('channels', id)} />
                    ))}
                  </div>
                </div>
              )}

              {form.channels.length === 0 && (
                <p className="text-xs text-red-400">Select at least one channel to continue.</p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {form.channels.map(ch => (
                  <Badge key={ch} variant="secondary" className="bg-violet-900/30 text-violet-300 border-violet-700">
                    {ch.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Format Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">
                Define the formats Riven should produce.
              </p>
              <div>
                <SectionLabel>Video / Image Orientation</SectionLabel>
                <div className="flex flex-wrap gap-3">
                  {ORIENTATIONS.map(({ id, label, icon }) => (
                    <ToggleChip key={id} id={id} label={label} icon={icon}
                      selected={form.format_preferences.orientations.includes(id)}
                      onToggle={id => toggleFormatPref('orientations', id)} />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel>Content Length</SectionLabel>
                <div className="flex flex-wrap gap-3">
                  {LENGTHS.map(({ id, label }) => (
                    <ToggleChip key={id} id={id} label={label}
                      selected={form.format_preferences.lengths.includes(id)}
                      onToggle={id => toggleFormatPref('lengths', id)} />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel>Multilingual Output</SectionLabel>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    format_preferences: {
                      ...prev.format_preferences,
                      multilingual: !prev.format_preferences.multilingual
                    }
                  }))}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    form.format_preferences.multilingual
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-gray-900 border-gray-700 text-gray-400'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-sm">Generate translated versions for each language selected</span>
                  {form.format_preferences.multilingual && <Check className="w-4 h-4 ml-auto" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Asset Sources */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Tell Riven where to pull source material from. It will use these to generate or gather assets for your campaign.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ASSET_SOURCES.map(({ id, label, icon }) => (
                  <ToggleChip key={id} id={id} label={label} icon={icon}
                    selected={form.asset_sources.includes(id)}
                    onToggle={id => toggleArr('asset_sources', id)} />
                ))}
              </div>

              {/* Summary card */}
              <div className="mt-6 p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-sm font-semibold text-white mb-3">Campaign summary</p>
                <div className="space-y-1.5 text-sm text-gray-400">
                  <div><span className="text-gray-500">Name:</span> {form.title}</div>
                  <div><span className="text-gray-500">Outputs:</span> {form.output_types.join(', ')}</div>
                  <div><span className="text-gray-500">Channels:</span> {form.channels.join(', ')}</div>
                  <div><span className="text-gray-500">Audience:</span> {form.target_audience || '—'}</div>
                  <div><span className="text-gray-500">Tone:</span> {form.tone}</div>
                  <div><span className="text-gray-500">Language:</span> {form.primary_language}{form.extra_languages.length > 0 ? ` + ${form.extra_languages.join(', ')}` : ''}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 mt-auto">
          <Button
            variant="ghost"
            onClick={prev}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 0 ? 'Back' : 'Previous'}
          </Button>
          <Button
            onClick={next}
            disabled={!canNext()}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8"
          >
            {step === STEPS.length - 1 ? 'Launch Campaign' : 'Next'}
            {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RivenCampaignWizard;
