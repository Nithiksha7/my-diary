import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn('[Database] ⚠ MONGODB_URI environment variable is not set. Database connection skipped.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] ✓ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[Database] ✕ MongoDB connection error:', (error as Error).message);
    // Don't crash process in development, allow retry or fallback
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
