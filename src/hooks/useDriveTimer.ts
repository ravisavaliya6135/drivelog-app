import { useState, useEffect, useCallback, useRef } from 'react';
import { saveSetting, getSetting, emptyActiveTimer } from '../utils/db';
import type { ActiveTimerRecord } from '../utils/db';
import { trackEvent } from '../utils/analytics';
import { useNightDetection } from './useNightDetection';

/** If the stored heartbeat is staler than this on load, we assume a crash/force-close happened. */
const HEARTBEAT_STALE_MS = 5000;

function getCurrentStateCode(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('drivelog-state') || 'CA';
  }
  return 'CA';
}

/**
 * Computes real driving time from true wall-clock timestamps:
 *   elapsed = now - startedAt - accumulatedPausedMs   (running)
 *   elapsed = lastSavedElapsedMs                      (paused)
 * This means closing the browser, backgrounding the tab, phone restarts,
 * or OS timer throttling can never lose driving time — the next calculation
 * is always derived from absolute timestamps, not accumulated ticks.
 */
function computeElapsedMs(
  record: Pick<ActiveTimerRecord, 'isPaused' | 'startedAt' | 'accumulatedPausedMs' | 'lastSavedElapsedMs'>,
  now: number
): number {
  if (!record.isPaused && record.startedAt !== null) {
    return Math.max(0, now - record.startedAt - record.accumulatedPausedMs);
  }
  return Math.max(0, record.lastSavedElapsedMs);
}

