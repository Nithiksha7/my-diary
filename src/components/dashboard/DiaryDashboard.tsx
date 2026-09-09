import React from 'react';
import {
  Calendar,
  Moon,
  Sparkles,
  Box,
  Lock,
  ArrowRight,
  Feather,
  Waves,
  Sunset,
  CloudRain,
  Trees,
  Scroll,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { ThemeId } from '../../types';
import { getDiaryDateDetails, getTodayKey } from '../../utils/dateUtils';

interface BookCoverConfig {
  id: ThemeId;
  title: string;
  subtitle: string;
  tagline: string;
  coverBg: string;
  spineColor: string;
  ribbonColor: string;
  foilColor: string;
  icon: React.ReactNode;
  paperPreviewDesc: string;
}

const DIARY_BOOKS: BookCoverConfig[] = [
  {
    id: 'ocean',
    title: 'Ocean Diary',
    subtitle: 'Coastal Reveries & Tides',
    tagline: 'Deep blue tones • Wave accents • Cyan paper',
    coverBg: 'linear-gradient(145deg, #071f35 0%, #030c17 100%)',
    spineColor: '#0284c7',
    ribbonColor: '#38bdf8',
    foilColor: '#7dd3fc',
    icon: <Waves className="w-8 h-8 text-sky-300 mb-2" />,
    paperPreviewDesc: 'Crisp cyan-cream lined paper with wave watermarks',
  },
  {
    id: 'beach',
    title: 'Beach Diary',
    subtitle: 'Summer Sunset & Warm Sands',
    tagline: 'Sand cream paper • Sun rays • Amber tones',
    coverBg: 'linear-gradient(145deg, #451a24 0%, #1c0b14 100%)',
    spineColor: '#d97706',
    ribbonColor: '#fb923c',
    foilColor: '#fde68a',
    icon: <Sunset className="w-8 h-8 text-amber-300 mb-2" />,
    paperPreviewDesc: 'Warm ivory parchment with sunset amber ruling',
  },
  {
    id: 'cloudy',
    title: 'Feel Good Diary',
    subtitle: 'Soft moments & quiet feelings',
    tagline: 'Slate grey paper • Raindrop art • Introspective',
    coverBg: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    spineColor: '#64748b',
    ribbonColor: '#94a3b8',
    foilColor: '#e2e8f0',
    icon: <CloudRain className="w-8 h-8 text-slate-300 mb-2" />,
    paperPreviewDesc: 'Soft mist-grey lined paper with gentle droplet art',
  },
  {
    id: 'moonlight',
    title: 'Moonlight Diary',
    subtitle: 'Midnight Starlight & Stillness',
    tagline: 'Indigo velvet • Silver celestial stars • Luminous',
    coverBg: 'linear-gradient(145deg, #1e1548 0%, #080617 100%)',
    spineColor: '#7c3aed',
    ribbonColor: '#a78bfa',
    foilColor: '#e9d5ff',
    icon: <Moon className="w-8 h-8 text-purple-300 mb-2" />,
    paperPreviewDesc: 'Deep night-sky stationery with luminous starlight lines',
  },
  {
    id: 'foggy',
    title: 'Foggy Forest Diary',
    subtitle: 'Pine Mist & Quiet Solitude',
    tagline: 'Sage herbal paper • Leaf accents • Evergreen',
    coverBg: 'linear-gradient(145deg, #0d2919 0%, #05130b 100%)',
    spineColor: '#059669',
    ribbonColor: '#34d399',
    foilColor: '#a7f3d0',
    icon: <Trees className="w-8 h-8 text-emerald-300 mb-2" />,
    paperPreviewDesc: 'Sage green paper with delicate botanical pine sprigs',
  },
  {
    id: 'vintage',
    title: 'Vintage Diary',
    subtitle: 'Aged Parchment & Sepia Ink',
    tagline: 'Antique paper • Red margin line • Timeless',
    coverBg: 'linear-gradient(145deg, #332011 0%, #150c05 100%)',
    spineColor: '#92400e',
    ribbonColor: '#b91c1c',
    foilColor: '#fde047',
    icon: <Scroll className="w-8 h-8 text-amber-200 mb-2" />,
    paperPreviewDesc: 'Aged deckled parchment with classic red margin rule',
  },
];

interface DiaryDashboardProps {
  onOpenDiaryWithTheme: (theme: ThemeId) => void;
  onOpenCalendarModal: () => void;
  onOpenFutureMeModal: () => void;
  onOpenSomedayModal: () => void;
  onOpenCapsulesModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const DiaryDashboard: React.FC<DiaryDashboardProps> = ({
  onOpenDiaryWithTheme,
  onOpenCalendarModal,
  onOpenFutureMeModal,
  onOpenSomedayModal,
  onOpenCapsulesModal,
  onOpenPrivacyModal,
}) => {
  const { activeTheme } = useDiary();
  const dateDetails = getDiaryDateDetails(getTodayKey());

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-6xl mx-auto relative z-10 flex flex-col justify-between animate-fade-in text-theme-text">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-theme-border-light">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-theme-accent/15 border border-theme-accent/30 text-theme-highlight">
            <Feather className="w-5 h-5 text-theme-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wider text-theme-text">
              MY DIARY
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-theme-muted">
              “A place for everything you never want to forget.”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPrivacyModal}
            className="p-2 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
            title="Privacy & Security"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sanctuary Hero Banner */}
      <div className="my-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-theme-border-light text-xs font-serif text-theme-muted mb-4">
          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
          <span>Today is {dateDetails.formattedLong} • {dateDetails.weekday}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight text-theme-text mb-3">
          Choose Your Diary Atmosphere
        </h2>
        <p className="text-sm sm:text-base font-serif italic text-theme-muted leading-relaxed">
          Select a physical journal design below to enter today’s lined writing page.
        </p>
      </div>

      {/* 3D Physical Book Covers Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {DIARY_BOOKS.map((book) => {
          const isCurrentTheme = activeTheme === book.id;

          return (
            <div
              key={book.id}
              className="diary-book-card group relative flex flex-col justify-between rounded-3xl p-6 border border-white/10 cursor-pointer overflow-hidden transition-all duration-300"
              style={{
                background: book.coverBg,
                boxShadow: isCurrentTheme
                  ? '0 20px 40px -10px var(--theme-accent-glow), 0 0 0 2px var(--theme-accent)'
                  : '0 20px 40px -10px rgba(0,0,0,0.6)',
              }}
              onClick={() => onOpenDiaryWithTheme(book.id)}
            >
              {/* Satin Ribbon Bookmark */}
              <div
                className="satin-ribbon"
                style={{ backgroundColor: book.ribbonColor }}
              />

              {/* Spine edge line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-3 opacity-60"
                style={{ backgroundColor: book.spineColor }}
              />

              {/* Book Front Artwork & Title */}
              <div className="pl-3">
                <div className="mb-4">
                  {book.icon}
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-75 block mb-1">
                    {book.tagline}
                  </span>
                  <h3
                    className="text-2xl font-serif font-bold tracking-wide text-white group-hover:scale-[1.02] transition-transform"
                    style={{ color: book.foilColor }}
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs font-serif italic text-white/70 mt-0.5">
                    {book.subtitle}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/10 mb-6 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">
                    Writing Surface
                  </span>
                  <p className="text-xs font-serif italic text-white/80">
                    {book.paperPreviewDesc}
                  </p>
                </div>
              </div>

              {/* Open Diary Button */}
              <div className="pl-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDiaryWithTheme(book.id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-serif text-xs font-semibold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-md group-hover:border-white/40 transition-all"
                >
                  <span>OPEN DIARY</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Sanctuary Portals Bar */}
      <div className="pt-8 border-t border-theme-border-light">
        <span className="text-xs font-mono uppercase tracking-widest text-theme-muted block mb-4 text-center">
          Explore Your Memory Vaults
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={onOpenCalendarModal}
            className="p-4 rounded-2xl glass-panel glass-panel-hover text-left group"
          >
            <Calendar className="w-5 h-5 text-theme-accent mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-serif font-semibold text-sm text-theme-text">Calendar</h4>
            <p className="text-[11px] font-serif italic text-theme-muted">365-day archive</p>
          </button>

          <button
            onClick={onOpenFutureMeModal}
            className="p-4 rounded-2xl glass-panel glass-panel-hover text-left group"
          >
            <Moon className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-serif font-semibold text-sm text-theme-text">Future Me</h4>
            <p className="text-[11px] font-serif italic text-theme-muted">Wax-sealed letters</p>
          </button>

          <button
            onClick={onOpenSomedayModal}
            className="p-4 rounded-2xl glass-panel glass-panel-hover text-left group"
          >
            <Sparkles className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-serif font-semibold text-sm text-theme-text">Someday</h4>
            <p className="text-[11px] font-serif italic text-theme-muted">Dreams & wishes</p>
          </button>

          <button
            onClick={onOpenCapsulesModal}
            className="p-4 rounded-2xl glass-panel glass-panel-hover text-left group"
          >
            <Box className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-serif font-semibold text-sm text-theme-text">Memories</h4>
            <p className="text-[11px] font-serif italic text-theme-muted">Scrapbook capsules</p>
          </button>
        </div>
      </div>
    </div>
  );
};
