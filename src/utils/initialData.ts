import type { DiaryEntry, FutureLetter, MemoryCapsule, MoodMeta, SomedayDream } from '../types';

export const MOODS: MoodMeta[] = [
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️', poeticDescription: 'A quiet stillness in the chest' },
  { id: 'dreamy', label: 'Dreamy', emoji: '☁️', poeticDescription: 'Lost in distant reveries' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🍂', poeticDescription: 'Longing for a memory that feels like yesterday' },
  { id: 'loved', label: 'Loved', emoji: '🕯️', poeticDescription: 'Held warmly by the world or someone dear' },
  { id: 'serene', label: 'Serene', emoji: '🌊', poeticDescription: 'Calm like the ocean under moonlight' },
  { id: 'happy', label: 'Happy', emoji: '✨', poeticDescription: 'A light that spills effortlessly outward' },
  { id: 'melancholic', label: 'Melancholic', emoji: '🌧️', poeticDescription: 'A sweet and gentle sadness' },
  { id: 'lost', label: 'Lost', emoji: '🌫️', poeticDescription: 'Wandering between where I was and where I want to be' },
  { id: 'excited', label: 'Excited', emoji: '💫', poeticDescription: 'A quiet spark waiting to catch fire' },
  { id: 'sad', label: 'Sad', emoji: '🥀', poeticDescription: 'Tears that needed space to fall' },
];

export const DAILY_PROMPTS = [
  "Something that made me smile today...",
  "Something I want to remember forever...",
  "What is on my mind tonight?",
  "If today were a photograph, what would it show?",
  "One sentence I wish I could say out loud...",
  "A small kindness I noticed today...",
  "The quietest moment of my day..."
];

export const CURATED_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunset shoreline wash & quiet breeze',
  },
  {
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunlight filtering through deep forest trees',
  },
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    caption: 'Midnight sky with silver moonlight',
  },
  {
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    caption: 'Warm tea and old handwritten notes',
  },
  {
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    caption: 'Raindrops on window glass',
  },
  {
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
    caption: 'Golden hour waves rolling softly',
  }
];

/**
 * Clean empty starting state — NO pre-written fake diary entries.
 * The diary belongs completely to the user.
 */
export function getInitialDiaryEntries(): Record<string, DiaryEntry> {
  return {};
}

export const INITIAL_FUTURE_LETTERS: FutureLetter[] = [];
export const INITIAL_SOMEDAY_DREAMS: SomedayDream[] = [];
export const INITIAL_CAPSULES: MemoryCapsule[] = [];
