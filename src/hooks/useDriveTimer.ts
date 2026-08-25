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

export function useDriveTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wasRecovered, setWasRecovered] = useState(false);

  // Legal night classification at the user's selected state (for analytics only)
  const { isNight } = useNightDetection(getCurrentStateCode());

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedAtRef = useRef<number>(0);
  const lastPersistRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => {
        const newElapsed = prev + 1;
        pausedAtRef.current = newElapsed;
        return newElapsed;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Persist every second (driven by the elapsedSeconds state tick) with a live heartbeat.
  // The heartbeat lets a future app load distinguish "running normally" from "crashed mid-drive".
  const persistTimer = useCallback(async () => {
    lastPersistRef.current = Date.now();
    await saveSetting('activeTimer', {
      isRunning,
      isPaused,
      elapsedSeconds,
      startTime: startTimeRef.current?.toISOString() || null,
      pausedAt: pausedAtRef.current,
      lastHeartbeat: lastPersistRef.current,
    });
  }, [isRunning, isPaused, elapsedSeconds]);

  const loadPersistedTimer = async () => {
    try {
      const saved = await getSetting<ActiveTimerRecord>('activeTimer');

      if (saved && saved.isRunning) {
        const now = Date.now();
        const start = saved.startTime ? new Date(saved.startTime).getTime() : now;
        const heartbeat = saved.lastHeartbeat ?? start;

        // Wall-clock delta since the current session segment began. This automatically
        // credits time lost to crashes, force-closes, phone restarts, or throttled
        // background timers (iOS low-power mode) because it is computed from real time.
        let elapsed = saved.isPaused
          ? saved.pausedAt
          : saved.elapsedSeconds + Math.max(0, Math.floor((now - start) / 1000));

        // Crash recovery audit trail: heartbeat older than HEARTBEAT_STALE_MS means the
        // app was killed while a drive was running (not just a tab switch).
        if (!saved.isPaused && now - heartbeat > HEARTBEAT_STALE_MS) {
          const missedSeconds = Math.max(0, elapsed - saved.elapsedSeconds);
          console.info(
            `[DriveLog Timer Recovery] Active drive restored after ${Math.round((now - heartbeat) / 1000)}s gap. ` +
            `Credited ${saved.elapsedSeconds}s persisted + ${missedSeconds}s wall-clock catch-up. Recovery event logged.`
          );
          setWasRecovered(true);
          // Guard against negative/absurd deltas if the device clock changed.
          if (elapsed < saved.elapsedSeconds) elapsed = saved.elapsedSeconds;
          // Crash-frequency telemetry: how much time was credited after recovery
          void trackEvent('timer_recovered', { missedSeconds });
        }

        setIsRunning(true);
        setIsPaused(saved.isPaused);
        setElapsedSeconds(elapsed);
        setStartTime(saved.startTime ? new Date(saved.startTime) : null);

        if (!saved.isPaused) {
          startTimer();
        }
      }
    } catch (error) {
      console.error('Failed to load timer:', error);
    }
  };

  // Load persisted timer state on mount
  useEffect(() => {
    loadPersistedTimer();
  }, []);

  // Handle visibility change (iOS backgrounding, tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        // Page became visible again — reload persisted state to catch any drift
        loadPersistedTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  // Persist timer on every state change AND before unload (force-close protection)
  useEffect(() => {
    persistTimer();

    // Also save on page unload (browser close, tab close, force-close)
    const handleBeforeUnload = () => {
      persistTimer();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, isPaused, elapsedSeconds]);

  // Additional safety: persist every 5 seconds while running
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const persistInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastPersistRef.current > 5000) {
        persistTimer();
      }
    }, 5000);

    return () => clearInterval(persistInterval);
  }, [isRunning, isPaused]);

  const start = useCallback(async () => {
    const now = new Date();
    startTimeRef.current = now;
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    pausedAtRef.current = 0;
    setWasRecovered(false);
    startTimer();
    await persistTimer();
    // Business analytics: no PII — state code + legal day/night classification only
    void trackEvent('drive_started', { state: getCurrentStateCode(), isNight });
  }, [startTimer, persistTimer, isNight]);

  const pause = useCallback(async () => {
    stopTimer();
    setIsPaused(true);
    pausedAtRef.current = elapsedSeconds;
    await persistTimer();
  }, [stopTimer, elapsedSeconds, persistTimer]);

  const resume = useCallback(async () => {
    const now = new Date();
    startTimeRef.current = now;
    setIsPaused(false);
    startTimer();
    await persistTimer();
  }, [startTimer, persistTimer]);

  const stop = useCallback(async () => {
    stopTimer();
    const finalElapsed = elapsedSeconds;
    const finalStartTime = startTimeRef.current ?? startTime;
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
    setWasRecovered(false);
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    await saveSetting('activeTimer', emptyActiveTimer());
    // Business analytics: duration + estimated miles (same 32 mph heuristic shown in the UI)
    if (finalElapsed > 0) {
      void trackEvent('drive_completed', {
        durationMinutes: Math.ceil(finalElapsed / 60),
        miles: Number(((finalElapsed / 3600) * 32).toFixed(1)),
      });
    }
    return { durationMinutes: Math.ceil(finalElapsed / 60), startTime: finalStartTime, endTime: new Date() };
  }, [stopTimer, elapsedSeconds, startTime]);

  const reset = useCallback(async () => {
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
    setWasRecovered(false);
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    await saveSetting('activeTimer', emptyActiveTimer());
  }, [stopTimer]);

  const dismissRecoveryToast = useCallback(() => setWasRecovered(false), []);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    elapsedSeconds,
    startTime,
    wasRecovered,
    dismissRecoveryToast,
    formatTime: formatTime(elapsedSeconds),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
