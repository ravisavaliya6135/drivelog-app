import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Play, Sun, Moon, ChevronRight, Plus, ShieldCheck, Car, X, ClipboardCheck } from 'lucide-react';
import { useDriveLog } from '../hooks/useDriveLog';
import { useEntitlement } from '../contexts/EntitlementContext';
import { UpgradeCard, UpgradeModal } from '../components/UpgradeModal';
import { US_STATES } from '../types';
import type { DriveEntry } from '../types';
import { DriveTimer } from '../components/DriveTimer';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { useSeo } from '../hooks/useSeo';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

export function Home() {
  useSeo({
    title: 'DriveLog — Supervised Teen Driving Hours Tracker & DMV Log',
    description: 'Track supervised teen driving practice hours, automatic day & night detection, and 50-state DMV license targets.',
    canonicalUrl: 'https://www.drivehours.app/',
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
  }, [searchParams, drives, isLimitReached]);  const updateModalUrl = (modal: string | null, editId?: string | null) => {
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
    updateModalUrl(null);
    sessionStorage.removeItem('timer-drive-data');
  };

  const handleLogEntryCancel = () => {
    setShowLogEntry(false);
    setEditingDrive(null);
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
  const remainingNight = Math.max(0, state.requiredNightHours - nightHoursVal).toFixed(1);
  const isTotalComplete = totalHoursVal >= state.requiredHours && nightHoursVal >= state.requiredNightHours;

  // Parent sign-off tracking: drives awaiting verification
  const unverifiedCount = drives.filter(d => !d.isVerified).length;

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="page-header">
        <p className="page-kicker">Driving cockpit</p>
        <h1 className="page-title">
          {primaryDriver ? `Welcome back, ${primaryDriver.name}` : 'Ready for the road?'}
        </h1>
        <p className="page-subtitle">
          Tracking your supervised driving toward the{' '}
          <Link to="/dmv" className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-900 dark:text-teal-300 dark:decoration-teal-700 dark:hover:text-teal-200">
            {state.name} license requirement
          </Link>
          .
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-elevated sm:p-6" aria-labelledby="license-goal-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <h2 id="license-goal-title" className="text-xs font-bold uppercase tracking-[0.16em]">License goal</h2>
            </div>
            <p className="mt-2 text-sm text-slate-300">{state.name} supervised driving target</p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
            {isTotalComplete ? 'Goal met' : `${totalProgress}% complete`}
          </span>
        </div>

        <div className="mt-6 flex items-end gap-2">
          <span className="font-mono text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">{totalHoursVal}</span>
          <span className="pb-1 text-lg font-bold text-slate-300">/ {state.requiredHours} hrs</span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-label="License goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={totalProgress}>
          <div
            className={`h-full rounded-full transition-[width] duration-200 ${isTotalComplete ? 'bg-emerald-400' : 'bg-teal-400'}`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-700 pt-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total remaining</dt>
            <dd className="mt-1 font-mono text-xl font-bold tabular-nums">{remainingTotal}h</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Night remaining</dt>
            <dd className="mt-1 font-mono text-xl font-bold tabular-nums">{remainingNight}h</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3" aria-label="Drive actions">
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
          className="btn-primary w-full text-base"
        >
          <Play className="h-5 w-5" aria-hidden="true" />
          Start a driving session
        </button>

        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Supervisor: <strong className="text-slate-700 dark:text-slate-300">{primaryDriver?.name || 'Primary Supervisor'}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setShowLogEntry(true);
              updateModalUrl('log-entry');
            }}
            className="btn-quiet -ml-3 self-start text-teal-800 dark:text-teal-300 sm:ml-0 sm:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Log past trip manually
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Day and night driving progress">
        <article className="app-card space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="badge-amber">
              <Sun className="h-4 w-4" aria-hidden="true" />
              Day driving
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{dayProgress}%</span>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-950 tabular-nums dark:text-white">
            {dayHoursVal}h <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ {state.requiredHours - state.requiredNightHours}h</span>
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-label="Day driving progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dayProgress}>
            <div className="h-full rounded-full bg-amber-500 transition-[width] duration-200" style={{ width: `${dayProgress}%` }} />
          </div>
        </article>

        <article className="app-card space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="badge-slate">
              <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
              Night driving
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{nightProgress}%</span>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-950 tabular-nums dark:text-white">
            {nightHoursVal}h <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ {state.requiredNightHours}h</span>
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-label="Night driving progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={nightProgress}>
            <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-200" style={{ width: `${nightProgress}%` }} />
          </div>
        </article>
      </section>

      {(drivers.length === 0 || vehicles.length === 0) && (
        <section className="app-card-accent flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="setup-title">
          <div>
            <h2 id="setup-title" className="font-bold text-slate-950 dark:text-white">Finish your driving setup</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Add a driver and vehicle so completed sessions are ready to save.</p>
          </div>
          <Link to="/settings" className="btn-secondary shrink-0">Open settings</Link>
        </section>
      )}

      {(isApproachingLimit || isLimitReached) && (
        <UpgradeCard onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {unverifiedCount > 5 && (
        <section className="app-card flex items-start gap-3 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40" aria-labelledby="sign-off-title">
          <ClipboardCheck className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
          <div>
            <h2 id="sign-off-title" className="font-bold text-sm text-amber-900 dark:text-amber-200">
              You have {unverifiedCount} unverified drives
            </h2>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
              Ask your parent to sign off before DMV submission.
            </p>
          </div>
        </section>
      )}

      <section className="space-y-3" aria-labelledby="latest-drive-title">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">History</p>
            <h2 id="latest-drive-title" className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Latest drive</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/log')}
            className="btn-quiet text-teal-800 dark:text-teal-300"
          >
            View all ({drives.length}) <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {drives.length > 0 ? (
          <div>
            {drives.slice(0, 1).map((drive) => {
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
                    setShowLogEntry(true);
                    updateModalUrl('log-entry', drive.id);
                  }}
                  className="app-card w-full p-4 flex items-center justify-between gap-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                      drive.dayNight === 'night'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {drive.dayNight === 'night' ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-slate-950 tabular-nums dark:text-white">
                        {formattedDuration}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>{new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span aria-hidden="true">•</span>
                        <span>{driver?.name || 'Supervisor'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <span className="hidden capitalize sm:inline">{drive.weather || 'Clear'}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="app-card space-y-3 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
              <Car className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-950 dark:text-white">No drives logged yet</h3>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
              Start a driving session above or log a previous drive to begin tracking toward your {state.requiredHours}-hour license goal.
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
