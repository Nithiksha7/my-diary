import React, { useState } from 'react';
import { Heart, Plus, MapPin, Music, Trash2, Calendar, Sparkles, X } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getTodayKey } from '../../utils/dateUtils';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';

export const MemoriesPage: React.FC = () => {
  const { memories, addMemory, deleteMemory } = useDiary();
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [caption, setCaption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayKey());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [song, setSong] = useState('');

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview || !caption.trim()) return;

    addMemory({
      photoUrl: photoPreview,
      photoFile,
      caption: caption.trim(),
      date,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      song: song.trim() || undefined,
    });

    setCaption('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setLocation('');
    setNotes('');
    setSong('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/20">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-300 block mb-1">
            Personal Gallery
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-md">
            MEMORIES
          </h1>
          <p className="text-sm sm:text-base font-serif font-bold italic text-white/95 mt-1 drop-shadow">
            Little pieces of life worth keeping.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-bold bg-rose-500/30 text-white border border-rose-400 hover:bg-rose-500/50 transition-all shadow-glow hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Memory</span>
          </button>
        )}
      </div>

      {/* Add Memory Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateMemory}
          className="p-6 sm:p-8 rounded-3xl glass-panel border border-rose-400/40 space-y-6 shadow-2xl bg-black/75 max-w-2xl mx-auto animate-fade-in backdrop-blur-xl text-white"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <h2 className="font-serif font-extrabold text-xl text-white">
                Save a Cherished Moment
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photograph Upload Area */}
          <PhotoUploadPicker
            label="Photograph"
            required={true}
            file={photoFile}
            previewUrl={photoPreview}
            onFileSelect={(file, objectUrl) => {
              setPhotoFile(file);
              setPhotoPreview(objectUrl);
            }}
            onFileRemove={() => {
              setPhotoFile(null);
              setPhotoPreview(null);
            }}
            themeAccent="rose"
          />

          <div>
            <label className="block text-xs font-serif font-bold text-white mb-1.5">
              Caption / Title *
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. That evening by the sea, Rainy afternoon coffee..."
              className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-3 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-rose-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2.5 text-xs font-serif text-white font-bold focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Coast of Oregon, Paris cafe..."
                className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2.5 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Soundtrack / Song (optional)
              </label>
              <input
                type="text"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="Song playing in that moment..."
                className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2.5 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-white mb-1.5">
                Short Reflection / Note (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Words whispered, quiet thoughts..."
                className="w-full bg-black/60 border border-white/30 rounded-2xl px-4 py-2.5 text-xs font-serif text-white font-bold placeholder:text-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-5 py-2 rounded-full text-xs font-serif font-bold text-white hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-serif text-xs font-extrabold hover:brightness-110 shadow-glow transition-all"
            >
              Keep Memory
            </button>
          </div>
        </form>
      )}

      {/* Memories Photo Gallery */}
      {memories.length === 0 ? (
        /* Clean, soulful empty state */
        <div className="p-16 text-center rounded-3xl glass-panel border border-dashed border-white/30 max-w-lg mx-auto bg-black/60 space-y-4 backdrop-blur-xl text-white">
          <div className="p-4 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 w-14 h-14 mx-auto flex items-center justify-center shadow-glow">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-extrabold text-2xl text-white">
              Your memories will live here.
            </h3>
            <p className="font-serif font-bold italic text-sm text-white/90 max-w-xs mx-auto leading-relaxed">
              Save the moments you never want to lose.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-serif font-extrabold bg-rose-500/30 hover:bg-rose-500/50 text-white border border-rose-400 transition-all shadow-glow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Memory</span>
          </button>
        </div>
      ) : (
        /* Polaroid-style Memory Wall */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="group relative rounded-3xl overflow-hidden glass-panel border border-white/20 hover:border-rose-400 bg-black/60 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] shadow-2xl flex flex-col justify-between text-white"
            >
              {/* Photo Area */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                <img
                  src={mem.photoUrl}
                  alt={mem.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteMemory(mem.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Date tag over photo */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-mono font-bold drop-shadow">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-300" />
                    <span>{mem.date}</span>
                  </span>
                  {mem.location && (
                    <span className="flex items-center gap-1.5 text-amber-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      <span>{mem.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Caption and Details */}
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-extrabold text-xl text-white leading-snug drop-shadow-sm">
                    “{mem.caption}”
                  </h3>
                  {mem.notes && (
                    <p className="font-serif font-bold italic text-xs text-white/90 mt-1.5 leading-relaxed">
                      {mem.notes}
                    </p>
                  )}
                </div>

                {mem.song && (
                  <div className="pt-2 border-t border-white/15 flex items-center gap-2 text-xs font-serif font-bold text-sky-300">
                    <Music className="w-3.5 h-3.5" />
                    <span>{mem.song}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
