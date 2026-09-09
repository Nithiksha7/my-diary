import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMemory extends Document {
  userId: Types.ObjectId;
  photoUrl: string;
  storageKey?: string;
  caption: string;
  date: string; // YYYY-MM-DD
  location?: string;
  notes?: string;
  song?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Memory photo URL is required'],
    },
    storageKey: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      required: [true, 'Memory caption is required'],
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    date: {
      type: String,
      required: [true, 'Memory date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'],
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    song: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId and date for fast retrieval
MemorySchema.index({ userId: 1, date: -1 });

export const Memory: Model<IMemory> =
  mongoose.models.Memory || mongoose.model<IMemory>('Memory', MemorySchema);
