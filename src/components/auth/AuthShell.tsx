import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export const AuthShell: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-950 text-white selection:bg-amber-500/20 selection:text-amber-200 overflow-hidden">
      {/* 1. Cinematic Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-stone-950">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=90"
          alt="My Diary Sanctuary Atmosphere"
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-105 saturate-90 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Warm & Cool Light Orbs */}
        <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
        <div className="absolute -bottom-32 right-1/4 w-[36rem] h-[36rem] bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-float-gentle" />

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* 2. Film Grain Texture Overlay */}
      <div className="film-grain" />

      {/* 3. Centered Authentication Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-stone-950/80 sm:bg-black/65 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-9 shadow-journal shadow-black/80 transition-all duration-300 relative overflow-hidden">
          {/* Subtle Top Accent Glow Line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {authView === 'login' ? (
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>

        {/* Subtle Bottom Sanctuary Footer */}
        <div className="text-center mt-6">
          <p className="text-[11px] font-serif italic text-stone-400/80 tracking-wide">
            A private sanctuary guarded by your personal credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
