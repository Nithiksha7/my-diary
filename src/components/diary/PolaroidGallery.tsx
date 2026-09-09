import React, { useState } from 'react';
import { Camera, Plus, Trash2, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { PhotoAttachment } from '../../types';
import { CURATED_PHOTOS } from '../../utils/initialData';

interface PolaroidGalleryProps {
  photos?: PhotoAttachment[];
  onAddPhoto: (photo: PhotoAttachment) => void;
  onRemovePhoto: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  onUpdateCaption,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePhotoZoom, setActivePhotoZoom] = useState<PhotoAttachment | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customCaption, setCustomCaption] = useState('');

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const randomRotation = (Math.random() * 4 - 2);
    onAddPhoto({
      id: `photo-${Date.now()}`,
      url: customUrl.trim(),
      caption: customCaption.trim() || 'Memory captured',
      rotation: randomRotation,
      createdAt: new Date().toISOString(),
    });

    setCustomUrl('');
    setCustomCaption('');
    setIsAddModalOpen(false);
  };

  const handleAddCurated = (preset: { url: string; caption: string }) => {
    const randomRotation = (Math.random() * 4 - 2);
    onAddPhoto({
      id: `photo-${Date.now()}`,
      url: preset.url,
      caption: preset.caption,
      rotation: randomRotation,
      createdAt: new Date().toISOString(),
    });
    setIsAddModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onAddPhoto({
          id: `photo-${Date.now()}`,
          url: result,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          rotation: (Math.random() * 4 - 2),
          createdAt: new Date().toISOString(),
        });
        setIsAddModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-theme-accent" />
          <span className="font-serif text-sm font-medium tracking-wide text-theme-text">
            Moments & Polaroids
          </span>
          <span className="text-[11px] text-theme-muted">
            ({photos.length})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif bg-white/5 hover:bg-white/10 text-theme-muted hover:text-theme-text border border-theme-border-light transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-theme-accent" />
          <span>Add Polaroid</span>
        </button>
      </div>

      {photos.length === 0 ? (
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="cursor-pointer border border-dashed border-theme-border-light hover:border-theme-border rounded-2xl p-6 text-center group transition-colors"
        >
          <Camera className="w-6 h-6 mx-auto mb-2 text-theme-muted group-hover:text-theme-accent transition-colors opacity-60" />
          <p className="text-xs font-serif italic text-theme-muted">
            Pin a photograph or memory to today’s page...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group transition-transform duration-300 hover:scale-[1.03] hover:z-20"
              style={{
                transform: `rotate(${photo.rotation || 0}deg)`,
              }}
            >
              <div className="washi-tape" />

              <div className="bg-stone-100 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 p-3 pb-4 rounded shadow-polaroid border border-stone-300 dark:border-stone-800">
                <div
                  className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone-950 cursor-pointer relative"
                  onClick={() => setActivePhotoZoom(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-[11px] bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm">
                      View
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => onUpdateCaption(photo.id, e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full bg-transparent font-handwritten text-lg text-stone-800 dark:text-stone-200 border-none focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded px-1"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(photo.id);
                    }}
                    title="Remove polaroid"
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl glass-panel shadow-journal p-6 z-10 text-theme-text border border-theme-border">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-light mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-theme-accent" />
                Add a Memory Photograph
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-theme-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5">
              <span className="text-[11px] text-theme-muted font-mono uppercase tracking-wider block mb-2">
                Curated Atmospheric Moments
              </span>
              <div className="grid grid-cols-3 gap-2">
                {CURATED_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddCurated(preset)}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden group border border-theme-border-light hover:border-theme-accent transition-all"
                  >
                    <img
                      src={preset.url}
                      alt={preset.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                      <Sparkles className="w-4 h-4 text-theme-highlight" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3 pt-3 border-t border-theme-border-light">
              <div>
                <label className="block text-xs font-serif text-theme-muted mb-1">
                  Or Paste an Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-theme-border-light text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-theme-muted mb-1">
                  Handwritten Caption
                </label>
                <input
                  type="text"
                  placeholder="A quiet moment beside the water..."
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-theme-border-light text-xs font-handwritten text-base text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="cursor-pointer flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text font-serif">
                  <ImageIcon className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Upload from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="px-5 py-1.5 rounded-full bg-theme-accent text-slate-950 text-xs font-serif font-medium disabled:opacity-40 hover:brightness-110 transition-all"
                >
                  Pin Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePhotoZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhotoZoom(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-stone-950 p-4 rounded-2xl shadow-2xl border border-stone-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoZoom(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoZoom.url}
              alt={activePhotoZoom.caption || 'Memory'}
              className="max-h-[65vh] w-auto mx-auto rounded-lg object-contain shadow-2xl"
            />
            {activePhotoZoom.caption && (
              <p className="mt-4 font-handwritten text-2xl text-amber-100">
                {activePhotoZoom.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
