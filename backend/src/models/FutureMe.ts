import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IFutureMe extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  unlockAt: Date;
  timezone: string;
  isOpened: boolean;
  openedAt?: Date;
  sealColor: string;
  recipientNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FutureMeSchema = new Schema<IFutureMe>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Letter title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Letter content is required'],
    },
    unlockAt: {
      type: Date,
      required: [true, 'Unlock date/timestamp is required'],
      index: true,
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    openedAt: {
      type: Date,
    },
    sealColor: {
      type: String,
      default: '#b91c1c',
    },
    recipientNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId for fast queries
FutureMeSchema.index({ userId: 1, unlockAt: 1 });

export const FutureMe: Model<IFutureMe> =
  mongoose.models.FutureMe || mongoose.model<IFutureMe>('FutureMe', FutureMeSchema);
