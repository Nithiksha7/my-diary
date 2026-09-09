import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Feather,
  ArrowLeft,
  Calendar,
  Star,
  Quote,
  CheckCircle2,
  Paperclip,
  Heart,
  Camera,
  Layers,
  Share2,
  RotateCw,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getDiaryDateDetails, getTodayKey } from '../../utils/dateUtils';
import {
  paginateContentByDimensions,
  measureTextLines,
  findPageForGlobalIndex,
  type PageSlice,
} from '../../utils/diaryPagination';
import { ThemeCornerArt } from './ThemeCornerArt';
import { LittleDetailsSection } from './LittleDetailsSection';
import { CurrentlySection } from './CurrentlySection';
import { PolaroidGallery } from './PolaroidGallery';
import { OnThisDaySection } from './OnThisDaySection';
import { SharePageModal } from './SharePageModal';

interface PhysicalDiaryPageProps {
  onBackToDashboard: () => void;
  onOpenCalendarModal: () => void;
  onOpenThemeModal: () => void;
  onOpenPrivacyModal: () => void;
}

const MAX_LINES_PER_PAGE = 14;
const LINE_HEIGHT = 36;

export const PhysicalDiaryPage: React.FC<PhysicalDiaryPageProps> = ({
  onBackToDashboard,
  onOpenCalendarModal,
  onOpenThemeModal,
}) => {
  const {
    activeDate,
    activeTheme,
    activeBackground,
    refreshActiveThemeBackground,
    currentEntry,
    updateCurrentEntry,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    setActiveDate,
    saveStatus,
    lastSavedAt,
    getOnThisDayEntries,
  } = useDiary();

  const [activeAttachment, setActiveAttachment] = useState<'none' | 'sentence' | 'mood' | 'photos' | 'currently'>('none');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Canonical references to avoid any stale-closure reads during rapid typing/editing
  const contentRef = useRef<string>(currentEntry.content || '');
  const slicesRef = useRef<PageSlice[]>([]);
  const lastRenderedSlicesRef = useRef<PageSlice[]>([]);
  const pageRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const writingAreaRef = useRef<HTMLDivElement | null>(null);
  const [writingAreaWidth, setWritingAreaWidth] = useState<number>(0);

  // Dynamically observe writing area width
  useEffect(() => {
    if (!writingAreaRef.current) return;

    const measureWidth = () => {
      if (writingAreaRef.current) {
        const cs = window.getComputedStyle(writingAreaRef.current);
        const paddingX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
        const w = Math.floor(writingAreaRef.current.clientWidth - paddingX);
        if (w > 0) {
          setWritingAreaWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
        }
      }
    };

    measureWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) {
          setWritingAreaWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
        }
      }
    });

    observer.observe(writingAreaRef.current);
    return () => observer.disconnect();
  }, []);

  const handleRefreshBackground = () => {
    setIsSpinning(true);
    refreshActiveThemeBackground();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const dateDetails = getDiaryDateDetails(activeDate);
  const isToday = activeDate === getTodayKey();
  const onThisDayEntries = getOnThisDayEntries(activeDate);

  const wordCount = currentEntry.content
    ? currentEntry.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Real DOM-dimension based continuous multi-page calculation
  const slices = useMemo(() => {
    const rawContent = currentEntry.content || '';
    return paginateContentByDimensions(
      rawContent,
      writingAreaWidth,
      MAX_LINES_PER_PAGE,
      LINE_HEIGHT
    );
  }, [currentEntry.content, writingAreaWidth]);

  const pages = useMemo(() => {
    return slices.map((s) => s.text);
  }, [slices]);

  // Keep refs and pageRefs in sync whenever canonical content or slices change
  useEffect(() => {
    contentRef.current = currentEntry.content || '';
    slicesRef.current = slices;
    lastRenderedSlicesRef.current = slices;
    pageRefs.current = pageRefs.current.slice(0, pages.length);
  }, [currentEntry.content, activeDate, slices, pages.length]);

  // Cursor restoration helper using requestAnimationFrame
  const restoreCursorToGlobalIndex = useCallback(
    (
      slicesToUse: PageSlice[],
      targetGlobalIndex: number,
      preferredPageIndex?: number
    ) => {
      requestAnimationFrame(() => {
        const { pageIndex, localIndex } = findPageForGlobalIndex(
          slicesToUse,
          targetGlobalIndex,
          preferredPageIndex
        );
        const textarea = pageRefs.current[pageIndex];
        if (textarea) {
          if (document.activeElement !== textarea) {
            textarea.focus();
          }
          const clamped = Math.max(0, Math.min(localIndex, textarea.value.length));
          textarea.setSelectionRange(clamped, clamped);
        } else {
          // Safe retry if React has not mounted the newly created page DOM element yet
          requestAnimationFrame(() => {
            const el = pageRefs.current[pageIndex];
            if (el) {
              if (document.activeElement !== el) {
                el.focus();
              }
              const clamped = Math.max(0, Math.min(localIndex, el.value.length));
              el.setSelectionRange(clamped, clamped);
            }
          });
        }
      });
    },
    []
  );

  // Universal global edit pipeline
  const applyGlobalEdit = useCallback(
    (
      globalStart: number,
      globalEnd: number,
      insertedText: string,
      newGlobalCursor: number,
      preferredPageIndex?: number
    ) => {
      const oldContent = contentRef.current;
      const safeStart = Math.max(0, Math.min(globalStart, oldContent.length));
      const safeEnd = Math.max(safeStart, Math.min(globalEnd, oldContent.length));

      const newContent =
        oldContent.substring(0, safeStart) +
        insertedText +
        oldContent.substring(safeEnd);

      // Guard against no-op
      if (newContent === oldContent && safeStart === safeEnd && insertedText === '') {
        return;
      }

      // 1. Immediately update canonical content ref
      contentRef.current = newContent;

      // 2. Synchronously compute the new slices for immediate cursor mapping and ref integrity
      const newSlices = paginateContentByDimensions(
        newContent,
        writingAreaWidth,
        MAX_LINES_PER_PAGE,
        LINE_HEIGHT
      );

      // 3. Update slices refs immediately
      slicesRef.current = newSlices;
      lastRenderedSlicesRef.current = newSlices;

      // 4. Update React canonical state (React will render <textarea value={currentSlice.text} />)
      updateCurrentEntry({ content: newContent });

      // 5. Restore cursor position and focus derived from newSlices
      restoreCursorToGlobalIndex(newSlices, newGlobalCursor, preferredPageIndex);
    },
    [writingAreaWidth, updateCurrentEntry, restoreCursorToGlobalIndex]
  );

  // Bulletproof onChange handler using snapshot-based diffing against rendered slice
  const handlePageChange = (
    pageIndex: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = e.currentTarget;
    const newPageValue = textarea.value;
    const localCursor = textarea.selectionStart;

    // Snapshot of what React rendered into this textarea before the user's edit
    const renderedSlice =
      lastRenderedSlicesRef.current[pageIndex] || slicesRef.current[pageIndex];

    if (!renderedSlice) {
      applyGlobalEdit(0, contentRef.current.length, newPageValue, localCursor, 0);
      return;
    }

    const oldSliceText = renderedSlice.text;

    // Guard: If text is unchanged, treat as no-op to prevent any feedback loops
    if (newPageValue === oldSliceText) {
      return;
    }

    // Fast path: find exact diff between oldSliceText and newPageValue
    let prefixMatch = 0;
    const maxPrefix = Math.min(oldSliceText.length, newPageValue.length);
    while (
      prefixMatch < maxPrefix &&
      oldSliceText[prefixMatch] === newPageValue[prefixMatch]
    ) {
      prefixMatch++;
    }

    let suffixMatch = 0;
    const maxSuffix = Math.min(
      oldSliceText.length - prefixMatch,
      newPageValue.length - prefixMatch
    );
    while (
      suffixMatch < maxSuffix &&
      oldSliceText[oldSliceText.length - 1 - suffixMatch] ===
        newPageValue[newPageValue.length - 1 - suffixMatch]
    ) {
      suffixMatch++;
    }

    const deletedCount = oldSliceText.length - prefixMatch - suffixMatch;
    const insertedChars = newPageValue.substring(
      prefixMatch,
      newPageValue.length - suffixMatch
    );

    const globalStart = renderedSlice.startIndex + prefixMatch;
    const globalEnd = globalStart + deletedCount;
    const newGlobalCursor = renderedSlice.startIndex + localCursor;

    applyGlobalEdit(globalStart, globalEnd, insertedChars, newGlobalCursor, pageIndex);
  };

  // Keyboard navigation & cross-page boundary handling
  const handlePageKeyDown = (pageIndex: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    const renderedSlice =
      lastRenderedSlicesRef.current[pageIndex] || slicesRef.current[pageIndex];
    if (!renderedSlice) return;

    // 1. Enter key: always insert exactly one '\n' at global cursor position
    if (e.key === 'Enter') {
      e.preventDefault();
      const globalStart = renderedSlice.startIndex + selectionStart;
      const globalEnd = renderedSlice.startIndex + selectionEnd;
      applyGlobalEdit(globalStart, globalEnd, '\n', globalStart + 1, pageIndex);
      return;
    }

    // 2. Backspace key:
    if (e.key === 'Backspace') {
      // Range selected across characters
      if (selectionStart !== selectionEnd) {
        e.preventDefault();
        const globalStart = renderedSlice.startIndex + selectionStart;
        const globalEnd = renderedSlice.startIndex + selectionEnd;
        applyGlobalEdit(globalStart, globalEnd, '', globalStart, pageIndex);
        return;
      }

      // Cursor is at beginning of page (selectionStart === 0) on Page N > 0
      if (selectionStart === 0) {
        if (pageIndex > 0 || renderedSlice.startIndex > 0) {
          e.preventDefault();
          const globalCursor = renderedSlice.startIndex;
          if (globalCursor > 0) {
            const deleteIndex = globalCursor - 1;
            applyGlobalEdit(deleteIndex, globalCursor, '', deleteIndex, pageIndex - 1);
          }
        }
        return;
      }
      // For selectionStart > 0: let native backspace fire onChange for clean snapshot diff
    }

    // 3. Delete key:
    if (e.key === 'Delete') {
      // Range selected
      if (selectionStart !== selectionEnd) {
        e.preventDefault();
        const globalStart = renderedSlice.startIndex + selectionStart;
        const globalEnd = renderedSlice.startIndex + selectionEnd;
        applyGlobalEdit(globalStart, globalEnd, '', globalStart, pageIndex);
        return;
      }

      // Cursor is at end of page (selectionStart === value.length)
      if (selectionStart === value.length) {
        const globalCursor = renderedSlice.endIndex;
        if (globalCursor < contentRef.current.length) {
          e.preventDefault();
          applyGlobalEdit(globalCursor, globalCursor + 1, '', globalCursor, pageIndex);
        }
        return;
      }
      // For selectionStart < value.length: let native delete fire onChange
    }

    // 4. ArrowLeft at beginning of page (position 0) -> move to end of previous page
    if (e.key === 'ArrowLeft' && !e.shiftKey && selectionStart === 0 && selectionEnd === 0) {
      if (pageIndex > 0) {
        e.preventDefault();
        const prevSlice = slicesRef.current[pageIndex - 1];
        if (prevSlice) {
          restoreCursorToGlobalIndex(slicesRef.current, prevSlice.endIndex, pageIndex - 1);
        }
      }
      return;
    }

    // 5. ArrowRight at end of page -> move to start of next page
    if (e.key === 'ArrowRight' && !e.shiftKey && selectionStart === value.length && selectionEnd === value.length) {
      if (pageIndex < pages.length - 1) {
        e.preventDefault();
        const nextSlice = slicesRef.current[pageIndex + 1];
        if (nextSlice) {
          restoreCursorToGlobalIndex(slicesRef.current, nextSlice.startIndex, pageIndex + 1);
        }
      }
      return;
    }

    // 6. ArrowUp on first line of page -> move to corresponding position on previous page
    if (e.key === 'ArrowUp' && !e.shiftKey && pageIndex > 0) {
      const textBeforeCursor = value.substring(0, selectionStart);
      const isFirstLine =
        !textBeforeCursor.includes('\n') &&
        measureTextLines(textBeforeCursor, writingAreaWidth || 600, LINE_HEIGHT) <= 1;

      if (isFirstLine) {
        e.preventDefault();
        const prevSlice = slicesRef.current[pageIndex - 1];
        if (prevSlice) {
          restoreCursorToGlobalIndex(slicesRef.current, prevSlice.endIndex, pageIndex - 1);
        }
      }
      return;
    }

    // 7. ArrowDown on last line of page -> move to corresponding position on next page
    if (e.key === 'ArrowDown' && !e.shiftKey && pageIndex < pages.length - 1) {
      const textAfterCursor = value.substring(selectionStart);
      const isLastLine =
        !textAfterCursor.includes('\n') &&
        measureTextLines(textAfterCursor, writingAreaWidth || 600, LINE_HEIGHT) <= 1;

      if (isLastLine) {
        e.preventDefault();
        const nextSlice = slicesRef.current[pageIndex + 1];
        if (nextSlice) {
          restoreCursorToGlobalIndex(slicesRef.current, nextSlice.startIndex, pageIndex + 1);
        }
      }
      return;
    }
  };

  const handleAddBlankPage = () => {
    const current = contentRef.current;
    const lastSlice = slicesRef.current[slicesRef.current.length - 1];
    const lastSliceText = lastSlice ? lastSlice.text : '';
    const linesOnLastPage = measureTextLines(
      lastSliceText,
      writingAreaWidth || 600,
      LINE_HEIGHT
    );
    const neededNewlines = Math.max(1, MAX_LINES_PER_PAGE - linesOnLastPage + 1);
    const globalPos = current.length;
    applyGlobalEdit(globalPos, globalPos, '\n'.repeat(neededNewlines), globalPos + neededNewlines);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 relative z-10 flex flex-col items-center justify-between animate-fade-in text-theme-text">
      {/* Floating Top Control Ribbon */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between gap-2 px-3 py-2 rounded-full glass-panel shadow-lg border border-theme-border-light text-xs font-serif sticky top-4 z-40">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-theme-muted hover:text-theme-text transition-all cursor-pointer"
          title="Return to Diary Bookshelf"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Diary Bookshelf</span>
        </button>

        {/* Date Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday ? (
            <button
              onClick={goToToday}
              className="px-2.5 py-1 rounded-full bg-theme-accent/20 border border-theme-accent/40 text-theme-highlight text-[11px] font-serif hover:bg-theme-accent/30 transition-all cursor-pointer"
            >
              Today
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-theme-highlight text-[11px] font-serif flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
              Today
            </span>
          )}

          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Tools */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="hidden md:flex items-center gap-1 text-theme-accent text-[11px] animate-pulse">
              <Feather className="w-3 h-3" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="hidden md:flex items-center gap-1 text-emerald-400 text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved {lastSavedAt}</span>
            </span>
          )}

          {/* Refresh / Change Background Button (hidden for custom photo theme) */}
          {activeTheme !== 'custom' && (
            <button
              type="button"
              onClick={handleRefreshBackground}
              className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors cursor-pointer group relative"
              title={`Change background (${activeBackground.name})`}
              aria-label="Change diary background"
            >
              <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isSpinning ? 'rotate-180 text-theme-highlight' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenThemeModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
            title="Change Diary Atmosphere"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCalendarModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
            title="Open Year/Month Calendar"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-1.5 rounded-full hover:bg-white/15 text-sky-300 hover:text-white transition-colors cursor-pointer"
            title="Share this page"
            aria-label="Share this page"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTINUOUS MULTI-PAGE PHYSICAL NOTEBOOK STACK */}
      <div className="w-full max-w-3xl space-y-8 flex flex-col items-center">
        {pages.map((pageText, pageIndex) => {
          const isFirstPage = pageIndex === 0;

          return (
            <div
              key={`diary-page-${pageIndex}`}
              className="w-full physical-notebook-sheet rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden transition-all duration-500 shadow-2xl flex flex-col justify-between min-h-[740px]"
            >
              {/* Theme Corner Art */}
              <ThemeCornerArt theme={activeTheme} />

              {/* Notebook Margin Guide Line */}
              <div className="notebook-margin-guide" />

              {/* Page 1: Bookmark Star Indicator */}
              {isFirstPage && (
                <button
                  onClick={() => updateCurrentEntry({ isSpecial: !currentEntry.isSpecial })}
                  className={`absolute top-5 left-5 sm:left-7 z-10 transition-transform hover:scale-110 cursor-pointer ${
                    currentEntry.isSpecial ? 'text-amber-500' : 'text-stone-400/40 hover:text-amber-500'
                  }`}
                  title={currentEntry.isSpecial ? 'Special Memory' : 'Bookmark this page'}
                >
                  <Star className={`w-4 h-4 ${currentEntry.isSpecial ? 'fill-amber-400' : ''}`} />
                </button>
              )}

              {/* Header: Date Header on Page 1, Continuation Header on Page 2+ */}
              {isFirstPage ? (
                <div className="pl-6 sm:pl-10 pr-10 pb-4 border-b border-dashed border-stone-300 dark:border-stone-700/50 select-none">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-inherit leading-none">
                        {dateDetails.day}
                      </span>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-display font-semibold tracking-wide text-inherit">
                          {dateDetails.month}
                        </h1>
                        <p className="text-xs font-serif italic opacity-75">
                          {dateDetails.dayOfWeekAndYear}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-[11px] italic opacity-70 block">
                        Day {dateDetails.dayOfYear} of {dateDetails.totalDays}
                      </span>
                      <span className="text-[10px] font-mono opacity-50 block">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pl-6 sm:pl-10 pr-10 pb-4 border-b border-dashed border-stone-300 dark:border-stone-700/50 select-none flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-theme-accent opacity-75" />
                    <span className="font-display font-semibold text-sm sm:text-base tracking-wide text-inherit">
                      {dateDetails.month} {dateDetails.day}, {dateDetails.year}
                    </span>
                    <span className="text-xs font-serif italic opacity-65">
                      • Continuation
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-[11px] italic opacity-70">
                      Page {pageIndex + 1} of {pages.length}
                    </span>
                  </div>
                </div>
              )}

              {/* The Fixed Ruled Writing Area: Exactly 14 Ruled Lines (14 * 36px = 504px) */}
              <div
                ref={pageIndex === 0 ? writingAreaRef : undefined}
                className="pl-6 sm:pl-10 pr-4 my-auto relative notebook-ruled-lines h-[504px] overflow-hidden"
              >
                <textarea
                  ref={(el) => {
                    pageRefs.current[pageIndex] = el;
                  }}
                  value={pageText}
                  onChange={(e) => handlePageChange(pageIndex, e)}
                  onKeyDown={(e) => handlePageKeyDown(pageIndex, e)}
                  placeholder={isFirstPage ? 'Start writing your thoughts here...' : ''}
                  className="notebook-textarea font-serif w-full h-[504px] overflow-hidden resize-none"
                  style={{
                    lineHeight: '36px',
                    fontSize: '1.125rem',
                  }}
                  spellCheck={false}
                />
              </div>

              {/* Bottom Page Footer Bar */}
              <div className="pl-6 sm:pl-10 pr-4 pt-3 border-t border-dashed border-stone-300 dark:border-stone-700/50 flex items-center justify-between text-xs font-serif select-none">
                {isFirstPage ? (
                  /* Page 1: Subtle Attachment Toggles */
                  <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-[11px] opacity-60 flex items-center gap-1 mr-1">
                      <Paperclip className="w-3 h-3" />
                      <span>Details:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveAttachment(activeAttachment === 'sentence' ? 'none' : 'sentence')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-all cursor-pointer ${
                        activeAttachment === 'sentence' || currentEntry.oneSentence
                          ? 'bg-amber-500/20 border-amber-600 dark:border-amber-400 font-semibold'
                          : 'border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Quote className="w-2.5 h-2.5 inline mr-1" />
                      <span>Sentence</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAttachment(activeAttachment === 'mood' ? 'none' : 'mood')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-all cursor-pointer ${
                        activeAttachment === 'mood' || currentEntry.mood
                          ? 'bg-rose-500/20 border-rose-600 dark:border-rose-400 font-semibold'
                          : 'border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Heart className="w-2.5 h-2.5 inline mr-1 text-rose-500" />
                      <span>{currentEntry.mood ? `Felt ${currentEntry.mood}` : 'Mood'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAttachment(activeAttachment === 'photos' ? 'none' : 'photos')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-all cursor-pointer ${
                        activeAttachment === 'photos' || (currentEntry.photos && currentEntry.photos.length > 0)
                          ? 'bg-sky-500/20 border-sky-600 dark:border-sky-400 font-semibold'
                          : 'border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Camera className="w-2.5 h-2.5 inline mr-1 text-sky-500" />
                      <span>{currentEntry.photos?.length ? `Photo (${currentEntry.photos.length})` : 'Photo'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="opacity-50 italic text-[11px]">
                    ~ Continued from previous page ~
                  </div>
                )}

                <div className="opacity-50 italic text-[11px]">
                  ~ Page {pageIndex + 1} of {pages.length} ~
                </div>
              </div>
            </div>
          );
        })}

        {/* Turn to Next Page / Add Blank Page Button */}
        <div className="w-full flex justify-center pt-2 pb-4">
          <button
            type="button"
            onClick={handleAddBlankPage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel hover:border-theme-accent text-xs font-serif text-theme-muted hover:text-theme-text transition-all cursor-pointer shadow-md hover:scale-105"
            title="Turn to a new blank diary page"
          >
            <Plus className="w-3.5 h-3.5 text-theme-accent" />
            <span>Turn to Next Page</span>
          </button>
        </div>
      </div>

      {/* Optional Attachment Drawer Below Fixed Paper */}
      {activeAttachment !== 'none' && (
        <div className="w-full max-w-3xl mt-4 p-4 rounded-2xl glass-panel shadow-lg border border-theme-border-light animate-fade-in">
          {activeAttachment === 'sentence' && (
            <div className="space-y-1">
              <label className="text-xs font-serif text-theme-muted flex items-center gap-1">
                <Quote className="w-3 h-3 text-amber-400" />
                <span>One sentence about today:</span>
              </label>
              <input
                type="text"
                value={currentEntry.oneSentence || ''}
                onChange={(e) => updateCurrentEntry({ oneSentence: e.target.value })}
                placeholder="Write one sentence about today..."
                className="w-full bg-black/20 border border-theme-border-light rounded-xl px-3 py-2 text-xs font-serif italic text-theme-text focus:outline-none focus:border-amber-400 placeholder:text-theme-muted/50"
                autoFocus
              />
            </div>
          )}

          {activeAttachment === 'mood' && (
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
          )}

          {activeAttachment === 'photos' && (
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
          )}

          {activeAttachment === 'currently' && (
            <CurrentlySection
              currently={currentEntry.currently}
              onUpdateCurrently={(currentlyUpdates) =>
                updateCurrentEntry({
                  currently: { ...currentEntry.currently, ...currentlyUpdates },
                })
              }
            />
          )}
        </div>
      )}

      {/* "On This Day" Flashbacks (Only shown if past memories exist for this month/day) */}
      {onThisDayEntries.length > 0 && (
        <div className="w-full max-w-3xl mt-4">
          <OnThisDaySection
            entries={onThisDayEntries}
            onNavigateToDate={(date) => setActiveDate(date)}
          />
        </div>
      )}

      {/* Share Page Modal */}
      <SharePageModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        dateKey={activeDate}
        formattedDate={dateDetails.formattedLong}
        entry={currentEntry}
        themeName={activeTheme}
      />
    </div>
  );
};
