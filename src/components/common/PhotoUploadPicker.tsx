import React, { useRef, useState, useEffect } from 'react';
import { Camera, UploadCloud, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export interface PhotoUploadPickerProps {
  label?: string;
  required?: boolean;
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File, objectUrl: string) => void;
  onFileRemove: () => void;
  themeAccent?: 'rose' | 'amber' | 'sky';
  aspectRatio?: 'landscape' | 'square' | 'video';
  maxSizeMB?: number;
}

export const PhotoUploadPicker: React.FC<PhotoUploadPickerProps> = ({
  label = 'Photograph',
  required = false,
  file,
  previewUrl,
  onFileSelect,
  onFileRemove,
  themeAccent = 'rose',
  aspectRatio = 'landscape',
  maxSizeMB = 20,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getAccentStyles = () => {
    switch (themeAccent) {
      case 'amber':
        return {
          iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          dropzoneHover: 'hover:border-amber-400 hover:bg-amber-500/10',
          dragActive: 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-300/40',
          btnReplace: 'bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border-amber-400/40',
          glow: 'shadow-glow',
        };
      case 'sky':
        return {
          iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
          dropzoneHover: 'hover:border-sky-400 hover:bg-sky-500/10',
          dragActive: 'border-sky-400 bg-sky-500/20 ring-2 ring-sky-300/40',
          btnReplace: 'bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border-sky-400/40',
          glow: 'shadow-glow',
        };
      case 'rose':
      default:
        return {
          iconBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
          dropzoneHover: 'hover:border-rose-400 hover:bg-rose-500/10',
          dragActive: 'border-rose-400 bg-rose-500/20 ring-2 ring-rose-300/40',
          btnReplace: 'bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border-rose-400/40',
          glow: 'shadow-glow',
        };
    }
  };

  const accent = getAccentStyles();

  const handleProcessFile = (selectedFile: File) => {
    setErrorMsg(null);

    // Validate mime type
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, HEIC).');
      return;
    }

    // Validate size
    const sizeInMB = selectedFile.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setErrorMsg(`Image size (${sizeInMB.toFixed(1)}MB) exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    // Create immediate local object URL for preview
    const objectUrl = URL.createObjectURL(selectedFile);
    onFileSelect(selectedFile, objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleTriggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'landscape':
      default:
        return 'aspect-[16/10] sm:aspect-[16/9]';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-serif font-bold text-white/95 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-white/80" />
          <span>{label}</span>
          {required ? (
            <span className="text-rose-400 font-bold">*</span>
          ) : (
            <span className="text-white/50 text-[10px] font-normal">(optional)</span>
          )}
        </label>

        {previewUrl && file && (
          <span className="text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/*"
        onChange={handleInputChange}
        className="hidden"
        tabIndex={-1}
      />

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-serif font-bold animate-shake">
          {errorMsg}
        </div>
      )}

      {/* Upload Zone or Photo Preview */}
      {!previewUrl ? (
        /* ----------------------------------------------------
           DROPZONE / PHOTO SELECTION AREA
           ---------------------------------------------------- */
        <div
          onClick={handleTriggerPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerPicker();
            }
          }}
          className={`group relative w-full border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-xl bg-black/45 ${
            isDragging
              ? accent.dragActive
              : `border-white/25 hover:border-white/50 ${accent.dropzoneHover}`
          }`}
        >
          {/* Animated Icon Emblem */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-lg ${accent.iconBg}`}
          >
            <Camera className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Prompt Text */}
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-serif font-bold text-white tracking-wide group-hover:text-white transition-colors">
              Add a Photo
            </p>
            <p className="text-xs font-serif text-white/75 group-hover:text-white/90 transition-colors">
              Upload from your device or gallery
            </p>
          </div>

          {/* File Format Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-white/70">
            <UploadCloud className="w-3 h-3" />
            <span>JPG · PNG · WebP · HEIC</span>
          </div>
        </div>
      ) : (
        /* ----------------------------------------------------
           PHOTO PREVIEW & ACTIONS (REPLACE / REMOVE)
           ---------------------------------------------------- */
        <div className="space-y-3 animate-fade-in">
          {/* Image Preview Card */}
          <div
            className={`relative w-full rounded-3xl overflow-hidden border border-white/30 bg-black/80 shadow-2xl group ${getAspectClass()}`}
          >
            <img
              src={previewUrl}
              alt="Uploaded memory preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Top Bar with file badge */}
            {file && (
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-mono drop-shadow">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/90 truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/80 text-[10px]">
                  {formatFileSize(file.size)}
                </span>
              </div>
            )}

            {/* Quick Floating Action Hover Bar (Desktop) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center gap-3 backdrop-blur-xs">
              <button
                type="button"
                onClick={handleTriggerPicker}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-extrabold border transition-all cursor-pointer shadow-lg hover:scale-105 ${accent.btnReplace}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif font-extrabold bg-rose-600/70 hover:bg-rose-600 text-white border border-rose-400/50 transition-all cursor-pointer shadow-lg hover:scale-105"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Below (Always Visible & Fully Mobile Friendly) */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerPicker}
              className={`flex-1 py-2.5 px-4 rounded-2xl border text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${accent.btnReplace}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Photo</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-rose-500/25 text-white/90 hover:text-rose-200 border border-white/20 hover:border-rose-400/50 text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
