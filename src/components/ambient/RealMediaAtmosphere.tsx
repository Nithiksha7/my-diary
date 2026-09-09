import React, { useState, useEffect } from 'react';
import { useDiary } from '../../context/DiaryContext';
import { THEME_MEDIA } from '../../utils/themeMedia';

export const RealMediaAtmosphere: React.FC = () => {
  const { activeTheme, activeBackground } = useDiary();
  const mediaConfig = THEME_MEDIA[activeTheme] || THEME_MEDIA.ocean;

  // Track active and incoming image sources for silky cross-fade
  const [currentSrc, setCurrentSrc] = useState<string>(() => activeBackground?.fallbackUrl || mediaConfig.fallbackImageUrl);
  const [incomingSrc, setIncomingSrc] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);

  useEffect(() => {
    if (!activeBackground) return;

    const targetPath = activeBackground.path;
    const fallbackPath = activeBackground.fallbackUrl;

    let isMounted = true;
    const img = new Image();

    const switchImage = (resolvedSrc: string) => {
      if (!isMounted) return;
      if (resolvedSrc === currentSrc && !incomingSrc) return;

      // Stage incoming image and trigger fade-in
      setIncomingSrc(resolvedSrc);
      setIsCrossFading(true);

      const timer = setTimeout(() => {
        if (isMounted) {
          setCurrentSrc(resolvedSrc);
          setIncomingSrc(null);
          setIsCrossFading(false);
        }
      }, 750);

      return () => clearTimeout(timer);
    };

    img.onload = () => {
      switchImage(targetPath);
    };

    img.onerror = () => {
      // Gracefully use distinct high-res curated photograph for this index
      switchImage(fallbackPath);
    };

    img.src = targetPath;

    return () => {
      isMounted = false;
    };
  }, [activeBackground?.id, activeBackground?.path, activeBackground?.fallbackUrl, activeTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-stone-950">
      {/* 1. Base Real Photography Layer (Always clear & vibrant) */}
      <img
        src={currentSrc}
        alt={`${mediaConfig.name} Atmosphere`}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover scale-100 filter brightness-100 contrast-105 saturate-105 transition-transform duration-1000 ease-out"
      />

      {/* 2. Smooth Cross-Fade Photography Layer */}
      {incomingSrc && (
        <img
          src={incomingSrc}
          alt={`${mediaConfig.name} Atmosphere Transition`}
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover scale-100 filter brightness-100 contrast-105 saturate-105 transition-opacity duration-700 ease-in-out ${
            isCrossFading ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 3. Subtle Edge Vignette (Keeps the scene bright and clear while maintaining UI text legibility) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/45 pointer-events-none" />
    </div>
  );
};
