import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Sun, Moon, AlertTriangle, History, Info } from 'lucide-react';
import { useNightDetection } from '../hooks/useNightDetection';
import { useDriveLog } from '../hooks/useDriveLog';
import { useDriveTimer } from '../hooks/useDriveTimer';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { cn } from '../utils/cn';

interface DriveTimerProps {
  onDriveComplete: (data: {
    durationMinutes: number;
    startTime: Date;
    endTime: Date;
    /** Supervisor selected at stop time — saved onto the drive entry */
    driverId: string;
  }) => void;
}

/** Safely trigger haptic feedback on supported touch devices */
function triggerHaptic(pattern: number | number[] = [15, 30, 15]) {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Non-blocking fallback for unsupported devices
  }
}

export function DriveTimer({ onDriveComplete }: DriveTimerProps) {
  const { drivers } = useDriveLog();

  // Crash-resilient timer: state is persisted to IndexedDB every second
  // with a live heartbeat, and restored automatically after crashes/force-closes.
  const {
    isRunning,
    isPaused,
    elapsedSeconds: seconds,
    wasRecovered,
    dismissRecoveryToast,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useDriveTimer();

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const discardDialogRef = useAccessibleDialog(showDiscardConfirm, () => setShowDiscardConfirm(false));

  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    const primary = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    return primary?.id || '';
  });

  // Automatic legal night detection — no user input required.
  const { isNight, polarNote } = useNightDetection();
  const isNightEffective = isNight;

  // Screen reader polite announcements — only updates every 5 elapsed minutes or on state change
  const [srAnnouncement, setSrAnnouncement] = useState('Timer ready to start');
  const lastAnnouncedMilestoneRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      setSrAnnouncement('Timer ready to start');
      lastAnnouncedMilestoneRef.current = 0;
      return;
    }
    if (isPaused) {
      setSrAnnouncement('Driving session paused');
      return;
    }

    const elapsedMins = Math.floor(seconds / 60);
    if (elapsedMins > 0 && elapsedMins % 5 === 0 && elapsedMins !== lastAnnouncedMilestoneRef.current) {
      lastAnnouncedMilestoneRef.current = elapsedMins;
      setSrAnnouncement(`${elapsedMins} minutes logged in driving session`);
    }
  }, [isRunning, isPaused, seconds]);

  const handleStart = () => {
    triggerHaptic([25]);
    setSrAnnouncement('Driving session started');
    void start();
  };

  const handlePauseResume = () => {
    triggerHaptic([15, 30, 15]);
    if (isPaused) {
      setSrAnnouncement('Driving session resumed');
      void resume();
    } else {
      setSrAnnouncement('Driving session paused');
      void pause();
    }
  };

  const handleFinish = async () => {
    triggerHaptic([30, 50, 30]);
    setSrAnnouncement('Driving session finished');
    const result = await stop();
    onDriveComplete({
      durationMinutes: result.durationMinutes,
      startTime: result.startTime || new Date(),
      endTime: result.endTime,
      driverId: selectedDriverId || drivers[0]?.id || '',
    });
  };

  const handleDiscard = () => {
    triggerHaptic([40]);
    setSrAnnouncement('Driving session discarded');
    void reset();
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

      {/* Crash Recovery Toast */}
      {wasRecovered && (
        <div
          role="status"
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm animate-slide-up"
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <History className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Drive timer recovered.</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">No time was lost.</p>
            </div>
            <button
              type="button"
              onClick={dismissRecoveryToast}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 px-3 py-2 rounded-xl min-h-[44px] inline-flex items-center hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 1. Supervisor & Day/Night Context Bar */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Supervisor Card */}
        <div className="app-card p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            {currentSupervisor?.name ? currentSupervisor.name[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 block">Supervisor</span>
            {drivers.length > 1 ? (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                aria-label="Supervisor"
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

        {/* Automatic Day / Night Badge — set by legal night detection, no user input */}
        <div
          aria-live="polite"
          className={cn(
            'app-card p-3 flex items-center gap-2.5 text-left transition-colors',
            isNightEffective
              ? 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30'
          )}
        >
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm',
            isNightEffective ? 'bg-indigo-500' : 'bg-amber-500'
          )}>
            {isNightEffective ? (
              <Moon className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <Sun className="w-4 h-4" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 block">Auto-detected</span>
            <span className="font-bold text-xs text-slate-900 dark:text-white capitalize flex items-center gap-1">
              {isNightEffective ? 'Night Drive' : 'Day Drive'}
            </span>
          </div>
        </div>
      </div>

      {/* Polar day/night info (Alaska extreme latitudes only) */}
      {polarNote && (
        <p className="text-xs text-slate-600 dark:text-slate-300 text-center -mt-3 inline-flex items-center justify-center gap-1" role="note">
          <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> {polarNote}
        </p>
      )}

      {/* 2. Main Live Timer Display */}
      <div className="w-full app-card-elevated p-8 text-center space-y-4 relative overflow-hidden">

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2">
          {isRunning && !isPaused ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Drive In Progress
            </span>
          ) : isRunning && isPaused ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Drive Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold">
              Ready to Start
            </span>
          )}
        </div>

        {/* Digital Tabular Clock with aria-live="off" to prevent 1-second screen-reader flooding */}
        <div className="py-2">
          <div
            role="timer"
            aria-live="off"
            className="font-mono text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight"
          >
            {time.hours}:{time.minutes}:{time.seconds}
          </div>

          {/* Polite off-screen container for milestone speech every 5 minutes */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {srAnnouncement}
          </div>

          <div className="grid grid-cols-3 text-center max-w-[240px] mx-auto text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mt-1">
            <span>Hours</span>
            <span>Mins</span>
            <span>Secs</span>
          </div>
        </div>

        {/* Telemetry Bento */}
        {!isRunning && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
              <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 block">Est. Distance</span>
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
                {estimatedMiles} mi
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
              <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 block">Average Speed</span>
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
                {avgSpeed} mph
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. In-Car High-Contrast Touch Controls (Min 64px height) */}
      <div className="w-full space-y-3">
        {!isRunning ? (
          /* Start Button (min-h-[64px]) */
          <button
            type="button"
            onClick={handleStart}
            aria-label="Start drive"
            className="w-full min-h-[64px] h-16 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold text-lg shadow-teal flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Play className="w-6 h-6 fill-white" strokeWidth={1.75} />
            <span>Start Drive</span>
          </button>
        ) : (
          /* Active Controls: Pause/Resume + Stop (both min-h-[64px]) */
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePauseResume}
              aria-label={isPaused ? 'Resume drive' : 'Pause drive'}
              className={cn(
                'min-h-[64px] h-16 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md focus:ring-emerald-500'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-400'
              )}
            >
              {isPaused ? (
                <Play className="w-5 h-5 fill-white" strokeWidth={1.75} />
              ) : (
                <Pause className="w-5 h-5" strokeWidth={1.75} />
              )}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleFinish()}
              aria-label="Stop drive"
              className="min-h-[64px] h-16 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Square className="w-5 h-5 fill-white" strokeWidth={1.75} />
              <span>Stop & Log</span>
            </button>
          </div>
        )}

        {/* Discard Session Link */}
        {isRunning && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic([20]);
                setShowDiscardConfirm(true);
              }}
              className="min-h-[44px] px-4 py-2 inline-flex items-center text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Discard this session
            </button>
          </div>
        )}
      </div>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div ref={discardDialogRef} role="dialog" aria-modal="true" aria-labelledby="discard-drive-title" tabIndex={-1} className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 id="discard-drive-title" className="font-extrabold text-base text-slate-900 dark:text-white">Discard Drive?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to discard this driving session? The elapsed time ({time.hours}:{time.minutes}:{time.seconds}) will not be saved.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 min-h-[48px] py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                Keep Driving
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="flex-1 min-h-[48px] py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
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
