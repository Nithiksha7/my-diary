import React, { useState } from 'react';
import { History, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import { parseDateKey } from '../../utils/dateUtils';

interface OnThisDaySectionProps {
  entries: DiaryEntry[];
  onNavigateToDate: (dateKey: string) => void;
}

export const OnThisDaySection: React.FC<OnThisDaySectionProps> = ({
  entries,
  onNavigateToDate,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!entries || entries.length === 0) return null;

  return (
    <div className="rounded-3xl border border-theme-accent/30 bg-gradient-to-r from-theme-card via-black/40 to-theme-card p-5 shadow-journal relative overflow-hidden my-6 animate-fade-in">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-theme-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 border-b border-theme-border-light">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-theme-accent/15 border border-theme-accent/30 text-theme-highlight">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest text-theme-accent uppercase font-semibold">
                Nostalgic Flashback
              </span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <h3 className="font-serif font-bold text-base text-theme-text">
              On this day in previous years...
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-4">
          {entries.map((entry) => {
            const entryYear = parseDateKey(entry.date).getFullYear();
            return (
              <div
                key={entry.date}
                className="group relative bg-black/25 hover:bg-white/5 border border-theme-border-light hover:border-theme-accent/50 rounded-2xl p-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-theme-highlight">
                      {entryYear}
                    </span>
                    {entry.mood && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-theme-muted font-serif capitalize">
                        felt {entry.mood}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onNavigateToDate(entry.date)}
                    className="flex items-center gap-1 text-xs font-serif text-theme-accent hover:text-theme-highlight group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Read full entry</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {entry.oneSentence ? (
                  <p className="font-serif italic text-sm text-theme-text/90 leading-relaxed mb-2">
                    “{entry.oneSentence}”
                  </p>
                ) : (
                  <p className="font-serif italic text-sm text-theme-text/80 line-clamp-2 leading-relaxed mb-2">
                    {entry.content}
                  </p>
                )}

                {entry.photos && entry.photos.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-theme-border-light/30">
                    <img
                      src={entry.photos[0].url}
                      alt="Past memory"
                      className="w-12 h-12 object-cover rounded-lg border border-white/10 shadow-sm"
                    />
                    <span className="text-[11px] font-handwritten text-lg text-theme-muted">
                      {entry.photos[0].caption || 'Photo attached from that day'}
                    </span>
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
