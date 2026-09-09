import React from 'react';
import type { ThemeId } from '../../types';

export const ThemeCornerArt: React.FC<{ theme: ThemeId }> = ({ theme }) => {
  switch (theme) {
    case 'ocean':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Wave Crest */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-30 text-sky-700"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 60 Q 30 30, 50 60 T 90 60" />
            <path d="M20 70 Q 40 45, 60 70 T 100 70" />
            <circle cx="75" cy="35" r="4" fill="currentColor" opacity="0.4" />
          </svg>
          {/* Bottom Right Shell */}
          <svg
            className="absolute bottom-6 right-6 w-12 h-12 opacity-25 text-cyan-800"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M50 85 C 20 60, 20 30, 50 20 C 80 30, 80 60, 50 85 Z" />
            <line x1="50" y1="20" x2="50" y2="85" />
            <line x1="50" y1="85" x2="32" y2="35" />
            <line x1="50" y1="85" x2="68" y2="35" />
          </svg>
        </div>
      );

    case 'beach':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Sun Rays */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-30 text-amber-700"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="85" cy="15" r="14" />
            <line x1="85" y1="36" x2="85" y2="44" />
            <line x1="64" y1="15" x2="56" y2="15" />
            <line x1="70" y1="30" x2="63" y2="37" />
          </svg>
          {/* Bottom Right Starfish */}
          <svg
            className="absolute bottom-6 right-6 w-12 h-12 opacity-25 text-amber-800"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="50,15 61,38 86,38 66,54 73,78 50,64 27,78 34,54 14,38 39,38" opacity="0.35" />
          </svg>
        </div>
      );

    case 'cloudy':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Rain Cloud */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-30 text-slate-600"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M25 45 a 15 15 0 0 1 30 -5 a 18 18 0 0 1 25 15 a 12 12 0 0 1 -10 12 l -45 0 a 12 12 0 0 1 0 -22 Z" />
            <line x1="35" y1="72" x2="30" y2="82" strokeDasharray="3,3" />
            <line x1="50" y1="72" x2="45" y2="82" strokeDasharray="3,3" />
            <line x1="65" y1="72" x2="60" y2="82" strokeDasharray="3,3" />
          </svg>
        </div>
      );

    case 'moonlight':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Crescent Moon & Stars */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-40 text-purple-300"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M70 20 A 24 24 0 1 0 70 68 A 20 20 0 0 1 70 20 Z" />
            <polygon points="35,25 37,30 42,30 38,33 40,38 35,35 30,38 32,33 28,30 33,30" opacity="0.8" />
            <polygon points="25,55 26,58 29,58 27,60 28,63 25,61 22,63 23,60 21,58 24,58" opacity="0.6" />
          </svg>
        </div>
      );

    case 'foggy':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Botanical Pine Branch */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-30 text-emerald-800"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M85 15 Q 50 45, 20 80" />
            <line x1="70" y1="28" x2="55" y2="20" />
            <line x1="60" y1="38" x2="45" y2="30" />
            <line x1="50" y1="48" x2="35" y2="40" />
            <line x1="40" y1="58" x2="25" y2="50" />
          </svg>
        </div>
      );

    case 'vintage':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Antique Postal Stamp */}
          <div className="absolute top-4 right-4 border border-amber-900/30 p-1.5 rounded text-[9px] font-mono text-amber-900/50 uppercase tracking-widest text-center rotate-3">
            <div>Sanctuary</div>
            <div className="text-[7px]">★ 2026 ★</div>
          </div>
          {/* Bottom Right Botanical Flourish */}
          <svg
            className="absolute bottom-6 right-6 w-12 h-12 opacity-30 text-amber-900"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 80 C 40 80, 60 60, 80 20" />
            <circle cx="80" cy="20" r="3" fill="currentColor" />
            <path d="M35 70 C 45 60, 48 50, 40 45" />
            <path d="M55 50 C 65 40, 68 30, 60 25" />
          </svg>
        </div>
      );

    case 'clouds':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Drifting Soft Cloud */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-30 text-sky-600"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M25 60 a 16 16 0 0 1 20 -15 a 20 20 0 0 1 32 6 a 14 14 0 0 1 -4 24 l -44 0 a 12 12 0 0 1 -4 -15 Z" />
            <path d="M65 42 a 8 8 0 0 1 12 -4 a 10 10 0 0 1 8 12" strokeDasharray="2,2" opacity="0.6" />
          </svg>
        </div>
      );

    case 'blur':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Sparkle Bokeh Rings */}
          <svg
            className="absolute top-4 right-4 w-16 h-16 opacity-35 text-fuchsia-400"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="70" cy="30" r="16" strokeDasharray="4,4" />
            <circle cx="50" cy="45" r="8" fill="currentColor" opacity="0.2" />
            <circle cx="75" cy="55" r="10" />
            <polygon points="40,25 43,32 50,35 43,38 40,45 37,38 30,35 37,32" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      );

    case 'custom':
      return (
        <div className="pointer-events-none select-none">
          {/* Top Right Elegant Photo Corner Frame */}
          <svg
            className="absolute top-4 right-4 w-12 h-12 opacity-30 text-sky-700"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M40 20 L 80 20 L 80 60" />
            <circle cx="80" cy="20" r="3" fill="currentColor" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
