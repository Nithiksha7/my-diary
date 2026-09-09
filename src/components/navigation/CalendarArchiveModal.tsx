import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
  Camera,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import {
  getDaysInMonth,
  getDaysInYear,
  getFirstDayOfMonth,
  getTodayKey,
  MONTH_NAMES,
  parseDateKey,
} from '../../utils/dateUtils';

export const CalendarArchiveModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeDate, setActiveDate, hasEntryOnDate } = useDiary();

  const currentDateObj = parseDateKey(activeDate);
  const [selectedYear, setSelectedYear] = useState<number>(currentDateObj.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDateObj.getMonth());

  if (!isOpen) return null;

  const todayKey = getTodayKey();
  const totalDaysInYear = getDaysInYear(selectedYear);
  const daysInMonthCount = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfWeek = getFirstDayOfMonth(selectedYear, selectedMonth);

  const daysArray = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetKey = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    setActiveDate(targetKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-journal p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 text-theme-highlight">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-theme-accent">
                  The Diary Archive
                </span>
                <span className="text-xs text-theme-muted font-serif">
                  • {totalDaysInYear} pages
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-theme-text flex items-center gap-3 mt-0.5">
                <span>{selectedYear}</span>
                <div className="flex items-center gap-1 text-sm font-normal">
                  <button
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="p-1 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text"
                    title="Previous Year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="p-1 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text"
                    title="Next Year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 12 Months Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {MONTH_NAMES.map((monthName, idx) => {
            const isCurrentMonth = selectedMonth === idx;
            const daysCount = getDaysInMonth(selectedYear, idx);

            return (
              <button
                key={monthName}
                onClick={() => setSelectedMonth(idx)}
                className={`px-3 py-2.5 rounded-2xl text-left border transition-all duration-300 ${
                  isCurrentMonth
                    ? 'bg-theme-accent/20 border-theme-accent text-theme-highlight shadow-glow'
                    : 'bg-black/20 hover:bg-white/5 border-theme-border-light text-theme-muted hover:text-theme-text'
                }`}
              >
                <div className="font-serif font-semibold text-xs truncate">
                  {monthName}
                </div>
                <div className="text-[10px] text-theme-muted font-mono mt-0.5">
                  {daysCount} pages
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Month Date Matrix */}
        <div className="journal-paper rounded-3xl p-6 border border-theme-border shadow-journal">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-theme-border-light">
            <h3 className="font-serif font-bold text-lg text-theme-text">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h3>
            <div className="flex items-center gap-4 text-xs text-theme-muted font-serif">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-theme-accent shadow-glow" />
                <span>Memory</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>Special</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-mono uppercase text-theme-muted/70 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square opacity-0 pointer-events-none" />
            ))}

            {daysArray.map((day) => {
              const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateKey = `${selectedYear}-${formattedMonth}-${formattedDay}`;

              const isSelected = dateKey === activeDate;
              const isTodayDate = dateKey === todayKey;
              const status = hasEntryOnDate(dateKey);

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={`aspect-square relative rounded-2xl p-1.5 flex flex-col items-center justify-between border transition-all duration-300 group ${
                    isSelected
                      ? 'border-theme-accent bg-theme-accent/25 text-theme-highlight shadow-glow scale-105 z-10'
                      : isTodayDate
                      ? 'border-white/40 bg-white/10 text-theme-text font-bold'
                      : status.hasEntry
                      ? 'border-theme-border bg-black/30 hover:bg-white/10 text-theme-text'
                      : 'border-theme-border-light/40 hover:border-theme-border bg-black/10 hover:bg-white/5 text-theme-muted/80'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-serif font-medium">
                      {formattedDay}
                    </span>
                    {status.isSpecial && (
                      <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300 shrink-0" />
                    )}
                  </div>

                  <div className="w-full flex items-center justify-center gap-1 mt-auto pb-0.5">
                    {status.hasEntry && (
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shadow-glow" />
                    )}
                    {status.hasPhotos && (
                      <Camera className="w-2.5 h-2.5 text-theme-muted opacity-80" />
                    )}
                    {status.mood && (
                      <span className="text-[9px] opacity-70">
                        {status.mood === 'peaceful' ? '🕊️' : status.mood === 'happy' ? '✨' : status.mood === 'nostalgic' ? '🍂' : status.mood === 'loved' ? '🕯️' : '☁️'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
