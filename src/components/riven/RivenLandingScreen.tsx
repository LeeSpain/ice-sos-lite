import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video, Share2, Mail, FileText, Megaphone, Layers,
  ChevronRight, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';

export type CreationType = 'video' | 'social_post' | 'email' | 'blog' | 'ads' | 'full_campaign';

interface CreationOption {
  id: CreationType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    id: 'video',
    label: 'Video',
    description: 'Promo videos, explainers, social reels, walkthroughs',
    icon: Video,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400',
    badge: 'Phase 2',
  },
  {
    id: 'social_post',
    label: 'Social Post',
    description: 'Captions, hashtags, multi-platform post sets',
    icon: Share2,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400',
  },
  {
    id: 'email',
    label: 'Email Campaign',
    description: 'Sequences, newsletters, product launches',
    icon: Mail,
    color: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400',
  },
  {
    id: 'blog',
    label: 'Blog / Article',
    description: 'SEO articles, features, educational content',
    icon: FileText,
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400',
  },
  {
    id: 'ads',
    label: 'Ads',
    description: 'Google, Meta, LinkedIn ad copy and creatives',
    icon: Megaphone,
    color: 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400',
  },
  {
    id: 'full_campaign',
    label: 'Full Campaign',
    description: 'All channels — video, posts, email, blog, ads in one run',
    icon: Layers,
    color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400',
    badge: 'Recommended',
  },
];

interface RivenLandingScreenProps {
  onStart: (types: CreationType[]) => void;
}

const RivenLandingScreen: React.FC<RivenLandingScreenProps> = ({ onStart }) => {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selected, setSelected] = useState<CreationType[]>([]);

  const toggle = (id: CreationType) => {
    if (!multiSelectMode) {
      onStart([id]);
      return;
    }
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(CREATION_OPTIONS.map(o => o.id));
  };

  const isSelected = (id: CreationType) => selected.includes(id);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-violet-400" />
          <span className="text-violet-400 text-sm font-medium tracking-widest uppercase">Riven</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          What do you want to create?
        </h1>
        <p className="text-gray-400 text-lg">
          Choose one type or switch to multi-select to build a full campaign.
        </p>
      </div>

      {/* Multi-select toggle */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-gray-400">Single item</span>
        <button
          onClick={() => {
            setMultiSelectMode(!multiSelectMode);
            setSelected([]);
          }}
          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
        >
          {multiSelectMode
            ? <ToggleRight className="w-8 h-8 text-violet-400" />
            : <ToggleLeft className="w-8 h-8 text-gray-500" />
          }
        </button>
        <span className={`text-sm transition-colors ${multiSelectMode ? 'text-violet-400 font-medium' : 'text-gray-400'}`}>
          Multi-select
        </span>
      </div>

      {/* Creation options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {CREATION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const sel = isSelected(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              className={`
                relative text-left p-6 rounded-xl border bg-gradient-to-br transition-all duration-200
                ${option.color}
                ${sel ? 'ring-2 ring-violet-400 border-violet-400 scale-[1.02]' : ''}
                group
              `}
            >
              {option.badge && (
                <Badge
                  variant="secondary"
                  className={`absolute top-3 right-3 text-xs ${
                    option.badge === 'Recommended'
                      ? 'bg-violet-500/30 text-violet-300 border-violet-500/40'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {option.badge}
                </Badge>
              )}
              <Icon className="w-8 h-8 text-white mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="font-semibold text-white text-lg mb-1">{option.label}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{option.description}</div>

              {!multiSelectMode && (
                <div className="mt-4 flex items-center gap-1 text-gray-400 group-hover:text-white transition-colors text-sm">
                  Start <ChevronRight className="w-4 h-4" />
                </div>
              )}

              {multiSelectMode && sel && (
                <div className="absolute top-3 left-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Multi-select action bar */}
      {multiSelectMode && (
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={selectAll}
            className="text-sm text-violet-400 hover:text-violet-300 underline"
          >
            Select all
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-gray-500 hover:text-gray-300 underline"
          >
            Clear
          </button>
          <Button
            onClick={() => selected.length > 0 && onStart(selected)}
            disabled={selected.length === 0}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8"
          >
            Build Campaign ({selected.length} selected)
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Bottom hint */}
      <p className="mt-12 text-xs text-gray-600 text-center">
        Riven — AI Marketing, Media & Publishing Engine for ICE SOS Lite
      </p>
    </div>
  );
};

export default RivenLandingScreen;
