import React from 'react';
import { Feather, Sparkles } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-white selection:bg-amber-500/20 selection:text-amber-200 overflow-hidden">
      {/* Cinematic Deep Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient atmospheric photo */}
        <img
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2560&q=85"
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-20 filter blur-sm scale-105 transition-all duration-1000"
        />
        {/* Soft moving ambient light glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-float-gentle pointer-events-none" />
        {/* Vignette gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-stone-950/90" />
      </div>

      {/* Film grain */}
      <div className="film-grain" />

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto space-y-6 animate-fade-in">
        {/* Emblem with soft radiant aura */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-200 shadow-glow backdrop-blur-md animate-float-gentle">
            <Feather className="w-8 h-8 text-amber-300" />
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Brand & Loading Status */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/80 block">
            Private Sanctuary
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-widest drop-shadow-md">
            MY DIARY
          </h1>
          <p className="text-sm font-serif italic text-stone-300 font-light mt-1">
            Opening your private world...
          </p>
        </div>

        {/* Minimal Animated Pulse Indicator */}
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
