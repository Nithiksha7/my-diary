import React, { useState } from 'react';
import {
  Mail,
  Heart,
  Sparkles,
  Lock,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Feather,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Filter
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { DeliveryChannel, LetterRecipientType } from '../../types';
import { formatTime12h, calculateRemainingCountdown } from '../../utils/dateUtils';
import { WriteLetterPage } from './WriteLetterPage';
import { LetterEnvelopeViewer } from './LetterEnvelopeViewer';

const LiveCountdownBadge: React.FC<{ timestamp: number; onComplete?: () => void }> = ({
  timestamp,
  onComplete,
}) => {
  const [countdown, setCountdown] = React.useState(() => calculateRemainingCountdown(timestamp));

  React.useEffect(() => {
    const timer = setInterval(() => {
      const next = calculateRemainingCountdown(timestamp);
      setCountdown(next);
      if (next.isReady && onComplete) {
        onComplete();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timestamp, onComplete]);

  if (countdown.isReady) {
    return (
      <span className="text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Scheduled Moment Arrived</span>
      </span>
    );
  }

  return (
    <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
      <span className="animate-spin text-[10px]">⏳</span>
      <span>{countdown.formatted}</span>
    </span>
  );
};

export const LettersLandingPage: React.FC = () => {
  const {
    letters,
    deleteLetter,
    activeLetterToken,
    setActiveLetterToken,
    refreshLetters,
    retryLetterDelivery,
    updateLetterRecipient,
  } = useDiary();

  // Navigation mode: 'landing' | 'write-someone' | 'write-me'
  const [composingType, setComposingType] = useState<LetterRecipientType | null>(null);
  const [viewingToken, setViewingToken] = useState<string | null>(activeLetterToken);

  // Filter state: 'all' | 'scheduled' | 'delivered' | 'opened'
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'delivered' | 'opened'>('all');

  // Recipient edit inline state
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState('');
  const [isUpdatingRecipient, setIsUpdatingRecipient] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const getChannelIcon = (channel: DeliveryChannel | string = 'link') => {
    if (channel === 'email') {
      return <Mail className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Globe className="w-3.5 h-3.5 text-purple-400" />;
  };

  const getChannelLabel = (channel: DeliveryChannel | string = 'link') => {
    if (channel === 'email') {
      return 'Email';
    }
    return 'Private Link';
  };

  const getOrigin = () => {
    const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim().replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:5173';
  };

  const getLetterPublicUrl = (token: string) => {
    return `${getOrigin()}/letter/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const url = getLetterPublicUrl(token);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async (token: string, letterTitle: string, recName: string) => {
    const url = getLetterPublicUrl(token);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Letter for ${recName}: "${letterTitle}"`,
          text: `You have a private letter waiting for you: "${letterTitle}". Open:`,
          url,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink(token);
    }
  };

  // If viewing envelope directly via URL token or item click
  if (viewingToken || activeLetterToken) {
    return (
      <LetterEnvelopeViewer
        token={(viewingToken || activeLetterToken)!}
        onClose={() => {
          setViewingToken(null);
          setActiveLetterToken(null);
          if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    );
  }

  // If composing letter
  if (composingType) {
    return (
      <WriteLetterPage
        type={composingType}
        onBack={() => setComposingType(null)}
      />
    );
  }

  // Filtered letters
  const filteredLetters = letters.filter((ltr) => {
    const isOpened = ltr.status === 'OPENED' || ltr.status === 'opened';
    const isDelivered = ltr.status === 'DELIVERED' || ltr.status === 'delivered';
    const isPastScheduled = Date.now() >= ltr.scheduledDeliveryTimestamp;

    if (statusFilter === 'opened') return isOpened;
    if (statusFilter === 'delivered') return isDelivered || (isPastScheduled && !isOpened);
    if (statusFilter === 'scheduled') return !isPastScheduled && !isDelivered && !isOpened;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 space-y-10 animate-fade-in text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 block mb-1">
            Time & Memory Letters
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            LETTERS
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-amber-100/90 mt-1 drop-shadow">
            Write what you want them to find.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-3.5 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Cloud Storage Active</span>
          </div>
        </div>
      </div>

      {/* ====================================================
          TWO PRIMARY CHOICES
          1. LETTER TO SOMEONE
          2. LETTER TO ME
          ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Choice 1: Letter to Someone */}
        <div className="group relative rounded-3xl p-6 sm:p-8 glass-panel border border-amber-400/30 bg-gradient-to-br from-black/85 via-black/75 to-amber-950/40 hover:border-amber-400/80 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6 hover:scale-[1.01]">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/25 border border-amber-400 text-amber-300 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">
                Shareable Private Link
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-white tracking-wide">
                LETTER TO SOMEONE
              </h2>
              <p className="text-sm font-serif font-bold text-white/90 leading-relaxed">
                Write a private letter and share it with someone who does NOT have an account.
              </p>
              <p className="text-xs font-serif italic text-white/70">
                Send immediately or schedule for the future. The recipient opens a cinematic 3D envelope using their secure private link.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setComposingType('someone')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-serif font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all cursor-pointer"
            >
              <Feather className="w-4 h-4" />
              <span>Write a Letter to Someone</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Choice 2: Letter to Me */}
        <div className="group relative rounded-3xl p-6 sm:p-8 glass-panel border border-purple-400/30 bg-gradient-to-br from-black/85 via-black/75 to-purple-950/40 hover:border-purple-400/80 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6 hover:scale-[1.01]">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/25 border border-purple-400 text-purple-300 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Heart className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 block">
                Time Capsule
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-white tracking-wide">
                LETTER TO ME
              </h2>
              <p className="text-sm font-serif font-bold text-white/90 leading-relaxed">
                Leave something for the person you’ll become.
              </p>
              <p className="text-xs font-serif italic text-white/70">
                A personal message from who you are today, sealed in an envelope until your chosen future date.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setComposingType('me')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-400 to-indigo-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Write to Future Me</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          LETTERS DASHBOARD SECTION
          ==================================================== */}
      <div className="space-y-6 pt-6 border-t border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-300" />
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
              MY LETTERS DASHBOARD
            </h2>
            <span className="text-xs font-mono font-bold text-amber-300/80 ml-2">
              ({letters.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-white/50 ml-2 mr-1" />
            {[
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'delivered', label: 'Delivered / Ready' },
              { id: 'opened', label: 'Opened' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-amber-400 text-slate-950 shadow-glow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLetters.length === 0 ? (
          /* Empty State */
          <div className="p-10 rounded-3xl glass-panel border border-white/15 bg-black/50 text-center space-y-3">
            <Mail className="w-10 h-10 text-white/40 mx-auto" />
            <h3 className="font-serif font-bold text-base text-white">
              {statusFilter === 'all' ? 'No letters written yet.' : `No ${statusFilter} letters found.`}
            </h3>
            <p className="font-serif font-bold italic text-xs text-white/70 max-w-sm mx-auto">
              “Some words are still waiting to be written.”
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setComposingType('someone')}
                className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-serif font-extrabold transition-all cursor-pointer shadow-glow"
              >
                Write a Letter to Someone
              </button>
            </div>
          </div>
        ) : (
          /* Letters List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLetters.map((ltr) => {
              const isPastScheduled = Date.now() >= ltr.scheduledDeliveryTimestamp;
              const formattedTime = formatTime12h(ltr.scheduledDeliveryTime);

              const isOpened = ltr.status === 'OPENED' || ltr.status === 'opened';
              const isDelivered = ltr.status === 'DELIVERED' || ltr.status === 'delivered';
              const isDelivering = ltr.status === 'DELIVERING';
              const isFailed = ltr.status === 'DELIVERY_FAILED';
              const isConfigRequired = ltr.status === 'CONFIG_REQUIRED';
              const isReady = isOpened || isDelivered || isPastScheduled;

              const isEditingThisLetter = editingLetterId === ltr.id;
              const isThisCopied = copiedToken === ltr.token;

              return (
                <div
                  key={ltr.id}
                  className={`p-5 rounded-3xl glass-panel border transition-all space-y-4 flex flex-col justify-between shadow-xl ${
                    isFailed
                      ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-black/85'
                      : isOpened
                      ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-black/85'
                      : isDelivered || isPastScheduled
                      ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-black/85'
                      : 'border-white/20 bg-black/75 backdrop-blur-xl hover:border-amber-400/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Header line with Wax Seal badge & Status pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full shadow-inner border border-white/40"
                          style={{ backgroundColor: ltr.sealColor }}
                        />
                        <span className="text-xs font-mono font-bold text-amber-300">
                          ✉ {ltr.type === 'someone' ? `To: ${ltr.recipientName}` : 'To: Future Me'}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          isOpened
                            ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                            : isDelivered || isPastScheduled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : isDelivering
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 animate-pulse'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                            : isConfigRequired
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        }`}
                      >
                        {isOpened
                          ? 'OPENED'
                          : isDelivered || isPastScheduled
                          ? 'READY / DELIVERED'
                          : isDelivering
                          ? 'DELIVERING...'
                          : isFailed
                          ? 'DELIVERY FAILED'
                          : isConfigRequired
                          ? 'GATEWAY REQUIRED'
                          : 'SEALED & SCHEDULED'}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-extrabold text-white leading-snug">
                      “{ltr.title}”
                    </h3>

                    {/* Letter Metadata Details Box */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-serif text-white/85 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 flex items-center gap-1.5">
                          {getChannelIcon(ltr.deliveryChannel)}
                          <span>Delivery:</span>
                        </span>
                        <span className="font-serif font-bold text-amber-300">
                          {getChannelLabel(ltr.deliveryChannel)}
                        </span>
                      </div>

                      {ltr.recipientContact && (
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-white/50">Destination:</span>
                          <span className="text-white/90">{ltr.recipientContact}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                        <span className="text-white/60">Date:</span>
                        <span className="font-bold text-emerald-300">
                          {ltr.scheduledDeliveryDate} {formattedTime ? `· ${formattedTime}` : ''}
                        </span>
                      </div>

                      {/* Timer Countdown (if still waiting) */}
                      {!isPastScheduled && !isDelivered && !isOpened && !isFailed && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                          <span className="text-white/60">Timer:</span>
                          <LiveCountdownBadge
                            timestamp={ltr.scheduledDeliveryTimestamp}
                            onComplete={refreshLetters}
                          />
                        </div>
                      )}

                      {/* Ready or Opened Badge */}
                      {(isDelivered || isOpened || isPastScheduled) && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px] font-mono text-emerald-300">
                          <span className="text-white/60 font-serif">Status:</span>
                          <span className="flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isOpened ? 'Letter has been opened by recipient' : 'Ready for recipient to open'}</span>
                          </span>
                        </div>
                      )}

                      {/* Delivery Failure Handler */}
                      {isFailed && (
                        <div className="pt-2 border-t border-rose-500/20 text-xs font-serif space-y-2">
                          <div className="flex items-start gap-1.5 text-rose-300 font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                            <span>Delivery Error: {ltr.deliveryFailureReason || 'Unable to dispatch email.'}</span>
                          </div>

                          {isEditingThisLetter ? (
                            <div className="p-2.5 rounded-xl bg-black/70 border border-white/20 space-y-2">
                              <label className="block text-[10px] font-mono text-white/70">
                                Enter New Recipient Email / Address:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editContact}
                                  onChange={(e) => setEditContact(e.target.value)}
                                  placeholder="recipient@example.com"
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/80 border border-white/30 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                                />
                                <button
                                  type="button"
                                  disabled={isUpdatingRecipient || !editContact.trim()}
                                  onClick={async () => {
                                    if (!editContact.trim()) return;
                                    setIsUpdatingRecipient(true);
                                    await updateLetterRecipient(ltr.id, editContact.trim());
                                    setIsUpdatingRecipient(false);
                                    setEditingLetterId(null);
                                    setEditContact('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-serif font-extrabold text-xs cursor-pointer shadow-glow"
                                >
                                  Save & Retry
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLetterId(null);
                                    setEditContact('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/70"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => retryLetterDelivery(ltr.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-xs font-serif font-bold text-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Retry Delivery</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLetterId(ltr.id);
                                  setEditContact(ltr.recipientContact || ltr.recipientEmail || '');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-serif font-bold text-white transition-colors cursor-pointer"
                              >
                                <span>Change Recipient</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {/* View / Open Envelope */}
                      <button
                        type="button"
                        onClick={() => setViewingToken(ltr.token)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isReady
                            ? 'bg-amber-400 hover:brightness-110 text-slate-950 font-extrabold shadow-glow'
                            : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                        }`}
                      >
                        <span>{isReady ? 'Open Letter' : 'View Envelope'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </button>

                      {/* Copy Secure Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(ltr.token)}
                        className={`px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isThisCopied
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                        }`}
                        title="Copy private letter link"
                      >
                        {isThisCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 opacity-70" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      {/* Native Share */}
                      <button
                        type="button"
                        onClick={() => handleNativeShare(ltr.token, ltr.title, ltr.recipientName)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                        title="Share letter"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete Letter */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the letter "${ltr.title}"?`)) {
                          deleteLetter(ltr.id);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-rose-500/20 text-white/40 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete letter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
