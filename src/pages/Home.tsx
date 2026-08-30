import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Play, Sun, Moon, ChevronRight, Plus, ShieldCheck, Car, X, ClipboardCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useDriveLog } from '../hooks/useDriveLog';
import { useEntitlement } from '../contexts/EntitlementContext';
import { UpgradeCard, UpgradeModal } from '../components/UpgradeModal';
import { US_STATES } from '../types';
import type { DriveEntry } from '../types';
import { DriveTimer } from '../components/DriveTimer';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { useSeo } from '../hooks/useSeo';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { calculateNightStatus } from '../utils/suncalc';
import { cn } from '../utils/cn';

export function Home() {
  useSeo({
    title: 'DriveHours — Supervised Teen Driving Hours Tracker & DMV Log',
    description: 'Track supervised teen driving practice hours, automatic day & night detection, and 50-state DMV license targets.',
    canonicalUrl: 'https://drivehours.app/',
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
  const [prefilledEntry, setPrefilledEntry] = useState<Partial<DriveEntry> | null>(null);

  useEffect(() => {
    const modal = searchParams.get('modal');
    const editId = searchParams.get('edit');

    if (modal === 'timer') {
      // Paywall gate: block NEW drive starts once the free limit is reached.
      // An in-progress drive is never interrupted — this only fires on fresh starts.
      if (isLimitReached) {
        setShowTimerModal(false);
        setShowUpgradeModal(true);
        const cleared = new URLSearchParams(searchParams);
        cleared.delete('modal');
        cleared.delete('edit');
        setSearchParams(cleared, { replace: true });
      } else {
        setShowTimerModal(true);
        setShowLogEntry(false);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, drives, isLimitReached]);

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

  /** Quick-log a preset duration past trip with automatic day/night detection */
  const handleQuickDuration = (minutes: number) => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60 * 1000);
    const driveDate = start.toISOString().split('T')[0];
    const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    const primaryVehicle = vehicles[0];
    const { isNight } = calculateNightStatus(start, selectedState);
    const estMiles = Math.max(1, Math.round((minutes / 60) * 28));

    const initials = primaryDriver?.name
      ? primaryDriver.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 3)
      : 'SUP';

    const entry: Partial<DriveEntry> = {
      date: driveDate,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: minutes,
      miles: estMiles,
      dayNight: isNight ? 'night' : 'day',
      driverId: primaryDriver?.id || '',
      vehicleId: primaryVehicle?.id || '',
      initials,
      weather: 'Sunny',
      roadType: 'City / Residential',
      notes: '',
      isVerified: false,
      state: selectedState,
    };

    setEditingDrive(null);
    setPrefilledEntry(entry);
    setShowLogEntry(true);
    updateModalUrl('log-entry');
  };

  const handleTimerComplete = (data: { durationMinutes: number; startTime: Date; endTime: Date; driverId: string }) => {
    setShowTimerModal(false);
    setShowLogEntry(true);
    updateModalUrl('log-entry');
    // DMV logs group drives by the date the drive STARTED, so a session
    // spanning midnight (11:30 PM → 12:15 AM) is logged on the start date.
    const driveDate = data.startTime.toISOString().split('T')[0];
    const primaryVehicle = vehicles[0];

    sessionStorage.setItem('timer-drive-data', JSON.stringify({
      date: driveDate,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      durationMinutes: data.durationMinutes,
      driverId: data.driverId || drivers.find(d => d.isPrimaryDriver)?.id || drivers[0]?.id || '',
      vehicleId: primaryVehicle?.id || '',
    }));
  };

  const handleLogEntrySave = (entry: DriveEntry) => {
    addDrive(entry);
    setShowLogEntry(false);
    setEditingDrive(null);
    setPrefilledEntry(null);
    updateModalUrl(null);
    sessionStorage.removeItem('timer-drive-data');
    toast.success('Drive logged successfully', {
      description: `${entry.durationMinutes}m ${entry.dayNight} drive saved`,
    });
  };

  const handleLogEntryCancel = () => {
    setShowLogEntry(false);
    setEditingDrive(null);
    setPrefilledEntry(null);
    updateModalUrl(null);
  };

  const timerDialogRef = useAccessibleDialog(showTimerModal, () => {
    setShowTimerModal(false);
    updateModalUrl(null);
  });
  const logEntryDialogRef = useAccessibleDialog(showLogEntry, handleLogEntryCancel);

  // Calculations
  const totalHoursVal = Number(totalHours.toFixed(1));
  const dayHoursVal = Number((dayMinutes / 60).toFixed(1));
  const nightHoursVal = Number((nightMinutes / 60).toFixed(1));
  
  const totalProgress = Math.min(100, Math.round((totalHoursVal / (state.requiredHours || 50)) * 100));
  const dayProgress = Math.min(100, Math.round((dayHoursVal / Math.max(1, state.requiredHours - state.requiredNightHours)) * 100));
  const nightProgress = state.requiredNightHours > 0 ? Math.min(100, Math.round((nightHoursVal / state.requiredNightHours) * 100)) : 100;
  
  const remainingTotal = Math.max(0, state.requiredHours - totalHoursVal).toFixed(1);
  const isTotalComplete = totalHoursVal >= state.requiredHours && nightHoursVal >= state.requiredNightHours;

  // Parent sign-off tracking: drives awaiting verification
  const unverifiedCount = drives.filter(d => !d.isVerified).length;

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. Main Overall Progress Card */}
      <section className="app-card-glow p-5 sm:p-7 space-y-5 border border-teal-500/25">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow-sm">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Link to="/dmv" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                {state.name} Requirement
              </Link>
            </span>
          </div>
          
          <span className={cn(
            'text-xs font-extrabold px-3 py-1 rounded-full border',
            isTotalComplete
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
          )}>
            {isTotalComplete ? 'Goal Met ✓' : `${totalProgress}% Complete`}
          </span>
        </div>

        {/* Hero Hours Display */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tabular-nums tracking-tight drop-shadow-sm">
              {totalHoursVal}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-400">
              / {state.requiredHours} hrs
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
            {remainingTotal}h left
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-900/90 rounded-full overflow-hidden p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 shadow-sm',
              isTotalComplete
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400 shadow-[0_0_15px_rgba(20,184,166,0.5)]'
            )}
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Day & Night Breakdown Bento */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Day */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#17233B]/75 border border-slate-200/70 dark:border-slate-700/60 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} /> Day
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dayProgress}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{dayHoursVal}h</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">/ {state.requiredHours - state.requiredNightHours}h</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${dayProgress}%` }} />
            </div>
          </div>

          {/* Night */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#17233B]/75 border border-slate-200/70 dark:border-slate-700/60 space-y-2 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.75} /> Night
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{nightProgress}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{nightHoursVal}h</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">/ {state.requiredNightHours}h</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${nightProgress}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Primary Start Drive Action & Quick Duration Chips */}
      <section className="space-y-3.5">
        {/* Main 64px CTA */}
        <button
          type="button"
          onClick={() => {
            // Gate new drive starts at the free limit; in-progress drives are unaffected.
            if (isLimitReached) {
              setShowUpgradeModal(true);
              return;
            }
            setShowTimerModal(true);
            updateModalUrl('timer');
          }}
          className="w-full min-h-[64px] h-16 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-base shadow-[0_4px_25px_rgba(20,184,166,0.4)] hover:shadow-[0_6px_30px_rgba(20,184,166,0.55)] border border-teal-400/30 flex items-center justify-center gap-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-[#0B0F19]"
        >
          <Play className="w-6 h-6 fill-white" strokeWidth={1.75} />
          <span>Start Driving Session</span>
        </button>

        {/* Quick Log Presets Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.75} /> Quick Log Past Trip
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingDrive(null);
                setPrefilledEntry(null);
                setShowLogEntry(true);
                updateModalUrl('log-entry');
              }}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} /> Custom Trip
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: '+15m', mins: 15 },
              { label: '+30m', mins: 30 },
              { label: '+45m', mins: 45 },
              { label: '+1h', mins: 60 },
            ].map(({ label, mins }) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleQuickDuration(mins)}
                aria-label={`Log ${label} drive`}
                className="min-h-[50px] py-3 px-3 rounded-2xl bg-white dark:bg-[#131C2E]/90 border border-slate-200/90 dark:border-slate-700/70 hover:border-teal-500/60 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all active:scale-95 flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisor: <strong className="text-slate-700 dark:text-slate-200">{primaryDriver?.name || 'Primary Supervisor'}</strong>
          </p>
        </div>
      </section>

      {/* 3. Tasteful Upgrade Card (only if approaching / at 20h limit) */}
      {(isApproachingLimit || isLimitReached) && (
        <UpgradeCard onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {/* 3b. Parent Sign-Off Nudge (weekly reminder when many drives are unverified) */}
      {unverifiedCount > 5 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-fade-in backdrop-blur-sm">
          <ClipboardCheck className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <h4 className="font-bold text-xs text-amber-800 dark:text-amber-300">
              You have {unverifiedCount} unverified drives
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-0.5">
              Ask your parent to sign off before DMV submission.
            </p>
          </div>
        </div>
      )}

      {/* 4. Recent Drives List */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Drives</h2>
          <button
            type="button"
            onClick={() => navigate('/log')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All ({drives.length}) <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
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
                <button
                  type="button"
                  key={drive.id}
                  onClick={() => {
                    setEditingDrive(drive);
                    setPrefilledEntry(null);
                    setShowLogEntry(true);
                    updateModalUrl('log-entry', drive.id);
                  }}
                  className="app-card w-full p-4 flex items-center justify-between text-left hover:border-teal-500/50 hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm',
                      drive.dayNight === 'night'
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    )}>
                      {drive.dayNight === 'night' ? (
                        <Moon className="w-5 h-5" strokeWidth={1.75} />
                      ) : (
                        <Sun className="w-5 h-5" strokeWidth={1.75} />
                      )}
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
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" strokeWidth={1.75} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="app-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto shadow-sm">
              <Car className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No drives logged yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Tap "Start Driving Session" above or use quick log presets to track towards your {state.requiredHours}h state license goal.
            </p>
          </div>
        )}
      </section>

      {/* Timer Modal — full-screen distraction-free mode during an active drive */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] overflow-y-auto animate-fade-in">
          <div ref={timerDialogRef} role="dialog" aria-modal="true" aria-labelledby="timer-modal-title" tabIndex={-1} className="min-h-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <h2 id="timer-modal-title" className="font-bold text-base text-slate-900 dark:text-white">Live Driving Session</h2>
              <button
                type="button"
                onClick={() => {
                  setShowTimerModal(false);
                  updateModalUrl(null);
                }}
                aria-label="Close driving session"
                className="btn-ghost rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <DriveTimer onDriveComplete={handleTimerComplete} />
          </div>
        </div>
      )}

      {/* Save Drive Modal */}
      {showLogEntry && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div ref={logEntryDialogRef} role="dialog" aria-modal="true" aria-labelledby="drive-entry-modal-title" tabIndex={-1} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 id="drive-entry-modal-title" className="font-bold text-base text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive' : 'Log Drive Summary'}
              </h2>
              <button
                type="button"
                onClick={handleLogEntryCancel}
                aria-label="Close drive entry"
                className="btn-ghost rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <DriveLogEntry
              initialData={editingDrive || prefilledEntry || (() => {
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

