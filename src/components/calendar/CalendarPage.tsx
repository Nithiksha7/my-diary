import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Camera,
  ArrowRight,
  SunMedium,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getTodayKey,
  MONTH_NAMES,
  parseDateKey,
} from '../../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { activeDate, setActiveDate, hasEntryOnDate, setActiveView } = useDiary();

  const currentDateObj = parseDateKey(activeDate);
  const [selectedYear, setSelectedYear] = useState<number>(currentDateObj.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDateObj.getMonth());

  const todayKey = getTodayKey();
  const daysInMonthCount = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfWeek = getFirstDayOfMonth(selectedYear, selectedMonth);

  const daysArray = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetKey = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    setActiveDate(targetKey);
    setActiveView('diary');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300 block mb-1">
            Browse by Date
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            CALENDAR
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 drop-shadow">
            Every day has a page. Revisit any of them.
          </p>
        </div>

        {/* Year Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold border border-white/30 hover:border-white flex items-center gap-1 text-xs font-serif transition-colors shadow-md"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>{selectedYear - 1}</span>
          </button>

          <span className="font-serif font-extrabold text-2xl text-white px-2 drop-shadow">
            {selectedYear}
          </span>

          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold border border-white/30 hover:border-white flex items-center gap-1 text-xs font-serif transition-colors shadow-md"
            title="Next Year"
          >
            <span>{selectedYear + 1}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 12 Months Selector Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {MONTH_NAMES.map((monthName, idx) => {
          const isCurrentMonth = selectedMonth === idx;

          return (
            <button
              key={monthName}
              onClick={() => setSelectedMonth(idx)}
              className={`py-2.5 px-2 rounded-xl text-center border font-bold transition-all duration-200 shadow-md ${
                isCurrentMonth
                  ? 'bg-sky-500/40 border-sky-300 text-white font-extrabold ring-2 ring-sky-400/50 shadow-glow scale-105'
                  : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-white text-white font-bold'
              }`}
            >
              <span className="text-xs sm:text-sm font-serif truncate block">
                {monthName.substring(0, 3)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Month Date Grid */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl bg-black/60 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/20">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white drop-shadow">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>
            <span className="text-xs sm:text-sm font-serif font-bold italic text-white/90">
              Click on any day to open and read or write its diary page.
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-white font-serif font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-glow" />
              <span>Has Entry</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Special</span>
            </span>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold uppercase text-white tracking-widest mb-3">
          <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square opacity-0 pointer-events-none" />
          ))}

          {daysArray.map((day) => {
            const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateKey = `${selectedYear}-${formattedMonth}-${formattedDay}`;

            const isTodayDate = dateKey === todayKey;
            const status = hasEntryOnDate(dateKey);

            return (
              <button
                key={day}
                onClick={() => handleSelectDate(day)}
                className={`aspect-square relative rounded-2xl p-3 flex flex-col items-center justify-between border transition-all duration-300 group cursor-pointer shadow-md ${
                  isTodayDate
                    ? 'border-sky-400 bg-sky-500/40 text-white font-extrabold ring-2 ring-sky-300 shadow-glow scale-[1.03]'
                    : status.hasEntry
                    ? 'border-white/40 bg-black/70 hover:border-white hover:bg-black/90 text-white font-bold'
                    : 'border-white/15 hover:border-white/60 bg-black/45 hover:bg-black/70 text-white font-bold'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-sm sm:text-base font-serif font-extrabold text-white">
                    {formattedDay}
                  </span>
                  {status.isSpecial ? (
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                  ) : isTodayDate ? (
                    <SunMedium className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
                  ) : null}
                </div>

                <div className="w-full flex items-center justify-center gap-1.5 mt-auto pb-0.5">
                  {status.hasEntry && (
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-glow" />
                  )}
                  {status.hasPhotos && (
                    <Camera className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-sky-300 font-serif font-bold absolute bottom-1.5 right-2">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
