import React, { useState } from 'react';
import { X, Box, Plus, Quote, Music, FileText } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { CapsuleItem, MemoryCapsule } from '../../types';

export const MemoryCapsuleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { capsules, addCapsule, addCapsuleItem, deleteCapsule } = useDiary();
  const [selectedCapsule, setSelectedCapsule] = useState<MemoryCapsule | null>(null);
  const [isCreatingCapsule, setIsCreatingCapsule] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // New capsule form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');

  // New item form
  const [itemType, setItemType] = useState<CapsuleItem['type']>('quote');
  const [itemContent, setItemContent] = useState('');
  const [itemExtra, setItemExtra] = useState('');

  if (!isOpen) return null;

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCapsule({
      title: newTitle.trim(),
      description: newDesc.trim(),
      coverPhoto: newCover,
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

    const updated = capsules.find((c) => c.id === selectedCapsule.id);
    if (updated) setSelectedCapsule(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-journal p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
                Treasured Moments
              </span>
              <h2 className="text-2xl font-serif font-bold text-theme-text mt-0.5">
                ✦ Memory Capsules
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedCapsule && !isCreatingCapsule && (
              <button
                onClick={() => setIsCreatingCapsule(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif bg-sky-500/20 text-sky-200 border border-sky-500/40 hover:bg-sky-500/30 transition-all shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Capsule</span>
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

        {/* Viewing a specific Capsule */}
        {selectedCapsule ? (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedCapsule(null)}
                className="text-xs font-serif text-theme-muted hover:text-theme-text flex items-center gap-1"
              >
                ← Back to all capsules
              </button>

              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-white/5 hover:bg-white/10 text-theme-text border border-theme-border-light"
              >
                <Plus className="w-3.5 h-3.5 text-theme-accent" />
                <span>Add Memory Artifact</span>
              </button>
            </div>

            {/* Capsule Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-theme-border-light p-6 sm:p-8 bg-black/40">
              {selectedCapsule.coverPhoto && (
                <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${selectedCapsule.coverPhoto})` }} />
              )}
              <div className="relative z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-theme-accent">
                  Created on {selectedCapsule.createdAt} • {selectedCapsule.items.length} artifacts
                </span>
                <h3 className="font-serif font-bold text-3xl text-theme-text mt-1 mb-2">
                  {selectedCapsule.title}
                </h3>
                <p className="font-serif italic text-sm text-theme-muted max-w-xl">
                  {selectedCapsule.description}
                </p>
              </div>
            </div>

            {/* Add Item Form */}
            {isAddingItem && (
              <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-black/30 border border-sky-500/30 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xs text-sky-300">Add to {selectedCapsule.title}</span>
                  <button type="button" onClick={() => setIsAddingItem(false)} className="text-xs font-serif text-theme-muted">Cancel</button>
                </div>

                <div className="flex gap-2">
                  {(['quote', 'photo', 'song', 'note'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setItemType(type)}
                      className={`px-3 py-1 rounded-full text-xs font-serif capitalize border ${
                        itemType === type
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                          : 'bg-white/5 border-theme-border-light text-theme-muted'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={itemContent}
                  onChange={(e) => setItemContent(e.target.value)}
                  placeholder={itemType === 'photo' ? 'Image URL...' : itemType === 'song' ? 'Song Title...' : 'Quote or memory note...'}
                  className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs font-serif text-theme-text focus:outline-none focus:border-sky-400"
                  required
                />

                <input
                  type="text"
                  value={itemExtra}
                  onChange={(e) => setItemExtra(e.target.value)}
                  placeholder="Author / Artist / Caption / Extra context..."
                  className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-xs font-serif text-theme-text focus:outline-none focus:border-sky-400"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-sky-400 text-slate-950 font-serif text-xs font-semibold hover:brightness-110"
                  >
                    Place in Capsule
                  </button>
                </div>
              </form>
            )}

            {/* Scrapbook Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCapsule.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-black/25 border border-theme-border-light hover:border-theme-border transition-all flex flex-col justify-between"
                >
                  <div>
                    {item.type === 'quote' && (
                      <div className="space-y-2">
                        <Quote className="w-4 h-4 text-amber-300 opacity-80" />
                        <p className="font-serif italic text-sm text-theme-text">
                          “{item.content}”
                        </p>
                        {item.extra && (
                          <span className="text-[11px] font-mono text-theme-muted block text-right">
                            — {item.extra}
                          </span>
                        )}
                      </div>
                    )}

                    {item.type === 'photo' && (
                      <div className="space-y-2">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900">
                          <img src={item.content} alt="Capsule photo" className="w-full h-full object-cover" />
                        </div>
                        {item.extra && (
                          <p className="font-handwritten text-lg text-theme-highlight">
                            {item.extra}
                          </p>
                        )}
                      </div>
                    )}

                    {item.type === 'song' && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-theme-accent" />
                          <span className="font-serif font-bold text-sm text-theme-text">{item.content}</span>
                        </div>
                        {item.extra && (
                          <span className="text-xs text-theme-muted font-serif italic block">
                            by {item.extra}
                          </span>
                        )}
                      </div>
                    )}

                    {item.type === 'note' && (
                      <div className="space-y-1">
                        <FileText className="w-4 h-4 text-purple-300 opacity-80" />
                        <p className="font-serif text-xs leading-relaxed text-theme-text/90">
                          {item.content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isCreatingCapsule ? (
          <form onSubmit={handleCreateCapsule} className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-serif text-sm text-theme-muted">Create a new Memory Capsule</span>
              <button type="button" onClick={() => setIsCreatingCapsule(false)} className="text-xs font-serif text-theme-muted">Cancel</button>
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">Capsule Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Summer of 2026 by the Coast..."
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-2 text-sm font-serif text-theme-text focus:outline-none focus:border-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">Description & Emotion</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What feelings or memories belong in this time capsule?..."
                rows={3}
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl p-4 text-xs font-serif text-theme-text focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">Cover Image URL</label>
              <input
                type="url"
                value={newCover}
                onChange={(e) => setNewCover(e.target.value)}
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-2 text-xs font-serif text-theme-text focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-sky-400 text-slate-950 font-serif text-xs font-semibold hover:brightness-110 shadow-glow"
              >
                Create Memory Capsule
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {capsules.map((capsule) => (
              <div
                key={capsule.id}
                onClick={() => setSelectedCapsule(capsule)}
                className="group relative cursor-pointer rounded-3xl overflow-hidden border border-theme-border-light hover:border-theme-accent bg-black/30 transition-all duration-500 hover:scale-[1.02] shadow-journal"
              >
                <div
                  className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 relative"
                  style={{ backgroundImage: `url(${capsule.coverPhoto})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase">
                      {capsule.items.length} Artifacts
                    </span>
                    <h3 className="font-serif font-bold text-xl text-white group-hover:text-sky-200 transition-colors">
                      {capsule.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-serif italic text-xs text-theme-muted line-clamp-2 mb-3">
                    {capsule.description}
                  </p>
                  <div className="flex items-center justify-between text-xs font-serif text-theme-muted pt-2 border-t border-theme-border-light/30">
                    <span>Explore Capsule →</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCapsule(capsule.id);
                      }}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Delete capsule"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
