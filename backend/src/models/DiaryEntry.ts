import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPhotoAttachment {
  id: string;
  url: string;
  caption?: string;
  rotation?: number;
  createdAt?: Date | string;
}

export interface ILittleThings {
  smiled?: string;
  remember?: string;
  wish?: string;
  learned?: string;
  customPrompt?: {
    question: string;
    answer: string;
  };
}

export interface ICurrentlyInfo {
  listening?: string;
  location?: string;
  having?: string;
  reading?: string;
  thinking?: string;
}

export interface ISongAttachment {
  title: string;
  artist: string;
  notes?: string;
}

export interface IDiaryEntry extends Document {
  userId: Types.ObjectId;
  dateKey: string; // Format: "YYYY-MM-DD"
  content: string;
  oneSentence?: string;
  mood?: string;
  littleThings?: ILittleThings;
  currently?: ICurrentlyInfo;
  photos?: IPhotoAttachment[];
  song?: ISongAttachment;
  isSpecial?: boolean;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoAttachmentSchema = new Schema<IPhotoAttachment>(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String },
    rotation: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LittleThingsSchema = new Schema<ILittleThings>(
  {
    smiled: { type: String },
    remember: { type: String },
    wish: { type: String },
    learned: { type: String },
    customPrompt: {
      question: { type: String },
      answer: { type: String },
    },
  },
  { _id: false }
);

const CurrentlyInfoSchema = new Schema<ICurrentlyInfo>(
  {
    listening: { type: String },
    location: { type: String },
    having: { type: String },
    reading: { type: String },
    thinking: { type: String },
  },
  { _id: false }
);

const SongAttachmentSchema = new Schema<ISongAttachment>(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const DiaryEntrySchema = new Schema<IDiaryEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: [true, 'dateKey in format YYYY-MM-DD is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'dateKey must be in format YYYY-MM-DD'],
    },
    content: {
      type: String,
      default: '',
    },
    oneSentence: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
    },
    littleThings: {
      type: LittleThingsSchema,
      default: () => ({}),
    },
    currently: {
      type: CurrentlyInfoSchema,
      default: () => ({}),
    },
    photos: {
      type: [PhotoAttachmentSchema],
      default: [],
    },
    song: {
      type: SongAttachmentSchema,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique constraint: Exactly one diary entry per user per date
DiaryEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

// Pre-save hook to calculate word count automatically
DiaryEntrySchema.pre('save', function (next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  } else {
    this.wordCount = 0;
  }
  next();
});

export const DiaryEntry: Model<IDiaryEntry> =
  mongoose.models.DiaryEntry || mongoose.model<IDiaryEntry>('DiaryEntry', DiaryEntrySchema);
