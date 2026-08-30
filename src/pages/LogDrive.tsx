import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Sun,
  Moon,
  Plus,
  Search,
  Car,
  User,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useDriveLog } from '../hooks/useDriveLog';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { useSeo } from '../hooks/useSeo';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { getActiveTimerRecord } from '../utils/db';
import { cn } from '../utils/cn';
import type { DriveEntry } from '../types';

export function LogDrive() {
  useSeo({
    title: 'Driving History & Practice Log | DriveHours',
    description: 'Search, filter, and review supervised teen driving logs. One-tap parent verification and Day/Night breakdown.',
    canonicalUrl: 'https://drivehours.app/log',
    noindex: true,
  });

  const { drives, drivers, vehicles, addDrive, updateDrive } = useDriveLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'night'>('all');
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);

  const formDialogRef = useAccessibleDialog(showManualForm, () => {
    setShowManualForm(false);
    setEditingDrive(null);
  });

  // Zero-distraction focus mode: if a drive session is active (persisted in
  // IndexedDB), hide history and show only the "Current Drive" card.
  const [driveActive, setDriveActive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const checkActive = async () => {
      try {
        const record = await getActiveTimerRecord();
        if (!cancelled) setDriveActive(Boolean(record?.isRunning));
      } catch {
        // Offline-safe: treat as no active drive
      }
    };
    void checkActive();
    document.addEventListener('visibilitychange', checkActive);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', checkActive);
    };
  }, []);

  const [selectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  // Filtering
  const filteredDrives = drives.filter((drive) => {
    // Condition filter
    if (filterType === 'day' && drive.dayNight !== 'day') return false;
    if (filterType === 'night' && drive.dayNight !== 'night') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const driver = drivers.find(d => d.id === drive.driverId)?.name.toLowerCase() || '';
      const notes = (drive.notes || '').toLowerCase();
      const weather = (drive.weather || '').toLowerCase();
      const date = drive.date.toLowerCase();
      return driver.includes(q) || notes.includes(q) || weather.includes(q) || date.includes(q);
    }
    return true;
  });

  // Calculate totals
  const totalMinutes = drives.reduce((acc, d) => acc + d.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const nightMinutes = drives.filter(d => d.dayNight === 'night').reduce((acc, d) => acc + d.durationMinutes, 0);
  const nightHours = (nightMinutes / 60).toFixed(1);

  const handleSaveDrive = async (entry: DriveEntry) => {
    if (editingDrive) {
      await updateDrive(entry);
      toast.success('Drive updated successfully');
    } else {
      await addDrive(entry);
      toast.success('New drive session saved');
    }
    setShowManualForm(false);
    setEditingDrive(null);
  };

  /** One-tap direct parent sign-off without opening edit modal */
  const handleQuickSign = async (e: React.MouseEvent, drive: DriveEntry) => {
    e.stopPropagation();
    const supervisor = drivers.find(d => d.id === drive.driverId) || drivers.find(d => d.isPrimaryDriver) || drivers[0];
    const initials = supervisor?.name
      ? supervisor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3)
      : (drive.initials || 'SUP');

    try {
      const updated: DriveEntry = {
        ...drive,
        isVerified: true,
        initials,
      };
      await updateDrive(updated);

      if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(20);
      }

      toast.success('Drive verified & signed off', {
        description: `Signed by ${supervisor?.name || 'Supervisor'} (${initials})`,
      });
    } catch (err) {
      console.error('Failed to sign off drive:', err);
      toast.error('Failed to verify drive');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Focus Mode: active drive session — hide all history & tools */}
      {driveActive ? (
        <div className="app-card-elevated p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
            <Car className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Current Drive</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            A driving session is in progress. History is hidden to keep you focused on the road.
          </p>
          <Link
            to="/?modal=timer"
            className="inline-flex items-center justify-center w-full min-h-[64px] h-16 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold text-base shadow-teal transition-all"
          >
            Return to Live Timer
          </Link>
        </div>
      ) : (
        <>
      {/* 1. Header & Summary Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Driving History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {drives.length} total sessions • {totalHours} hrs logged ({nightHours}h night)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingDrive(null);
            setShowManualForm(true);
          }}
          className="btn-primary min-h-[48px] py-2.5 px-4 text-xs font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          <span>Log Past Drive</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="app-card p-3 flex flex-col sm:flex-row gap-2.5 bg-white/90 dark:bg-[#131C2E]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search by driver, notes, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B0F19]/70 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 min-h-[44px] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-slate-100 dark:bg-[#17233B] p-1 rounded-xl border border-transparent dark:border-slate-700/60" role="radiogroup" aria-label="Drive filter">
          <button
            type="button"
            role="radio"
            aria-checked={filterType === 'all'}
            onClick={() => setFilterType('all')}
            className={cn(
              'px-3.5 py-1.5 min-h-[40px] text-xs font-bold rounded-lg transition-all',
              filterType === 'all'
                ? 'bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-teal-300 dark:border dark:border-teal-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All ({drives.length})
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filterType === 'day'}
            onClick={() => setFilterType('day')}
            className={cn(
              'px-3.5 py-1.5 min-h-[40px] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
              filterType === 'day'
                ? 'bg-white dark:bg-[#0B0F19] text-amber-600 dark:text-amber-300 dark:border dark:border-amber-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} /> Day
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filterType === 'night'}
            onClick={() => setFilterType('night')}
            className={cn(
              'px-3.5 py-1.5 min-h-[40px] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
              filterType === 'night'
                ? 'bg-white dark:bg-[#0B0F19] text-indigo-600 dark:text-indigo-300 dark:border dark:border-indigo-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" strokeWidth={1.75} /> Night
          </button>
        </div>
      </div>

      {/* 3. Chronological Drive List */}
      {filteredDrives.length > 0 ? (
        <div className="space-y-2.5">
          {filteredDrives.map((drive) => {
            const driver = drivers.find(d => d.id === drive.driverId);
            const vehicle = vehicles.find(v => v.id === drive.vehicleId);
            const durationHours = Math.floor(drive.durationMinutes / 60);
            const durationMins = drive.durationMinutes % 60;
            const formattedDuration = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

            return (
              <div
                key={drive.id}
                onClick={() => {
                  setEditingDrive(drive);
                  setShowManualForm(true);
                }}
                className="app-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 cursor-pointer hover:border-teal-500/50 hover:shadow-[0_8px_30px_rgba(20,184,166,0.12)] transition-all group rounded-2xl"
              >
                {/* Left side: Time, Condition & Date */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 shadow-sm',
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

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formattedDuration}
                      </span>
                      <span className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-md border',
                        drive.dayNight === 'night'
                          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      )}>
                        {drive.dayNight === 'night' ? 'Night' : 'Day'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                        {new Date(drive.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                        {driver?.name || 'Supervisor'}
                      </span>
                      {vehicle && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            {vehicle.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Verification Status + One-Tap Sign-Off + Notes */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {drive.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-[180px] truncate hidden md:block">
                      "{drive.notes}"
                    </p>
                  )}

                  {drive.isVerified ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
                      <span>Signed ({drive.initials || 'SUP'})</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => void handleQuickSign(e, drive)}
                      aria-label={`Sign off drive for ${drive.date}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 active:scale-[0.97] text-teal-300 border border-teal-500/30 font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                      <span>Sign Off</span>
                    </button>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors flex-shrink-0" strokeWidth={1.75} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="app-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {searchQuery ? 'No drives matching search' : 'No driving history yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Completed driving sessions will be logged chronologically here.'}
          </p>
        </div>
      )}

      {/* Manual Log / Edit Drive Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            ref={formDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drive-modal-header"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="drive-modal-header" className="font-bold text-base text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive Entry' : 'Log Past Drive Manually'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  setEditingDrive(null);
                }}
                aria-label="Close modal"
                className="btn-ghost rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <DriveLogEntry
              initialData={editingDrive || undefined}
              drivers={drivers}
              vehicles={vehicles}
              selectedState={selectedState}
              onSave={handleSaveDrive}
              onCancel={() => {
                setShowManualForm(false);
                setEditingDrive(null);
              }}
              isEditing={!!editingDrive}
            />
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
}

