import React, { useState } from 'react';
import { Sparkles, Plus, Check, Trash2, X, Compass, Palette, BookOpen, Flame, Feather, SunMedium } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { DreamCategory } from '../../types';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';

const CATEGORIES: Array<{ id: DreamCategory; label: string; icon: React.ReactNode }> = [
  { id: 'places', label: 'Places I want to see', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'experiences', label: 'Things I want to experience', icon: <SunMedium className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Things I want to learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'try', label: 'Things I want to try', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'little', label: 'Little dreams', icon: <Feather className="w-3.5 h-3.5" /> },
  { id: 'big', label: 'Big dreams', icon: <Palette className="w-3.5 h-3.5" /> },
];

export const SomedayPage: React.FC = () => {
  const { somedayDreams, addSomedayDream, toggleSomedayDream, deleteSomedayDream } = useDiary();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DreamCategory | 'all'>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DreamCategory>('places');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState('');

  const handleCreateDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSomedayDream({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      imageUrl: imagePreview || undefined,
      imageFile,
      targetDate: targetDate.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setTargetDate('');
    setIsAdding(false);
  };

  const filteredDreams = selectedCategory === 'all'
    ? somedayDreams
    : somedayDreams.filter((d) => d.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 block mb-1">
            Wishes & Aspirations
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            SOMEDAY
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 drop-shadow">
            Things I hope life lets me experience.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-bold bg-amber-500/30 text-white border border-amber-400 hover:bg-amber-500/50 transition-all shadow-glow hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add a Dream</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-serif font-bold border whitespace-nowrap transition-all shadow-md ${
            selectedCategory === 'all'
              ? 'bg-amber-500/40 border-amber-300 text-white shadow-glow ring-2 ring-amber-400/40'
              : 'bg-black/50 border-white/20 text-white hover:border-white'
          }`}
        >
          All Dreams ({somedayDreams.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = somedayDreams.filter((d) => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-bold border whitespace-nowrap transition-all shadow-md ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/40 border-amber-300 text-white shadow-glow ring-2 ring-amber-400/40'
                  : 'bg-black/50 border-white/20 text-white hover:border-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {count > 0 && <span className="opacity-80 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Add Dream Form Modal */}
      {isAdding && (
        <form
          onSubmit={handleCreateDream}
          className="p-6 sm:p-8 rounded-3xl glass-panel border border-amber-400/40 space-y-6 shadow-2xl bg-black/75 max-w-2xl mx-auto animate-fade-in backdrop-blur-xl text-white"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif font-extrabold text-xl text-white">
                Add a Someday Wish
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              What do you hope to experience? *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. See the Northern Lights in Norway, Learn to play cello..."
              className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-3 text-sm font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-amber-400"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 p-3 rounded-xl border text-xs font-serif font-bold transition-all text-left ${
                    category === cat.id
                      ? 'bg-amber-500/40 border-amber-300 text-white shadow-glow'
                      : 'bg-black/50 border-white/20 text-white hover:border-white'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Notes or why this matters to you (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The feeling, season, or memory you imagine..."
              rows={3}
              className="w-full bg-black/60 border border-white/30 rounded-2xl p-4 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Target season / timeframe (optional)
            </label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="e.g. Autumn 2027, Before 30, Sometime in this life..."
              className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2.5 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Inspirational Photograph Upload Area */}
          <PhotoUploadPicker
            label="Inspirational Photograph"
            required={false}
            file={imageFile}
            previewUrl={imagePreview}
            onFileSelect={(file, objectUrl) => {
              setImageFile(file);
              setImagePreview(objectUrl);
            }}
            onFileRemove={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            themeAccent="amber"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-5 py-2 rounded-full text-xs font-serif font-bold text-white hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-serif text-xs font-extrabold hover:brightness-110 shadow-glow transition-all"
            >
              Keep in Someday
            </button>
          </div>
        </form>
      )}

      {/* Dreams List / Cards */}
      {filteredDreams.length === 0 ? (
        /* Soulful, clean empty state */
        <div className="p-16 text-center rounded-3xl glass-panel border border-dashed border-white/30 max-w-lg mx-auto bg-black/60 space-y-4 backdrop-blur-xl text-white">
          <div className="p-4 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 w-14 h-14 mx-auto flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-extrabold text-2xl text-white">
              Your dreams and wishes will live here.
            </h3>
            <p className="font-serif font-bold italic text-sm text-white/90 max-w-xs mx-auto leading-relaxed">
              Add the experiences, journeys, and small wonders you hope to experience someday.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-serif font-extrabold bg-amber-500/30 hover:bg-amber-500/50 text-white border border-amber-400 transition-all shadow-glow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add a Dream</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDreams.map((dream) => {
            const catMeta = CATEGORIES.find((c) => c.id === dream.category);

            return (
              <div
                key={dream.id}
                className={`p-6 rounded-3xl glass-panel border transition-all duration-300 flex flex-col justify-between group shadow-xl ${
                  dream.completed
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-white'
                    : 'border-white/20 hover:border-amber-400 bg-black/60 backdrop-blur-xl text-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-xs font-serif font-bold text-amber-300">
                      {catMeta?.icon}
                      <span>{catMeta?.label}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteSomedayDream(dream.id)}
                      className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete dream"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Optional Dream Photograph */}
                  {dream.imageUrl && (
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/15 my-2 shadow-md bg-stone-900">
                      <img
                        src={dream.imageUrl}
                        alt={dream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className={`font-serif font-extrabold text-xl leading-snug ${dream.completed ? 'line-through text-white/70' : 'text-white'}`}>
                      {dream.title}
                    </h3>
                    {dream.description && (
                      <p className="font-serif font-bold italic text-xs text-white/90 mt-1 leading-relaxed">
                        {dream.description}
                      </p>
                    )}
                  </div>

                  {dream.targetDate && (
                    <div className="text-xs font-mono font-bold text-amber-300">
                      Target: {dream.targetDate}
                    </div>
                  )}
                </div>

                {/* "Something I finally lived" toggle button */}
                <div className="pt-4 mt-3 border-t border-white/15 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSomedayDream(dream.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition-all ${
                      dream.completed
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                        : 'bg-black/40 hover:bg-black/60 text-white border border-white/30'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${dream.completed ? 'bg-emerald-400 text-slate-950 border-emerald-400' : 'border-white/50'}`}>
                      {dream.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{dream.completed ? 'Something I finally lived ✦' : 'Mark as lived'}</span>
                  </button>

                  {dream.completedAt && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Lived {dream.completedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
