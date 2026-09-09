# My Diary — Private Journal & Real-Time Scheduled Email Letter Delivery

A beautiful, cinematic, and private diary experience featuring **Real Scheduled Email Letter Delivery**.

---

## ✉ Real Email Letter Delivery

My Diary allows you to compose private, physical-styled stationery letters addressed to someone special or to your future self, choose an exact delivery date, time, and timezone, and seal them. 

When the scheduled moment arrives, the **server-side background scheduler automatically delivers the letter to the recipient's email address** containing a cryptographically secure public unsealing link.

### Features
- **Zero Account Requirement for Recipient**: The recipient does NOT need a My Diary account, login, or dashboard access. Clicking the email link opens a dedicated 3D interactive envelope.
- **Server-Authoritative Background Scheduler**: Independent of client browser state. The sender can close their browser, log out, or shut down their machine; the server guarantees delivery at the exact UTC timestamp.
- **Envelope Unsealing Experience**: Before the scheduled time, the recipient sees a locked envelope with an active countdown. At the delivery moment, the `OPEN` button activates, animating the envelope flap and revealing the handwritten stationery letter with particles/confetti.
- **AES-256-GCM Encryption at Rest**: Letter content is encrypted on the server at rest and only decrypted when the delivery timestamp is reached.
- **Idempotent & Safe**: State transitions (`SCHEDULED` → `DELIVERING` → `DELIVERED` / `OPENED`) prevent duplicate dispatches even across server reboots.

---

## 🔧 Environment Variables Configuration

Copy `.env.example` to `.env` or set these environment variables in your deployment platform:

```bash
# 1. Base Public Application URL (Included in recipient email links)
# Local development: http://localhost:5173
# Production domain: https://yourdiary.app
APP_PUBLIC_URL=https://yourdiary.app

# 2. Email Sender Identity
EMAIL_FROM_ADDRESS=letters@yourdiary.app
EMAIL_FROM_NAME="My Diary"

# 3. Transactional Email Provider (Option A: Resend API - Recommended)
# Get a free API key at https://resend.com (3,000 free emails/month)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# --- Option B: Custom SMTP Server ---
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
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
