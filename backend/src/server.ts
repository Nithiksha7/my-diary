import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import somedayRoutes from './routes/somedayRoutes.js';
import futureMeRoutes from './routes/futureMeRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { startScheduler } from './services/schedulerService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse configured frontend origins from environment
const rawOrigins = [
  process.env.FRONTEND_URL,
  process.env.APP_PUBLIC_URL,
  process.env.CORS_ORIGIN,
  process.env.VITE_PUBLIC_APP_URL,
].filter(Boolean);

const configuredOrigins: string[] = [];
rawOrigins.forEach((str) => {
  if (str) {
    str.split(',').forEach((item) => {
      const clean = item.trim().replace(/\/$/, '');
      if (clean) configuredOrigins.push(clean);
    });
  }
});

const defaultOrigins = [
  'https://my-diary-nine-tau.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

const isOriginAllowed = (origin: string): boolean => {
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(cleanOrigin)) {
    return true;
  }
  // Allow all Vercel deployments for this frontend
  if (/^https:\/\/my-diary-.*\.vercel\.app$/.test(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
    return true;
  }
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server, or curl/Postman)
    if (!origin) {
      return callback(null, true);
    }
    if (isOriginAllowed(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Reject unauthorized origin without throwing an error that breaks preflight response
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Static file serving for local development uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

// Root health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'My Diary API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/someday', somedayRoutes);
app.use('/api/future-me', futureMeRoutes);
app.use('/api/letters', letterRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server and initialize MongoDB connection
async function startServer() {
  await connectDB();

  // Start background letter delivery scheduler
  startScheduler(4000);

  app.listen(PORT, () => {
    console.log(`[MyDiaryBackend] 🚀 API Server running on port ${PORT}`);
    console.log(`[MyDiaryBackend] 📡 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[MyDiaryBackend] Failed to start server:', err);
});

export default app;
