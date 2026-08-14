import { useState } from 'react';
import { Play, Pause, StopCircle, RotateCcw, Sun, Moon, AlertCircle } from 'lucide-react';
import { useDriveTimer } from '../hooks/useDriveTimer';
import { useNightDetection } from '../hooks/useNightDetection';
import { useTheme } from '../hooks/useTheme';

export function DriveTimer({ onDriveComplete }: { onDriveComplete?: (data: { durationMinutes: number; startTime: Date; endTime: Date }) => void }) {
  const { isRunning, isPaused, elapsedSeconds, startTime, formatTime, start, pause, resume, stop, reset } = useDriveTimer();
  const { isNight, manualOverride, setManualDayNight, sunsetTime, legalNightStart } = useNightDetection();
  const { resolvedTheme } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStop = async () => {
    if (elapsedSeconds < 60) {
      setShowConfirm(true);
      return;
    }
    const result = await stop();
    if (onDriveComplete && result.durationMinutes > 0) {
      onDriveComplete(result);
    }
  };

  if (showConfirm) {
    return (
      <div className="card-gradient-warning animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center shadow-soft">
            <RotateCcw className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Drive too short?</h3>
          <p className="text-slate-600 mb-6">Minimum 1 minute required. Want to continue driving?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-secondary touch-target no-tap-highlight transition-smooth"
            >
              Keep Driving
            </button>
            <button
              onClick={reset}
              className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 touch-target no-tap-highlight transition-smooth"
            >
              Discard & Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format sunset time for display
  const formatSunset = sunsetTime ? sunsetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—';

  return (
    <div className="card-gradient animate-fade-in overflow-hidden">
      {/* Timer Display */}
      <div className={`relative p-8 text-center rounded-t-2xl ${isNight || resolvedTheme === 'dark' ? 'glass-dark text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Day/Night Indicator with manual override */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className={`badge ${isNight ? 'badge-primary bg-indigo-500/20 text-indigo-300' : 'badge-warning'}`}>
            {isNight ? (
              <>
                <Moon className="w-3 h-3" aria-hidden="true" /> Legal Night
              </>
            ) : (
              <>
                <Sun className="w-3 h-3" aria-hidden="true" /> Daytime
              </>
            )}
          </span>
          {/* Manual override indicator */}
          {manualOverride && (
            <span className="badge badge-warning flex items-center gap-1">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              Manual: {manualOverride === 'night' ? 'Night' : 'Day'}
              <button
                type="button"
                onClick={() => setManualDayNight('auto')}
                className="ml-1 underline hover:text-amber-900 touch-target no-tap-highlight transition-smooth"
              >
                Auto
              </button>
            </span>
          )}
        </div>

        {/* Main Timer */}
        <div className="font-mono text-6xl font-light tabular-nums tracking-tight select-none">
          {formatTime}
        </div>

        {/* Start time display when running */}
        {isRunning && startTime && (
          <div className="mt-4 text-sm opacity-70">
            Started: {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        )}

        {/* Sunset info */}
        {sunsetTime && legalNightStart && (
          <div className="mt-2 text-xs opacity-60 flex flex-wrap justify-center gap-4">
            <span>Sunset: {formatSunset}</span>
            <span>Legal night starts: {legalNightStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        )}

        {/* Paused overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-t-2xl">
            <div className="glass px-6 py-3 rounded-xl shadow-lg">
              <span className="text-lg font-medium text-slate-900">PAUSED</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="btn-primary col-span-3 py-4 text-lg touch-target no-tap-highlight rounded-none rounded-b-2xl"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            Start Drive
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={resume}
              className="btn-primary gradient-success col-span-2 py-4 touch-target no-tap-highlight rounded-none rounded-bl-2xl"
            >
              <Play className="w-5 h-5" aria-hidden="true" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="btn-primary gradient-danger py-4 touch-target no-tap-highlight rounded-none rounded-br-2xl"
            >
              <StopCircle className="w-5 h-5" aria-hidden="true" />
              Stop
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pause}
              className="btn-primary gradient-warning col-span-2 py-4 touch-target no-tap-highlight rounded-none"
            >
              <Pause className="w-5 h-5" aria-hidden="true" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="btn-primary gradient-danger py-4 touch-target no-tap-highlight rounded-none"
            >
              <StopCircle className="w-5 h-5" aria-hidden="true" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}