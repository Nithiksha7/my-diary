# My Diary — Private Journal & Sealed Letter Experience

A beautiful, cinematic, and private diary experience featuring **Sealed Private Letters & Device Sharing**.

---

## 🔗 Private Link & Device Sharing

My Diary allows you to compose private, physical-styled stationery letters addressed to someone special or to your future self, choose an exact delivery date, time, and timezone, and seal them with an authentic wax seal emblem.

You can share your private letters directly via **Device Sharing** (WhatsApp, Messages, AirDrop, etc.) or by copying the secure link.

### Features
- **Zero Account Requirement for Recipient**: The recipient does NOT need a My Diary account, login, or dashboard access. Opening the private link displays a dedicated interactive envelope.
- **Envelope Unsealing Experience**: Before the scheduled time, the recipient sees a locked envelope with an active countdown. At the delivery moment, the envelope unlocks, animating the envelope flap and revealing the handwritten stationery letter with particles/confetti.
- **AES-256-GCM Encryption at Rest**: Letter content is encrypted on the server at rest and only decrypted when the delivery timestamp is reached.
- **Idempotent & Safe**: State transitions (`SCHEDULED` → `DELIVERED` → `OPENED`) manage letter unlocking reliably.

---

## 🔧 Environment Variables Configuration

Copy `.env.example` to `.env` or set these environment variables in your deployment platform:

```bash
# 1. Base Public Application URL
# Local development: http://localhost:5173
# Production domain: https://my-diary-nine-tau.vercel.app
APP_PUBLIC_URL=https://my-diary-nine-tau.vercel.app

# 2. Frontend Origin for CORS
FRONTEND_URL=https://my-diary-nine-tau.vercel.app

# 3. Database & Authentication
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_jwt_key
```

> **Important**: Never commit your `.env` file or API secrets to version control. The repository `.gitignore` is pre-configured to ignore `.env` and `.env.local` files.

---

## 🚀 Production Deployment Guidelines

1. **Continuous Node.js Host (VPS / Docker / Railway / Render)**:
   The built-in scheduler runs periodically inside the server process. Overdue letters from any downtime are automatically caught and delivered immediately upon server restart.
2. **Serverless Deployment (Vercel / AWS Lambda / Cloudflare Pages)**:
   For serverless environments where long-lived background intervals are terminated after request completion, set up an external cron service (e.g., [Cron-Job.org](https://cron-job.org), Vercel Cron, or GitHub Actions) to invoke `GET /api/letters` or `POST /api/letters/settings/gateways` periodically every 1–5 minutes. The backend uses the database as the sole source of truth to claim and process due letters.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server with backend letters plugin
npm run dev

# 3. Build for production
npm run build
```
