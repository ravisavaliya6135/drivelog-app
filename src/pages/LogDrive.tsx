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
  X
} from 'lucide-react';
import { useDriveLog } from '../hooks/useDriveLog';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { useSeo } from '../hooks/useSeo';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { getActiveTimerRecord } from '../utils/db';
import type { DriveEntry } from '../types';

export function LogDrive() {
  useSeo({
    title: 'Driving History & Practice Log | DriveLog',
    description: 'Chronological log of supervised teen driving sessions with day/night filtering, road conditions, and supervisor signatures.',
    canonicalUrl: 'https://www.drivehours.app/log',
    noindex: true,
  });

  const { drives, drivers, vehicles, addDrive } = useDriveLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'night'>('all');
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);
  const manualFormDialogRef = useAccessibleDialog(showManualForm, () => {
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
    await addDrive(entry);
    setShowManualForm(false);
    setEditingDrive(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Focus Mode: active drive session — hide all history & tools */}
      {driveActive ? (
        <section className="app-card-elevated border-teal-200 p-6 text-center shadow-elevated dark:border-teal-800 sm:p-8" aria-labelledby="current-drive-title">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            <Car className="w-7 h-7" />
          </div>
          <p className="mt-4 section-kicker">Active session</p>
          <h1 id="current-drive-title" className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Current drive</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
            A driving session is in progress. History is hidden to keep you focused on the road.
          </p>
          <Link
            to="/?modal=timer"
            className="btn-primary mt-5 w-full text-base"
          >
            Return to Live Timer
          </Link>
        </section>
      ) : (
        <>
      {/* 1. Header & Summary Stats Bar */}
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">Practice log</p>
          <h1 className="page-title">Driving history</h1>
          <p className="page-subtitle">
            {drives.length} sessions · <span className="font-mono font-semibold tabular-nums">{totalHours} hours</span> logged · <span className="font-mono font-semibold tabular-nums">{nightHours} night hours</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingDrive(null);
            setShowManualForm(true);
          }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Past Drive</span>
        </button>
      </header>

      {/* 2. Search & Filter Bar */}
      <section className="app-card flex flex-col gap-3 p-3 sm:flex-row sm:items-end" aria-label="Search and filter driving history">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="drive-history-search" className="sr-only">Search driving history</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="drive-history-search"
            placeholder="Search supervisor, conditions, notes, or date"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input bg-slate-50 pl-9 dark:bg-slate-800/60"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Drive time filter">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            aria-pressed={filterType === 'all'}
            className={`min-h-11 px-3 py-1 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All <span className="font-mono tabular-nums">({drives.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('day')}
            aria-pressed={filterType === 'day'}
            className={`min-h-11 px-3 py-1 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              filterType === 'day'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" aria-hidden="true" /> Day
          </button>
          <button
            type="button"
            onClick={() => setFilterType('night')}
            aria-pressed={filterType === 'night'}
            className={`min-h-11 px-3 py-1 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              filterType === 'night'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-4 h-4" aria-hidden="true" /> Night
          </button>
        </div>
      </section>

      {/* 3. Chronological Drive List */}
      {filteredDrives.length > 0 ? (
        <section className="space-y-3" aria-label="Driving history results">
          {filteredDrives.map((drive) => {
            const driver = drivers.find(d => d.id === drive.driverId);
            const vehicle = vehicles.find(v => v.id === drive.vehicleId);
            const durationHours = Math.floor(drive.durationMinutes / 60);
            const durationMins = drive.durationMinutes % 60;
            const formattedDuration = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

            return (
              <button
                type="button"
                key={drive.id}
                onClick={() => {
                  setEditingDrive(drive);
                  setShowManualForm(true);
                }}
                aria-label={`Edit ${formattedDuration} ${drive.dayNight} drive on ${new Date(drive.date).toLocaleDateString('en-US')}`}
                className="app-card flex w-full flex-col justify-between gap-3 p-4 text-left hover:border-teal-500 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-teal-500 sm:flex-row sm:items-center sm:p-5"
              >
                {/* Left side: Time, Condition & Date */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                    drive.dayNight === 'night'
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}>
                    {drive.dayNight === 'night' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formattedDuration}
                      </span>
                      <span className="badge-slate">
                        {drive.dayNight === 'night' ? <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" aria-hidden="true" /> : <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
                        {drive.dayNight === 'night' ? 'Night drive' : 'Day drive'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(drive.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {driver?.name || 'Supervisor'}
                      </span>
                      {vehicle && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {vehicle.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Notes snippet & Weather */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {drive.notes ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                      "{drive.notes}"
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400 capitalize">{drive.weather || 'Clear conditions'}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="app-card space-y-3 p-10 text-center" aria-labelledby="history-empty-title">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 id="history-empty-title" className="font-bold text-base text-slate-900 dark:text-white">
            {searchQuery ? 'No drives matching search' : 'No driving history yet'}
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Completed driving sessions will be logged chronologically here.'}
          </p>
        </section>
      )}

      {/* Manual Log / Edit Drive Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div ref={manualFormDialogRef} role="dialog" aria-modal="true" aria-labelledby="manual-drive-modal-title" tabIndex={-1} className="w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-[32px] border border-slate-200 bg-white p-5 shadow-2xl animate-slide-up dark:border-slate-700 dark:bg-slate-900 sm:rounded-[32px] sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="section-kicker">Practice record</p>
                <h2 id="manual-drive-modal-title" className="mt-1 font-bold text-lg text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive Entry' : 'Log Past Drive Manually'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  setEditingDrive(null);
                }}
                aria-label="Close drive entry"
                className="btn-quiet h-11 w-11 rounded-full bg-slate-100 p-0 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
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
