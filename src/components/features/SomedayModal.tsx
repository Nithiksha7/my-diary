import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, Trash2, Compass, BookOpen, Flame, Feather, Palette, SunMedium } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiary } from '../../context/DiaryContext';
import type { DreamCategory } from '../../types';

const CATEGORIES: Array<{ id: DreamCategory; label: string; icon: React.ReactNode }> = [
  { id: 'places', label: 'Places I want to see', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'experiences', label: 'Things I want to experience', icon: <SunMedium className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Things I want to learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'try', label: 'Things I want to try', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'little', label: 'Little dreams', icon: <Feather className="w-3.5 h-3.5" /> },
  { id: 'big', label: 'Big dreams', icon: <Palette className="w-3.5 h-3.5" /> },
];

export const SomedayModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { somedayDreams, addSomedayDream, toggleSomedayDream, deleteSomedayDream } = useDiary();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState<DreamCategory>('places');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addSomedayDream({
      title: newTitle.trim(),
      category,
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#fbbf24', '#38bdf8', '#a78bfa'],
        });
      } catch {
        // ignore
      }
    }
    toggleSomedayDream(id);
  };

  const filteredDreams = somedayDreams.filter((d) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return d.completed;
    if (activeFilter === 'uncompleted') return !d.completed;
    return d.category === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-journal p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Wishes & Horizons
              </span>
              <h2 className="text-2xl font-serif font-bold text-theme-text mt-0.5">
                ✦ Someday
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dream</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-theme-muted font-serif italic mb-6 leading-relaxed">
          Things I hope life lets me experience.
        </p>

        {/* Add Dream Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 rounded-2xl bg-black/30 border border-amber-500/30 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <span className="font-serif text-xs text-amber-300">New Dream for Someday</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs font-serif text-theme-muted hover:text-theme-text"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. See the Northern Lights, Learn cello..."
              className="w-full bg-white/5 border border-theme-border-light rounded-xl px-4 py-2.5 text-sm font-serif text-theme-text focus:outline-none focus:border-amber-400"
              autoFocus
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1 rounded-full text-xs font-serif border transition-all ${
                      category === c.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-serif text-xs font-semibold hover:brightness-110 shadow-glow"
              >
                Preserve Dream
              </button>
            </div>
          </form>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-3 border-b border-theme-border-light/40">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-serif border ${
              activeFilter === 'all'
                ? 'bg-theme-accent/20 border-theme-accent text-theme-highlight'
                : 'bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text'
            }`}
          >
            All Dreams ({somedayDreams.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-serif flex items-center gap-1.5 border ${
                activeFilter === cat.id
                  ? 'bg-theme-accent/20 border-theme-accent text-theme-highlight'
                  : 'bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Dreams List */}
        {filteredDreams.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-theme-border-light text-theme-muted text-xs font-serif italic">
            Your dreams and wishes will live here.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDreams.map((dream) => {
              const catMeta = CATEGORIES.find((c) => c.id === dream.category);
              return (
                <div
                  key={dream.id}
                  className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    dream.completed
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200/80'
                      : 'bg-black/20 hover:bg-white/5 border-theme-border-light hover:border-theme-border text-theme-text'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(dream.id, dream.completed)}
                      className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        dream.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm'
                          : 'border-theme-muted/50 hover:border-amber-400 hover:scale-110'
                      }`}
                      title={dream.completed ? 'Something I finally lived (click to unmark)' : 'Mark as lived'}
                    >
                      {dream.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1">
                      <p
                        className={`font-serif text-sm leading-relaxed ${
                          dream.completed ? 'line-through opacity-70' : 'text-theme-text'
                        }`}
                      >
                        {dream.title}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-theme-muted">
                        {catMeta && (
                          <span className="flex items-center gap-1">
                            {catMeta.icon}
                            <span className="font-serif">{catMeta.label}</span>
                          </span>
                        )}
                        {dream.completed && dream.completedAt && (
                          <span className="text-emerald-400 font-serif italic">
                            • Something I finally lived on {dream.completedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteSomedayDream(dream.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-theme-muted hover:text-rose-400 transition-opacity"
                    title="Remove dream"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
