import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import type {
  ActiveView,
  CapsuleItem,
  DeliveryChannel,
  DiaryEntry,
  DreamCategory,
  FutureLetter,
  LetterRecord,
  LetterRecipientType,
  MemoryCapsule,
  MemoryMoment,
  SomedayDream,
  ThemeId,
  UserSettings
} from '../types';
import {
  calculateDeliveryTimestamp,
  generateSecureLetterToken,
  getMonthDayString,
  getTodayKey,
  parseDateKey
} from '../utils/dateUtils';
import {
  getInitialDiaryEntries,
  INITIAL_CAPSULES,
  INITIAL_FUTURE_LETTERS,
  INITIAL_SOMEDAY_DREAMS
} from '../utils/initialData';
import {
  type ThemeBackgroundImage,
  getThemeBackgroundByIndex,
  getNextRandomBackgroundIndex,
  resolveSafeThemeId,
  VALID_THEME_IDS
} from '../utils/themeBackgrounds';

interface DiaryContextType {
  activeDate: string;
  activeView: ActiveView;
  activeTheme: ThemeId;
  activeBackground: ThemeBackgroundImage;
  themeBackgroundIndexes: Record<ThemeId, number>;
  customPhoto: string | null;
  setCustomPhoto: (photo: string) => void;
  removeCustomPhoto: () => void;
  refreshActiveThemeBackground: () => void;
  refreshThemeBackground: (themeId: ThemeId) => void;
  setThemeBackgroundIndex: (themeId: ThemeId, index: number) => void;
  entries: Record<string, DiaryEntry>;
  currentEntry: DiaryEntry;
  futureLetters: FutureLetter[];
  somedayDreams: SomedayDream[];
  memories: MemoryMoment[];
  capsules: MemoryCapsule[];
  settings: UserSettings;
  saveStatus: 'saved' | 'saving' | 'idle';
  lastSavedAt: string | null;
  
  // Navigation & View
  setActiveDate: (date: string) => void;
  setActiveView: (view: ActiveView) => void;
  setTheme: (theme: ThemeId) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;

  // Entry Management
  updateCurrentEntry: (updates: Partial<DiaryEntry>) => void;
  updateEntryForDate: (dateKey: string, updates: Partial<DiaryEntry>) => void;
  deleteEntryForDate: (dateKey: string) => void;
  getEntryForDate: (dateKey: string) => DiaryEntry | undefined;
  hasEntryOnDate: (dateKey: string) => { hasEntry: boolean; hasPhotos: boolean; isSpecial: boolean; mood?: string };
  getOnThisDayEntries: (dateKey: string) => DiaryEntry[];

  // Future Me Letters
  addFutureLetter: (letter: { title: string; content: string; unlockDate: string; sealColor?: string; recipientNote?: string }) => Promise<void> | void;
  openFutureLetter: (id: string) => Promise<FutureLetter | undefined> | void;
  deleteFutureLetter: (id: string) => Promise<void> | void;

  // Someday Dreams
  addSomedayDream: (dream: { title: string; description?: string; category: DreamCategory; imageUrl?: string; imageFile?: File | null; targetDate?: string }) => Promise<void> | void;
  toggleSomedayDream: (id: string, notes?: string) => Promise<void> | void;
  deleteSomedayDream: (id: string) => Promise<void> | void;

  // Memories Gallery
  addMemory: (memory: { photoUrl: string; photoFile?: File | null; caption: string; date: string; location?: string; notes?: string; song?: string }) => Promise<void> | void;
  deleteMemory: (id: string) => Promise<void> | void;

  // Capsules (Legacy support)
  addCapsule: (capsule: { title: string; description: string; coverPhoto?: string; themeColor?: string; items: CapsuleItem[] }) => void;
  addCapsuleItem: (capsuleId: string, item: Omit<CapsuleItem, 'id'>) => void;
  deleteCapsule: (id: string) => void;

  // Security & Settings
  updateSettings: (updates: Partial<UserSettings>) => void;
  unlockDiary: (passcode: string) => boolean;
  lockDiary: () => void;
  exportBackup: () => string;
  importBackup: (jsonString: string) => boolean;

