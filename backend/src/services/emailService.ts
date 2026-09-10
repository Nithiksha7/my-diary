import type { ILetter } from '../models/Letter.js';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  errorReason?: string;
  isConfigRequired?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateLetterEmailHtml(recipientName: string, letterTitle: string, secureUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You have a letter waiting for you: ${escapeHtml(letterTitle)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0d1117;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Georgia', serif;
      color: #e6edf3;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #090d13;
      padding: 40px 16px;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background: linear-gradient(145deg, #161b22 0%, #0d1117 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .seal-badge {
      width: 60px;
      height: 60px;
      margin: 0 auto 24px;
      background: radial-gradient(circle at 30% 30%, #dc2626, #7f1d1d);
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 24px rgba(220, 38, 38, 0.4);
      color: #ffffff;
      font-size: 24px;
      line-height: 60px;
      text-align: center;
    }
    .brand {
      font-size: 11px;
      font-family: monospace;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #38bdf8;
      margin-bottom: 12px;
    }
    .headline {
      font-family: 'Georgia', serif;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px;
      line-height: 1.3;
    }
    .salutation {
      font-family: 'Georgia', serif;
      font-size: 17px;
      font-style: italic;
      color: #93c5fd;
      margin-bottom: 16px;
    }
    .message {
      font-family: 'Georgia', serif;
      font-size: 15px;
      line-height: 1.7;
      color: #cbd5e1;
      margin: 0 0 32px;
    }
    .btn-container {
      margin: 32px 0 24px;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background: linear-gradient(135deg, #fbbf24 0%, #38bdf8 50%, #818cf8 100%);
      color: #030712 !important;
      text-decoration: none;
      font-family: 'Georgia', serif;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35);
    }
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 32px 0 20px;
    }
    .footer {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="seal-badge">✉</div>
      <div class="brand">MY DIARY · SCHEDULED DELIVERY</div>
      <h1 class="headline">You have a letter waiting for you</h1>
      
      <div class="salutation">Hello ${escapeHtml(recipientName)},</div>
      
      <p class="message">
        Someone wrote something for you in My Diary:<br>
        <strong style="color: #ffffff; font-size: 16px;">“${escapeHtml(letterTitle)}”</strong><br><br>
        and chose this exact moment for you to receive it.
      </p>

      <div class="btn-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${secureUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" stroke="f" fillcolor="#38bdf8">
          <w:anchorlock/>
          <center style="color:#030712;font-family:Georgia,serif;font-size:14px;font-weight:bold;letter-spacing:2px;">OPEN YOUR LETTER</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${secureUrl}" class="btn" target="_blank" rel="noopener noreferrer">OPEN YOUR LETTER</a>
        <!--<![endif]-->
      </div>

      <div class="divider"></div>

      <div class="footer">
        <p style="margin: 0 0 8px;">
          This letter is private and sealed until opened. You do not need an account to read it.
        </p>
        <p style="margin: 0; font-size: 11px; opacity: 0.8;">
          Direct link: <a href="${secureUrl}">${secureUrl}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateLetterEmailPlainText(recipientName: string, letterTitle: string, secureUrl: string): string {
  return `Hello ${recipientName},

You have a letter waiting for you in My Diary: "${letterTitle}".

Someone wrote something for you, and chose this exact moment for you to receive it.

[ OPEN YOUR LETTER ]
${secureUrl}

This letter is private and sealed until opened. You do not need an account to read it.

With warmth,
My Diary`;
}

/**
 * Resolves the public frontend base URL used for links in emails and notifications.
 *
 * Priority order for environment variables:
 * 1. APP_PUBLIC_URL
 * 2. FRONTEND_URL (first valid URL if comma-separated)
 * 3. VITE_PUBLIC_APP_URL
 * 4. CORS_ORIGIN (first valid URL if comma-separated)
 *
 * Behavior:
 * - Production: Defaults to 'https://my-diary-nine-tau.vercel.app' and ensures
 *   no localhost/127.0.0.1 link is ever emitted in production emails.
 * - Local Development: Defaults to 'http://localhost:5173' (or custom port/host if configured in env).
 */
export function getPublicFrontendUrl(): string {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.HEROKU_APP_NAME);

  const rawCandidates = [
    process.env.APP_PUBLIC_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_PUBLIC_APP_URL,
    process.env.CORS_ORIGIN,
  ];

  const extractedUrls: string[] = [];
  for (const candidate of rawCandidates) {
    if (candidate && typeof candidate === 'string') {
      const parts = candidate.split(',');
      for (const part of parts) {
        const cleaned = part.trim().replace(/\/$/, '');
        if (cleaned && /^https?:\/\//i.test(cleaned)) {
          extractedUrls.push(cleaned);
        }
      }
    }
  }

  if (isProduction) {
    // In production, select the first valid candidate that is not a local address
    const prodUrl = extractedUrls.find((url) => !/localhost|127\.0\.0\.1/i.test(url));
    if (prodUrl) {
      return prodUrl;
    }
    // Hard fallback for production
    return 'https://my-diary-nine-tau.vercel.app';
  }

  // In local development, if an env candidate was specified (e.g. localhost:5174), use it
  if (extractedUrls.length > 0) {
    return extractedUrls[0];
  }

  return 'http://localhost:5173';
}

export class EmailService {
  /**
   * Checks if Resend API is configured in the environment
   */
  static isConfigured(): boolean {
    const key = process.env.RESEND_API_KEY;
    return Boolean(key && key.trim());
  }

  /**
   * Sends a scheduled letter notification email via Resend
   */
  static async sendLetterEmail(letter: ILetter, rawToken: string): Promise<EmailSendResult> {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || !resendKey.trim()) {
      return {
        success: false,
        isConfigRequired: true,
        errorReason: 'RESEND_API_KEY is not configured in the backend environment.',
      };
    }

    const recipientEmail = letter.recipientEmail || letter.recipientContact;
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return {
        success: false,
        isConfigRequired: false,
        errorReason: 'Invalid or missing recipient email address.',
      };
    }

    const publicUrl = getPublicFrontendUrl();
    const secureUrl = `${publicUrl}/letter/${rawToken}`;
    let fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || process.env.RESEND_FROM_EMAIL;
    if (!fromAddress || !fromAddress.trim()) {
      fromAddress = 'My Diary <onboarding@resend.dev>';
    } else {
      fromAddress = fromAddress.trim();
      if (!fromAddress.includes('<') && !fromAddress.includes('>')) {
        const fromName = process.env.EMAIL_FROM_NAME || 'My Diary';
        fromAddress = `${fromName} <${fromAddress}>`;
      }
    }
    const subject = `You have a letter waiting for you: "${letter.title}"`;

    const htmlContent = generateLetterEmailHtml(letter.recipientName, letter.title, secureUrl);
    const textContent = generateLetterEmailPlainText(letter.recipientName, letter.title, secureUrl);

    try {
      console.log(`[EmailService] ✉ Dispatching scheduled letter via Resend to ${letter.recipientName} <${recipientEmail}>...`);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipientEmail],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      const data = (await res.json()) as { id?: string; message?: string; name?: string };

      if (res.ok && data.id) {
        console.log(`[EmailService] ✓ Resend email dispatched successfully! ID: ${data.id}`);
        return {
          success: true,
          messageId: data.id,
        };
      } else {
        const errorMsg = data.message || data.name || `Resend returned HTTP ${res.status}`;
        console.error(`[EmailService] ✕ Resend error:`, data);
        return {
          success: false,
          isConfigRequired: false,
          errorReason: errorMsg,
        };
      }
    } catch (err) {
      console.error(`[EmailService] ✕ Network error connecting to Resend:`, err);
      return {
        success: false,
        isConfigRequired: false,
        errorReason: (err as Error).message || 'Network error connecting to Resend',
      };
    }
  }
}
