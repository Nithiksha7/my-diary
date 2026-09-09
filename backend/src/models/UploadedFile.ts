import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUploadedFile extends Document {
  userId: Types.ObjectId;
  url: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UploadedFile: Model<IUploadedFile> =
  mongoose.models.UploadedFile || mongoose.model<IUploadedFile>('UploadedFile', UploadedFileSchema);