  // New Letters System (Letter to Someone & Letter to Me)
  letters: LetterRecord[];
  activeLetterToken: string | null;
  setActiveLetterToken: (token: string | null) => void;
  createLetter: (data: {
    type: LetterRecipientType;
    recipientName: string;
    deliveryChannel?: DeliveryChannel;
    recipientContact?: string;
    title: string;
    content: string;
    scheduledDeliveryDate?: string;
    scheduledDeliveryTime?: string;
    scheduledDeliveryTimestamp?: number;
    timezone?: string;
    sealTheme?: ThemeId;
    sealColor?: string;
    isImmediate?: boolean;
  }) => Promise<LetterRecord>;
  deleteLetter: (id: string) => Promise<void>;
  fetchLetterByToken: (token: string) => Promise<LetterRecord | null>;
  openLetter: (token: string) => Promise<LetterRecord | null>;
  fastForwardDelivery: (token: string) => Promise<LetterRecord | null>;
  retryLetterDelivery: (id: string) => Promise<void>;
  updateLetterRecipient: (id: string, contact: string, name?: string) => Promise<void>;
  refreshLetters: () => Promise<void>;
}

const STORAGE_KEYS = {
  ENTRIES: 'my_diary_entries_v2_clean',
  THEME: 'my_diary_theme_v2',
  THEME_BACKGROUNDS: 'my_diary_theme_backgrounds_v1',
  CUSTOM_PHOTO: 'my_diary_custom_photo_v1',
  LETTERS: 'my_diary_letters_v2_clean',
  SEALED_LETTERS: 'my_diary_sealed_letters_v3',
  DREAMS: 'my_diary_dreams_v3_clean',
  MEMORIES: 'my_diary_memories_v3_clean',
  CAPSULES: 'my_diary_capsules_v2_clean',
  SETTINGS: 'my_diary_settings_v2',
};