export function useDriveTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wasRecovered, setWasRecovered] = useState(false);

  // Legal night classification at the user's selected state (for analytics only)
  const { isNight } = useNightDetection(getCurrentStateCode());

  const intervalRef = useRef<number | null>(null);
  // Live mirror of the persisted record so ticks/persists always use fresh values
  const recordRef = useRef<ActiveTimerRecord>(emptyActiveTimer());
  const lastPersistRef = useRef<number>(0);

  const persistTimer = useCallback(async () => {
    const now = Date.now();
    lastPersistRef.current = now;
    recordRef.current = { ...recordRef.current, lastHeartbeat: now };
    await saveSetting('activeTimer', recordRef.current);
  }, []);

  const startTicker = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      setElapsedMs(computeElapsedMs(recordRef.current, now));
      // Persist every tick so the heartbeat stays fresh (crash detection)
      void persistTimer();
    }, 1000);
  }, [persistTimer]);

  const stopTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const loadPersistedTimer = async () => {
    try {
      const saved = await getSetting<ActiveTimerRecord>('activeTimer');
      if (!saved || !saved.isRunning) return;

      const now = Date.now();

      // Backward compatibility: pre-wall-clock records stored an ISO startTime
      let startedAt = saved.startedAt;
      if (typeof startedAt !== 'number') {
        const legacy = (saved as unknown as { startTime?: string | null }).startTime;
        if (!legacy) return; // Malformed record — nothing to restore
        startedAt = new Date(legacy).getTime();
      }

      const restored: ActiveTimerRecord = {
        isRunning: true,
        isPaused: Boolean(saved.isPaused),
        startedAt,
        accumulatedPausedMs: Number(saved.accumulatedPausedMs) || 0,
        pausedAt: typeof saved.pausedAt === 'number' ? saved.pausedAt : null,
        lastSavedElapsedMs: Number(saved.lastSavedElapsedMs) || 0,
        lastHeartbeat: typeof saved.lastHeartbeat === 'number' ? saved.lastHeartbeat : null,
      };

      // Real wall-clock elapsed time — instantly correct even if the app was
      // closed for hours. No tick accumulation involved.
      const elapsed = computeElapsedMs(restored, now);

      // Crash recovery audit trail: stale heartbeat means the app was killed
      // while a drive was running (not just a normal close while paused).
      if (!restored.isPaused && restored.lastHeartbeat !== null && now - restored.lastHeartbeat > HEARTBEAT_STALE_MS) {
        const missedSeconds = Math.max(0, Math.floor((elapsed - restored.lastSavedElapsedMs) / 1000));
        console.info(
          `[DriveLog Timer Recovery] Active drive restored after ${Math.round((now - restored.lastHeartbeat) / 1000)}s gap. ` +
          `Wall-clock catch-up credited ${missedSeconds}s. Recovery event logged.`
        );
        setWasRecovered(true);
        void trackEvent('timer_recovered', { missedSeconds });
      }

      recordRef.current = restored;
      setIsRunning(true);
      setIsPaused(restored.isPaused);
      setElapsedMs(elapsed);
      setStartTime(new Date(startedAt));

      if (!restored.isPaused) {
        startTicker();
      }
    } catch (error) {
      console.error('Failed to load timer:', error);
    }
  };

  // Load persisted timer state on mount
  useEffect(() => {
    void loadPersistedTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle visibility change (iOS backgrounding, tab switch):
  // recompute from the wall clock immediately to erase any drift.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        setElapsedMs(computeElapsedMs(recordRef.current, Date.now()));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  // Safety net: persist periodically even if ticks are throttled (low-power mode),
  // and always persist right before unload (force-close protection).
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const persistInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastPersistRef.current > 5000) {
        void persistTimer();
      }
    }, 5000);

    const handleBeforeUnload = () => {
      void persistTimer();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(persistInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, isPaused, persistTimer]);

  const start = useCallback(async () => {
    const now = Date.now();
    recordRef.current = {
      isRunning: true,
      isPaused: false,
      startedAt: now,
      accumulatedPausedMs: 0,
      pausedAt: null,
      lastSavedElapsedMs: 0,
      lastHeartbeat: now,
    };
    setIsRunning(true);
    setIsPaused(false);
    setElapsedMs(0);
    setStartTime(new Date(now));
    setWasRecovered(false);
    startTicker();
    await persistTimer();
    // Business analytics: no PII — state code + legal day/night classification only
    void trackEvent('drive_started', { state: getCurrentStateCode(), isNight });
  }, [startTicker, persistTimer, isNight]);

  const pause = useCallback(async () => {
    const now = Date.now();
    const rec = recordRef.current;
    // Freeze elapsed at the exact wall-clock moment of pausing
    const frozenMs = computeElapsedMs(rec, now);
    recordRef.current = {
      ...rec,
      isPaused: true,
      lastSavedElapsedMs: frozenMs,
      pausedAt: now,
    };
    stopTicker();
    setIsPaused(true);
    setElapsedMs(frozenMs);
    await persistTimer();
  }, [stopTicker, persistTimer]);

  const resume = useCallback(async () => {
    const now = Date.now();
    const rec = recordRef.current;
    // Fold the pause duration into accumulatedPausedMs so the wall-clock
    // formula keeps producing exact driving time.
    const pauseDuration = rec.pausedAt !== null ? Math.max(0, now - rec.pausedAt) : 0;
    recordRef.current = {
      ...rec,
      isPaused: false,
      accumulatedPausedMs: rec.accumulatedPausedMs + pauseDuration,
      pausedAt: null,
    };
    startTicker();
    setIsPaused(false);
    setElapsedMs(computeElapsedMs(recordRef.current, now));
    await persistTimer();
  }, [startTicker, persistTimer]);

  const stop = useCallback(async () => {
    const now = Date.now();
    const finalElapsedMs = computeElapsedMs(recordRef.current, now);
    const finalStartMs = recordRef.current.startedAt;
    stopTicker();
    recordRef.current = emptyActiveTimer();
    setIsRunning(false);
    setIsPaused(false);
    setElapsedMs(0);
    setStartTime(null);
    setWasRecovered(false);
    await saveSetting('activeTimer', emptyActiveTimer());
    // Business analytics: duration + estimated miles (same 32 mph heuristic shown in the UI)
    if (finalElapsedMs > 0) {
      void trackEvent('drive_completed', {
        durationMinutes: Math.ceil(finalElapsedMs / 60000),
        miles: Number(((finalElapsedMs / 3600000) * 32).toFixed(1)),
      });
    }
    return {
      durationMinutes: Math.ceil(finalElapsedMs / 60000),
      startTime: finalStartMs !== null ? new Date(finalStartMs) : new Date(),
      endTime: new Date(now),
    };
  }, [stopTicker]);

  const reset = useCallback(async () => {
    stopTicker();
    recordRef.current = emptyActiveTimer();
    setIsRunning(false);
    setIsPaused(false);
    setElapsedMs(0);
    setStartTime(null);
    setWasRecovered(false);
    await saveSetting('activeTimer', emptyActiveTimer());
  }, [stopTicker]);

  const dismissRecoveryToast = useCallback(() => setWasRecovered(false), []);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    isPaused,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    startTime,
    wasRecovered,
    dismissRecoveryToast,
    formatTime: formatTime(Math.floor(elapsedMs / 1000)),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
