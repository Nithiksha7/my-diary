import React, { useState } from 'react';
import { Headphones, MapPin, Coffee, BookOpen, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { CurrentlyInfo } from '../../types';

interface CurrentlySectionProps {
  currently?: CurrentlyInfo;
  onUpdateCurrently: (updates: Partial<CurrentlyInfo>) => void;
}

export const CurrentlySection: React.FC<CurrentlySectionProps> = ({
  currently = {},
  onUpdateCurrently,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAnyData = Boolean(
    currently.listening ||
    currently.location ||
    currently.having ||
    currently.reading ||
    currently.thinking
  );

  return (
    <div className="rounded-2xl border border-theme-border-light bg-black/15 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-theme-accent" />
          <span className="font-serif text-sm font-medium text-theme-text">
            Currently...
          </span>
          {hasAnyData && !isExpanded && (
            <span className="text-[11px] text-theme-accent font-serif italic truncate max-w-[200px]">
              {currently.location || currently.having || currently.reading || 'Recorded'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-theme-muted font-serif">
          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-theme-border-light/40 animate-fade-in text-xs">
          {/* 🎵 Listening to */}
          <div className="flex items-center gap-2 bg-white/5 border border-theme-border-light rounded-xl px-3 py-2">
            <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] text-theme-muted font-mono uppercase block">Listening to</span>
              <input
                type="text"
                value={currently.listening || ''}
                onChange={(e) => onUpdateCurrently({ listening: e.target.value })}
                placeholder="Song or album title..."
                className="w-full bg-transparent text-theme-text font-serif focus:outline-none placeholder:text-theme-muted/50"
              />
            </div>
          </div>

          {/* 📍 Somewhere */}
          <div className="flex items-center gap-2 bg-white/5 border border-theme-border-light rounded-xl px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] text-theme-muted font-mono uppercase block">Somewhere</span>
              <input
                type="text"
                value={currently.location || ''}
                onChange={(e) => onUpdateCurrently({ location: e.target.value })}
                placeholder="By the window, cafe..."
                className="w-full bg-transparent text-theme-text font-serif focus:outline-none placeholder:text-theme-muted/50"
              />
            </div>
          </div>

          {/* ☕ Having */}
          <div className="flex items-center gap-2 bg-white/5 border border-theme-border-light rounded-xl px-3 py-2">
            <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] text-theme-muted font-mono uppercase block">Having</span>
              <input
                type="text"
                value={currently.having || ''}
                onChange={(e) => onUpdateCurrently({ having: e.target.value })}
                placeholder="Warm tea, black coffee..."
                className="w-full bg-transparent text-theme-text font-serif focus:outline-none placeholder:text-theme-muted/50"
              />
            </div>
          </div>

          {/* 📖 Reading */}
          <div className="flex items-center gap-2 bg-white/5 border border-theme-border-light rounded-xl px-3 py-2">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] text-theme-muted font-mono uppercase block">Reading</span>
              <input
                type="text"
                value={currently.reading || ''}
                onChange={(e) => onUpdateCurrently({ reading: e.target.value })}
                placeholder="Book or poem title..."
                className="w-full bg-transparent text-theme-text font-serif focus:outline-none placeholder:text-theme-muted/50"
              />
            </div>
          </div>

          {/* 💭 Thinking about */}
          <div className="col-span-1 sm:col-span-2 flex items-center gap-2 bg-white/5 border border-theme-border-light rounded-xl px-3 py-2">
            <MessageCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div className="w-full">
              <span className="text-[10px] text-theme-muted font-mono uppercase block">Thinking about</span>
              <input
                type="text"
                value={currently.thinking || ''}
                onChange={(e) => onUpdateCurrently({ thinking: e.target.value })}
                placeholder="A quiet wonder, someone far away, the future..."
                className="w-full bg-transparent text-theme-text font-serif focus:outline-none placeholder:text-theme-muted/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
