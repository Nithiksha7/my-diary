import React, { useState } from 'react';
import {
  Book,
  Palette,
  Calendar,
  Heart,
  Sparkles,
  Mail,
  Lock,
  Feather,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { useAuth } from '../../context/AuthContext';
import type { ActiveView } from '../../types';

interface SidebarProps {
  onOpenPrivacyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPrivacyModal }) => {
  const { activeView, setActiveView, goToToday, activeTheme } = useDiary();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      id: 'today',
      label: 'Today',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      onClick: () => {
        goToToday();
        setActiveView('diary');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'dashboard' as ActiveView,
      label: 'My Diary',
      icon: <Book className="w-4 h-4 text-sky-300" />,
      onClick: () => {
        setActiveView('dashboard');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'themes' as ActiveView,
      label: 'Diary Themes',
      icon: <Palette className="w-4 h-4 text-sky-400" />,
      onClick: () => {
        setActiveView('themes');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'calendar' as ActiveView,
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4 text-cyan-300" />,
      onClick: () => {
        setActiveView('calendar');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'capsules' as ActiveView,
      label: 'Memories',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      onClick: () => {
        setActiveView('capsules');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'someday' as ActiveView,
      label: 'Someday',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      onClick: () => {
        setActiveView('someday');
        setIsMobileOpen(false);
      },
    },
    {
      id: 'letters' as ActiveView,
      label: 'Letters',
      icon: <Mail className="w-4 h-4 text-purple-300" />,
      onClick: () => {
        setActiveView('letters');
        setIsMobileOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 px-4 py-3 bg-black/80 backdrop-blur-lg border-b border-white/20 flex items-center justify-between text-white">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2"
        >
          <div className="p-1.5 rounded-full bg-sky-500/30 border border-sky-400 text-white">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-serif font-extrabold text-lg tracking-wide text-white">
            My Diary
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-black/50 border border-white/20 text-white"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop on mobile drawer */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-white/20 p-6 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 bg-black/80 backdrop-blur-2xl shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-3 mb-8 text-left group cursor-pointer"
          >
            <div className="p-2.5 rounded-2xl bg-sky-500/25 border border-sky-400 text-white group-hover:scale-105 transition-transform shadow-glow">
              <Feather className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-xl text-white tracking-wider drop-shadow-md">
                MY DIARY
              </h1>
              <span className="text-[11px] font-serif font-bold italic text-white/90 block">
                A secret place
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1.5 font-serif text-sm">
            {navItems.map((item) => {
              const isActive =
                item.id === 'today'
                  ? activeView === 'diary'
                  : activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm ${
                    isActive
                      ? 'bg-sky-500/35 text-white border border-sky-300 font-extrabold shadow-glow'
                      : 'text-white font-bold hover:text-white hover:bg-white/15 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-white font-bold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-5 border-t border-white/20 space-y-2.5">
          {/* Authenticated User Card & Sign Out */}
          {user && (
            <div className="p-2.5 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-200 font-serif font-bold text-xs shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-serif font-bold text-white truncate leading-tight">
                    {user.name || 'Private Diarist'}
                  </p>
                  <p className="text-[10px] font-mono text-stone-400 truncate leading-tight mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign out of My Diary"
                aria-label="Sign out of My Diary"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-stone-300 hover:text-rose-300 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Atmosphere Badge */}
          <button
            onClick={() => {
              setActiveView('themes');
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-black/60 border border-white/20 hover:border-white transition-colors text-left cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-sky-300" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300 block">
                  Atmosphere
                </span>
                <span className="text-xs font-serif font-extrabold capitalize text-white">
                  {activeTheme}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-sky-300 font-serif font-bold">Change →</span>
          </button>

          {/* Privacy & Security Lock */}
          <div>
            <button
              onClick={() => {
                onOpenPrivacyModal();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white font-serif font-bold text-xs transition-colors border border-white/20 hover:border-white shadow-sm cursor-pointer"
              title="Privacy & Security"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Privacy & Lock</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

