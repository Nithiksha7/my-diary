import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type LetterRecipientType = 'someone' | 'me';

export type LetterStatus =
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'CONFIG_REQUIRED'
  | 'DELIVERY_FAILED'
  | 'OPENED';

export interface ILetter extends Document {
  userId: Types.ObjectId;
  type: LetterRecipientType;
  recipientName: string;
  recipientEmail?: string;
  deliveryChannel: string;
  recipientContact?: string;
  title: string;
  encryptedContent: string;
  encryptedToken?: string;
  scheduledDeliveryDate: string; // YYYY-MM-DD
  scheduledDeliveryTime: string; // HH:mm
  scheduledDeliveryTimestamp: number; // UTC milliseconds timestamp
  timezone: string;
  publicTokenHash: string; // SHA-256 hash of the public token
  status: LetterStatus;
  sealTheme: string;
  sealColor: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  providerMessageId?: string;
  deliveryFailureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LetterSchema = new Schema<ILetter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['someone', 'me'],
      required: true,
      default: 'someone',
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      maxlength: [200, 'Recipient name cannot exceed 200 characters'],
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    deliveryChannel: {
      type: String,
      default: 'link',
    },
    recipientContact: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Letter title is required'],
      trim: true,
      maxlength: [300, 'Letter title cannot exceed 300 characters'],
    },
    encryptedContent: {
      type: String,
      required: [true, 'Encrypted letter content is required'],
    },
    encryptedToken: {
      type: String,
    },
    scheduledDeliveryDate: {
      type: String,
      required: [true, 'Scheduled delivery date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Scheduled delivery date must be in YYYY-MM-DD format'],
    },
    scheduledDeliveryTime: {
      type: String,
      required: [true, 'Scheduled delivery time (HH:mm) is required'],
    },
    scheduledDeliveryTimestamp: {
      type: Number,
      required: [true, 'Scheduled delivery timestamp (ms) is required'],
      index: true,
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    publicTokenHash: {
      type: String,
      required: [true, 'Public token hash is required'],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'PROCESSING', 'DELIVERED', 'CONFIG_REQUIRED', 'DELIVERY_FAILED', 'OPENED'],
      default: 'SCHEDULED',
      index: true,
    },
    sealTheme: {
      type: String,
      default: 'ocean',
    },
    sealColor: {
      type: String,
      default: '#b91c1c',
    },
    dispatchedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    providerMessageId: {
      type: String,
    },
    deliveryFailureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LetterSchema.index({ userId: 1, scheduledDeliveryTimestamp: 1 });
LetterSchema.index({ status: 1, scheduledDeliveryTimestamp: 1 });

export const Letter: Model<ILetter> =
  mongoose.models.Letter || mongoose.model<ILetter>('Letter', LetterSchema);
