import React, { useState } from 'react';
import { Sparkles, Heart, Smile, Bookmark, HelpCircle, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import type { LittleThings, MoodType } from '../../types';
import { MOODS } from '../../utils/initialData';

interface LittleDetailsSectionProps {
  mood?: MoodType;
  littleThings?: LittleThings;
  onUpdateMood: (mood?: MoodType) => void;
  onUpdateLittleThings: (updates: Partial<LittleThings>) => void;
}

export const LittleDetailsSection: React.FC<LittleDetailsSectionProps> = ({
  mood,
  littleThings = {},
  onUpdateMood,
  onUpdateLittleThings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeMoodMeta = MOODS.find((m) => m.id === mood);

  return (
    <div className="space-y-6 pt-4 border-t border-theme-border-light">
      {/* Mood Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif text-sm tracking-wide text-theme-muted flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-theme-accent" />
            <span>Today I felt...</span>
          </span>
          {mood && (
            <button
              onClick={() => onUpdateMood(undefined)}
              className="text-[11px] font-serif text-theme-muted hover:text-theme-text transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateMood(isSelected ? undefined : m.id)}
                title={m.poeticDescription}
                className={`group px-3.5 py-1.5 rounded-full text-xs font-serif transition-all duration-300 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-theme-accent/20 border-theme-accent text-theme-highlight shadow-glow scale-[1.03]'
                    : 'bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text hover:border-theme-border'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {activeMoodMeta && (
          <p className="mt-2 text-xs font-serif italic text-theme-highlight/80 animate-fade-in pl-1">
            "{activeMoodMeta.poeticDescription}"
          </p>
        )}
      </div>

      {/* Little Things Accordion */}
      <div className="rounded-2xl border border-theme-border-light bg-black/15 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-theme-accent" />
            <span className="font-serif text-sm font-medium text-theme-text">
              Little things & reflections
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-theme-muted font-serif">
            <span>{isExpanded ? 'Hide prompts' : 'Optional prompts'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 pt-2 space-y-4 border-t border-theme-border-light/40 animate-fade-in">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-serif text-theme-muted">
                <Smile className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Something that made me smile</span>
              </label>
              <input
                type="text"
                value={littleThings.smiled || ''}
                onChange={(e) => onUpdateLittleThings({ smiled: e.target.value })}
                placeholder="A warm beam of sun, a kind message..."
                className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs text-theme-text font-serif placeholder:italic focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-serif text-theme-muted">
                <Bookmark className="w-3.5 h-3.5 text-sky-400/80" />
                <span>Something I want to remember</span>
              </label>
              <input
                type="text"
                value={littleThings.remember || ''}
                onChange={(e) => onUpdateLittleThings({ remember: e.target.value })}
                placeholder="The feeling of the air, a whisper..."
                className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs text-theme-text font-serif placeholder:italic focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-serif text-theme-muted">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400/80" />
                <span>Something I wish had happened</span>
              </label>
              <input
                type="text"
                value={littleThings.wish || ''}
                onChange={(e) => onUpdateLittleThings({ wish: e.target.value })}
                placeholder="A conversation that never took place..."
                className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs text-theme-text font-serif placeholder:italic focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-serif text-theme-muted">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400/80" />
                <span>Something I learned today</span>
              </label>
              <input
                type="text"
                value={littleThings.learned || ''}
                onChange={(e) => onUpdateLittleThings({ learned: e.target.value })}
                placeholder="A quiet truth about myself or the world..."
                className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs text-theme-text font-serif placeholder:italic focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
