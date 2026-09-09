import { Letter, type ILetter } from '../models/Letter.js';
import { decryptLetterContent } from '../utils/crypto.js';
import { EmailService } from './emailService.js';

let isRunningBatch = false;
let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Atomically processes all scheduled letters that have become due.
 */
export async function processScheduledLettersBatch(): Promise<number> {
  if (isRunningBatch) return 0;
  isRunningBatch = true;

  let processedCount = 0;

  try {
    const now = Date.now();

    // Find all letters that are due and waiting for delivery
    const dueLetters = await Letter.find({
      status: 'SCHEDULED',
      scheduledDeliveryTimestamp: { $lte: now },
    });

    for (const letter of dueLetters) {
      // 1. Atomic claim: SCHEDULED -> PROCESSING
      // Prevents concurrent double-delivery even under clustering or overlapping ticks
      const claimed = await Letter.findOneAndUpdate(
        {
          _id: letter._id,
          status: 'SCHEDULED',
        },
        {
          status: 'PROCESSING',
          dispatchedAt: new Date(),
        },
        { new: true }
      );

      if (!claimed) {
        // Another scheduler tick or worker already claimed this letter
        continue;
      }

      processedCount++;

      // 2. Decrypt raw token for secure URL generation in email
      const rawToken = claimed.encryptedToken
        ? decryptLetterContent(claimed.encryptedToken)
        : '';

      const isEmailChannel = claimed.deliveryChannel === 'email' || Boolean(claimed.recipientEmail);

      // 3. For Direct Link or channels without email configuration:
      // Mark DELIVERED immediately as the scheduled moment has arrived and link is unlocked.
      if (!isEmailChannel || claimed.deliveryChannel === 'link') {
        claimed.status = 'DELIVERED';
        claimed.deliveredAt = new Date();
        claimed.deliveryFailureReason = undefined;
        await claimed.save();

        console.log(
          `[SchedulerService] ✓ Letter "${claimed.title}" DELIVERED (Direct Link unlocked for ${claimed.recipientName}).`
        );
        continue;
      }

      // 4. Dispatch via Resend Email Service for Email delivery channel
      const result = await EmailService.sendLetterEmail(claimed, rawToken);

      if (result.success) {
        claimed.status = 'DELIVERED';
        claimed.deliveredAt = new Date();
        claimed.providerMessageId = result.messageId;
        claimed.deliveryFailureReason = undefined;
        await claimed.save();

        console.log(
          `[SchedulerService] ✓ Letter "${claimed.title}" DELIVERED via Email to ${claimed.recipientName} (${claimed.recipientEmail || claimed.recipientContact}). MessageId: ${result.messageId}`
        );
      } else if (result.isConfigRequired) {
        claimed.status = 'CONFIG_REQUIRED';
        claimed.deliveryFailureReason = result.errorReason;
        await claimed.save();

        console.warn(
          `[SchedulerService] ⚠ Letter "${claimed.title}" marked CONFIG_REQUIRED (${result.errorReason})`
        );
      } else {
        claimed.status = 'DELIVERY_FAILED';
        claimed.deliveryFailureReason = result.errorReason;
        await claimed.save();

        console.error(
          `[SchedulerService] ✕ Letter "${claimed.title}" DELIVERY_FAILED (${result.errorReason})`
        );
      }
    }
  } catch (err) {
    console.error('[SchedulerService] Error running delivery batch:', err);
  } finally {
    isRunningBatch = false;
  }

  return processedCount;
}

/**
 * Starts the server-side delivery scheduler loop.
 */
export function startScheduler(intervalMs = 4000): void {
  if (schedulerTimer) return;

  console.log(`[SchedulerService] ⏱ Background letter delivery scheduler started (Interval: ${intervalMs}ms)`);

  // Initial trigger
  processScheduledLettersBatch().catch(() => {});

  schedulerTimer = setInterval(() => {
    processScheduledLettersBatch().catch(() => {});
  }, intervalMs);

  if (schedulerTimer && typeof schedulerTimer.unref === 'function') {
    schedulerTimer.unref();
  }
}

/**
 * Manually triggers an immediate scheduler batch (e.g. after letter creation or retry).
 */
export function triggerSchedulerNow(): void {
  setTimeout(() => {
    processScheduledLettersBatch().catch(() => {});
  }, 50);
}
