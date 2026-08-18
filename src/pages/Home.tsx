import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Sun, Moon, ChevronRight, Plus, ShieldCheck, Car, X } from 'lucide-react';
import { useDriveLog } from '../hooks/useDriveLog';
import { useEntitlement } from '../contexts/EntitlementContext';
import { UpgradeCard, UpgradeModal } from '../components/UpgradeModal';
import { US_STATES } from '../types';
import { DriveTimer } from '../components/DriveTimer';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { useSeo } from '../hooks/useSeo';

export function Home() {
  useSeo({
    title: 'DriveLog — Supervised Teen Driving Hours Tracker & DMV Log',
    description: 'Track supervised teen driving practice hours, automatic day & night detection, and 50-state DMV license targets.',
    canonicalUrl: 'https://drivelog-app.vercel.app/',
  });

  const navigate = useNavigate();
  const { isLimitReached, isApproachingLimit } = useEntitlement();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const {
    drives,
    drivers,
    vehicles,
    dayMinutes,
    nightMinutes,
    totalHours,
    addDrive,
  } = useDriveLog();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

  // Modal deep links
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);

  useEffect(() => {
    const modal = searchParams.get('modal');
    const editId = searchParams.get('edit');

    if (modal === 'timer') {
      setShowTimerModal(true);
      setShowLogEntry(false);
    } else if (modal === 'log-entry') {
      setShowLogEntry(true);
      setShowTimerModal(false);
      if (editId) {
        const d = drives.find(item => item.id === editId);
        if (d) setEditingDrive(d);
      }
    } else {
      setShowTimerModal(false);
      setShowLogEntry(false);
      setEditingDrive(null);
    }
  }, [searchParams, drives]);

  const updateModalUrl = (modal: string | null, editId?: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (modal) {
      params.set('modal', modal);
      if (editId) params.set('edit', editId);
      else params.delete('edit');
    } else {
      params.delete('modal');
      params.delete('edit');
    }
    setSearchParams(params, { replace: true });
  };

  const handleTimerComplete = (data: { durationMinutes: number; startTime: Date; endTime: Date }) => {
    setShowTimerModal(false);
    setShowLogEntry(true);
    updateModalUrl('log-entry');
    const today = new Date().toISOString().split('T')[0];
    const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    const primaryVehicle = vehicles[0];

    sessionStorage.setItem('timer-drive-data', JSON.stringify({
      date: today,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      durationMinutes: data.durationMinutes,
      driverId: primaryDriver?.id || '',
      vehicleId: primaryVehicle?.id || '',
    }));
  };

  const handleLogEntrySave = (entry: any) => {
    addDrive(entry);
    setShowLogEntry(false);
    setEditingDrive(null);
    updateModalUrl(null);
    sessionStorage.removeItem('timer-drive-data');
  };

  const handleLogEntryCancel = () => {
    setShowLogEntry(false);
    setEditingDrive(null);
    updateModalUrl(null);
  };

  // Calculations
  const totalHoursVal = Number(totalHours.toFixed(1));
  const dayHoursVal = Number((dayMinutes / 60).toFixed(1));
  const nightHoursVal = Number((nightMinutes / 60).toFixed(1));
  
  const totalProgress = Math.min(100, Math.round((totalHoursVal / (state.requiredHours || 50)) * 100));
  const dayProgress = Math.min(100, Math.round((dayHoursVal / Math.max(1, state.requiredHours - state.requiredNightHours)) * 100));
  const nightProgress = state.requiredNightHours > 0 ? Math.min(100, Math.round((nightHoursVal / state.requiredNightHours) * 100)) : 100;
  
  const remainingTotal = Math.max(0, state.requiredHours - totalHoursVal).toFixed(1);
  const isTotalComplete = totalHoursVal >= state.requiredHours && nightHoursVal >= state.requiredNightHours;

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. Main Overall Progress Card */}
      <section className="app-card p-5 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {state.name} Requirement
            </span>
          </div>
          
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isTotalComplete
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {isTotalComplete ? 'Goal Met ✓' : `${totalProgress}% Complete`}
          </span>
        </div>

        {/* Hero Hours Display */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {totalHoursVal}
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-400 dark:text-slate-500">
              / {state.requiredHours} hrs
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {remainingTotal}h left
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isTotalComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-teal-500 to-teal-600'
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Day & Night Breakdown Bento */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Day */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Day
              </span>
              <span className="text-[11px] font-bold text-slate-500">{dayProgress}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">{dayHoursVal}h</span>
              <span className="text-xs text-slate-400">/ {state.requiredHours - state.requiredNightHours}h</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
            </div>
          </div>

          {/* Night */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Night
              </span>
              <span className="text-[11px] font-bold text-slate-500">{nightProgress}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">{nightHoursVal}h</span>
              <span className="text-xs text-slate-400">/ {state.requiredNightHours}h</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${nightProgress}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Primary Start Drive Action */}
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setShowTimerModal(true);
            updateModalUrl('timer');
          }}
          className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-base shadow-teal flex items-center justify-center gap-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Start Driving Session</span>
        </button>

        <div className="flex justify-between items-center px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisor: <strong className="text-slate-700 dark:text-slate-300">{primaryDriver?.name || 'Primary Supervisor'}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setShowLogEntry(true);
              updateModalUrl('log-entry');
            }}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log past trip manually
          </button>
        </div>
      </section>

      {/* 3. Tasteful Upgrade Card (only if approaching / at 20h limit) */}
      {(isApproachingLimit || isLimitReached) && (
        <UpgradeCard onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {/* 4. Recent Drives List */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Recent Drives</h2>
          <button
            type="button"
            onClick={() => navigate('/log')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All ({drives.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {drives.length > 0 ? (
          <div className="space-y-2.5">
            {drives.slice(0, 4).map((drive) => {
              const driver = drivers.find(d => d.id === drive.driverId);
              const durationHours = Math.floor(drive.durationMinutes / 60);
              const durationMins = drive.durationMinutes % 60;
              const formattedDuration = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

              return (
                <div
                  key={drive.id}
                  onClick={() => {
                    setEditingDrive(drive);
                    setShowLogEntry(true);
                    updateModalUrl('log-entry', drive.id);
                  }}
                  className="app-card p-3.5 flex items-center justify-between cursor-pointer hover:border-teal-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      drive.dayNight === 'night'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {drive.dayNight === 'night' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formattedDuration}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{driver?.name || 'Supervisor'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span className="capitalize text-slate-600 dark:text-slate-300">{drive.weather || 'Clear'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="app-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No drives logged yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Tap "Start Driving Session" above or log a previous drive to start tracking towards your {state.requiredHours}h state license goal.
            </p>
          </div>
        )}
      </section>

      {/* Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-base text-slate-900 dark:text-white">Live Driving Session</span>
              <button
                type="button"
                onClick={() => {
                  setShowTimerModal(false);
                  updateModalUrl(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DriveTimer onDriveComplete={handleTimerComplete} />
          </div>
        </div>
      )}

      {/* Save Drive Modal */}
      {showLogEntry && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive' : 'Log Drive Summary'}
              </span>
              <button
                type="button"
                onClick={handleLogEntryCancel}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DriveLogEntry
              initialData={editingDrive || (() => {
                try {
                  const saved = sessionStorage.getItem('timer-drive-data');
                  return saved ? JSON.parse(saved) : undefined;
                } catch {
                  return undefined;
                }
              })()}
              drivers={drivers}
              vehicles={vehicles}
              selectedState={selectedState}
              onSave={handleLogEntrySave}
              onCancel={handleLogEntryCancel}
              isEditing={!!editingDrive}
            />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={
          isLimitReached 
            ? 'You have logged 20 hours on the free tier. Unlock Lifetime Pro for unlimited driving logs.' 
            : undefined
        }
      />

    </div>
  );
}