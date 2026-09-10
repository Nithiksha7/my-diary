import { Letter } from '../models/Letter.js';

let isRunningBatch = false;
let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Atomically processes all scheduled letters that have become due.
 * Marks them DELIVERED so they are unlocked for unsealing via their private link.
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
      // 1. Atomic claim: SCHEDULED -> DELIVERED
      const claimed = await Letter.findOneAndUpdate(
        {
          _id: letter._id,
          status: 'SCHEDULED',
        },
        {
          status: 'DELIVERED',
          dispatchedAt: new Date(),
          deliveredAt: new Date(),
          deliveryFailureReason: undefined,
        },
        { new: true }
      );

      if (!claimed) {
        // Another scheduler tick already claimed this letter
        continue;
      }

      processedCount++;

      console.log(
        `[SchedulerService] ✓ Letter "${claimed.title}" DELIVERED (Private Link unlocked for ${claimed.recipientName}).`
      );
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
