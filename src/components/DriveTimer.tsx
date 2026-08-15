import { useState, useEffect, useRef } from 'react';
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
  const [seconds, setSeconds] = useState(0);
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
    if (isRunning) {
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
  }, [isRunning]);

  const handleStartPause = () => {
    if (!isRunning) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
      pausedTimeRef.current = seconds;
    }
  };

  const handleFinish = () => {
    const finalSeconds = seconds;
    const finalStart = startTimeRef.current || new Date();
    const finalEnd = new Date();
    setIsRunning(false);
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

  // Format HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular gauge offset: 60 mins full cycle
  const maxSeconds = 3600;
  const progressRatio = Math.min(seconds / maxSeconds, 1);
  const strokeDashoffset = 283 - progressRatio * 283;

  // Estimated stats
  const estimatedMiles = (seconds > 0 ? (seconds / 3600) * 32 : 0).toFixed(1);
  const avgSpeed = seconds > 0 ? 32 : 0;

  return (
    <div className="w-full flex flex-col items-center max-w-md mx-auto">
      
      {/* Supervisor Selector */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 w-full card-shadow mb-stack-md border border-outline-variant/20 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">Current Supervisor</span>
          <div className="flex items-center gap-2">
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="font-headline-md text-headline-md text-primary font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
              {drivers.length === 0 && <option value="default">Dad</option>}
            </select>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container relative shadow-sm border border-outline-variant/20">
          <img
            alt="Supervisor Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq-pfF7SXYiYc0MNY-Rpjc2J5GnYjWhwLI0oST7jNwbbnFfw-kWHUpeALZI5Xm9vwqYUgFoNnIS8am6vFbFQZXol_OpHl7SQCwqNONZCwSgmB6Sc0M1eDdqEfXWGsN56ZkSHs6psZythPrlFkeWHUoI-CWeeb2nhwEok-X-o3xx7rQL4QhaHsuzwlPspheUCtXywTopvM5Zy1pJYvT03a9KcGbjVvx5lLo0fkCuL5tlTtZTcDncndT"
          />
        </div>
      </div>

      {/* Driving Conditions Badge */}
      <button
        type="button"
        onClick={() => setManualOverride(isNightEffective ? 'day' : 'night')}
        className="bg-surface-container-lowest px-4 py-2 rounded-full card-shadow border border-outline-variant/20 flex items-center gap-2 mb-stack-md mx-auto transition-transform active:scale-95 hover:bg-surface-container-low"
      >
        <span
          className={`material-symbols-outlined text-xl ${isNightEffective ? 'text-indigo-400' : 'text-tertiary-fixed-dim'}`}
          data-weight="fill"
        >
          {isNightEffective ? 'dark_mode' : 'light_mode'}
        </span>
        <span className="font-label-bold text-label-bold text-primary font-bold">
          {isNightEffective ? 'Night driving' : 'Day driving'}
        </span>
        <span className="material-symbols-outlined text-outline text-[16px] ml-1">sync</span>
      </button>

      {/* Timer Display Area */}
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] mx-auto flex items-center justify-center my-4">
        {/* Progress Ring Background */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="#e8e8e7"
            strokeLinecap="round"
            strokeWidth="6"
          />
          {/* Animated Progress Ring */}
          <circle
            className="transition-all duration-1000 ease-linear"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="#006a61"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="6"
          />
        </svg>

        <div className="flex flex-col items-center z-10 text-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-medium">
            Current Drive
          </span>
          <div className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary-container tracking-tighter font-extrabold tabular-nums">
            {formatTime(seconds)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-secondary">
            <span className={`w-2 h-2 rounded-full bg-secondary ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="font-label-bold text-label-bold font-bold">
              {isRunning ? 'Recording' : seconds > 0 ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-4 w-full">
        {/* Pause/Resume Button */}
        <button
          type="button"
          onClick={handleStartPause}
          className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary-container bottom-shadow-surface active:translate-y-1 active:shadow-none transition-all shadow-sm"
          aria-label={isRunning ? 'Pause' : 'Start/Resume'}
        >
          <span className="material-symbols-outlined text-[32px]" data-weight="fill">
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Stop/Finish Button (Primary) */}
        <button
          type="button"
          onClick={handleFinish}
          className="w-24 h-24 rounded-full bg-secondary text-on-secondary flex flex-col items-center justify-center bottom-shadow-secondary active:translate-y-1 active:shadow-none transition-all hover:brightness-110 group relative overflow-hidden btn-3d shadow-md"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="material-symbols-outlined text-[40px] mb-1" data-weight="fill">stop</span>
          <span className="font-label-bold text-label-bold text-xs uppercase tracking-wider font-bold">Finish</span>
        </button>

        {/* Add Event/Note Button */}
        <button
          type="button"
          onClick={() => {}}
          className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary-container bottom-shadow-surface active:translate-y-1 active:shadow-none transition-all shadow-sm"
          aria-label="Add location marker"
        >
          <span className="material-symbols-outlined text-[28px]">add_location</span>
        </button>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 gap-4 w-full mt-6 mb-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl card-shadow border border-outline-variant/20 flex flex-col">
          <span className="material-symbols-outlined text-outline mb-2 text-xl">speed</span>
          <span className="font-headline-md text-headline-md text-primary font-bold">
            {avgSpeed} <span className="text-label-sm text-outline ml-1 font-normal text-xs">mph</span>
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Avg Speed</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl card-shadow border border-outline-variant/20 flex flex-col">
          <span className="material-symbols-outlined text-outline mb-2 text-xl">route</span>
          <span className="font-headline-md text-headline-md text-primary font-bold">
            {estimatedMiles} <span className="text-label-sm text-outline ml-1 font-normal text-xs">mi</span>
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Distance</span>
        </div>
      </div>

    </div>
  );
}