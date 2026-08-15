import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Filter, 
  Car, 
  User, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  FileText,
  X
} from 'lucide-react';
import { useDriveLog } from '../hooks/useDriveLog';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { StateSelector } from '../components/StateSelector';
import { US_STATES } from '../types';
import { useSeo } from '../hooks/useSeo';

export function LogDrive() {
  useSeo({
    title: 'Driving History & Practice Log | DriveLog',
    description: 'Chronological log of supervised teen driving sessions with day/night filtering, road conditions, and supervisor signatures.',
    canonicalUrl: 'https://drivelog-app.vercel.app/log',
  });

  const navigate = useNavigate();
  const { drives, drivers, vehicles, loading, addDrive, deleteDrive } = useDriveLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'night'>('all');
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);

  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

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

  const handleSaveDrive = async (entry: any) => {
    await addDrive(entry);
    setShowManualForm(false);
    setEditingDrive(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
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
          className="btn-primary py-2.5 px-4 text-xs font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Past Drive</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="app-card p-3 flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by driver, notes, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({drives.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('day')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filterType === 'day'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3 h-3" /> Day
          </button>
          <button
            type="button"
            onClick={() => setFilterType('night')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              filterType === 'night'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3 h-3" /> Night
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
                className="app-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-teal-500/50 transition-all"
              >
                {/* Left side: Time, Condition & Date */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
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
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        drive.dayNight === 'night'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {drive.dayNight === 'night' ? 'Night' : 'Day'}
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
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {drive.notes ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                      "{drive.notes}"
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400 capitalize">{drive.weather || 'Clear conditions'}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="app-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
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
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {editingDrive ? 'Edit Drive Entry' : 'Log Past Drive Manually'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  setEditingDrive(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900"
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

    </div>
  );
}