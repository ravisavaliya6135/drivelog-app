import { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Car, 
  Cloud, 
  Check, 
  CloudRain, 
  CloudFog, 
  Save, 
  X,
  FileText
} from 'lucide-react';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';
import { useNightDetection } from '../hooks/useNightDetection';

interface DriveLogEntryProps {
  initialData?: Partial<DriveEntry>;
  drivers: DriverProfile[];
  vehicles: VehicleProfile[];
  selectedState: string;
  onSave: (entry: DriveEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function DriveLogEntry({
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
    isVerified: true,
    driverId: drivers[0]?.id || '',
    vehicleId: vehicles[0]?.id || '',
    initials: 'DAD',
    state: selectedState,
    ...initialData,
  });

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

  const activeDriver = drivers.find(d => d.id === formData.driverId) || drivers[0];
  const durationHours = Math.floor((formData.durationMinutes || 0) / 60);
  const durationMins = (formData.durationMinutes || 0) % 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DriveEntry = {
      id: initialData?.id || `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Total Session Time
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`}
          </div>
        </div>

        {/* Day / Night Condition Toggle */}
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, dayNight: 'day' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              formData.dayNight === 'day'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Day
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, dayNight: 'night' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              formData.dayNight === 'night'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Night
          </button>
        </div>
      </div>

      {/* 2. Date & Duration Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Duration (Minutes)</label>
          <input
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
          <label className="form-label">Supervising Adult</label>
          <select
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
          <label className="form-label">Vehicle</label>
          <select
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
              className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                formData.weather === label
                  ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notes & Supervisor Signature */}
      <div className="space-y-3">
        <div>
          <label className="form-label">Route & Practice Notes</label>
          <input
            type="text"
            placeholder="e.g. Parallel parking, 101 freeway merge, night rain practice"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Supervisor Initials</label>
            <input
              type="text"
              maxLength={4}
              value={formData.initials || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
              placeholder="e.g. JD"
              className="form-input font-mono uppercase"
            />
          </div>

          <div>
            <label className="form-label">Est. Miles</label>
            <input
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

      {/* 6. Form Actions */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          className="btn-primary w-full h-14 text-base font-bold shadow-teal flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{isEditing ? 'Update Drive Entry' : 'Save Drive to Log'}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors text-center block"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
