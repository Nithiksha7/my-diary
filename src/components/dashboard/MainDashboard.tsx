import React from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  SunMedium,
  Heart,
  Mail,
  Palette,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { useAuth } from '../../context/AuthContext';
import { getDiaryDateDetails, getTodayKey, parseDateKey, getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateUtils';
import { THEME_MEDIA } from '../../utils/themeMedia';

export const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    activeTheme,
    entries,
    futureLetters,
    somedayDreams,
    memories,
    setActiveView,
    goToToday,
    getOnThisDayEntries,
    setActiveDate,
    hasEntryOnDate,
  } = useDiary();

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const todayKey = getTodayKey();
  const dateDetails = getDiaryDateDetails(todayKey);
  const mediaConfig = THEME_MEDIA[activeTheme] || THEME_MEDIA.ocean;

  // Dynamic greeting based on user's current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return firstName ? `Good morning, ${firstName}.` : 'Good morning.';
    if (hour < 17) return firstName ? `Good afternoon, ${firstName}.` : 'Good afternoon.';
    if (hour < 22) return firstName ? `Good evening, ${firstName}.` : 'Good evening.';
    return firstName ? `Good night, ${firstName}.` : 'Good night.';
  };

  const todayEntry = entries[todayKey];
  const hasTodayContent = Boolean(todayEntry?.content?.trim() || todayEntry?.oneSentence?.trim());
  const onThisDayMatches = getOnThisDayEntries(todayKey);
  const totalEntriesCount = Object.keys(entries).length;

  // Mini calendar calculation
  const todayDateObj = parseDateKey(todayKey);
  const currentMonthIdx = todayDateObj.getMonth();
  const currentYear = todayDateObj.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonthIdx);
  const startDayOfWeek = getFirstDayOfMonth(currentYear, currentMonthIdx);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Top Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            {getGreeting()}
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 drop-shadow">
            Welcome back to your private sanctuary.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300 block">
            {dateDetails.weekday}
          </span>
          <p className="text-sm sm:text-base font-serif text-white font-bold drop-shadow">
            {dateDetails.formattedLong} • Day {dateDetails.dayOfYear} of {dateDetails.totalDays}
          </p>
        </div>
      </div>

      {/* Primary Card: Today's Diary */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black/60 backdrop-blur-xl group">
        {/* Real Video or Image Preview Background of Active Theme */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-stone-950">
          <img
            key={`dash-img-${mediaConfig.id}`}
            src={mediaConfig.previewImageUrl}
            alt={mediaConfig.name}
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 filter brightness-95"
          />
          <video
            key={`dash-vid-${mediaConfig.videoUrl}`}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 filter brightness-95"
          >
            <source src={mediaConfig.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-serif font-bold text-white shadow-sm">
              <SunMedium className="w-4 h-4 text-amber-300" />
              <span>Today's Sanctuary</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-wide drop-shadow-md">
              {dateDetails.formattedLong}
            </h2>

            <p className="text-sm font-serif font-bold italic text-white/95 leading-relaxed drop-shadow">
              {hasTodayContent
                ? 'You have recorded thoughts for today. Click to continue your entry.'
                : 'A clean, quiet page with ruled lines is waiting for your reflections.'}
            </p>

            <div className="flex items-center gap-4 text-xs font-serif font-bold text-white pt-2">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-sky-300" />
                <span>Atmosphere: <strong>{mediaConfig.name}</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={() => {
                goToToday();
                setActiveView('diary');
              }}
              className="px-7 py-3 rounded-2xl bg-sky-400 hover:brightness-110 text-slate-950 font-serif font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all"
            >
              <span>{hasTodayContent ? 'Continue Today’s Diary' : 'Open Today’s Diary'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => setActiveView('themes')}
              className="px-4 py-2.5 rounded-2xl bg-black/50 hover:bg-black/80 border border-white/25 text-xs font-serif font-bold text-white hover:border-white transition-colors text-center shadow-md"
            >
              Change Atmosphere ({mediaConfig.name})
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Sanctuary Overview & Mini Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Mini Month Calendar */}
        <div className="p-6 rounded-3xl glass-panel border border-white/20 space-y-4 bg-black/60 backdrop-blur-xl shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-300" />
              <h3 className="font-serif font-extrabold text-lg text-white">
                {dateDetails.month} {dateDetails.year}
              </h3>
            </div>
            <button
              onClick={() => setActiveView('calendar')}
              className="text-xs font-serif font-bold text-sky-300 hover:underline"
            >
              Archive →
            </button>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono font-bold text-white">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`b-${i}`} className="aspect-square" />
            ))}
            {daysArray.map((d) => {
              const dKey = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isTodayDay = dKey === todayKey;
              const status = hasEntryOnDate(dKey);

              return (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDate(dKey);
                    setActiveView('diary');
                  }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-serif font-bold transition-all shadow-sm ${
                    isTodayDay
                      ? 'bg-sky-400 text-slate-950 font-extrabold ring-2 ring-sky-300 shadow-glow'
                      : status.hasEntry
                      ? 'bg-white/30 text-white font-extrabold'
                      : 'hover:bg-white/20 text-white bg-black/40'
                  }`}
                  title={`${dKey} ${status.hasEntry ? '(Has memory)' : ''}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sanctuary Memory Highlights */}
        <div className="p-6 rounded-3xl glass-panel border border-white/20 space-y-4 flex flex-col justify-between bg-black/60 backdrop-blur-xl shadow-2xl text-white">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="font-serif font-extrabold text-lg text-white">
                Preserved Moments
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-serif font-bold italic text-white/90 leading-relaxed">
              {totalEntriesCount === 0 && memories.length === 0
                ? 'Your diary is clean and waiting for your first recorded memory.'
                : `You have written ${totalEntriesCount} diary pages and saved ${memories.length} photo moments.`}
            </p>

            <div className="space-y-2 pt-2 text-xs font-serif font-bold text-white">
              <div className="flex justify-between py-1.5 border-b border-white/15 text-white">
                <span>Memories Gallery</span>
                <span className="font-mono font-extrabold text-white">{memories.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/15 text-white">
                <span>Someday Dreams</span>
                <span className="font-mono font-extrabold text-white">{somedayDreams.length}</span>
              </div>
              <div className="flex justify-between py-1.5 text-white">
                <span>Future Letters</span>
                <span className="font-mono font-extrabold text-white">{futureLetters.length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('capsules')}
            className="w-full py-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-xs font-serif font-bold text-white hover:border-white transition-colors text-center border border-white/20 shadow-md"
          >
            Open Memories Gallery →
          </button>
        </div>

        {/* 3. Future Me & Someday Quick Portals */}
        <div className="p-6 rounded-3xl glass-panel border border-white/20 space-y-4 flex flex-col justify-between bg-black/60 backdrop-blur-xl shadow-2xl text-white">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <h3 className="font-serif font-extrabold text-lg text-white">
                Wishes & Future Letters
              </h3>
            </div>

            {futureLetters.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-400/40 text-xs font-serif text-white">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 block mb-1">
                  Next Sealed Letter
                </span>
                <p className="font-bold text-white truncate text-sm">{futureLetters[0].title}</p>
                <span className="text-xs text-white/80 font-semibold">Unlocks {futureLetters[0].unlockDate}</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-serif font-bold italic text-white/90 leading-relaxed">
                Write a letter to your future self and seal it in wax until a chosen date.
              </p>
            )}

            {somedayDreams.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-400/40 text-xs font-serif text-white">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block mb-1">
                  ✦ Someday Wish
                </span>
                <p className="font-serif font-bold italic text-white line-clamp-2">
                  “{somedayDreams[0].title}”
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('future-me')}
              className="flex-1 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-xs font-serif font-bold text-white hover:border-white transition-colors text-center border border-white/20 shadow-md"
            >
              Write Letter
            </button>
            <button
              onClick={() => setActiveView('someday')}
              className="flex-1 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-xs font-serif font-bold text-white hover:border-white transition-colors text-center border border-white/20 shadow-md"
            >
              Dreams
            </button>
          </div>
        </div>
      </div>

      {/* Historical Flashback Section */}
      {onThisDayMatches.length > 0 && (
        <div className="p-6 rounded-3xl border border-amber-400/40 bg-black/60 backdrop-blur-xl space-y-3 text-white shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-serif font-extrabold text-lg text-white">
              On This Day in Past Years
            </h3>
          </div>
          <p className="text-sm font-serif font-bold italic text-white/95">
            You have {onThisDayMatches.length} memory recorded on {dateDetails.month} {dateDetails.day} in previous years.
          </p>
          <button
            onClick={() => {
              goToToday();
              setActiveView('diary');
            }}
            className="text-xs font-serif font-bold text-amber-300 hover:underline"
          >
            View on today's diary page →
          </button>
        </div>
      )}
    </div>
  );
};
