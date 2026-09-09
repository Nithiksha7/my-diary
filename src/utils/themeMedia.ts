import type { ThemeId } from '../types';

export interface ThemeMediaConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  subtitle: string;
  videoUrl: string;
  fallbackImageUrl: string;
  previewImageUrl: string;
  stationeryName: string;
  accentColor: string;
  tagColor: string;
}

export const THEME_MEDIA: Record<ThemeId, ThemeMediaConfig> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    subtitle: 'Moving waves & coastal horizon',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sea-waves-approaching-the-shore-41584-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Ruled Cyan-Cream Paper',
    accentColor: '#38bdf8',
    tagColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
  },
  beach: {
    id: 'beach',
    name: 'Beach Sunset',
    emoji: '🌅',
    subtitle: 'Golden hour sunset & shoreline wash',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-ocean-waves-41582-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Warm Sand Lined Stationery',
    accentColor: '#fb923c',
    tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
  },
  cloudy: {
    id: 'cloudy',
    name: 'Feel Good',
    emoji: '🌧️',
    subtitle: 'Soft moments & quiet feelings',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-raindrops-on-a-window-pane-during-a-storm-41576-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Slate Grey Raindrop Paper',
    accentColor: '#94a3b8',
    tagColor: 'text-slate-300 bg-slate-500/20 border-slate-500/40',
  },
  foggy: {
    id: 'foggy',
    name: 'Foggy Forest',
    emoji: '🌲',
    subtitle: 'Mist drifting through evergreen pines',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-forest-covered-in-fog-41595-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Sage Green Herbal Paper',
    accentColor: '#34d399',
    tagColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
  },
  moonlight: {
    id: 'moonlight',
    name: 'Moonlight',
    emoji: '🌙',
    subtitle: 'Luminous full moon & starlit sky',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-full-moon-over-a-calm-sea-at-night-41591-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Midnight Celestial Stationery',
    accentColor: '#a78bfa',
    tagColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📜',
    subtitle: 'Nostalgic desk & warm sepia lighting',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-light-dust-particles-floating-in-a-dark-room-41594-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Aged Deckled Parchment',
    accentColor: '#d9b27e',
    tagColor: 'text-amber-200 bg-amber-600/20 border-amber-600/40',
  },
  clouds: {
    id: 'clouds',
    name: 'Clouds',
    emoji: '☁️',
    subtitle: 'Drifting clouds & peaceful open skies',
    videoUrl: '',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Airy Sky Blue Lined Paper',
    accentColor: '#38bdf8',
    tagColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
  },
  blur: {
    id: 'blur',
    name: 'Aesthetic Blur',
    emoji: '✨',
    subtitle: 'Soft bokeh lights & dreamy shallow focus',
    videoUrl: '',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Dreamy Lavender Soft Paper',
    accentColor: '#e879f9',
    tagColor: 'text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-500/40',
  },
  custom: {
    id: 'custom',
    name: 'From Your Gallery / File',
    emoji: '📷',
    subtitle: 'Choose your personal photo atmosphere',
    videoUrl: '',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2560&q=95',
    previewImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=90',
    stationeryName: 'Personal Keepsake Stationery',
    accentColor: '#38bdf8',
    tagColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
  },
};
