import React, { useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Feather,
  Quote,
  CheckCircle2,
  Calendar,
  Star,
  Trash2,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getDiaryDateDetails, getTodayKey } from '../../utils/dateUtils';
import { LittleDetailsSection } from './LittleDetailsSection';
import { CurrentlySection } from './CurrentlySection';
import { PolaroidGallery } from './PolaroidGallery';
import { OnThisDaySection } from './OnThisDaySection';

export const DiaryPage: React.FC = () => {
  const {
    activeDate,
    currentEntry,
    updateCurrentEntry,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    setActiveDate,
    setActiveView,
    saveStatus,
    lastSavedAt,
    getOnThisDayEntries,
    deleteEntryForDate,
  } = useDiary();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dateDetails = getDiaryDateDetails(activeDate);
  const isToday = activeDate === getTodayKey();
  const onThisDayEntries = getOnThisDayEntries(activeDate);

  // Auto resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [currentEntry.content]);

  const isEmptyPage = !currentEntry.content?.trim() && !currentEntry.oneSentence?.trim() && !currentEntry.mood && (!currentEntry.photos || currentEntry.photos.length === 0);

  const wordCount = currentEntry.content
    ? currentEntry.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 animate-fade-in relative z-10">
      {/* Date Navigation & Status Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border-light text-theme-muted">
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-white/5 text-theme-muted hover:text-theme-text transition-colors flex items-center gap-1"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-serif">Previous</span>
          </button>

          {!isToday ? (
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-full bg-theme-accent/15 border border-theme-accent/40 text-theme-highlight text-xs font-serif hover:bg-theme-accent/25 transition-all"
            >
              Return to Today
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-theme-border-light text-theme-highlight text-xs font-serif flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
              Today
            </span>
          )}

          <button
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-white/5 text-theme-muted hover:text-theme-text transition-colors flex items-center gap-1"
            title="Next Day"
          >
            <span className="hidden sm:inline text-xs font-serif">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Save Status Whispering Indicator & Controls */}
        <div className="flex items-center gap-3 text-xs font-serif">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-theme-accent animate-pulse">
              <Feather className="w-3.5 h-3.5" />
              <span>Preserving thought...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-400 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved {lastSavedAt ? `• ${lastSavedAt}` : ''}</span>
            </span>
          )}
          {saveStatus === 'idle' && lastSavedAt && (
            <span className="text-theme-muted/60 hidden sm:inline">
              Saved {lastSavedAt}
            </span>
          )}

          <button
            onClick={() => updateCurrentEntry({ isSpecial: !currentEntry.isSpecial })}
            className={`p-2 rounded-full transition-colors ${
              currentEntry.isSpecial
                ? 'text-amber-300 bg-amber-400/10'
                : 'text-theme-muted hover:text-theme-text'
            }`}
            title={currentEntry.isSpecial ? 'Marked as Special Memory' : 'Bookmark as Special Memory'}
          >
            <Star className={`w-4 h-4 ${currentEntry.isSpecial ? 'fill-amber-300' : ''}`} />
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className="p-2 rounded-full hover:bg-white/5 text-theme-muted hover:text-theme-text transition-colors"
            title="Open Book Calendar"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {!isEmptyPage && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear this page?')) {
                  deleteEntryForDate(activeDate);
                }
              }}
              className="p-2 rounded-full hover:bg-red-500/10 text-theme-muted hover:text-red-400 transition-colors"
              title="Clear entry for this day"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Journal Book Canvas */}
      <div className="journal-paper rounded-3xl p-6 sm:p-10 md:p-14 shadow-journal relative overflow-hidden transition-all duration-500">
        {/* Subtle page top header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8 pb-6 border-b border-theme-border-light">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-theme-highlight tracking-tight">
                {dateDetails.day}
              </span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-semibold text-theme-text tracking-wide">
                  {dateDetails.month}
                </h1>
                <p className="text-sm font-serif italic text-theme-muted">
                  {dateDetails.dayOfWeekAndYear}
                </p>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-theme-border-light font-serif text-xs text-theme-muted">
              Day {dateDetails.dayOfYear} of {dateDetails.totalDays}
            </span>
            <p className="text-[11px] font-mono uppercase tracking-widest text-theme-accent mt-1.5 opacity-80">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} recorded
            </p>
          </div>
        </div>

        {/* Empty Page Gentle Invitation */}
        {isEmptyPage && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-dashed border-theme-border-light text-center animate-fade-in">
            <p className="font-serif italic text-sm text-theme-muted">
              “This page is still waiting for you.”
            </p>
          </div>
        )}

        {/* Optional One Sentence About Today */}
        <div className="mb-8 relative group">
          <div className="flex items-center gap-2 mb-1.5">
            <Quote className="w-3.5 h-3.5 text-theme-accent" />
            <label className="text-xs font-serif text-theme-muted">
              One sentence about today
            </label>
          </div>
          <input
            type="text"
            value={currentEntry.oneSentence || ''}
            onChange={(e) => updateCurrentEntry({ oneSentence: e.target.value })}
            placeholder="A single thought or essence of the day..."
            className="w-full bg-black/20 border-b border-theme-border-light hover:border-theme-accent focus:border-theme-accent text-base sm:text-lg font-serif italic text-theme-text py-2 px-3 rounded-lg focus:outline-none transition-all placeholder:text-theme-muted/40"
          />
        </div>

        {/* Main Journal Writing Area: Dear diary... */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Feather className="w-4 h-4 text-theme-accent/80" />
            <span className="font-handwritten text-2xl text-theme-highlight select-none">
              Dear diary...
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={currentEntry.content || ''}
            onChange={(e) => updateCurrentEntry({ content: e.target.value })}
            placeholder="Write your thoughts freely... The evening is quiet, and this space belongs only to you."
            className="w-full bg-transparent font-serif text-base sm:text-lg leading-relaxed text-theme-text placeholder:text-theme-muted/40 border-none focus:outline-none focus:ring-0 p-0 selection:bg-theme-accent/25"
            rows={6}
          />
        </div>

        {/* "On This Day..." Historical Flashbacks */}
        <OnThisDaySection
          entries={onThisDayEntries}
          onNavigateToDate={(date) => setActiveDate(date)}
        />

        {/* Polaroid Memory Photographs */}
        <div className="my-8">
          <PolaroidGallery
            photos={currentEntry.photos}
            onAddPhoto={(photo) => {
              const current = currentEntry.photos || [];
              updateCurrentEntry({ photos: [...current, photo] });
            }}
            onRemovePhoto={(id) => {
              const current = currentEntry.photos || [];
              updateCurrentEntry({ photos: current.filter((p) => p.id !== id) });
            }}
            onUpdateCaption={(id, caption) => {
              const current = currentEntry.photos || [];
              updateCurrentEntry({
                photos: current.map((p) => (p.id === id ? { ...p, caption } : p)),
              });
            }}
          />
        </div>

        {/* Little Details & Mood Selector */}
        <LittleDetailsSection
          mood={currentEntry.mood}
          littleThings={currentEntry.littleThings}
          onUpdateMood={(mood) => updateCurrentEntry({ mood })}
          onUpdateLittleThings={(littleThingsUpdates) =>
            updateCurrentEntry({
              littleThings: { ...currentEntry.littleThings, ...littleThingsUpdates },
            })
          }
        />

        {/* Currently Section */}
        <div className="mt-8">
          <CurrentlySection
            currently={currentEntry.currently}
            onUpdateCurrently={(currentlyUpdates) =>
              updateCurrentEntry({
                currently: { ...currentEntry.currently, ...currentlyUpdates },
              })
            }
          />
        </div>

        {/* Subtle Journal Footer Quote */}
        <div className="mt-12 pt-8 border-t border-theme-border-light/40 text-center">
          <p className="font-serif italic text-xs text-theme-muted/70 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-theme-accent/50" />
            <span>“What you write in the quiet hours becomes the sanctuary of tomorrow.”</span>
          </p>
        </div>
      </div>
    </div>
  );
};
