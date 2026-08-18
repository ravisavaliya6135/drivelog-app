import { useState, useEffect, useCallback, useRef } from 'react';
import { saveSetting, getSetting } from '../utils/db';

export function useDriveTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

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

  const persistTimer = useCallback(async () => {
    lastPersistRef.current = Date.now();
    await saveSetting('activeTimer', {
      isRunning,
      isPaused,
      elapsedSeconds,
      startTime: startTimeRef.current?.toISOString() || null,
      pausedAt: pausedAtRef.current,
    });
  }, [isRunning, isPaused, elapsedSeconds]);

  const loadPersistedTimer = async () => {
    try {
      const saved = await getSetting<{
        isRunning: boolean;
        isPaused: boolean;
        elapsedSeconds: number;
        startTime: string | null;
        pausedAt: number;
      }>('activeTimer');

      if (saved && saved.isRunning) {
        const now = Date.now();
        const start = saved.startTime ? new Date(saved.startTime).getTime() : now;
        const elapsed = saved.isPaused
          ? saved.pausedAt
          : saved.elapsedSeconds + Math.floor((now - start) / 1000);

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
    startTimer();
    await persistTimer();
  }, [startTimer, persistTimer]);

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
    const finalStartTime = startTimeRef.current;
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    await saveSetting('activeTimer', { isRunning: false, isPaused: false, elapsedSeconds: 0, startTime: null, pausedAt: 0 });
    return { durationMinutes: Math.ceil(finalElapsed / 60), startTime: finalStartTime, endTime: new Date() };
  }, [stopTimer, elapsedSeconds]);

  const reset = useCallback(async () => {
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
    pausedAtRef.current = 0;
    startTimeRef.current = null;
    await saveSetting('activeTimer', { isRunning: false, isPaused: false, elapsedSeconds: 0, startTime: null, pausedAt: 0 });
  }, [stopTimer]);

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
    formatTime: formatTime(elapsedSeconds),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
