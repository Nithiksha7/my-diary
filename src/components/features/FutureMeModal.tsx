import React, { useState } from 'react';
import { X, Moon, Lock, Unlock, Plus, Trash2, Send, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiary } from '../../context/DiaryContext';
import type { FutureLetter } from '../../types';
import { getTodayKey } from '../../utils/dateUtils';

export const FutureMeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { futureLetters, addFutureLetter, openFutureLetter, deleteFutureLetter } = useDiary();
  const [isComposing, setIsComposing] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [recipientNote, setRecipientNote] = useState('');
  const [sealColor, setSealColor] = useState('#b91c1c');

  if (!isOpen) return null;

  const todayKey = getTodayKey();

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addFutureLetter({
      title: title.trim(),
      content: content.trim(),
      unlockDate,
      sealColor,
      recipientNote: recipientNote.trim() || 'A letter from your past self.',
    });

    setTitle('');
    setContent('');
    setRecipientNote('');
    setIsComposing(false);
  };

  const handleOpenSealedLetter = async (letter: FutureLetter) => {
    const isReadyToUnlock = todayKey >= letter.unlockDate;
    let unsealed = letter;
    if (isReadyToUnlock && !letter.isOpened) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a78bfa', '#fb923c', '#38bdf8', '#fbbf24'],
        });
      } catch {}
      const res = await openFutureLetter(letter.id);
      if (res) {
        unsealed = res;
      }
    }
    setSelectedLetter(unsealed);
  };

  const WAX_COLORS = [
    { color: '#b91c1c', label: 'Crimson Red' },
    { color: '#b45309', label: 'Antique Gold' },
    { color: '#4338ca', label: 'Midnight Indigo' },
    { color: '#047857', label: 'Emerald Forest' },
    { color: '#701a75', label: 'Royal Plum' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-journal p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                Time Capsule & Vault
              </span>
              <h2 className="text-2xl font-serif font-bold text-theme-text mt-0.5">
                Future Me Letters
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isComposing && !selectedLetter && (
              <button
                onClick={() => setIsComposing(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif bg-purple-500/20 text-purple-200 border border-purple-500/40 hover:bg-purple-500/30 transition-all shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Letter</span>
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

        {/* Read Selected Letter View */}
        {selectedLetter ? (
          <div className="animate-fade-in space-y-6">
            <button
              onClick={() => setSelectedLetter(null)}
              className="text-xs font-serif text-theme-muted hover:text-theme-text flex items-center gap-1 mb-2"
            >
              ← Back to all letters
            </button>

            {todayKey < selectedLetter.unlockDate && !selectedLetter.isOpened ? (
              <div className="rounded-3xl border border-purple-500/30 bg-black/40 p-8 text-center relative overflow-hidden">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-white/20"
                  style={{ backgroundColor: selectedLetter.sealColor || '#b91c1c' }}
                >
                  <Lock className="w-8 h-8 text-amber-100" />
                </div>
                <h3 className="font-serif font-bold text-xl text-theme-text mb-2">
                  {selectedLetter.title}
                </h3>
                <p className="text-sm font-serif italic text-theme-muted max-w-md mx-auto mb-6">
                  {selectedLetter.recipientNote}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/30 text-purple-200 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sealed until {selectedLetter.unlockDate}</span>
                </div>
              </div>
            ) : (
              <div className="journal-paper p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                      Written on {selectedLetter.createdAt} • Opened on {selectedLetter.unlockDate}
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-theme-text mt-1">
                      {selectedLetter.title}
                    </h3>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-amber-100 shadow-md"
                    style={{ backgroundColor: selectedLetter.sealColor || '#b91c1c' }}
                    title="Broken Wax Seal"
                  >
                    <Unlock className="w-5 h-5" />
                  </div>
                </div>

                <div className="font-serif text-base sm:text-lg leading-relaxed text-theme-text/90 whitespace-pre-line">
                  {selectedLetter.content}
                </div>

                <div className="mt-8 pt-6 border-t border-theme-border-light flex justify-between items-center text-xs text-theme-muted font-serif">
                  <span className="italic">“Words preserved across time.”</span>
                  <button
                    onClick={() => {
                      deleteFutureLetter(selectedLetter.id);
                      setSelectedLetter(null);
                    }}
                    className="flex items-center gap-1 text-rose-400/80 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Letter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isComposing ? (
          <form onSubmit={handleCreateLetter} className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-serif text-sm text-theme-muted">
                Compose a letter to your future self
              </span>
              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="text-xs font-serif text-theme-muted hover:text-theme-text"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">
                Letter Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="To Myself in One Year..."
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-2.5 text-sm text-theme-text font-serif focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif text-theme-muted mb-1">
                  Unlock Date (When can this be opened?)
                </label>
                <input
                  type="date"
                  value={unlockDate}
                  min={todayKey}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-2 text-xs text-theme-text font-serif focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-theme-muted mb-1">
                  Wax Seal Stamp Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {WAX_COLORS.map((w) => (
                    <button
                      key={w.color}
                      type="button"
                      onClick={() => setSealColor(w.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        sealColor === w.color
                          ? 'border-white scale-110 shadow-glow'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: w.color }}
                      title={w.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">
                Recipient Note (Visible on the sealed envelope)
              </label>
              <input
                type="text"
                value={recipientNote}
                onChange={(e) => setRecipientNote(e.target.value)}
                placeholder="Open when you need to remember how far you've come..."
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl px-4 py-2 text-xs text-theme-text font-serif focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-theme-muted mb-1">
                Your Letter
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear Future Me, What are you doing today? Have you remembered to breathe?..."
                rows={8}
                className="w-full bg-black/30 border border-theme-border-light rounded-2xl p-4 text-sm text-theme-text font-serif leading-relaxed focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-purple-500 text-white font-serif text-xs font-medium hover:bg-purple-600 shadow-glow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Seal & Save Letter</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-theme-muted font-serif italic mb-4">
              Write letters to yourself that remain sealed in wax until a chosen date in the future.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {futureLetters.map((letter) => {
                const isReady = todayKey >= letter.unlockDate;
                return (
                  <div
                    key={letter.id}
                    onClick={() => handleOpenSealedLetter(letter)}
                    className="group relative cursor-pointer rounded-2xl border border-theme-border-light hover:border-purple-400/50 bg-black/25 hover:bg-white/5 p-5 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-amber-100 shadow"
                          style={{ backgroundColor: letter.sealColor || '#b91c1c' }}
                        >
                          {letter.isOpened ? (
                            <Unlock className="w-4 h-4" />
                          ) : isReady ? (
                            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-theme-text group-hover:text-purple-200 transition-colors">
                            {letter.title}
                          </h4>
                          <span className="text-[10px] text-theme-muted font-mono">
                            Written on {letter.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-theme-muted font-serif italic line-clamp-2 mb-3">
                      {letter.recipientNote || (letter.isOpened ? letter.content : 'Sealed time letter.')}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-theme-border-light/30 text-[11px] font-mono">
                      {letter.isOpened ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Unlock className="w-3 h-3" />
                          <span>Opened</span>
                        </span>
                      ) : isReady ? (
                        <span className="text-amber-300 font-semibold flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          <span>Ready to Open!</span>
                        </span>
                      ) : (
                        <span className="text-theme-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Unlocks {letter.unlockDate}</span>
                        </span>
                      )}

                      <span className="text-purple-300 font-serif text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Read →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
