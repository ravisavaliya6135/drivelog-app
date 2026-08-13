import { useState } from 'react';
import { Play, Pause, Stop, RotateCcw, Sun, Moon, AlertCircle } from 'lucide-react';
import { useDriveTimer } from '../hooks/useDriveTimer';
import { useNightDetection } from '../hooks/useNightDetection';

export function DriveTimer({ onDriveComplete }: { onDriveComplete?: (data: { durationMinutes: number; startTime: Date; endTime: Date }) => void }) {
  const { isRunning, isPaused, elapsedSeconds, startTime, formatTime, start, pause, resume, stop, reset } = useDriveTimer();
  const { isNight, manualOverride, setManualDayNight, sunsetTime, legalNightStart } = useNightDetection();
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <RotateCcw className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Drive too short?</h3>
          <p className="text-slate-600 mb-6">Minimum 1 minute required. Want to continue driving?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
            >
              Keep Driving
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Timer Display */}
      <div className={`relative p-8 text-center ${isNight ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Day/Night Indicator with manual override */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            isNight ? 'bg-blue-900/30 text-blue-300' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isNight ? (
              <>
                <Moon className="w-3 h-3" /> Legal Night
              </>
            ) : (
              <>
                <Sun className="w-3 h-3" /> Daytime
              </>
            )}
          </span>
          {/* Manual override indicator */}
          {manualOverride && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
              <AlertCircle className="w-3 h-3" />
              Manual: {manualOverride === 'night' ? 'Night' : 'Day'}
              <button
                type="button"
                onClick={() => setManualDayNight('auto')}
                className="ml-1 underline hover:text-amber-900"
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
              <span className="text-lg font-medium text-slate-900">PAUSED</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 border-t border-slate-200">
        {!isRunning ? (
          <button
            onClick={start}
            className="col-span-3 py-4 bg-slate-900 text-white text-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Drive
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={resume}
              className="py-4 bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 col-span-2"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="py-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Stop className="w-5 h-5" />
              Stop
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pause}
              className="py-4 bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 col-span-2"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="py-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Stop className="w-5 h-5" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}