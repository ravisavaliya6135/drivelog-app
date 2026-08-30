import { useState, useEffect, memo } from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudFog,
  Save,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';
import { useNightDetection } from '../hooks/useNightDetection';
import { generateId } from '../utils/db';
import { cn } from '../utils/cn';

interface DriveLogEntryProps {
  initialData?: Partial<DriveEntry>;
  drivers: DriverProfile[];
  vehicles: VehicleProfile[];
  selectedState: string;
  onSave: (entry: DriveEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

// Memoized: parent lists re-render on timer ticks / context updates —
// entry cards should not unless their own data changes.
export const DriveLogEntry = memo(function DriveLogEntry({
  initialData,
  drivers,
  vehicles,
  selectedState,
  onSave,
  onCancel,
  isEditing = false,
}: DriveLogEntryProps) {
  const { isNight: autoIsNight } = useNightDetection(selectedState);

  const [formData, setFormData] = useState<Partial<DriveEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 60,
    miles: 15,
    dayNight: autoIsNight ? 'night' : 'day',
    weather: 'Sunny',
    roadType: 'City / Residential',
    notes: '',
    isVerified: false,
    driverId: drivers[0]?.id || '',
    vehicleId: vehicles[0]?.id || '',
    initials: 'DAD',
    state: selectedState,
    ...initialData,
  });

  // Sync with initialData whenever it changes (e.g. when opening via quick preset chips)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Calculate duration from start and end time if available
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime).getTime();
      const end = new Date(formData.endTime).getTime();
      if (end > start) {
        const mins = Math.round((end - start) / 60000);
        setFormData(prev => ({ ...prev, durationMinutes: mins }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const setPresetDuration = (mins: number) => {
    const end = formData.endTime ? new Date(formData.endTime) : new Date();
    const start = new Date(end.getTime() - mins * 60 * 1000);
    const estMiles = Math.max(1, Math.round((mins / 60) * 28));

    setFormData(prev => ({
      ...prev,
      durationMinutes: mins,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      miles: prev.miles === 15 || !prev.miles ? estMiles : prev.miles,
    }));
  };

  const durationHours = Math.floor((formData.durationMinutes || 0) / 60);
  const durationMins = (formData.durationMinutes || 0) % 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DriveEntry = {
      id: initialData?.id || generateId(),
      date: formData.date || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || new Date().toISOString(),
      endTime: formData.endTime || new Date().toISOString(),
      durationMinutes: Number(formData.durationMinutes) || 30,
      dayNight: formData.dayNight || 'day',
      miles: Number(formData.miles) || 0,
      weather: formData.weather || 'Sunny',
      roadType: formData.roadType || 'City / Residential',
      notes: formData.notes || '',
      isVerified: Boolean(formData.isVerified),
      driverId: formData.driverId || drivers[0]?.id || '',
      vehicleId: formData.vehicleId || vehicles[0]?.id || '',
      initials: formData.initials || 'SUP',
      state: selectedState,
    };
    onSave(entry);
  };

  const weatherOptions = [
    { label: 'Sunny', icon: Sun },
    { label: 'Cloudy', icon: Cloud },
    { label: 'Rainy', icon: CloudRain },
    { label: 'Foggy', icon: CloudFog },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* 1. Time & Duration Display Card */}
      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Total Session Time
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`}
          </div>
        </div>

        {/* Day / Night Condition Toggle */}
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm" role="radiogroup" aria-label="Day or night session">
          <button
            type="button"
            role="radio"
            aria-checked={formData.dayNight === 'day'}
            onClick={() => setFormData(prev => ({ ...prev, dayNight: 'day' }))}
            className={cn(
              'px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
              formData.dayNight === 'day'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Sun className="w-3.5 h-3.5" strokeWidth={1.75} /> Day
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={formData.dayNight === 'night'}
            onClick={() => setFormData(prev => ({ ...prev, dayNight: 'night' }))}
            className={cn(
              'px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
              formData.dayNight === 'night'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Moon className="w-3.5 h-3.5" strokeWidth={1.75} /> Night
          </button>
        </div>
      </div>

      {/* Quick Duration Preset Chips */}
      <div>
        <span className="form-label">Quick Duration Presets</span>
        <div className="grid grid-cols-4 gap-2">
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setPresetDuration(mins)}
              className={cn(
                'min-h-[44px] py-2 px-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95',
                formData.durationMinutes === mins
                  ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/50'
              )}
            >
              {mins === 60 ? '1 hr' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Date & Duration Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="drive-date" className="form-label">Date</label>
          <input
            id="drive-date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="drive-duration" className="form-label">Duration (Minutes)</label>
          <input
            id="drive-duration"
            type="number"
            min="1"
            max="720"
            required
            value={formData.durationMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
            className="form-input"
          />
        </div>
      </div>

      {/* 3. Driver & Vehicle Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="drive-supervisor" className="form-label">Supervising Adult</label>
          <select
            id="drive-supervisor"
            value={formData.driverId}
            onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
            className="form-input cursor-pointer"
          >
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} {d.isPrimaryDriver ? '(Primary)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="drive-vehicle" className="form-label">Vehicle</label>
          <select
            id="drive-vehicle"
            value={formData.vehicleId}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
            className="form-input cursor-pointer"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.make})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Weather Chips */}
      <div>
        <label className="form-label">Weather Conditions</label>
        <div className="grid grid-cols-4 gap-2">
          {weatherOptions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, weather: label }))}
              className={cn(
                'min-h-[52px] py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all active:scale-95',
                formData.weather === label
                  ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notes & Supervisor Signature */}
      <div className="space-y-3">
        <div>
          <label htmlFor="drive-notes" className="form-label">Route & Practice Notes</label>
          <input
            id="drive-notes"
            type="text"
            placeholder="e.g. Parallel parking, 101 freeway merge, night rain practice"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="drive-initials" className="form-label">Supervisor Initials</label>
            <input
              id="drive-initials"
              type="text"
              maxLength={4}
              value={formData.initials || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
              placeholder="e.g. JD"
              className="form-input font-mono uppercase"
            />
          </div>

          <div>
            <label htmlFor="drive-miles" className="form-label">Est. Miles</label>
            <input
              id="drive-miles"
              type="number"
              min="0"
              step="0.1"
              value={formData.miles || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, miles: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 15.2"
              className="form-input font-mono"
            />
          </div>
        </div>
      </div>

      {/* 6. Parent Sign-Off Verification */}
      <div>
        <label className="form-label">Parent Sign-Off</label>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, isVerified: !prev.isVerified }))}
          aria-pressed={Boolean(formData.isVerified)}
          aria-label="Mark as verified by parent"
          className={cn(
            'w-full min-h-[64px] p-4 rounded-2xl border flex items-center gap-3 text-left transition-all',
            formData.isVerified
              ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/40'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm',
            formData.isVerified ? 'bg-emerald-600' : 'bg-amber-500'
          )}>
            {formData.isVerified ? (
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <Clock className="w-5 h-5" strokeWidth={1.75} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {formData.isVerified ? (
              <>
                <span className="block font-bold text-xs text-emerald-700 dark:text-emerald-300">
                  ✓ Verified by {(formData.initials || 'parent').toUpperCase()}
                </span>
                <span className="block text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Signed off for DMV submission
                </span>
              </>
            ) : (
              <>
                <span className="block font-bold text-xs text-amber-700 dark:text-amber-300">
                  Awaiting parent sign-off
                </span>
                <span className="block text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Tap to mark this drive as verified by a parent/guardian
                </span>
              </>
            )}
          </div>
          {/* Toggle switch visual */}
          <div className={cn(
            'w-10 h-6 rounded-full p-0.5 flex-shrink-0 transition-all flex items-center',
            formData.isVerified ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
          )}>
            <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </div>
        </button>
      </div>

      {/* 7. Form Actions */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          className="btn-primary w-full min-h-[64px] h-16 text-base font-extrabold shadow-teal flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" strokeWidth={1.75} />
          <span>{isEditing ? 'Update Drive Entry' : 'Save Drive to Log'}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full min-h-[48px] py-3 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors text-center block"
        >
          Cancel
        </button>
      </div>

    </form>
  );
});

