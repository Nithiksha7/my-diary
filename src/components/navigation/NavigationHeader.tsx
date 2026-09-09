import React from 'react';
import {
  Book,
  Calendar,
  Moon,
  Sparkles,
  Box,
  Palette,
  Lock,
  Feather,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import type { ActiveView } from '../../types';

interface NavigationHeaderProps {
  onOpenThemeModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenFutureMeModal: () => void;
  onOpenSomedayModal: () => void;
  onOpenCapsulesModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  onOpenThemeModal,
  onOpenCalendarModal,
  onOpenFutureMeModal,
  onOpenSomedayModal,
  onOpenCapsulesModal,
  onOpenPrivacyModal,
}) => {
  const { activeView, setActiveView, goToToday, activeTheme } = useDiary();

  const navItems = [
    {
      id: 'diary' as ActiveView,
      label: 'My Diary',
      icon: <Book className="w-4 h-4" />,
      onClick: () => {
        setActiveView('diary');
        goToToday();
      },
    },
    {
      id: 'calendar' as ActiveView,
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
      onClick: onOpenCalendarModal,
    },
    {
      id: 'future-me' as ActiveView,
      label: 'Future Me',
      icon: <Moon className="w-4 h-4" />,
      onClick: onOpenFutureMeModal,
    },
    {
      id: 'someday' as ActiveView,
      label: 'Someday',
      icon: <Sparkles className="w-4 h-4" />,
      onClick: onOpenSomedayModal,
    },
    {
      id: 'capsules' as ActiveView,
      label: 'Memories',
      icon: <Box className="w-4 h-4" />,
      onClick: onOpenCapsulesModal,
    },
  ];

  return (
    <>
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 p-2 sm:px-6 rounded-full glass-panel shadow-journal border border-theme-border-light">
          {/* Brand Identity */}
          <button
            onClick={() => {
              setActiveView('diary');
              goToToday();
            }}
            className="flex items-center gap-2 group text-left px-2"
          >
            <div className="p-1.5 rounded-full bg-theme-accent/15 border border-theme-accent/30 text-theme-highlight group-hover:scale-110 transition-transform">
              <Feather className="w-4 h-4 text-theme-accent" />
            </div>
            <div>
              <span className="font-serif font-bold text-base sm:text-lg text-theme-text tracking-wider group-hover:text-theme-highlight transition-colors block leading-tight">
                My Diary
              </span>
              <span className="text-[10px] text-theme-muted font-serif italic hidden md:block leading-none">
                A secret place
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-serif">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-theme-accent/20 text-theme-highlight border border-theme-accent/40 shadow-glow font-medium'
                      : 'text-theme-muted hover:text-theme-text hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif text-theme-muted hover:text-theme-text bg-white/5 hover:bg-white/10 border border-theme-border-light transition-all"
              title="Change Atmosphere & Theme"
            >
              <Palette className="w-3.5 h-3.5 text-theme-accent" />
              <span className="hidden sm:inline capitalize font-serif">{activeTheme}</span>
            </button>

            <button
              onClick={onOpenPrivacyModal}
              className="p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-white/10 transition-colors"
              title="Privacy & Security"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
        <nav className="flex items-center justify-around py-2 px-3 rounded-full glass-panel shadow-journal border border-theme-border text-theme-text">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`p-2 rounded-full flex flex-col items-center gap-0.5 transition-all ${
                  isActive
                    ? 'text-theme-highlight bg-theme-accent/20 border border-theme-accent/30'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[9px] font-serif leading-none mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
