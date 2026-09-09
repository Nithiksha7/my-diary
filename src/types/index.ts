export type ThemeId =
  | 'ocean'
  | 'beach'
  | 'cloudy'
  | 'foggy'
  | 'moonlight'
  | 'vintage'
  | 'clouds'
  | 'blur'
  | 'custom';

export type MoodType = 
  | 'peaceful'
  | 'happy'
  | 'nostalgic'
  | 'loved'
  | 'lost'
  | 'dreamy'
  | 'excited'
  | 'sad'
  | 'melancholic'
  | 'serene';

export interface MoodMeta {
  id: MoodType;
  label: string;
  emoji: string;
  poeticDescription: string;
}

export interface LittleThings {
  smiled?: string;
  remember?: string;
  wish?: string;
  learned?: string;
  customPrompt?: {
    question: string;
    answer: string;
  };
}

export interface CurrentlyInfo {
  listening?: string;
  location?: string;
  having?: string;
  reading?: string;
  thinking?: string;
}

export interface PhotoAttachment {
  id: string;
  url: string;
  caption?: string;
  rotation?: number;
  createdAt: string;
}

export interface SongAttachment {
  title: string;
  artist: string;
  notes?: string;
}

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  oneSentence?: string;
  mood?: MoodType;
  littleThings?: LittleThings;
  currently?: CurrentlyInfo;
  photos?: PhotoAttachment[];
  song?: SongAttachment;
  weather?: string;
  location?: string;
  isSpecial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FutureLetter {
  id: string;
  title: string;
  content: string;
  createdAt: string; // Written on YYYY-MM-DD
  unlockDate: string; // Open on YYYY-MM-DD
  unlockAt?: string; // ISO timestamp
  timezone?: string;
  isOpened: boolean;
  isLocked?: boolean;
  openedAt?: string;
  sealColor?: string;
  recipientNote?: string;
  updatedAt?: string;
}

export type DreamCategory = 
  | 'places'
  | 'experiences'
  | 'learning'
  | 'try'
  | 'little'
  | 'big';

export interface SomedayDream {
  id: string;
  title: string;
  description?: string;
  category: DreamCategory;
  imageUrl?: string;
  storageKey?: string;
  targetDate?: string;
  createdAt: string;
  completed: boolean; // "Something I finally lived"
  completedAt?: string;
  notes?: string;
  updatedAt?: string;
}

export interface MemoryMoment {
  id: string;
  photoUrl: string;
  storageKey?: string;
  caption: string;
  date: string;
  location?: string;
  notes?: string;
  song?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CapsuleItem {
  id: string;
  type: 'photo' | 'quote' | 'song' | 'note' | 'date';
  content: string;
  extra?: string;
}

export interface MemoryCapsule {
  id: string;
  title: string;
  description: string;
  coverPhoto?: string;
  themeColor?: string;
  createdAt: string;
  items: CapsuleItem[];
}

export interface UserSettings {
  passcode?: string;
  isLocked: boolean;
  reducedMotion: boolean;
  activeTheme: ThemeId;
}

export type LetterRecipientType = 'someone' | 'me';
export type LetterStatus =
  | 'DRAFT'
  | 'SEALED'
  | 'SCHEDULED'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CONFIG_REQUIRED'
  | 'DELIVERY_FAILED'
  | 'OPENED'
  | 'sealed'
  | 'deliverable'
  | 'delivered'
  | 'opened'
  | 'DISPATCHING'
  | 'DISPATCHED'
  | 'DELIVERABLE';

export type DeliveryChannel = 'link' | 'email';

export interface LetterRecord {
  id: string;
  type: LetterRecipientType;
  senderId?: string;
  recipientName: string;
  recipientEmail?: string;
  deliveryChannel: DeliveryChannel | string;
  recipientContact?: string; // Recipient email address for Email delivery or note for link
  title: string;
  content: string;
  scheduledDeliveryDate: string; // YYYY-MM-DD
  scheduledDeliveryTime: string; // HH:mm
  scheduledDeliveryTimestamp: number; // Absolute UTC timestamp in milliseconds
  timezone: string; // e.g. "Asia/Kolkata (IST)"
  token: string; // Secure 32-character opaque token for recipient link
  status: LetterStatus;
  sealTheme: ThemeId;
  sealColor: string;
  createdAt: string; // ISO string
  dispatchedAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  providerMessageId?: string;
  deliveryFailureReason?: string;
  autoDeliveryDispatched?: boolean;
  isDeliverable?: boolean;
}

export type SocialPlatform = 'email' | 'copy';

export type ActiveView = 'dashboard' | 'diary' | 'themes' | 'calendar' | 'letters' | 'future-me' | 'someday' | 'capsules';
