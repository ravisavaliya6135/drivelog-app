/**
 * Offline-first, privacy-respecting event logger.
 *
 * - Events are written to IndexedDB (`analyticsEvents` store) FIRST, so
 *   tracking never breaks offline usage and never blocks the UI thread.
 * - When online and Supabase is configured, pending events are batch-uploaded
 *   to the `analytics_events` table; failures are silent and events stay queued.
 * - Collects ZERO PII: no names, no emails, no GPS coordinates. Only flat,
 *   aggregate-friendly scalars (state code, hour totals, booleans).
 */
import { getDB, generateId } from './db';
import type { AnalyticsEventRecord } from './db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MAX_BATCH_SIZE = 100;

/** Allowed property keys as a second line of defense against accidental PII. */
const ALLOWED_PROPERTY_KEYS = new Set([
  'state',
  'isNight',
  'durationMinutes',
  'miles',
  'missedSeconds',
  'totalHoursLogged',
  'totalHours',
]);

function sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> {
  if (!properties) return {};
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_PROPERTY_KEYS.has(key)) continue;
    // Only flat primitives — drop anything structured that could carry PII
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    }
  }
  return safe;
}

/** Writes an event to IndexedDB immediately, then triggers a best-effort flush. */
export async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    const db = await getDB();
    const record: AnalyticsEventRecord = {
      id: `${Date.now()}-${generateId()}`,
      name: eventName,
      properties: sanitizeProperties(properties),
      createdAt: new Date().toISOString(),
      synced: 0,
    };
    await db.put('analyticsEvents', record);
  } catch (err) {
    // Analytics must never disrupt the core app (offline-first guarantee)
    console.warn('[DriveLog Analytics] Failed to persist event:', err);
    return;
  }

  // Fire-and-forget flush attempt (no-op when offline or unconfigured)
  void flushEvents();
}

/**
 * Batch-uploads unsynced events to Supabase. Silently retains them in
 * IndexedDB when offline, unconfigured, or on any upload error.
 */
export async function flushEvents(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  try {
    const db = await getDB();
    const pending = await db.getAllFromIndex('analyticsEvents', 'by-synced', IDBKeyRange.only(0));
    if (pending.length === 0) return;

    const batch = pending.slice(0, MAX_BATCH_SIZE);

    const { error } = await supabase.from('analytics_events').insert(
      batch.map(event => ({
        id: event.id,
        event_name: event.name,
        properties: event.properties,
        created_at: event.createdAt,
      }))
    );

    if (error) {
      console.warn('[DriveLog Analytics] Sync deferred:', error.message);
      return;
    }

    // Mark uploaded
    for (const event of batch) {
      await db.put('analyticsEvents', { ...event, synced: 1 as const });
    }

    // Prune old synced events to keep local storage lean (keep most recent 200)
    const synced = await db.getAllFromIndex('analyticsEvents', 'by-synced', IDBKeyRange.only(1));
    if (synced.length > 200) {
      const stale = synced
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, synced.length - 200);
      for (const event of stale) {
        await db.delete('analyticsEvents', event.id);
      }
    }
  } catch (err) {
    console.warn('[DriveLog Analytics] Flush skipped:', err);
  }
}

// Self-initialize: retry sync whenever connectivity returns, plus one attempt at startup.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushEvents();
  });
  // Delayed initial flush so it never competes with first paint / data hydration
  window.setTimeout(() => {
    void flushEvents();
  }, 5000);
}
