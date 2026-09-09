import React, { useState } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';

export const LockScreen: React.FC = () => {
  const { unlockDiary, settings } = useDiary();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockDiary(pin);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in text-theme-text">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full mx-auto bg-theme-accent/15 border border-theme-accent/40 flex items-center justify-center text-theme-highlight shadow-glow animate-float-gentle">
            <Lock className="w-8 h-8" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-theme-accent block mb-1">
            Private Sanctuary
          </span>
          <h2 className="text-3xl font-serif font-bold text-theme-text tracking-wide">
            My Diary
          </h2>
          <p className="text-sm font-serif italic text-theme-muted mt-2 max-w-xs mx-auto leading-relaxed">
            “I opened a secret place that belongs only to me.”
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
          {settings.passcode ? (
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN passcode..."
                maxLength={8}
                autoFocus
                className={`w-full bg-black/40 border ${
                  error ? 'border-red-500 animate-shake' : 'border-theme-border'
                } rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-theme-text focus:outline-none focus:border-theme-accent shadow-journal transition-all`}
              />
              {error && (
                <p className="text-xs font-serif text-rose-400 mt-2 animate-fade-in">
                  Incorrect passcode. Please try again.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs font-serif text-theme-muted">
              Click below to enter your quiet world.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-theme-accent hover:brightness-110 text-slate-950 font-serif font-semibold text-sm tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <span>Enter Diary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
