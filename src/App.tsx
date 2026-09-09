import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiaryProvider, useDiary } from './context/DiaryContext';
import { RealMediaAtmosphere } from './components/ambient/RealMediaAtmosphere';
import { Sidebar } from './components/navigation/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { PhysicalDiaryPage } from './components/diary/PhysicalDiaryPage';
import { ThemeLibraryPage } from './components/themes/ThemeLibraryPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { LettersLandingPage } from './components/letters/LettersLandingPage';
import { LetterEnvelopeViewer } from './components/letters/LetterEnvelopeViewer';
import { SomedayPage } from './components/features/SomedayPage';
import { MemoriesPage } from './components/features/MemoriesPage';
import { CalendarArchiveModal } from './components/navigation/CalendarArchiveModal';
import { ThemeSwitcherModal } from './components/features/ThemeSwitcherModal';
import { PrivacyLockModal } from './components/features/PrivacyLockModal';
import { LockScreen } from './components/features/LockScreen';
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen';
import { AuthShell } from './components/auth/AuthShell';

const DiaryAppContent: React.FC = () => {
  const { settings, activeView, setActiveView, activeLetterToken, setActiveLetterToken } = useDiary();

  // Modal display states for secondary triggers
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // If a public letter token is in the URL, render the standalone LetterEnvelopeViewer directly
  // No My Diary account or passcode unlock required for the recipient
  if (activeLetterToken) {
    return (
      <div className="min-h-screen relative selection:bg-amber-500/20 selection:text-amber-200">
        <RealMediaAtmosphere />
        <div className="film-grain" />
        <LetterEnvelopeViewer
          token={activeLetterToken}
          onClose={() => {
            setActiveLetterToken(null);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname.replace(/\/letter\/[^/]+/, '/'));
            }
          }}
        />
      </div>
    );
  }

  // If locked, present full-screen cinematic lock screen
  if (settings.isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row selection:bg-amber-500/20 selection:text-amber-200">
      {/* Real Atmospheric Video/Photography Background */}
      <RealMediaAtmosphere />

      {/* Film Grain Texture Overlay */}
      <div className="film-grain" />

      {/* Persistent Left Sidebar */}
      <Sidebar onOpenPrivacyModal={() => setIsPrivacyOpen(true)} />

      {/* Main Content Viewport */}
      <main className="flex-1 md:pl-64 pt-14 md:pt-0 min-h-screen relative z-10 overflow-y-auto">
        {activeView === 'dashboard' && <MainDashboard />}
        {activeView === 'diary' && (
          <PhysicalDiaryPage
            onBackToDashboard={() => setActiveView('dashboard')}
            onOpenCalendarModal={() => setIsCalendarOpen(true)}
            onOpenThemeModal={() => setIsThemeOpen(true)}
            onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
          />
        )}
        {activeView === 'themes' && <ThemeLibraryPage />}
        {activeView === 'calendar' && <CalendarPage />}
        {(activeView === 'letters' || activeView === 'future-me') && <LettersLandingPage />}
        {activeView === 'someday' && <SomedayPage />}
        {activeView === 'capsules' && <MemoriesPage />}
      </main>

      {/* Global Modals for Quick In-Diary Triggers */}
      <ThemeSwitcherModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />

      <CalendarArchiveModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <PrivacyLockModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
};

// Helper to extract public letter token from URL without requiring authentication
function getPublicLetterToken(): string | null {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get('letter') || params.get('token');
    if (queryToken) return queryToken;

    const pathMatch = window.location.pathname.match(/^\/letter\/([^/?#]+)/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
  }
  return null;
}

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [publicToken, setPublicToken] = useState<string | null>(() => getPublicLetterToken());

  // 1. If public letter token is present in URL, render public viewer without requiring login
  if (publicToken) {
    return (
      <DiaryProvider>
        <div className="min-h-screen relative selection:bg-amber-500/20 selection:text-amber-200">
          <RealMediaAtmosphere />
          <div className="film-grain" />
          <LetterEnvelopeViewer
            token={publicToken}
            onClose={() => {
              setPublicToken(null);
              if (typeof window !== 'undefined' && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname.replace(/\/letter\/[^/]+/, '/'));
              }
              window.location.href = '/';
            }}
          />
        </div>
      </DiaryProvider>
    );
  }

  // 2. While checking existing session via /api/auth/me, render atmospheric splash loading
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // 3. If unauthenticated, show cinematic login & register authentication shell
  if (!isAuthenticated) {
    return <AuthShell />;
  }

  // 4. If authenticated, render full Diary application wrapped in DiaryProvider
  return (
    <DiaryProvider>
      <DiaryAppContent />
    </DiaryProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}


