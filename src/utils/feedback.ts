/**
 * Offline-first feedback system.
 *
 * Feedback is ALWAYS written to IndexedDB first (never blocks on network),
 * then — only if Supabase is configured and the device is online — synced to
 * the `feedback_submissions` table as a best-effort background step. If the
 * backend isn't configured yet, submissions simply stay local and never crash.
 */
import { getDB, generateId } from './db';
import type { FeedbackSubmission } from './db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type FeedbackCategory = FeedbackSubmission['category'];
export type FeedbackSource = FeedbackSubmission['source'];

export interface FeedbackInput {
  name?: string;
  email?: string;
  category: FeedbackCategory;
  message: string;
  source: FeedbackSource;
}

/** Best-effort sync of pending submissions. Safe to call anywhere. */
async function trySyncPending(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  try {
    const db = await getDB();
    const pending = await db.getAllFromIndex('feedback', 'by-status', 'pending');
    if (pending.length === 0) return true;

    const batch = pending.slice(0, 50);
    const { error } = await supabase.from('feedback_submissions').insert(
      batch.map(f => ({
        id: f.id,
        name: f.name ?? null,
        email: f.email ?? null,
        category: f.category,
        message: f.message,
        created_at: f.createdAt,
      }))
    );

    if (error) {
      console.warn('[DriveLog Feedback] Sync deferred:', error.message);
      for (const f of batch) {
        await db.put('feedback', { ...f, status: 'failed' as const });
      }
      return false;
    }

    for (const f of batch) {
      await db.put('feedback', { ...f, status: 'synced' as const });
    }
    return true;
  } catch (err) {
    console.warn('[DriveLog Feedback] Sync skipped:', err);
    return false;
  }
}

/**
 * Saves feedback locally, then attempts an immediate best-effort sync.
 * Returns whether it was delivered to the backend or saved locally.
 */
export async function submitFeedback(input: FeedbackInput): Promise<{ delivered: boolean }> {
  const record: FeedbackSubmission = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    name: input.name?.trim() || undefined,
    email: input.email?.trim() || undefined,
    category: input.category,
    message: input.message.trim(),
    status: 'pending',
    source: input.source,
  };

  // Local write FIRST — offline-first guarantee
  const db = await getDB();
  await db.put('feedback', record);

  // Best-effort immediate sync
  const delivered = await trySyncPending();
  return { delivered };
}

/** Retry any pending/failed feedback (e.g. on reconnect). */
export async function retryPendingFeedback(): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  // Mark failed items back to pending so trySyncPending picks them up
  try {
    const db = await getDB();
    const failed = await db.getAllFromIndex('feedback', 'by-status', 'failed');
    for (const f of failed) {
      await db.put('feedback', { ...f, status: 'pending' as const });
    }
  } catch {
    // Non-fatal
  }
  await trySyncPending();
}

// Self-initialize: retry queued feedback whenever connectivity returns
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void retryPendingFeedback();
  });
}
