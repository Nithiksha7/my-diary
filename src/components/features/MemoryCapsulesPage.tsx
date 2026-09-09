import React, { useState } from 'react';
import { Box, Plus, Quote, Music, FileText, Sparkles, Trash2, ArrowLeft, Camera } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { CapsuleItem } from '../../types';

export const MemoryCapsulesPage: React.FC = () => {
  const { capsules, addCapsule, addCapsuleItem, deleteCapsule } = useDiary();
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string | null>(null);
  const [isCreatingCapsule, setIsCreatingCapsule] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // New capsule form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80');

  // New item form
  const [itemType, setItemType] = useState<CapsuleItem['type']>('quote');
  const [itemContent, setItemContent] = useState('');
  const [itemExtra, setItemExtra] = useState('');

  const selectedCapsule = capsules.find((c) => c.id === selectedCapsuleId) || null;

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCapsule({
      title: newTitle.trim(),
      description: newDesc.trim(),
      coverPhoto: newCover || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
      themeColor: '#38bdf8',
      items: [],
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreatingCapsule(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapsule || !itemContent.trim()) return;

    addCapsuleItem(selectedCapsule.id, {
      type: itemType,
      content: itemContent.trim(),
      extra: itemExtra.trim(),
    });

    setItemContent('');
    setItemExtra('');
    setIsAddingItem(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-8 space-y-8 animate-fade-in text-theme-text">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-border-light">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
                Treasured Moments
              </span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400/80" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-theme-text mt-0.5">
              Memory Capsules & Scrapbooks
            </h1>
            <p className="font-serif italic text-sm text-theme-muted mt-1">
              Curated collections of songs, polaroids, whispered quotes, and fragments of moments you want to keep forever.
            </p>
          </div>
        </div>

        {!selectedCapsule && !isCreatingCapsule && (
          <button
            onClick={() => setIsCreatingCapsule(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-serif bg-sky-500/20 text-sky-200 border border-sky-500/40 hover:bg-sky-500/30 transition-all shadow-glow hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Memory Capsule</span>
          </button>
        )}
      </div>

      {/* Viewing a specific Capsule */}
      {selectedCapsule ? (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCapsuleId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-serif text-theme-muted hover:text-theme-text bg-black/20 hover:bg-black/40 border border-theme-border-light transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all capsules</span>
            </button>

            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-serif bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scrapbook Artifact</span>
            </button>
          </div>

          {/* Capsule Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-theme-border-light p-8 sm:p-12 bg-black/40 shadow-journal min-h-[220px] flex flex-col justify-end">
            {selectedCapsule.coverPhoto && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                style={{ backgroundImage: `url(${selectedCapsule.coverPhoto})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-300">
                Capsule Archive • Created {selectedCapsule.createdAt} • {selectedCapsule.items.length} Artifacts
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-1 mb-3">
                {selectedCapsule.title}
              </h2>
              {selectedCapsule.description && (
                <p className="font-serif italic text-base text-stone-300 max-w-2xl leading-relaxed">
                  {selectedCapsule.description}
                </p>
              )}
            </div>
          </div>

          {/* Add Item Form */}
          {isAddingItem && (
            <form onSubmit={handleAddItem} className="p-6 rounded-3xl glass-panel border border-sky-500/30 space-y-4 animate-fade-in shadow-journal">
              <div className="flex justify-between items-center pb-2 border-b border-theme-border-light">
                <span className="font-serif font-semibold text-sm text-sky-300">
                  Add Artifact to “{selectedCapsule.title}”
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="text-xs font-serif text-theme-muted hover:text-theme-text"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                {(['quote', 'photo', 'song', 'note'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemType(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-serif capitalize border transition-all ${
                      itemType === type
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-glow'
                        : 'bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  value={itemContent}
                  onChange={(e) => setItemContent(e.target.value)}
                  placeholder={
                    itemType === 'photo'
                      ? 'Image URL (e.g. Unsplash photo)...'
                      : itemType === 'song'
                      ? 'Song Title & Track...'
                      : itemType === 'quote'
                      ? 'Quote or words spoken...'
                      : 'Memory note or reflections...'
                  }
                  className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-3 text-sm font-serif text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={itemExtra}
                  onChange={(e) => setItemExtra(e.target.value)}
                  placeholder={
                    itemType === 'photo'
                      ? 'Photo caption or date...'
                      : itemType === 'song'
                      ? 'Artist name or album...'
                      : itemType === 'quote'
                      ? 'Who said it or where...'
                      : 'Additional tags / location...'
                  }
                  className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-3 text-sm font-serif text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2 rounded-full text-xs font-serif text-theme-muted hover:text-theme-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-sky-400 text-slate-950 font-serif text-xs font-bold hover:brightness-110 shadow-glow"
                >
                  Add to Capsule
                </button>
              </div>
            </form>
          )}

          {/* Artifacts Scrapbook Grid */}
          {selectedCapsule.items.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-theme-border-light">
              <Camera className="w-10 h-10 text-theme-muted mx-auto mb-3 opacity-60" />
              <h3 className="font-serif font-bold text-lg text-theme-text">This capsule is currently empty</h3>
              <p className="font-serif italic text-sm text-theme-muted mt-1 max-w-md mx-auto">
                Begin preserving fragments of this time by clicking “Add Scrapbook Artifact” above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCapsule.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl glass-panel border border-theme-border-light hover:border-theme-border transition-all duration-300 flex flex-col justify-between shadow-journal"
                >
                  <div>
                    {item.type === 'quote' && (
                      <div className="space-y-3">
                        <Quote className="w-5 h-5 text-amber-300 opacity-80" />
                        <p className="font-serif italic text-base text-theme-text leading-relaxed">
                          “{item.content}”
                        </p>
                        {item.extra && (
                          <span className="text-xs font-mono text-theme-muted block text-right">
                            — {item.extra}
                          </span>
                        )}
                      </div>
                    )}

                    {item.type === 'photo' && (
                      <div className="space-y-3">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900 border border-white/10 shadow-md">
                          <img src={item.content} alt="Capsule photo" className="w-full h-full object-cover" />
                        </div>
                        {item.extra && (
                          <p className="font-handwritten text-xl text-theme-highlight text-center pt-1">
                            {item.extra}
                          </p>
                        )}
                      </div>
                    )}

                    {item.type === 'song' && (
                      <div className="space-y-2 p-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-theme-accent/15 border border-theme-accent/30 text-theme-accent">
                            <Music className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base text-theme-text">{item.content}</h4>
                            {item.extra && (
                              <p className="text-xs text-theme-muted font-serif italic">
                                by {item.extra}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'note' && (
                      <div className="space-y-2">
                        <FileText className="w-5 h-5 text-purple-300 opacity-80" />
                        <p className="font-serif text-sm leading-relaxed text-theme-text/90">
                          {item.content}
                        </p>
                        {item.extra && (
                          <span className="text-[11px] font-mono text-theme-muted block">
                            {item.extra}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isCreatingCapsule ? (
        <form onSubmit={handleCreateCapsule} className="p-8 rounded-3xl glass-panel border border-theme-border space-y-6 shadow-journal max-w-2xl mx-auto">
          <div className="flex justify-between items-center pb-4 border-b border-theme-border-light">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400">New Scrapbook</span>
              <h2 className="font-serif font-bold text-2xl text-theme-text mt-0.5">Create Memory Capsule</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingCapsule(false)}
              className="text-xs font-serif text-theme-muted hover:text-theme-text"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-serif text-theme-muted mb-2">Capsule Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Summer of 2026 by the Coast, Rainy Coffee Mornings..."
              className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-3 text-sm font-serif text-theme-text focus:outline-none focus:border-sky-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-serif text-theme-muted mb-2">Description & Emotional Context</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What feelings, people, or memories belong in this time capsule?..."
              rows={4}
              className="w-full bg-black/30 border border-theme-border-light rounded-2xl p-4 text-sm font-serif text-theme-text focus:outline-none focus:border-sky-400 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-serif text-theme-muted mb-2">Cover Photography URL</label>
            <input
              type="url"
              value={newCover}
              onChange={(e) => setNewCover(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-3 text-sm font-serif text-theme-text focus:outline-none focus:border-sky-400"
            />
            <p className="text-[11px] font-serif text-theme-muted mt-1">
              Use a real high-res Unsplash photo URL or personal image link.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-theme-border-light">
            <button
              type="button"
              onClick={() => setIsCreatingCapsule(false)}
              className="px-5 py-2.5 rounded-full text-xs font-serif text-theme-muted hover:text-theme-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-sky-400 text-slate-950 font-serif text-xs font-bold hover:brightness-110 shadow-glow"
            >
              Create Capsule
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              onClick={() => setSelectedCapsuleId(capsule.id)}
              className="group relative cursor-pointer rounded-3xl overflow-hidden border border-theme-border-light hover:border-sky-400/50 bg-black/30 transition-all duration-500 hover:scale-[1.02] shadow-journal flex flex-col"
            >
              <div
                className="aspect-[16/10] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 relative"
                style={{ backgroundImage: `url(${capsule.coverPhoto})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase">
                    {capsule.items.length} Artifacts
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-white group-hover:text-sky-200 transition-colors mt-0.5">
                    {capsule.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="font-serif italic text-xs text-theme-muted line-clamp-2 mb-4 leading-relaxed">
                  {capsule.description || 'A timeless collection of preserved memories.'}
                </p>

                <div className="flex items-center justify-between text-xs font-serif text-theme-muted pt-3 border-t border-theme-border-light/40">
                  <span className="text-sky-300 group-hover:underline">Open Scrapbook →</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCapsule(capsule.id);
                    }}
                    className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete capsule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
