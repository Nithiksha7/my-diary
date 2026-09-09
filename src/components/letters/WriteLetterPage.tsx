import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Calendar,
  Clock,
  Globe,
  AlertCircle,
  Mail,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { DeliveryChannel, LetterRecipientType, LetterRecord, ThemeId } from '../../types';
import {
  formatToDateKey,
  getUserTimezoneDetails,
  calculateDeliveryTimestamp,
} from '../../utils/dateUtils';

interface WriteLetterPageProps {
  type: LetterRecipientType;
  onBack: () => void;
}

const WAX_SEALS = [
  { id: '#b91c1c', name: 'Crimson Wax', bg: 'bg-red-700', border: 'border-red-500' },
  { id: '#d97706', name: 'Amber Gold', bg: 'bg-amber-600', border: 'border-amber-400' },
  { id: '#4338ca', name: 'Royal Indigo', bg: 'bg-indigo-700', border: 'border-indigo-400' },
  { id: '#047857', name: 'Emerald Wax', bg: 'bg-emerald-700', border: 'border-emerald-400' },
  { id: '#6b21a8', name: 'Midnight Purple', bg: 'bg-purple-800', border: 'border-purple-400' },
];

const DELIVERY_CHANNELS: {
  id: DeliveryChannel;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  inputLabel: string;
  description: string;
}[] = [
  {
    id: 'link',
    name: 'Private Link',
    icon: <Globe className="w-4 h-4 text-purple-400" />,
    inputLabel: 'Recipient Note (Optional)',
    placeholder: 'e.g. For Lucas, Private envelope link',
    description: 'Create a secure private link that can be shared with the recipient.',
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-4 h-4 text-amber-400" />,
    inputLabel: 'Recipient Email Address *',
    placeholder: 'e.g. friend@example.com',
    description: "Automatically send the private letter link to the recipient's email when the delivery time arrives.",
  },
];

