import { useState, useEffect } from 'react';
import { Calendar, MapPin, Cloud, Road, ClipboardList, UserCheck, Truck, Car, Save, X, AlertCircle, Sun, Moon, RotateCcw } from 'lucide-react';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';
import { WEATHER_OPTIONS, ROAD_TYPE_OPTIONS, SKILLS_OPTIONS, US_STATES } from '../types';
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
  const { getNightStatus, manualOverride, setManualDayNight } = useNightDetection(selectedState);

  const [formData, setFormData] = useState<Partial<DriveEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 0,
    miles: 0,
    dayNight: 'day',
    weather: 'Clear',
    roadType: 'Residential',
    notes: '',
    isVerified: false,
    driverId: drivers[0]?.id || '',
    vehicleId: vehicles[0]?.id || '',
    initials: '',
    state: selectedState,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSkills, setShowSkills] = useState(false);

  // Auto-calculate day/night based on start time (respects manual override)
  useEffect(() => {
    if (formData.startTime) {
      const start = new Date(formData.startTime);
      const result = getNightStatus(start, manualOverride === null); // useAuto = true only if no manual override
      setFormData(prev => ({ ...prev, dayNight: result.isNight ? 'night' : 'day' }));
    }
  }, [formData.startTime, getNightStatus, manualOverride]);

  // Auto-calculate duration when start/end times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end > start) {
        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
        setFormData(prev => ({ ...prev, durationMinutes: duration }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (!formData.driverId) newErrors.driverId = 'Select a driver';
    if (!formData.vehicleId) newErrors.vehicleId = 'Select a vehicle';
    if (!formData.initials.trim()) newErrors.initials = 'Supervising adult initials required';
    if (formData.durationMinutes < 1) newErrors.durationMinutes = 'Minimum 1 minute required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as DriveEntry);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="card-gradient-accent safe-x safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Drive Entry' : 'Log New Drive'}
          </h2>
          <p className="text-slate-500 text-sm">All fields required unless marked optional</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost p-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Date & Time Section */}
      <fieldset className="space-y-4 mb-6">
        <legend className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-indigo-500" /> Date & Time
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
              className="input-field"
              required
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time *</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(formData.startTime)}
              onChange={e => handleChange('startTime', new Date(e.target.value).toISOString())}
              className="input-field"
              required
            />
            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time *</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(formData.endTime)}
              onChange={e => handleChange('endTime', new Date(e.target.value).toISOString())}
              className="input-field"
              required
            />
            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        {/* Duration display */}
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
          <span className="text-sm font-medium text-slate-700">Duration</span>
          <span className="text-lg font-mono font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {formData.durationMinutes} min ({Math.floor(formData.durationMinutes / 60)}h {formData.durationMinutes % 60}m)
          </span>
        </div>
      </fieldset>

      {/* Driver & Vehicle Section */}
      <fieldset className="space-y-4 mb-6">
        <legend className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-indigo-500" /> Driver & Vehicle
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Who is driving? *</label>
            <select
              value={formData.driverId}
              onChange={e => handleChange('driverId', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.role === 'teen' ? 'Student' : 'Parent'})
                </option>
              ))}
            </select>
            {errors.driverId && <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={e => handleChange('vehicleId', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.year} {v.make} {v.model} ({v.licensePlate})
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>}
          </div>
        </div>

        {/* Supervising adult initials */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervising Adult Initials *</label>
          <input
            type="text"
            maxLength={3}
            value={formData.initials.toUpperCase()}
            onChange={e => handleChange('initials', e.target.value.toUpperCase())}
            placeholder="JD"
            className="input-field max-w-xs text-center text-lg font-semibold tracking-wider uppercase"
            required
          />
          {errors.initials && <p className="mt-1 text-sm text-red-600">{errors.initials}</p>}
          <p className="mt-1.5 text-xs text-slate-500">Required per entry for DMV compliance</p>
        </div>
      </fieldset>

      {/* Conditions Section */}
      <fieldset className="space-y-4 mb-6">
        <legend className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Cloud className="w-4 h-4 text-indigo-500" /> Conditions (auto-detected where possible)
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Day / Night *</label>
            <div className="space-y-2">
              <select
                value={formData.dayNight}
                onChange={e => handleChange('dayNight', e.target.value)}
                className="input-field"
              >
                <option value="day">☀️ Daytime</option>
                <option value="night">🌙 Legal Night (30 min after sunset)</option>
              </select>
              {/* Manual override toggle when auto-detection might be wrong */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg text-xs text-slate-600 border border-slate-100">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto-detected from start time</span>
                <button
                  type="button"
                  onClick={() => setManualDayNight(formData.dayNight === 'day' ? 'night' : 'day')}
                  className="ml-auto text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2 transition-smooth"
                >
                  Override
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Weather</label>
            <select
              value={formData.weather}
              onChange={e => handleChange('weather', e.target.value)}
              className="input-field"
            >
              {WEATHER_OPTIONS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Road Type</label>
            <select
              value={formData.roadType}
              onChange={e => handleChange('roadType', e.target.value)}
              className="input-field"
            >
              {ROAD_TYPE_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Miles Driven (optional)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={formData.miles}
            onChange={e => handleChange('miles', parseFloat(e.target.value) || 0)}
            className="input-field max-w-xs"
          />
        </div>
      </fieldset>

      {/* Skills & Notes Section */}
      <fieldset className="space-y-4 mb-6">
        <legend className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-indigo-500" /> Skills Practiced & Notes
        </legend>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select skills practiced (optional)</label>
          <button
            type="button"
            onClick={() => setShowSkills(!showSkills)}
            className="btn-ghost text-sm mb-3"
          >
            <ClipboardList className="w-4 h-4" />
            {showSkills ? 'Hide' : 'Show'} Skills Checklist
          </button>

          {showSkills && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100">
              {SKILLS_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-white/60 transition-fast">
                  <input
                    type="checkbox"
                    checked={formData.notes?.includes(skill) || false}
                    onChange={e => {
                      const currentNotes = formData.notes || '';
                      const skills = currentNotes.split(', ').filter(s => s && SKILLS_OPTIONS.includes(s));
                      if (e.target.checked) {
                        skills.push(skill);
                      } else {
                        const idx = skills.indexOf(skill);
                        if (idx > -1) skills.splice(idx, 1);
                      }
                      handleChange('notes', skills.join(', '));
                    }}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  {skill}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            rows={3}
            placeholder="e.g., Practiced parallel parking on Main St, highway merge at exit 12..."
            className="input-field resize-none"
          />
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-slate-200/80">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Update Drive' : 'Save Drive'}
        </button>
      </div>

      {errors.durationMinutes && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-red-100 mt-4">
          <AlertCircle className="w-4 h-4" />
          {errors.durationMinutes}
        </div>
      )}
    </form>
  );
}
