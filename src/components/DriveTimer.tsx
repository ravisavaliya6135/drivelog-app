import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useNightDetection } from '../hooks/useNightDetection';
import { useDriveLog } from '../hooks/useDriveLog';

interface DriveTimerProps {
  onDriveComplete: (data: {
    durationMinutes: number;
    startTime: Date;
    endTime: Date;
  }) => void;
}

export function DriveTimer({ onDriveComplete }: DriveTimerProps) {
  const { drivers } = useDriveLog();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    const primary = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    return primary?.id || '';
  });
  
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Automatic legal night detection & manual override
  const { isNight: autoIsNight } = useNightDetection();
  const [manualOverride, setManualOverride] = useState<'day' | 'night' | null>(null);
  const isNightEffective = manualOverride !== null ? manualOverride === 'night' : autoIsNight;

  useEffect(() => {
    if (isRunning && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date(Date.now() - pausedTimeRef.current * 1000);
      }
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
          setSeconds(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
      pausedTimeRef.current = seconds;
    }
  };

  const handleFinish = () => {
    const finalSeconds = seconds;
    const finalStart = startTimeRef.current || new Date();
    const finalEnd = new Date();
    
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;

    const durationMinutes = Math.max(1, Math.round(finalSeconds / 60));
    onDriveComplete({
      durationMinutes,
      startTime: finalStart,
      endTime: finalEnd,
    });
  };

  const handleDiscard = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setShowDiscardConfirm(false);
  };

  // Format HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const time = formatTimer(seconds);

  // Estimates
  const estimatedMiles = (seconds > 0 ? (seconds / 3600) * 32 : 0).toFixed(1);
  const avgSpeed = seconds > 0 ? 32 : 0;

  const currentSupervisor = drivers.find(d => d.id === selectedDriverId) || drivers[0];

  return (
    <div className="w-full flex flex-col items-center space-y-6 max-w-md mx-auto">
      
      {/* 1. Supervisor & Day/Night Context Bar */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Supervisor Card */}
        <div className="app-card p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            {currentSupervisor?.name ? currentSupervisor.name[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Supervisor</span>
            {drivers.length > 1 ? (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none truncate cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>
                ))}
              </select>
            ) : (
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
                {currentSupervisor?.name || 'Primary Supervisor'}
              </span>
            )}
          </div>
        </div>

        {/* Day / Night Selector */}
        <button
          type="button"
          onClick={() => setManualOverride(isNightEffective ? 'day' : 'night')}
          className={`app-card p-3 flex items-center gap-2.5 text-left transition-all ${
            isNightEffective
              ? 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isNightEffective ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isNightEffective ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition</span>
            <span className="font-bold text-xs text-slate-900 dark:text-white capitalize flex items-center gap-1">
              {isNightEffective ? 'Night Drive' : 'Day Drive'}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Main Live Timer Display (High Contrast / Distraction-Free) */}
      <div className="w-full app-card-elevated p-8 text-center space-y-4 relative overflow-hidden">
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2">
          {isRunning && !isPaused ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Drive In Progress
            </span>
          ) : isRunning && isPaused ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Drive Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold">
              Ready to Start
            </span>
          )}
        </div>

        {/* Digital Tabular Clock */}
        <div className="py-2">
          <div className="font-mono text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {time.hours}:{time.minutes}:{time.seconds}
          </div>
          <div className="grid grid-cols-3 text-center max-w-[240px] mx-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            <span>Hours</span>
            <span>Mins</span>
            <span>Secs</span>
          </div>
        </div>

        {/* Telemetry Bento */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Distance</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
              {estimatedMiles} mi
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Speed</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
              {avgSpeed} mph
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tactile Large Touch Controls (Min 56px height) */}
      <div className="w-full space-y-3">
        {!isRunning ? (
          /* Start Button */
          <button
            type="button"
            onClick={handleStart}
            className="w-full h-15 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-lg shadow-teal flex items-center justify-center gap-3 transition-all"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Start Drive</span>
          </button>
        ) : (
          /* Active Controls: Pause/Resume + Finish */
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePauseResume}
              className={`h-15 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="h-15 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-base shadow-teal flex items-center justify-center gap-2 transition-all"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>Finish Drive</span>
            </button>
          </div>
        )}

        {/* Discard Session Link */}
        {isRunning && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
            >
              Discard this session
            </button>
          </div>
        )}
      </div>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Discard Drive?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to discard this driving session? The elapsed time ({time.hours}:{time.minutes}:{time.seconds}) will not be saved.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Keep Driving
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}