export const WriteLetterPage: React.FC<WriteLetterPageProps> = ({ type, onBack }) => {
  const { activeTheme, createLetter } = useDiary();
  const tz = getUserTimezoneDetails();

  // Mode: 'send-now' vs 'send-later'
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'later'>(type === 'me' ? 'later' : 'now');

  // Form states
  const [recipientName, setRecipientName] = useState(type === 'me' ? 'Future Me' : '');
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>(type === 'me' ? 'link' : 'link');
  const [recipientContact, setRecipientContact] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sealColor, setSealColor] = useState('#b91c1c');

  // Scheduling states (Default: 1 year into the future at 8:00 PM)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return formatToDateKey(d);
  });
  const [scheduledTime, setScheduledTime] = useState('20:00'); // 8:00 PM

  // Modals & sealing states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealedLetter, setSealedLetter] = useState<LetterRecord | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Quick date jump helpers
  const handleDatePreset = (monthsToAdd: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    setScheduledDate(formatToDateKey(d));
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setModalError(null);

    if (type === 'someone' && !recipientName.trim()) {
      setValidationError('Please enter the recipient’s name before sealing.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Please provide a title for your letter.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Please write your letter before sealing.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSeal = async () => {
    setModalError(null);

    // Validate delivery details inside the popup modal
    if (type === 'someone' && deliveryChannel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!recipientContact.trim()) {
        setModalError('Recipient email address is required for Email delivery.');
        return;
      }
      if (!emailRegex.test(recipientContact.trim())) {
        setModalError('Please enter a valid recipient email address.');
        return;
      }
    }

    if (deliveryMode === 'later' && (!scheduledDate || !scheduledTime)) {
      setModalError('Please specify the delivery date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isImmediate = deliveryMode === 'now';
      const emailValue = deliveryChannel === 'email' ? recipientContact.trim() : undefined;
      const targetDate = isImmediate ? undefined : scheduledDate;
      const targetTime = isImmediate ? undefined : scheduledTime;
      const targetTimestamp = isImmediate
        ? Date.now()
        : calculateDeliveryTimestamp(scheduledDate, scheduledTime);

      const created = await createLetter({
        type,
        recipientName: type === 'me' ? 'Future Me' : recipientName.trim(),
        recipientEmail: emailValue,
        deliveryChannel,
        recipientContact: recipientContact.trim() || undefined,
        title: title.trim(),
        content: content.trim(),
        scheduledDeliveryDate: targetDate,
        scheduledDeliveryTime: targetTime,
        scheduledDeliveryTimestamp: targetTimestamp,
        timezone: tz.fullLabel,
        sealTheme: activeTheme,
        sealColor,
        isImmediate,
      });

      setSealedLetter(created);
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Failed to seal letter', err);
      setModalError('Failed to seal letter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme-specific stationery styles
  const getStationeryClasses = (theme: ThemeId) => {
    switch (theme) {
      case 'beach':
        return 'bg-[#fcf8f2] text-amber-950 border-amber-200/80 shadow-amber-950/20';
      case 'cloudy': // Rain
        return 'bg-[#f4f7f9] text-slate-900 border-slate-300 shadow-slate-950/25';
      case 'foggy': // Foggy Forest
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

  const getRuledLineColor = (theme: ThemeId) => {
    if (theme === 'moonlight') return 'rgba(255, 255, 255, 0.08)';
    if (theme === 'vintage') return 'rgba(180, 150, 120, 0.25)';
    return 'rgba(0, 0, 0, 0.07)';
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
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
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
          text: `You have a private letter waiting for you in My Diary: "${letterTitle}". Open your letter:`,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink(token);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 animate-fade-in text-white">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Letters Dashboard</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">
            {type === 'someone' ? 'Private Letter Experience' : 'Time Capsule Letter'}
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            {type === 'someone' ? 'LETTER TO SOMEONE' : 'LETTER TO ME'}
          </h1>
        </div>
      </div>

      {/* Subtitle Banner */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <p className="text-sm sm:text-base font-serif font-bold italic text-amber-100 drop-shadow">
          {type === 'someone'
            ? '“Write what you want them to find.”'
            : '“A message from who you are today, to who you’ll become.”'}
        </p>
        <span className="text-xs font-serif text-white/70 block">
          {type === 'someone'
            ? 'Write a private letter and share it with someone who does NOT have a My Diary account. They only need the secure link.'
            : 'A physical-style stationery letter sealed in a digital envelope until your chosen milestone.'}
        </span>
      </div>

      {/* Sealed View / Share Link Modal */}
      {sealedLetter ? (
        /* ====================================================
           SHARE LINK & CONFIRMATION EXPERIENCE
           ==================================================== */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-amber-400/30 bg-gradient-to-b from-stone-950/95 via-black/95 to-slate-950/95 backdrop-blur-2xl text-center space-y-6 animate-fade-in shadow-2xl">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-glow border-2"
              style={{ backgroundColor: sealedLetter.sealColor, borderColor: 'rgba(255,255,255,0.5)' }}
            >
              <Lock className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <span className="absolute -top-1 -right-1 text-lg">✨</span>
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-glow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>YOUR LETTER IS READY</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
              “{sealedLetter.title}”
            </h2>
            <p className="text-sm font-serif font-bold text-amber-200">
              {type === 'someone'
                ? `For: ${sealedLetter.recipientName}`
                : 'For: Future Me'}
            </p>
          </div>

          {/* Secure Public Link Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/15 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Share this private link</span>
              </label>
              <span className="text-[10px] font-mono text-white/50">
                No account required to read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getLetterPublicUrl(sealedLetter.token)}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/25 text-xs font-mono text-sky-300 select-all focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(sealedLetter.token)}
                className={`px-4 py-2.5 rounded-xl font-serif font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-glow ${
                  isCopied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Generic Native Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleNativeShare(sealedLetter.token, sealedLetter.title, sealedLetter.recipientName)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-serif font-bold text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>Share via Device</span>
                </button>
              </div>
            )}
          </div>

          {/* Delivery & Offline Info Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs font-serif text-amber-100 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Offline & Recipient Freedom</span>
            </p>
            <p className="text-[11px] text-white/80 leading-relaxed">
              The recipient will see the full cinematic envelope unsealing animation without needing an account or password.
              Your computer can now go offline — the letter is safely stored in the cloud.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-serif font-bold text-sm text-white transition-all cursor-pointer"
            >
              Done / Return to Letters
            </button>
            <a
              href={getLetterPublicUrl(sealedLetter.token)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-sm transition-all shadow-glow flex items-center justify-center gap-2"
            >
              <span>Preview Envelope</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        </div>
      ) : (
        /* ====================================================
           WRITING FORM
           ==================================================== */
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-serif font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Delivery Mode Toggle: SEND NOW vs SEND LATER */}
          {type === 'someone' && (
            <div className="p-4 rounded-3xl glass-panel border border-white/20 bg-black/60 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">
                  Delivery Mode
                </span>
                <p className="text-xs font-serif font-bold text-white/90">
                  Choose when this letter should be ready for the recipient
                </p>
              </div>

              <div className="flex items-center p-1 rounded-2xl bg-black/70 border border-white/15 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('now')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    deliveryMode === 'now'
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-glow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Now (Immediate Link)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode('later')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    deliveryMode === 'later'
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-glow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Send Later (Schedule)</span>
                </button>
              </div>
            </div>
          )}

          {/* Recipient Name & Letter Title Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/20 bg-black/60 backdrop-blur-xl space-y-4 shadow-xl">
            {type === 'someone' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-white/90 mb-1.5">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena, Dad, Lucas, My Friend..."
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 focus:border-amber-400 text-sm font-serif font-bold text-white placeholder:text-white/40 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-white/90 mb-1.5">
                    Letter Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A letter for when you miss me, or Happy Birthday"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 focus:border-amber-400 text-sm font-serif font-bold text-white placeholder:text-white/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-serif font-bold text-white/90 mb-1.5">
                  Letter Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remember who you were at 24, or Promises I made today"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 focus:border-amber-400 text-sm font-serif font-bold text-white placeholder:text-white/40 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* PHYSICAL LETTER STATIONERY SHEET */}
          <div
            className={`w-full rounded-3xl p-6 sm:p-10 md:p-12 border transition-all duration-300 shadow-2xl relative ${getStationeryClasses(
              activeTheme
            )}`}
          >
            {/* Salutation */}
            <div className="pb-4 border-b border-dashed border-black/10 dark:border-white/10 flex items-baseline justify-between">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                {type === 'someone'
                  ? `Dear ${recipientName.trim() || '__________'},`
                  : 'Dear Future Me,'}
              </span>
              <span className="text-[11px] font-mono font-bold opacity-60">
                Written: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Writing Area with Ruled Lines */}
            <div className="relative pt-6">
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write what you want them to read..."
                style={{
                  lineHeight: '34px',
                  backgroundImage: `linear-gradient(to bottom, transparent 33px, ${getRuledLineColor(
                    activeTheme
                  )} 34px)`,
                  backgroundSize: '100% 34px',
                  backgroundAttachment: 'local',
                }}
                className="w-full bg-transparent border-none text-base sm:text-lg font-serif resize-none focus:outline-none focus:ring-0 leading-[34px] px-1 font-medium tracking-wide"
              />
            </div>

            {/* Bottom Sign-off Footer */}
            <div className="pt-6 border-t border-dashed border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-70 font-serif font-bold">
              <span>With love & patience,</span>
              <span>— From My Diary</span>
            </div>
          </div>

          {/* SEAL LETTER Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Lock className="w-5 h-5 stroke-[2.5]" />
              <span>
                {deliveryMode === 'now' ? 'SEAL & GENERATE PRIVATE LINK' : 'SEAL & SCHEDULE LETTER'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* ====================================================
          SEALING & SCHEDULING POPUP MODAL
          ==================================================== */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in text-white">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => !isSubmitting && setIsConfirmModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-2xl p-6 sm:p-8 z-10 border border-white/25 bg-gradient-to-b from-stone-950/95 via-black/95 to-slate-950/95 backdrop-blur-2xl space-y-6 text-left animate-scale-up">
            {/* Wax Seal Header */}
            <div className="text-center space-y-3 pb-2 border-b border-white/15">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-glow border-2 transition-transform duration-300 hover:scale-105"
                  style={{ backgroundColor: sealColor, borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  <Lock className="w-7 h-7 text-white stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 text-lg">💌</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide">
                  {deliveryMode === 'now' ? 'Ready to Seal Your Letter?' : 'Schedule Letter Delivery'}
                </h3>
                <p className="font-serif font-bold italic text-xs sm:text-sm text-amber-200/90 leading-relaxed max-w-sm mx-auto">
                  {deliveryMode === 'now'
                    ? 'A secure private link will be generated instantly. Anyone with the link can open and read this letter.'
                    : 'This letter will remain sealed and locked until the scheduled moment.'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-serif font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Delivery Method Selector (if Letter to Someone) */}
            {type === 'someone' && (
              <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-xs font-serif font-bold text-white/90">
                  Delivery Method
                </label>
                <div className="space-y-2">
                  {DELIVERY_CHANNELS.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setDeliveryChannel(channel.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        deliveryChannel === channel.id
                          ? 'bg-amber-500/25 border-amber-400 text-white ring-2 ring-amber-300/60 font-extrabold shadow-glow'
                          : 'bg-black/40 hover:bg-white/10 border-white/15 text-white/80 font-bold'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-extrabold text-white">{channel.name}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            deliveryChannel === channel.id
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/40 bg-transparent'
                          }`}>
                            {deliveryChannel === channel.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] font-serif text-white/70 mt-0.5 leading-relaxed">
                          {channel.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Email Address Input (Required for Email Channel) */}
                {deliveryChannel === 'email' ? (
                  <div className="pt-2">
                    <label className="block text-xs font-serif font-bold text-white/90 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recipient Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. friend@example.com"
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-xs font-mono text-white placeholder:text-white/40 focus:outline-none transition-colors"
                    />
                    <span className="text-[10px] font-serif text-white/60 block mt-1">
                      ℹ The private letter link will be emailed to the recipient when the delivery time arrives.
                    </span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <span className="text-[11px] font-serif text-amber-200/90 block">
                      🔗 A secure private link will be generated immediately for you to copy and share. No recipient email required.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Scheduling (if Send Later) */}
            {(deliveryMode === 'later' || type === 'me') && (
              <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-xs font-serif font-bold text-white/90 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-300" />
                  <span>Scheduled Delivery Date & Time *</span>
                </label>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '+1 Month', months: 1 },
                    { label: '+6 Months', months: 6 },
                    { label: '+1 Year', months: 12 },
                    { label: '+3 Years', months: 36 },
                    { label: '+5 Years', months: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleDatePreset(preset.months)}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-serif font-bold text-white transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Date, Time & Timezone Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-serif font-bold text-white/80 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      min={formatToDateKey(new Date())}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-serif font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif font-bold text-white/80 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-300" />
                      <span>Time *</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-serif font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-white/60 pt-1 flex items-center justify-between">
                  <span>Timezone:</span>
                  <span className="text-white/80 font-bold">{tz.fullLabel}</span>
                </div>
              </div>
            )}

            {/* Wax Seal Selection */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-serif font-bold text-white/80 block">
                Choose Wax Seal Emblem:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {WAX_SEALS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSealColor(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      sealColor === s.id
                        ? 'ring-2 ring-white scale-105 border-white bg-white/25'
                        : 'border-white/20 bg-black/40 hover:bg-white/15 opacity-80'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full shadow-inner ${s.bg}`} />
                    <span className="text-[11px] font-serif font-bold text-white">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: CANCEL & 🔒 SEAL & CONFIRM */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-serif font-bold text-white transition-all cursor-pointer text-center"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSeal}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-serif font-extrabold shadow-glow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sealing...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 stroke-[3]" />
                    <span>{deliveryMode === 'now' ? 'SEAL & GENERATE LINK' : 'SEAL & SCHEDULE'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
