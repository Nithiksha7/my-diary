import React, { useState } from 'react';
import { Share2, Copy, Check, Lock, X, ExternalLink, Quote, Sparkles } from 'lucide-react';
import type { DiaryEntry } from '../../types';

interface SharePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  formattedDate: string;
  entry: DiaryEntry;
  themeName: string;
}

export const SharePageModal: React.FC<SharePageModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  formattedDate,
  entry,
  themeName,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const hasContent = Boolean(
    entry.content?.trim() || entry.oneSentence?.trim() || entry.mood || (entry.photos && entry.photos.length > 0)
  );

  const shareUrl = `${window.location.origin}/?date=${dateKey}`;
  const shareTitle = `My Diary — ${formattedDate}`;
  const shareSnippet = entry.oneSentence?.trim()
    || (entry.content?.trim() ? entry.content.trim().substring(0, 120) + (entry.content.length > 120 ? '...' : '') : '');

  const handleNativeShare = async () => {
    if (!hasContent) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `“${shareSnippet}” — ${formattedDate}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed; fallback to copy link
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (!hasContent) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTextQuote = () => {
    if (!hasContent) return;
    const textToCopy = `“${entry.content?.trim() || entry.oneSentence}”\n\n— My Diary (${formattedDate})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in text-white">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel shadow-2xl p-6 sm:p-8 z-10 border border-white/20 bg-black/85 backdrop-blur-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/25 border border-sky-400 text-sky-300 shadow-glow">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-300 block">
                {formattedDate}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
                Share this page
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Check */}
        {!hasContent ? (
          /* Empty Page Notice */
          <div className="p-6 rounded-2xl bg-white/5 border border-white/15 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-300 mx-auto opacity-80" />
            <h3 className="font-serif font-bold text-base text-white">
              This diary page is currently empty
            </h3>
            <p className="font-serif font-bold italic text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
              Write something first before sharing this page.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-serif font-bold text-white transition-colors"
            >
              Return to writing
            </button>
          </div>
        ) : (
          /* Share Options */
          <div className="space-y-4">
            {/* Snippet Preview */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-white/70">
                <Quote className="w-3.5 h-3.5 text-sky-300" />
                <span>Page Preview ({themeName} Atmosphere)</span>
              </div>
              <p className="font-serif font-bold italic text-xs text-white/95 line-clamp-3 leading-relaxed">
                {shareSnippet || 'Personal reflections recorded on this date.'}
              </p>
            </div>

            {/* Primary Action: Native Device Share / Share Page */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-2xl bg-sky-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 stroke-[3]" />
              <span>↗ Share this page</span>
            </button>

            {/* Secondary Action: Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2.5 px-4 rounded-2xl border font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Link copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link for {formattedDate}</span>
                </>
              )}
            </button>

            {/* Tertiary Action: Copy Entry Text */}
            <button
              type="button"
              onClick={handleCopyTextQuote}
              className={`w-full py-2 px-3 rounded-2xl border font-serif font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiedText
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-black/40 hover:bg-black/60 border-white/10 text-white/80 hover:text-white'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Excerpt copied!</span>
                </>
              ) : (
                <>
                  <Quote className="w-3 h-3 text-amber-300" />
                  <span>Copy text excerpt</span>
                </>
              )}
            </button>

            {/* Privacy Assurance Note */}
            <div className="pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] font-serif font-bold text-white/75">
              <Lock className="w-3.5 h-3.5 text-sky-300 shrink-0 mt-0.5" />
              <p className="leading-normal">
                Private by default. This link corresponds directly to the <strong>{formattedDate}</strong> page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
