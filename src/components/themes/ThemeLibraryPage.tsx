import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, Palette, Eye, RotateCw, Camera, Trash2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { THEME_MEDIA, type ThemeMediaConfig } from '../../utils/themeMedia';
import { getThemeBackgroundByIndex } from '../../utils/themeBackgrounds';
import type { ThemeId } from '../../types';

interface ThemeCardItemProps {
  theme: ThemeMediaConfig;
  isSelected: boolean;
  backgroundIndex: number;
  onOpenDiary: (id: ThemeId) => void;
  onSetDefault: (id: ThemeId) => void;
  onRefreshTheme: (id: ThemeId) => void;
}

const ThemeCardItem: React.FC<ThemeCardItemProps> = ({
  theme,
  isSelected,
  backgroundIndex,
  onOpenDiary,
  onSetDefault,
  onRefreshTheme,
}) => {
  const bgObj = getThemeBackgroundByIndex(theme.id, backgroundIndex);
  const [currentImageSrc, setCurrentImageSrc] = useState(bgObj.fallbackUrl || theme.fallbackImageUrl);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setCurrentImageSrc(bgObj.fallbackUrl || theme.fallbackImageUrl);
    const img = new Image();

    img.onload = () => {
      if (isMounted) setCurrentImageSrc(bgObj.path);
    };
    img.onerror = () => {
      if (isMounted) setCurrentImageSrc(bgObj.fallbackUrl || theme.fallbackImageUrl);
    };
    img.src = bgObj.path;

    return () => {
      isMounted = false;
    };
  }, [bgObj.id, bgObj.path, bgObj.fallbackUrl, theme.fallbackImageUrl]);

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    onRefreshTheme(theme.id);
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <div
      className={`rounded-3xl overflow-hidden glass-panel border transition-all duration-300 flex flex-col justify-between group shadow-2xl hover:shadow-2xl text-white ${
        isSelected
          ? 'border-sky-300 ring-2 ring-sky-400/50 shadow-glow scale-[1.01] bg-black/75'
          : 'border-white/20 hover:border-white bg-black/60 backdrop-blur-xl'
      }`}
    >
      {/* Visual Media Header (Real Photograph) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
        {/* Real High-Resolution Photograph */}
        <img
          src={currentImageSrc}
          alt={theme.name}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-100"
        />

        {/* Subtle Bottom Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Left: Refresh / Change Background Button on Card */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={handleRefreshClick}
            className="p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white/90 hover:text-white border border-white/30 transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 flex items-center gap-1.5 text-xs font-serif font-bold"
            title={`Change background for ${theme.name}`}
            aria-label={`Change ${theme.name} background`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'rotate-180 transition-transform duration-500 text-sky-300' : ''}`} />
            <span className="hidden sm:inline">Change Photo</span>
          </button>
        </div>

        {/* Top-Right: Active Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          {isSelected && (
            <span className="px-3 py-1 rounded-full bg-sky-400 text-slate-950 font-serif font-extrabold text-xs flex items-center gap-1 shadow-lg backdrop-blur-md">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Active</span>
            </span>
          )}
        </div>

        {/* Title & Emoji placed over bottom of the visual media */}
        <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow-md">{theme.emoji}</span>
            <h3 className="text-2xl font-serif font-extrabold text-white tracking-wide drop-shadow-md">
              {theme.name}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold italic text-white/95 mt-0.5 drop-shadow">
            {theme.subtitle}
          </p>
        </div>
      </div>

      {/* Card Content & Action Area */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-end text-white">
        <div className="space-y-2 pt-2 border-t border-white/15">
          <button
            type="button"
            onClick={() => onOpenDiary(theme.id)}
            className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:brightness-110 text-slate-950 font-serif text-xs font-extrabold flex items-center justify-center gap-2 shadow-glow hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Open Diary in this Atmosphere</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {!isSelected && (
            <button
              type="button"
              onClick={() => onSetDefault(theme.id)}
              className="w-full py-2 px-3 rounded-xl bg-black/50 hover:bg-black/80 text-white font-serif font-bold text-xs border border-white/20 hover:border-white transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Set as Default Atmosphere</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface CustomThemeCardProps {
  isSelected: boolean;
  customPhoto: string | null;
  onSetCustomPhoto: (dataUrl: string) => void;
  onRemoveCustomPhoto: () => void;
  onOpenDiary: (id: ThemeId) => void;
  onSetDefault: (id: ThemeId) => void;
}

const CustomThemeCard: React.FC<CustomThemeCardProps> = ({
  isSelected,
  customPhoto,
  onSetCustomPhoto,
  onRemoveCustomPhoto,
  onOpenDiary,
  onSetDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSetCustomPhoto(reader.result);
        onSetDefault('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`rounded-3xl overflow-hidden glass-panel border transition-all duration-300 flex flex-col justify-between group shadow-2xl hover:shadow-2xl text-white ${
        isSelected && customPhoto
          ? 'border-sky-300 ring-2 ring-sky-400/50 shadow-glow scale-[1.01] bg-black/75'
          : 'border-white/20 hover:border-white bg-black/60 backdrop-blur-xl'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        className="hidden"
      />

      {customPhoto ? (
        /* State 2: Photo HAS been selected */
        <>
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
            <img
              src={customPhoto}
              alt="Your custom diary photo"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

            {/* Top-Left: Remove button */}
            <div className="absolute top-3 left-3 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCustomPhoto();
                }}
                className="px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-rose-950 text-white/90 hover:text-rose-200 border border-white/30 hover:border-rose-500/40 transition-all cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-serif"
                title="Remove custom photo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                <span>Remove</span>
              </button>
            </div>

            {/* Top-Right: Active / Photo Selected Status Pill */}
            <div className="absolute top-3 right-3 z-10">
              {isSelected ? (
                <span className="px-3 py-1 rounded-full bg-sky-400 text-slate-950 font-serif font-extrabold text-xs flex items-center gap-1 shadow-lg backdrop-blur-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white font-serif font-bold text-xs flex items-center gap-1 shadow-lg backdrop-blur-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Photo Selected</span>
                </span>
              )}
            </div>

            {/* Bottom Title */}
            <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl drop-shadow-md">📷</span>
                <h3 className="text-2xl font-serif font-extrabold text-white tracking-wide drop-shadow-md">
                  From Your Gallery
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-serif font-bold italic text-white/95 mt-0.5 drop-shadow">
                Your personal photo atmosphere
              </p>
            </div>
          </div>

          {/* Action Area when Photo is Selected */}
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-end text-white">
            <div className="space-y-2 pt-2 border-t border-white/15">
              <button
                type="button"
                onClick={() => onOpenDiary('custom')}
                className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:brightness-110 text-slate-950 font-serif text-xs font-extrabold flex items-center justify-center gap-2 shadow-glow hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Open Diary</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-black/50 hover:bg-black/80 text-white font-serif font-bold text-xs border border-white/20 hover:border-white transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sky-300" />
                <span>Choose Another Photo</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* State 1: Initial State — Clean Upload Card */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col justify-between p-6 cursor-pointer transition-colors ${
            isDragging ? 'bg-sky-500/15 ring-2 ring-sky-400/50' : 'hover:bg-white/[0.04]'
          }`}
        >
          {/* Header & Center Content matching requested structure */}
          <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform shadow-glow">
              <Camera className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-wide">
                From Your Gallery / File
              </h3>
              <p className="text-xs sm:text-sm font-serif italic text-white/80 max-w-xs mx-auto leading-relaxed">
                Choose your own photograph for today's diary.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:brightness-110 text-slate-950 font-serif text-xs font-extrabold flex items-center justify-center gap-2 shadow-glow hover:shadow-xl transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Upload from Gallery / File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThemeLibraryPage: React.FC = () => {
  const {
    activeTheme,
    setTheme,
    setActiveView,
    themeBackgroundIndexes,
    customPhoto,
    setCustomPhoto,
    removeCustomPhoto,
    refreshThemeBackground,
    refreshActiveThemeBackground,
  } = useDiary();

  const themesList = Object.values(THEME_MEDIA);
  const [isHeaderSpinning, setIsHeaderSpinning] = useState(false);

  const handleSelectAndOpen = (themeId: ThemeId) => {
    setTheme(themeId);
    setActiveView('diary');
  };

  const handleSetDefault = (themeId: ThemeId) => {
    setTheme(themeId);
  };

  const handleHeaderRefresh = () => {
    if (activeTheme === 'custom') return;
    setIsHeaderSpinning(true);
    refreshActiveThemeBackground();
    setTimeout(() => setIsHeaderSpinning(false), 500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/25 border border-sky-400 text-xs font-serif font-bold text-white mb-2 shadow-sm">
            <Palette className="w-4 h-4 text-sky-300" />
            <span>Atmospheric Environments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            DIARY THEMES
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 leading-relaxed max-w-2xl drop-shadow">
            Select your preferred visual atmosphere. Each theme features real cinematic photography and tranquil lined notebook stationery.
          </p>
        </div>

        {/* Global Refresh Background Button (Only for predefined themes) */}
        {activeTheme !== 'custom' && (
          <div>
            <button
              type="button"
              onClick={handleHeaderRefresh}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-serif font-bold text-white transition-all cursor-pointer shadow-md hover:scale-105"
              title="Change active background"
              aria-label="Change diary background"
            >
              <RotateCw className={`w-4 h-4 text-sky-300 ${isHeaderSpinning ? 'rotate-180 transition-transform duration-500' : ''}`} />
              <span>Change Background</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Real Visual Media Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {themesList.map((theme) => {
          if (theme.id === 'custom') {
            return (
              <CustomThemeCard
                key={theme.id}
                isSelected={activeTheme === 'custom'}
                customPhoto={customPhoto}
                onSetCustomPhoto={setCustomPhoto}
                onRemoveCustomPhoto={() => {
                  removeCustomPhoto();
                  if (activeTheme === 'custom') {
                    setTheme('ocean');
                  }
                }}
                onOpenDiary={handleSelectAndOpen}
                onSetDefault={handleSetDefault}
              />
            );
          }

          return (
            <ThemeCardItem
              key={theme.id}
              theme={theme}
              isSelected={activeTheme === theme.id}
              backgroundIndex={themeBackgroundIndexes[theme.id] || 1}
              onOpenDiary={handleSelectAndOpen}
              onSetDefault={handleSetDefault}
              onRefreshTheme={refreshThemeBackground}
            />
          );
        })}
      </div>
    </div>
  );
};
