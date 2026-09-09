import React, { useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { THEME_MEDIA } from '../../utils/themeMedia';
import type { ThemeId } from '../../types';

export const ThemeSwitcherModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeTheme, setTheme, customPhoto, setCustomPhoto, settings, updateSettings } = useDiary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const themesList = Object.values(THEME_MEDIA);

  const handleSelectTheme = (themeId: ThemeId) => {
    if (themeId === 'custom' && !customPhoto) {
      fileInputRef.current?.click();
      return;
    }
    setTheme(themeId);
  };

  const handleCustomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPhoto(reader.result);
          setTheme('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomFile}
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        className="hidden"
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel shadow-2xl p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-theme-accent uppercase">
              Atmospheric Sanctuary
            </span>
            <h2 className="text-2xl font-serif font-bold tracking-wide mt-1">
              Choose Your Atmosphere
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-theme-muted font-serif italic mb-6 leading-relaxed">
          Select an environment to transform your diary atmosphere and stationery paper styling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {themesList.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const previewUrl = theme.id === 'custom' && customPhoto ? customPhoto : theme.previewImageUrl;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`relative text-left rounded-2xl border transition-all duration-300 group overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-theme-accent ring-2 ring-theme-accent/50 shadow-glow scale-[1.02] bg-black/60'
                    : 'border-theme-border-light hover:border-theme-border bg-black/40 hover:bg-black/50'
                }`}
              >
                {/* Visual Media Thumbnail (Real Photo) */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                  <img
                    src={previewUrl}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-theme-accent text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="font-serif font-bold text-sm text-white drop-shadow truncate">
                      {theme.name}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-[11px] text-theme-muted font-serif italic truncate">
                    {theme.id === 'custom' && !customPhoto ? 'Tap to upload photo' : theme.subtitle}
                  </p>
                  <span className={`inline-block text-[10px] font-serif px-2 py-0.5 rounded-full border ${theme.tagColor}`}>
                    {theme.stationeryName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-theme-border-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reduced-motion"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="rounded accent-sky-400 cursor-pointer"
            />
            <label htmlFor="reduced-motion" className="cursor-pointer font-serif">
              Subtle Reduced Motion (optimized for low-power devices)
            </label>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-full bg-theme-accent text-slate-950 font-medium font-serif tracking-wide hover:brightness-110 transition-all font-semibold cursor-pointer"
          >
            Apply Atmosphere
          </button>
        </div>
      </div>
    </div>
  );
};
