import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type SomedayCategory = 'places' | 'experiences' | 'learning' | 'try' | 'little' | 'big';

export interface ISomeday extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: SomedayCategory;
  imageUrl?: string;
  storageKey?: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SomedaySchema = new Schema<ISomeday>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Dream title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['places', 'experiences', 'learning', 'try', 'little', 'big'],
        message: '{VALUE} is not a supported dream category',
      },
      required: [true, 'Category is required'],
      default: 'places',
    },
    imageUrl: {
      type: String,
    },
    storageKey: {
      type: String,
      trim: true,
    },
    targetDate: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId for fast queries
SomedaySchema.index({ userId: 1, createdAt: -1 });

export const Someday: Model<ISomeday> =
  mongoose.models.Someday || mongoose.model<ISomeday>('Someday', SomedaySchema);
