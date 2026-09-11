import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lock,
  Mail,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  FastForward,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import type { LetterRecord, ThemeId } from '../../types';
import { formatTime12h, calculateRemainingCountdown } from '../../utils/dateUtils';

async function fetchPublicLetter(token: string): Promise<LetterRecord | null> {
  try {
    const res = await api.letters.getPublicLetter(token);
    if (res.success && res.letter) {
      return res.letter as LetterRecord;
    }
  } catch {
    // Fallback to local storage for offline / dev preview
  }
  const saved = localStorage.getItem('my_diary_sealed_letters_v3') || localStorage.getItem('my_diary_letters_v2_clean');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const match = parsed.find((l: any) => l.token === token || l.id === token);
        if (match) {
          const isReady = Date.now() >= match.scheduledDeliveryTimestamp || match.status === 'DELIVERED' || match.status === 'OPENED';
          return {
            ...match,
            status: isReady ? (match.status === 'OPENED' ? 'OPENED' : 'DELIVERED') : 'SCHEDULED',
            content: isReady ? match.content : '',
          };
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

async function openPublicLetterDirect(token: string): Promise<LetterRecord | null> {
  try {
    const res = await api.letters.openPublicLetter(token);
    if (res.success && res.letter) {
      return res.letter as LetterRecord;
    }
  } catch {
    // Fallback
  }
  const saved = localStorage.getItem('my_diary_sealed_letters_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        let matched: any = null;
        const updated = parsed.map((l: any) => {
          if (l.token === token || l.id === token) {
            matched = { ...l, status: 'OPENED', openedAt: new Date().toISOString() };
            return matched;
          }
          return l;
        });
        localStorage.setItem('my_diary_sealed_letters_v3', JSON.stringify(updated));
        if (matched) return matched;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

async function fastForwardPublicLetterDirect(token: string): Promise<LetterRecord | null> {
  try {
    const res = await api.letters.fastForwardPublicLetter(token);
    if (res.success && res.letter) {
      return res.letter as LetterRecord;
    }
  } catch {
    // Fallback
  }
  const saved = localStorage.getItem('my_diary_sealed_letters_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        let matched: any = null;
        const updated = parsed.map((l: any) => {
          if (l.token === token || l.id === token) {
            matched = {
              ...l,
              scheduledDeliveryTimestamp: Date.now() - 1000,
              status: 'DELIVERED',
              deliveredAt: new Date().toISOString(),
            };
            return matched;
          }
          return l;
        });
        localStorage.setItem('my_diary_sealed_letters_v3', JSON.stringify(updated));
        if (matched) return matched;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

const EnvelopeCountdownTimer: React.FC<{ timestamp: number; onComplete?: () => void }> = ({
  timestamp,
  onComplete,
}) => {
  const [countdown, setCountdown] = React.useState(() => calculateRemainingCountdown(timestamp));
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (countdown.isReady) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    const timer = setInterval(() => {
      const next = calculateRemainingCountdown(timestamp);
      setCountdown(next);
      if (next.isReady) {
        clearInterval(timer);
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timestamp, countdown.isReady]);

  if (countdown.isReady) {
    return (
      <span className="text-xs font-mono font-bold text-emerald-300 animate-pulse">
        ● Timer Complete · Letter Ready to Open
      </span>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2">
      <span className="animate-spin text-xs">⏳</span>
      <span>Unlocks in: {countdown.formatted}</span>
    </div>
  );
};

interface LetterEnvelopeViewerProps {
  token: string;
  onClose: () => void;
}

export const LetterEnvelopeViewer: React.FC<LetterEnvelopeViewerProps> = ({
  token,
  onClose,
}) => {
  const [letter, setLetter] = useState<LetterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  // Animation states
  const [isOpening, setIsOpening] = useState(false);
  const [isUnfolded, setIsUnfolded] = useState(false);

  // Keep track of loaded token to strictly prevent reloading flash and unnecessary re-fetches
  const loadedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // If letter for this exact token is already loaded, do not show loading spinner again
    if (loadedTokenRef.current === token) {
      return;
    }

    const loadLetter = async () => {
      setLoading(true);
      try {
        const data = await fetchPublicLetter(token);
        if (mounted) {
          if (!data) {
            setError('This letter link could not be found or has expired.');
          } else {
            setLetter(data);
            loadedTokenRef.current = token;
            if (data.status === 'OPENED' || data.status === 'opened') {
              setIsUnfolded(true);
            }
          }
        }
      } catch (e) {
        if (mounted) setError('Could not load letter. Please check your internet connection.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLetter();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleCountdownComplete = useCallback(async () => {
    setTimeExpired(true);
    // Silently refresh letter status from server without triggering full-screen loading
    try {
      const data = await fetchPublicLetter(token);
      if (data) {
        setLetter(data);
      }
    } catch {
      // Ignore silent refresh error
    }
  }, [token]);

  const isDeliverable = Boolean(
    timeExpired ||
    (letter && (
      Date.now() >= letter.scheduledDeliveryTimestamp ||
      letter.isDeliverable === true ||
      letter.status === 'DELIVERED' ||
      letter.status === 'OPENED' ||
      letter.status === 'CONFIG_REQUIRED' ||
      letter.status === 'DELIVERABLE' ||
      letter.status === 'deliverable' ||
      letter.status === 'delivered' ||
      letter.status === 'opened'
    ))
  );

  const handleOpenEnvelope = async () => {
    if (!letter || !isDeliverable || isOpening || isUnfolded) return;

    setIsOpening(true);

    // Trigger joyful confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#a78bfa', '#38bdf8', '#fb923c', '#e2e8f0', '#d97706'],
      });
    } catch {
      // Ignore
    }

    // Call server to mark opened and fetch decrypted content
    try {
      const updated = await openPublicLetterDirect(letter.token);
      if (updated) {
        setLetter(updated);
      }
    } catch (err) {
      console.error('Failed to open letter:', err);
    }

    setTimeout(() => {
      setIsUnfolded(true);
      setIsOpening(false);
    }, 1200);
  };

  const handleFastForward = async () => {
    if (!letter) return;
    try {
      const updated = await fastForwardPublicLetterDirect(letter.token);
      if (updated) {
        setLetter(updated);
        setTimeExpired(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStationeryClasses = (theme: ThemeId = 'ocean') => {
    switch (theme) {
      case 'beach':
        return 'bg-[#fcf8f2] text-amber-950 border-amber-200/80 shadow-amber-950/20';
      case 'cloudy':
        return 'bg-[#f4f7f9] text-slate-900 border-slate-300 shadow-slate-950/25';
      case 'foggy':
        return 'bg-[#f2f7f4] text-emerald-950 border-emerald-200/80 shadow-emerald-950/20';
      case 'moonlight':
        return 'bg-[#1e2330] text-slate-100 border-indigo-900/60 shadow-black/50';
      case 'vintage':
        return 'bg-[#f5ede0] text-stone-900 border-[#d8c7ad] shadow-amber-950/30';
      case 'ocean':
      default:
        return 'bg-[#fbfcf8] text-slate-900 border-sky-200/70 shadow-sky-950/20';
    }
  };

  const getRuledLineColor = (theme: ThemeId = 'ocean') => {
    if (theme === 'moonlight') return 'rgba(255, 255, 255, 0.08)';
    if (theme === 'vintage') return 'rgba(180, 150, 120, 0.25)';
    return 'rgba(0, 0, 0, 0.07)';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-sky-400 border-t-transparent animate-spin" />
        <p className="font-serif font-bold text-sm tracking-wide text-sky-200">
          Unfolding letter from the archives...
        </p>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300">
          <AlertCircle className="w-10 h-10 mx-auto" />
        </div>
        <h2 className="text-2xl font-serif font-extrabold text-white">
          Letter Unavailable
        </h2>
        <p className="text-xs font-serif text-white/80 leading-relaxed">
          {error || 'This link is invalid or the letter is no longer accessible.'}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-serif font-bold text-white transition-colors cursor-pointer"
        >
          Return to My Diary
        </button>
      </div>
    );
  }

  const sealColor = letter.sealColor || '#b91c1c';
  const deliveryTimeStr = `${letter.scheduledDeliveryDate} at ${formatTime12h(letter.scheduledDeliveryTime)}`;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center text-white">
      {/* Top Floating Control */}
      <div className="w-full max-w-3xl mb-6 flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-serif font-bold text-white transition-colors cursor-pointer shadow-lg backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Diary</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[11px] font-mono font-bold text-sky-300 backdrop-blur-md">
          ✉ {letter.type === 'someone' ? `For ${letter.recipientName}` : 'To Future Me'}
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {!isUnfolded ? (
          /* ====================================================
             THE 3D REALISTIC PHYSICAL ENVELOPE EXPERIENCE
             ==================================================== */
          <div className="w-full max-w-lg space-y-8 animate-fade-in text-center">
            {/* Ambient Title */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300 block">
                {isDeliverable ? 'A Letter Ready For You' : 'Sealed & Waiting'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-wide drop-shadow-md">
                {letter.type === 'someone'
                  ? `A LETTER FOR ${letter.recipientName.toUpperCase()}`
                  : 'A LETTER FOR FUTURE ME'}
              </h1>
            </div>

            {/* Realistic Physical Envelope */}
            <div
              className={`relative mx-auto w-full aspect-[16/11] max-w-md rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center transition-all duration-700 shadow-2xl border ${
                isOpening ? 'scale-105 rotate-1' : ''
              }`}
              style={{
                background: 'linear-gradient(145deg, #1c2128 0%, #0d1117 100%)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Envelope Flap Triangle Graphic */}
              <div
                className={`absolute top-0 inset-x-8 h-20 border-b border-white/20 transition-transform duration-700 origin-top flex items-center justify-center ${
                  isOpening ? '-scale-y-100 opacity-60' : ''
                }`}
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }}
              />

              {/* Top Envelope Stamp / Date */}
              <div className="w-full flex items-center justify-between text-[11px] font-mono opacity-70 border-b border-white/10 pb-2 z-10">
                <span>PAR AVION ✈</span>
                <span>{letter.scheduledDeliveryDate}</span>
              </div>

              {/* Center Wax Seal Emblem */}
              <div className="relative z-20 my-4 flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 transition-transform duration-500 ${
                    isOpening ? 'scale-125 rotate-45' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: sealColor,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: `0 0 30px ${sealColor}88, inset 0 2px 4px rgba(255,255,255,0.4)`,
                  }}
                >
                  {isDeliverable ? (
                    <Mail className="w-8 h-8 text-white stroke-[2.5]" />
                  ) : (
                    <Lock className="w-8 h-8 text-white stroke-[2.5]" />
                  )}
                </div>

                <span className="mt-3 text-xs font-serif font-extrabold uppercase tracking-widest text-white drop-shadow">
                  {letter.title}
                </span>
              </div>

              {/* Bottom Addressee Line */}
              <div className="w-full text-center z-10 pt-2 border-t border-white/10">
                <span className="font-serif italic font-bold text-sm text-sky-200">
                  {letter.type === 'someone'
                    ? `To: ${letter.recipientName}`
                    : 'To: Future Me'}
                </span>
              </div>
            </div>

            {/* Status & Open Action */}
            {!isDeliverable ? (
              /* Still Sealed Guard */
              <div className="p-6 rounded-3xl bg-black/75 border border-white/20 max-w-md mx-auto space-y-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-serif font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>This letter is still sealed</span>
                </div>
                <p className="text-xs font-serif font-bold italic text-white/90 leading-relaxed">
                  “Come back when the scheduled delivery time arrives.”
                </p>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-white/80 space-y-0.5">
                  <p className="text-sky-300 font-bold">Unlocks: {deliveryTimeStr}</p>
                  <p className="text-[10px] text-white/60">Timezone: {letter.timezone}</p>
                </div>

                {/* Live Real-time Countdown Timer */}
                <EnvelopeCountdownTimer
                  timestamp={letter.scheduledDeliveryTimestamp}
                  onComplete={handleCountdownComplete}
                />

                {/* Development demo fast-forward helper */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleFastForward}
                    className="flex items-center justify-center gap-1.5 mx-auto text-[11px] font-mono text-sky-300/80 hover:text-sky-200 hover:underline cursor-pointer"
                    title="Simulate scheduled time passing for previewing right now"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>[Demo: Fast-Forward Delivery]</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Ready to Open Action Button */
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isOpening}
                  onClick={handleOpenEnvelope}
                  className="w-full sm:w-80 mx-auto py-4 px-8 rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-base tracking-widest uppercase shadow-glow hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  <span>{isOpening ? 'OPENING...' : 'OPEN'}</span>
                </button>
                <p className="text-xs font-serif font-bold text-white/70 italic">
                  Tap OPEN to unseal and read this letter.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ====================================================
             THE UNVEILED PHYSICAL STATIONERY LETTER
             ==================================================== */
          <div className="w-full space-y-6 animate-fade-in">
            {/* Stationery Paper */}
            <div
              className={`w-full rounded-3xl p-6 sm:p-10 md:p-12 border transition-all duration-500 shadow-2xl relative ${getStationeryClasses(
                letter.sealTheme || 'ocean'
              )}`}
            >
              {/* Top Letter Header */}
              <div className="pb-4 border-b border-dashed border-black/15 dark:border-white/15 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight">
                    {letter.title}
                  </h2>
                  <span className="text-xs font-mono font-bold opacity-60 shrink-0">
                    Written: {new Date(letter.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="text-sm font-serif font-bold opacity-80">
                  {letter.type === 'someone'
                    ? `Dear ${letter.recipientName},`
                    : 'Dear Future Me,'}
                </div>
              </div>

              {/* The Actual Letter Content */}
              <div
                className="py-8 text-base sm:text-lg font-serif whitespace-pre-wrap leading-[34px] tracking-wide"
                style={{
                  lineHeight: '34px',
                  backgroundImage: `linear-gradient(to bottom, transparent 33px, ${getRuledLineColor(
                    letter.sealTheme || 'ocean'
                  )} 34px)`,
                  backgroundSize: '100% 34px',
                }}
              >
                {letter.content || 'A memory preserved in time.'}
              </div>

              {/* Bottom Stamp & Signature */}
              <div className="pt-6 border-t border-dashed border-black/15 dark:border-white/15 flex items-center justify-between">
                <div className="space-y-0.5 text-xs font-serif font-bold opacity-75">
                  <p>Delivered on: {deliveryTimeStr}</p>
                  <p className="text-[10px] font-mono">({letter.timezone})</p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 border-white/60"
                    style={{ backgroundColor: sealColor }}
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-serif font-bold italic opacity-80">
                    Sealed in My Diary
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsUnfolded(false)}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-serif font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Fold & View Envelope</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-serif font-extrabold text-xs transition-all shadow-glow cursor-pointer"
              >
                Return to My Diary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
