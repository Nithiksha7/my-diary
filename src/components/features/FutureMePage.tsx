import React, { useState } from 'react';
import { Lock, Unlock, Plus, Trash2, Clock, Sparkles, Mail, X, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDiary } from '../../context/DiaryContext';
import type { FutureLetter } from '../../types';
import { getTodayKey } from '../../utils/dateUtils';

const WAX_SEALS = [
  { id: '#b91c1c', name: 'Crimson Wax', bg: 'bg-red-700' },
  { id: '#d97706', name: 'Amber Gold', bg: 'bg-amber-600' },
  { id: '#4338ca', name: 'Royal Indigo', bg: 'bg-indigo-700' },
  { id: '#047857', name: 'Emerald Wax', bg: 'bg-emerald-700' },
  { id: '#6b21a8', name: 'Midnight Purple', bg: 'bg-purple-800' },
];

export const FutureMePage: React.FC = () => {
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
  const [sealColor, setSealColor] = useState('#b91c1c');

  const todayKey = getTodayKey();

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addFutureLetter({
      title: title.trim(),
      content: content.trim(),
      unlockDate,
      sealColor,
    });

    setTitle('');
    setContent('');
    setIsComposing(false);
  };

  const handleOpenLetter = async (letter: FutureLetter) => {
    const isReady = todayKey >= letter.unlockDate;
    if (!isReady && !letter.isOpened) return;

    let unsealed = letter;
    if (!letter.isOpened && isReady) {
      const res = await openFutureLetter(letter.id);
      if (res) {
        unsealed = res;
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a78bfa', '#38bdf8', '#fb923c', '#d9b27e'],
        });
      } catch {
        // ignore
      }
    }
    setSelectedLetter({ ...unsealed, isOpened: true });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-300 block mb-1">
            Time Capsule Letters
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            FUTURE ME
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 drop-shadow">
            Letters from who you are today, to who you'll become.
          </p>
        </div>

        {!isComposing && !selectedLetter && (
          <button
            onClick={() => setIsComposing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-bold bg-purple-500/30 text-white border border-purple-400 hover:bg-purple-500/50 transition-all shadow-glow hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Write a Letter</span>
          </button>
        )}
      </div>

      {/* Reading an Unsealed Letter */}
      {selectedLetter ? (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto text-white">
          <button
            onClick={() => setSelectedLetter(null)}
            className="flex items-center gap-2 text-xs font-serif font-bold text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Letters Vault</span>
          </button>

          <div className="p-8 sm:p-12 rounded-3xl physical-notebook-sheet border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-300 dark:border-stone-700/50">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest opacity-80 block">
                  Written on {selectedLetter.createdAt} • Opened for {selectedLetter.unlockDate}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-inherit mt-1">
                  {selectedLetter.title}
                </h2>
              </div>
              <div
                className="w-8 h-8 rounded-full shadow-md flex items-center justify-center text-white text-xs font-serif font-bold"
                style={{ backgroundColor: selectedLetter.sealColor || '#b91c1c' }}
              >
                ✦
              </div>
            </div>

            <div className="font-serif font-semibold text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-inherit">
              {selectedLetter.content}
            </div>

            <div className="pt-6 border-t border-stone-300 dark:border-stone-700/50 text-right font-serif italic font-bold text-xs opacity-80">
              ~ Preserved in time ~
            </div>
          </div>
        </div>
      ) : isComposing ? (
        /* Writing a New Letter */
        <form
          onSubmit={handleCreateLetter}
          className="p-6 sm:p-10 rounded-3xl glass-panel border border-purple-400/40 space-y-6 shadow-2xl bg-black/75 max-w-2xl mx-auto animate-fade-in backdrop-blur-xl text-white"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="font-serif font-extrabold text-xl text-white">
                Write a Letter to Your Future Self
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Letter Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. When you turn 30, Words for when you feel lost, One year from tonight..."
              className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-3 text-sm font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-purple-400"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Written On (Today)
              </label>
              <input
                type="text"
                value={todayKey}
                disabled
                className="w-full bg-black/30 border border-white/15 rounded-2xl px-4 py-2 text-xs font-mono font-bold text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Open On (Unlock Date) *
              </label>
              <input
                type="date"
                value={unlockDate}
                min={todayKey}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2 text-xs font-serif text-white font-bold focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Wax Seal Color
            </label>
            <div className="flex items-center gap-3">
              {WAX_SEALS.map((seal) => (
                <button
                  key={seal.id}
                  type="button"
                  onClick={() => setSealColor(seal.id)}
                  className={`w-7 h-7 rounded-full transition-transform ${seal.bg} ${
                    sealColor === seal.id ? 'scale-125 ring-2 ring-white shadow-glow' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={seal.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Letter Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear Future Me,&#10;&#10;I am writing this on a quiet evening..."
              rows={8}
              className="w-full bg-black/60 border border-white/30 rounded-2xl p-4 text-sm font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-purple-400 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="px-5 py-2 rounded-full text-xs font-serif font-bold text-white hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-purple-500 text-white font-serif text-xs font-extrabold hover:brightness-110 shadow-glow transition-all"
            >
              Seal Letter in Wax
            </button>
          </div>
        </form>
      ) : (
        /* Letters Vault Grid */
        <div className="space-y-4">
          {futureLetters.length === 0 ? (
            /* Clean empty state */
            <div className="p-16 text-center rounded-3xl glass-panel border border-dashed border-white/30 max-w-lg mx-auto bg-black/60 space-y-4 backdrop-blur-xl text-white">
              <div className="p-4 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 w-14 h-14 mx-auto flex items-center justify-center shadow-glow">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-extrabold text-2xl text-white">
                  No letters sealed yet.
                </h3>
                <p className="font-serif font-bold italic text-sm text-white/90 max-w-xs mx-auto leading-relaxed">
                  Write a letter from who you are today, and seal it until a date in your future.
                </p>
              </div>

              <button
                onClick={() => setIsComposing(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-serif font-extrabold bg-purple-500/30 hover:bg-purple-500/50 text-white border border-purple-400 transition-all shadow-glow"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Write a Letter to Future Me</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {futureLetters.map((letter) => {
                const isReady = todayKey >= letter.unlockDate;
                const isLocked = !isReady && !letter.isOpened;

                return (
                  <div
                    key={letter.id}
                    onClick={() => (!isLocked ? handleOpenLetter(letter) : undefined)}
                    className={`p-6 rounded-3xl glass-panel border transition-all duration-300 flex flex-col justify-between group shadow-2xl ${
                      isLocked
                        ? 'border-purple-500/30 bg-black/60 cursor-not-allowed text-white backdrop-blur-xl'
                        : 'border-white/20 hover:border-purple-400 bg-black/70 cursor-pointer hover:scale-[1.02] text-white backdrop-blur-xl'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Wax Seal Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-serif font-bold shadow-md"
                            style={{ backgroundColor: letter.sealColor || '#b91c1c' }}
                          >
                            ✦
                          </div>
                          <span className="text-xs font-mono font-bold tracking-widest text-purple-300 uppercase">
                            {isLocked ? 'SEALED FOR FUTURE ME' : 'OPEN LETTER'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFutureLetter(letter.id);
                          }}
                          className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete letter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-serif font-extrabold text-2xl text-white">
                          {letter.title}
                        </h3>
                        <p className="text-xs font-serif font-bold italic text-white/80 mt-1">
                          Written on {letter.createdAt}
                        </p>
                      </div>
                    </div>

                    {/* Footer Lock Status */}
                    <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between">
                      {isLocked ? (
                        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-purple-300">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlocks on {letter.unlockDate}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-serif font-extrabold text-emerald-300">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Ready to read →</span>
                        </div>
                      )}

                      <span className="text-xs font-mono font-bold text-white/90">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {letter.unlockDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
