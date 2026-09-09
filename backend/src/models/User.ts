import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserSettings {
  passcode?: string;
  isLocked?: boolean;
  reducedMotion?: boolean;
  activeTheme?: string;
  themeBackgroundIndexes?: Record<string, number>;
  customPhotoUrl?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  settings: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    passcode: { type: String },
    isLocked: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    activeTheme: { type: String, default: 'ocean' },
    themeBackgroundIndexes: { type: Map, of: Number, default: {} },
    customPhotoUrl: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false, // Never return in standard queries
    },
    settings: {
      type: UserSettingsSchema,
      default: () => ({
        activeTheme: 'ocean',
        isLocked: false,
        reducedMotion: false,
        themeBackgroundIndexes: {},
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password against bcrypt hash
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