const DiaryContext = createContext<DiaryContextType | null>(null);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, migrateFromLocalStorage } = useAuth();
  const [activeLetterToken, setActiveLetterToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryToken = params.get('letter') || params.get('token');
      if (queryToken) return queryToken;

      const pathMatch = window.location.pathname.match(/^\/letter\/([^/?#]+)/);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
    }
    return null;
  });

  const [activeDate, setActiveDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam;
      }
    }
    return getTodayKey();
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('letter') || params.get('token')) {
        return 'letters';
      }
      if (params.get('date')) {
        return 'diary';
      }
    }
    return 'dashboard';
  });
  
  const [activeTheme, setActiveThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return resolveSafeThemeId(saved);
  });

  // Background image index per theme (1 to 100) strictly partitioned per theme
  const [themeBackgroundIndexes, setThemeBackgroundIndexes] = useState<Record<ThemeId, number>>(() => {
    const defaults: Record<ThemeId, number> = {
      ocean: 1,
      beach: 1,
      cloudy: 1,
      foggy: 1,
      moonlight: 1,
      vintage: 1,
      clouds: 1,
      blur: 1,
      custom: 1,
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_BACKGROUNDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          for (const t of VALID_THEME_IDS) {
            if (typeof parsed[t] === 'number' && parsed[t] >= 1 && parsed[t] <= 100) {
              defaults[t] = Math.round(parsed[t]);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse theme backgrounds', e);
    }
    return defaults;
  });

  // Recent history to avoid repetition
  const [themeBackgroundHistory, setThemeBackgroundHistory] = useState<Record<ThemeId, number[]>>(() => {
    return {
      ocean: [1],
      beach: [1],
      cloudy: [1],
      foggy: [1],
      moonlight: [1],
      vintage: [1],
      clouds: [1],
      blur: [1],
      custom: [1],
    };
  });

  // Custom user photo state
  const [customPhoto, setCustomPhotoState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_PHOTO);
  });

  const setCustomPhoto = useCallback((photo: string) => {
    setCustomPhotoState(photo);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PHOTO, photo);
  }, []);

  const removeCustomPhoto = useCallback(() => {
    setCustomPhotoState(null);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_PHOTO);
  }, []);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      passcode: undefined,
      isLocked: false,
      reducedMotion: false,
      activeTheme: 'ocean',
    };
  });

  // Entries repository - starts completely empty
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse entries', e);
      }
    }
    return getInitialDiaryEntries();
  });

  // Future Letters - starts completely empty
  const [futureLetters, setFutureLetters] = useState<FutureLetter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse future letters', e);
      }
    }
    return INITIAL_FUTURE_LETTERS;
  });

  // Someday Dreams - starts completely empty
  const [somedayDreams, setSomedayDreams] = useState<SomedayDream[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DREAMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse dreams', e);
      }
    }
    return INITIAL_SOMEDAY_DREAMS;
  });

  // Memories Gallery Moments - starts completely empty
  const [memories, setMemories] = useState<MemoryMoment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse memories', e);
      }
    }
    return [];
  });

  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAPSULES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse capsules', e);
      }
    }
    return INITIAL_CAPSULES;
  });

  // Sealed & Scheduled Letters System
  const [letters, setLetters] = useState<LetterRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SEALED_LETTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sealed letters', e);
      }
    }
    return [];
  });

  const lettersRef = useRef<LetterRecord[]>(letters);
  useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);

  const refreshLetters = useCallback(async () => {
    try {
      const res = await api.letters.getLetters();
      if (res.success && Array.isArray(res.letters)) {
        setLetters((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(res.letters)) {
            return prev;
          }
          return res.letters;
        });
      }
    } catch {
      // Local mode fallback
    }
  }, []);

  // Sync letters from backend server on mount & interval only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshLetters();
    const interval = setInterval(refreshLetters, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshLetters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEALED_LETTERS, JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(futureLetters));
  }, [futureLetters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(somedayDreams));
  }, [somedayDreams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_BACKGROUNDS, JSON.stringify(themeBackgroundIndexes));
  }, [themeBackgroundIndexes]);

  const activeBackground = useMemo<ThemeBackgroundImage>(() => {
    const safeTheme = resolveSafeThemeId(activeTheme);
    if (safeTheme === 'custom') {
      const photoSrc = customPhoto || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2560&q=95';
      return {
        id: 'custom-user-photo',
        themeId: 'custom',
        index: 1,
        name: 'From Your Gallery / File',
        path: photoSrc,
        fallbackUrl: photoSrc,
      };
    }
    const currentIndex = themeBackgroundIndexes[safeTheme] || 1;
    return getThemeBackgroundByIndex(safeTheme, currentIndex);
  }, [activeTheme, themeBackgroundIndexes, customPhoto]);

  const refreshThemeBackground = useCallback((themeId: ThemeId) => {
    const safeTheme = resolveSafeThemeId(themeId);
    if (safeTheme === 'custom') {
      // Custom theme has no random refresh
      return;
    }
    const currentIndex = themeBackgroundIndexes[safeTheme] || 1;
    const currentHistory = themeBackgroundHistory[safeTheme] || [currentIndex];
    const { nextIndex, newHistory } = getNextRandomBackgroundIndex(safeTheme, currentIndex, currentHistory);

    setThemeBackgroundIndexes((prev) => ({
      ...prev,
      [safeTheme]: nextIndex,
    }));

    setThemeBackgroundHistory((prev) => ({
      ...prev,
      [safeTheme]: newHistory,
    }));
  }, [themeBackgroundIndexes, themeBackgroundHistory]);

  const refreshActiveThemeBackground = useCallback(() => {
    refreshThemeBackground(activeTheme);
  }, [activeTheme, refreshThemeBackground]);

  const setThemeBackgroundIndex = useCallback((themeId: ThemeId, index: number) => {
    const safeTheme = resolveSafeThemeId(themeId);
    const safeIndex = Math.max(1, Math.min(100, Math.round(index) || 1));
    setThemeBackgroundIndexes((prev) => ({
      ...prev,
      [safeTheme]: safeIndex,
    }));
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    const safeTheme = resolveSafeThemeId(theme);
    setActiveThemeState(safeTheme);
    setSettings((prev) => ({ ...prev, activeTheme: safeTheme }));
  }, []);

  const migratedRef = useRef(false);

  // Background migration of local storage data upon user login
  useEffect(() => {
    if (isAuthenticated && !migratedRef.current) {
      migratedRef.current = true;
      migrateFromLocalStorage(entries, settings).catch(() => {});
    }
  }, [isAuthenticated, entries, settings, migrateFromLocalStorage]);

  // Load active date entry, memories, and someday dreams from backend
  useEffect(() => {
    let isMounted = true;

    async function loadEntry() {
      try {
        const res = await api.diary.getEntry(activeDate);
        if (isMounted && res.success && res.entry && !res.entry.isNew) {
          setEntries((prev) => ({
            ...prev,
            [activeDate]: {
              ...res.entry,
              date: activeDate,
            },
          }));
        }
      } catch {
        // Fallback to local entry state
      }
    }

    async function loadUserFeatures() {
      try {
        const [memoriesRes, dreamsRes, futureLettersRes] = await Promise.all([
          api.memories.getMemories().catch(() => ({ success: false, memories: [] })),
          api.someday.getSomedayDreams().catch(() => ({ success: false, dreams: [] })),
          api.futureMe.getLetters().catch(() => ({ success: false, letters: [] })),
        ]);

        if (isMounted) {
          if (memoriesRes.success && Array.isArray(memoriesRes.memories)) {
            setMemories(memoriesRes.memories);
          }
          if (dreamsRes.success && Array.isArray(dreamsRes.dreams)) {
            setSomedayDreams(dreamsRes.dreams);
          }
          if (futureLettersRes.success && Array.isArray(futureLettersRes.letters)) {
            setFutureLetters(futureLettersRes.letters);
          }
        }
      } catch (err) {
        console.error('Failed to load user features (memories/dreams/letters):', err);
      }
    }

    if (isAuthenticated) {
      loadEntry();
      loadUserFeatures();
    }
    return () => {
      isMounted = false;
    };
  }, [activeDate, isAuthenticated]);

  const currentEntry = useMemo<DiaryEntry>(() => {
    if (entries[activeDate]) {
      return entries[activeDate];
    }
    return {
      date: activeDate,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [entries, activeDate]);

  const updateEntryForDate = useCallback((dateKey: string, updates: Partial<DiaryEntry>) => {
    setSaveStatus('saving');
    
    let updatedEntry: DiaryEntry;

    setEntries((prev) => {
      const existing = prev[dateKey] || {
        date: dateKey,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated: DiaryEntry = {
        ...existing,
        ...updates,
        date: dateKey,
        updatedAt: new Date().toISOString(),
      };

      updatedEntry = updated;

      return {
        ...prev,
        [dateKey]: updated,
      };
    });

    const timer = setTimeout(async () => {
      try {
        if (isAuthenticated) {
          await api.diary.saveEntry(dateKey, updatedEntry);
        }
        setSaveStatus('saved');
        const now = new Date();
        setLastSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        console.error('Failed to save diary entry to database:', err);
        setSaveStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const updateCurrentEntry = useCallback((updates: Partial<DiaryEntry>) => {
    updateEntryForDate(activeDate, updates);
  }, [activeDate, updateEntryForDate]);

  const deleteEntryForDate = useCallback(async (dateKey: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    if (isAuthenticated) {
      try {
        await api.diary.deleteEntry(dateKey);
      } catch (err) {
        console.error('Failed to delete entry from database:', err);
      }
    }
  }, [isAuthenticated]);

  const getEntryForDate = useCallback((dateKey: string): DiaryEntry | undefined => {
    return entries[dateKey];
  }, [entries]);

  const hasEntryOnDate = useCallback((dateKey: string) => {
    const entry = entries[dateKey];
    if (!entry) {
      return { hasEntry: false, hasPhotos: false, isSpecial: false };
    }
    const hasContent = Boolean(entry.content?.trim() || entry.oneSentence?.trim() || entry.mood);
    const hasPhotos = Boolean(entry.photos && entry.photos.length > 0);
    const isSpecial = Boolean(entry.isSpecial);
    return {
      hasEntry: hasContent,
      hasPhotos,
      isSpecial,
      mood: entry.mood,
    };
  }, [entries]);

  const getOnThisDayEntries = useCallback((dateKey: string): DiaryEntry[] => {
    const targetMonthDay = getMonthDayString(dateKey);
    const currentYear = parseDateKey(dateKey).getFullYear();

    const matches: DiaryEntry[] = [];
    Object.keys(entries).forEach((key) => {
      if (key !== dateKey && getMonthDayString(key) === targetMonthDay) {
        const entryYear = parseDateKey(key).getFullYear();
        if (entryYear < currentYear) {
          const entry = entries[key];
          if (entry.content?.trim() || entry.oneSentence?.trim()) {
            matches.push(entry);
          }
        }
      }
    });

    return matches.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  const goToToday = useCallback(() => {
    setActiveDate(getTodayKey());
    setActiveView('diary');
  }, []);

  const goToPreviousDay = useCallback(() => {
    const date = parseDateKey(activeDate);
    date.setDate(date.getDate() - 1);
    const prevYear = date.getFullYear();
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
    const prevDay = String(date.getDate()).padStart(2, '0');
    setActiveDate(`${prevYear}-${prevMonth}-${prevDay}`);
  }, [activeDate]);

  const goToNextDay = useCallback(() => {
    const date = parseDateKey(activeDate);
    date.setDate(date.getDate() + 1);
    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');
    setActiveDate(`${nextYear}-${nextMonth}-${nextDay}`);
  }, [activeDate]);

  const addFutureLetter = useCallback(
    async (letter: { title: string; content: string; unlockDate: string; sealColor?: string; recipientNote?: string }) => {
      const tempId = `letter-${Date.now()}`;
      const newLetter: FutureLetter = {
        id: tempId,
        title: letter.title,
        content: letter.content,
        createdAt: getTodayKey(),
        unlockDate: letter.unlockDate,
        isOpened: false,
        sealColor: letter.sealColor || '#b91c1c',
        recipientNote: letter.recipientNote,
      };
      setFutureLetters((prev) => [newLetter, ...prev]);

      if (isAuthenticated) {
        try {
          const res = await api.futureMe.createLetter({
            title: letter.title,
            content: letter.content,
            unlockDate: letter.unlockDate,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            sealColor: letter.sealColor,
            recipientNote: letter.recipientNote,
          });
          if (res.success && res.letter) {
            setFutureLetters((prev) =>
              prev.map((l) => (l.id === tempId ? res.letter : l))
            );
          }
        } catch (err) {
          console.error('Failed to create future letter on server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const openFutureLetter = useCallback(
    async (id: string): Promise<FutureLetter | undefined> => {
      let unsealedLetter: FutureLetter | undefined;

      setFutureLetters((prev) =>
        prev.map((l) => {
          if (l.id === id) {
            const updated = { ...l, isOpened: true, isLocked: false };
            unsealedLetter = updated;
            return updated;
          }
          return l;
        })
      );

      if (isAuthenticated) {
        try {
          const res = await api.futureMe.openLetter(id);
          if (res.success && res.letter) {
            unsealedLetter = res.letter;
            setFutureLetters((prev) =>
              prev.map((l) => (l.id === id ? res.letter : l))
            );
          }
        } catch (err) {
          console.error('Failed to open future letter on server:', err);
        }
      }

      return unsealedLetter;
    },
    [isAuthenticated]
  );

  const deleteFutureLetter = useCallback(
    async (id: string) => {
      setFutureLetters((prev) => prev.filter((l) => l.id !== id));

      if (isAuthenticated) {
        try {
          await api.futureMe.deleteLetter(id);
        } catch (err) {
          console.error('Failed to delete future letter on server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const addSomedayDream = useCallback(
    async (dream: {
      title: string;
      description?: string;
      category: DreamCategory;
      imageUrl?: string;
      imageFile?: File | null;
      targetDate?: string;
    }) => {
      let finalImageUrl = dream.imageUrl;
      let storageKey: string | undefined = undefined;

      if (dream.imageFile && isAuthenticated) {
        try {
          const uploadRes = await api.upload.uploadPhoto(dream.imageFile);
          if (uploadRes.success && uploadRes.url) {
            finalImageUrl = uploadRes.url;
            storageKey = uploadRes.storageKey;
          }
        } catch (err) {
          console.error('Failed to upload dream image:', err);
        }
      }

      const tempId = `dream-${Date.now()}`;
      const newDream: SomedayDream = {
        id: tempId,
        title: dream.title,
        description: dream.description,
        category: dream.category,
        imageUrl: finalImageUrl,
        storageKey,
        targetDate: dream.targetDate,
        createdAt: getTodayKey(),
        completed: false,
      };

      setSomedayDreams((prev) => [newDream, ...prev]);

      if (isAuthenticated) {
        try {
          const res = await api.someday.createSomedayDream({
            title: dream.title,
            description: dream.description,
            category: dream.category,
            imageUrl: finalImageUrl,
            storageKey,
            targetDate: dream.targetDate,
          });
          if (res.success && res.dream) {
            setSomedayDreams((prev) =>
              prev.map((d) => (d.id === tempId ? res.dream : d))
            );
          }
        } catch (err) {
          console.error('Failed to save dream to database:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const toggleSomedayDream = useCallback(
    async (id: string, notes?: string) => {
      setSomedayDreams((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const isCompleting = !d.completed;
            return {
              ...d,
              completed: isCompleting,
              completedAt: isCompleting ? getTodayKey() : undefined,
              notes: notes !== undefined ? notes : d.notes,
            };
          }
          return d;
        })
      );

      if (isAuthenticated) {
        try {
          await api.someday.toggleSomedayDream(id, notes);
        } catch (err) {
          console.error('Failed to toggle dream on server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const deleteSomedayDream = useCallback(
    async (id: string) => {
      setSomedayDreams((prev) => prev.filter((d) => d.id !== id));

      if (isAuthenticated) {
        try {
          await api.someday.deleteSomedayDream(id);
        } catch (err) {
          console.error('Failed to delete dream on server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const addMemory = useCallback(
    async (memory: {
      photoUrl: string;
      photoFile?: File | null;
      caption: string;
      date: string;
      location?: string;
      notes?: string;
      song?: string;
    }) => {
      let finalPhotoUrl = memory.photoUrl;
      let storageKey: string | undefined = undefined;

      if (memory.photoFile && isAuthenticated) {
        try {
          const uploadRes = await api.upload.uploadPhoto(memory.photoFile);
          if (uploadRes.success && uploadRes.url) {
            finalPhotoUrl = uploadRes.url;
            storageKey = uploadRes.storageKey;
          }
        } catch (err) {
          console.error('Failed to upload memory photo:', err);
        }
      }

      const tempId = `mem-${Date.now()}`;
      const newMem: MemoryMoment = {
        id: tempId,
        photoUrl: finalPhotoUrl,
        storageKey,
        caption: memory.caption,
        date: memory.date,
        location: memory.location,
        notes: memory.notes,
        song: memory.song,
        createdAt: new Date().toISOString(),
      };

      setMemories((prev) => [newMem, ...prev]);

      if (isAuthenticated) {
        try {
          const res = await api.memories.createMemory({
            photoUrl: finalPhotoUrl,
            storageKey,
            caption: memory.caption,
            date: memory.date,
            location: memory.location,
            notes: memory.notes,
            song: memory.song,
          });
          if (res.success && res.memory) {
            setMemories((prev) =>
              prev.map((m) => (m.id === tempId ? res.memory : m))
            );
          }
        } catch (err) {
          console.error('Failed to save memory to database:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      setMemories((prev) => prev.filter((m) => m.id !== id));

      if (isAuthenticated) {
        try {
          await api.memories.deleteMemory(id);
        } catch (err) {
          console.error('Failed to delete memory on server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const addCapsule = useCallback((capsule: { title: string; description: string; coverPhoto?: string; themeColor?: string; items: CapsuleItem[] }) => {
    const newCapsule: MemoryCapsule = {
      id: `capsule-${Date.now()}`,
      title: capsule.title,
      description: capsule.description,
      coverPhoto: capsule.coverPhoto,
      themeColor: capsule.themeColor || '#38bdf8',
      createdAt: getTodayKey(),
      items: capsule.items,
    };
    setCapsules((prev) => [newCapsule, ...prev]);
  }, []);

  const addCapsuleItem = useCallback((capsuleId: string, item: Omit<CapsuleItem, 'id'>) => {
    const newItem: CapsuleItem = {
      id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...item,
    };
    setCapsules((prev) =>
      prev.map((c) =>
        c.id === capsuleId ? { ...c, items: [...c.items, newItem] } : c
      )
    );
  }, []);

  const deleteCapsule = useCallback((id: string) => {
    setCapsules((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const unlockDiary = useCallback((passcode: string): boolean => {
    if (!settings.passcode || settings.passcode === passcode) {
      setSettings((prev) => ({ ...prev, isLocked: false }));
      return true;
    }
    return false;
  }, [settings.passcode]);

  const lockDiary = useCallback(() => {
    setSettings((prev) => ({ ...prev, isLocked: true }));
  }, []);

  const exportBackup = useCallback((): string => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      entries,
      letters,
      futureLetters,
      somedayDreams,
      memories,
      capsules,
      theme: activeTheme,
    };
    return JSON.stringify(data, null, 2);
  }, [entries, letters, futureLetters, somedayDreams, memories, capsules, activeTheme]);

  const importBackup = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.entries) setEntries(data.entries);
      if (data.letters) setLetters(data.letters);
      if (data.futureLetters) setFutureLetters(data.futureLetters);
      if (data.somedayDreams) setSomedayDreams(data.somedayDreams);
      if (data.memories) setMemories(data.memories);
      if (data.capsules) setCapsules(data.capsules);
      if (data.theme) setTheme(data.theme);
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }, [setTheme]);

  const createLetter = useCallback(async (data: {
    type: LetterRecipientType;
    recipientName: string;
    deliveryChannel?: DeliveryChannel;
    recipientContact?: string;
    title: string;
    content: string;
    scheduledDeliveryDate?: string;
    scheduledDeliveryTime?: string;
    scheduledDeliveryTimestamp?: number;
    timezone?: string;
    sealTheme?: ThemeId;
    sealColor?: string;
    isImmediate?: boolean;
  }): Promise<LetterRecord> => {
    const today = new Date();
    const todayDateKey = today.toISOString().split('T')[0];
    const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
    const targetDate = data.scheduledDeliveryDate || todayDateKey;
    const targetTime = data.scheduledDeliveryTime || currentTime;
    const timestamp = data.isImmediate
      ? Date.now()
      : (data.scheduledDeliveryTimestamp || calculateDeliveryTimestamp(targetDate, targetTime));
    const token = generateSecureLetterToken();
    const tempLetter: LetterRecord = {
      id: `ltr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      recipientName: data.recipientName.trim(),
      deliveryChannel: 'link',
      recipientContact: data.recipientContact?.trim() || undefined,
      title: data.title.trim(),
      content: data.content.trim(),
      scheduledDeliveryDate: targetDate,
      scheduledDeliveryTime: targetTime,
      scheduledDeliveryTimestamp: timestamp,
      timezone: data.timezone || 'UTC',
      token,
      status: 'SCHEDULED',
      sealTheme: data.sealTheme || 'ocean',
      sealColor: data.sealColor || '#b91c1c',
      createdAt: new Date().toISOString(),
      autoDeliveryDispatched: false,
    };

    setLetters((prev) => [tempLetter, ...prev]);

    // Send to server backend with explicit absolute timestamp
    try {
      const payload = {
        ...data,
        scheduledDeliveryDate: targetDate,
        scheduledDeliveryTime: targetTime,
        scheduledDeliveryTimestamp: timestamp,
      };
      const res = await api.letters.createLetter(payload);
      if (res.success && res.letter) {
        const createdLetter = res.letter as LetterRecord;
        setLetters((prev) =>
          prev.map((l) => (l.id === tempLetter.id ? createdLetter : l))
        );
        return createdLetter;
      }
    } catch (err) {
      console.error('Failed to create letter on server:', err);
    }

    return tempLetter;
  }, []);

  const deleteLetter = useCallback(async (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id && l.token !== id));
    try {
      await api.letters.deleteLetter(id);
    } catch {
      // Local mode fallback
    }
  }, []);

  const fetchLetterByToken = useCallback(async (token: string): Promise<LetterRecord | null> => {
    try {
      const res = await api.letters.getPublicLetter(token);
      if (res.success && res.letter) {
        return res.letter as LetterRecord;
      }
    } catch {
      // Fallback to local letters store
    }

    const localMatch = lettersRef.current.find((l) => l.token === token || l.id === token);
    if (localMatch) {
      const isReady = Date.now() >= localMatch.scheduledDeliveryTimestamp || localMatch.status === 'DELIVERED' || localMatch.status === 'OPENED';
      if (!isReady) {
        return {
          ...localMatch,
          status: 'SCHEDULED',
          content: '', // mask
        };
      }
      return localMatch;
    }

    return null;
  }, []);

  const openLetter = useCallback(async (token: string): Promise<LetterRecord | null> => {
    try {
      const res = await api.letters.openPublicLetter(token);
      if (res.success && res.letter) {
        const opened = res.letter as LetterRecord;
        setLetters((prev) =>
          prev.map((l) => (l.token === token || l.id === token ? opened : l))
        );
        return opened;
      }
    } catch {
      // Fallback
    }

    let openedLetter: LetterRecord | null = null;
    setLetters((prev) =>
      prev.map((l) => {
        if (l.token === token || l.id === token) {
          const updated = { ...l, status: 'OPENED' as const, openedAt: new Date().toISOString() };
          openedLetter = updated;
          return updated;
        }
        return l;
      })
    );
    return openedLetter || lettersRef.current.find((l) => l.token === token || l.id === token) || null;
  }, []);

  const fastForwardDelivery = useCallback(async (token: string): Promise<LetterRecord | null> => {
    try {
      const res = await api.letters.fastForwardPublicLetter(token);
      if (res.success && res.letter) {
        const ff = res.letter as LetterRecord;
        setLetters((prev) =>
          prev.map((l) => (l.token === token || l.id === token ? ff : l))
        );
        return ff;
      }
    } catch {
      // Fallback
    }

    let ffLetter: LetterRecord | null = null;
    setLetters((prev) =>
      prev.map((l) => {
        if (l.token === token || l.id === token) {
          const updated = {
            ...l,
            scheduledDeliveryTimestamp: Date.now() - 1000,
            status: 'DELIVERED' as const,
            deliveredAt: new Date().toISOString(),
          };
          ffLetter = updated;
          return updated;
        }
        return l;
      })
    );
    return ffLetter || lettersRef.current.find((l) => l.token === token || l.id === token) || null;
  }, []);

  const retryLetterDelivery = useCallback(async (id: string) => {
    try {
      const res = await api.letters.retryDelivery(id);
      if (res.success) {
        await refreshLetters();
      }
    } catch (err) {
      console.error('Failed to retry letter delivery', err);
    }
  }, [refreshLetters]);

  const updateLetterRecipient = useCallback(async (id: string, contact: string, name?: string) => {
    try {
      const res = await api.letters.updateRecipient(id, contact, name);
      if (res.success) {
        await refreshLetters();
      }
    } catch (err) {
      console.error('Failed to update recipient', err);
    }
  }, [refreshLetters]);

  return (
    <DiaryContext.Provider
      value={{
        activeDate,
        activeView,
        activeTheme,
        activeBackground,
        themeBackgroundIndexes,
        customPhoto,
        setCustomPhoto,
        removeCustomPhoto,
        refreshActiveThemeBackground,
        refreshThemeBackground,
        setThemeBackgroundIndex,
        entries,
        currentEntry,
        futureLetters,
        somedayDreams,
        memories,
        capsules,
        settings,
        saveStatus,
        lastSavedAt,
        setActiveDate,
        setActiveView,
        setTheme,
        goToToday,
        goToPreviousDay,
        goToNextDay,
        updateCurrentEntry,
        updateEntryForDate,
        deleteEntryForDate,
        getEntryForDate,
        hasEntryOnDate,
        getOnThisDayEntries,
        addFutureLetter,
        openFutureLetter,
        deleteFutureLetter,
        addSomedayDream,
        toggleSomedayDream,
        deleteSomedayDream,
        addMemory,
        deleteMemory,
        addCapsule,
        addCapsuleItem,
        deleteCapsule,
        updateSettings,
        unlockDiary,
        lockDiary,
        exportBackup,
        importBackup,
        letters,
        activeLetterToken,
        setActiveLetterToken,
        createLetter,
        deleteLetter,
        fetchLetterByToken,
        openLetter,
        fastForwardDelivery,
        retryLetterDelivery,
        updateLetterRecipient,
        refreshLetters,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = (): DiaryContextType => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
