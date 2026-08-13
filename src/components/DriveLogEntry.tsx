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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Drive Entry' : 'Log New Drive'}
          </h2>
          <p className="text-slate-500 text-sm">All fields required unless marked optional</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Date & Time Section */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Date & Time
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(formData.startTime)}
              onChange={e => handleChange('startTime', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
            <input
              type="datetime-local"
              value={formatTimeForInput(formData.endTime)}
              onChange={e => handleChange('endTime', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        {/* Duration display */}
        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Duration</span>
          <span className="text-lg font-mono font-semibold text-slate-900">
            {formData.durationMinutes} min ({Math.floor(formData.durationMinutes / 60)}h {formData.durationMinutes % 60}m)
          </span>
        </div>
      </fieldset>

      {/* Driver & Vehicle Section */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4" /> Driver & Vehicle
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Who is driving? *</label>
            <select
              value={formData.driverId}
              onChange={e => handleChange('driverId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={e => handleChange('vehicleId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Supervising Adult Initials *</label>
          <input
            type="text"
            maxLength={3}
            value={formData.initials.toUpperCase()}
            onChange={e => handleChange('initials', e.target.value.toUpperCase())}
            placeholder="JD"
            className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-uppercase"
            required
          />
          {errors.initials && <p className="mt-1 text-sm text-red-600">{errors.initials}</p>}
          <p className="mt-1 text-xs text-slate-500">Required per entry for DMV compliance</p>
        </div>
      </fieldset>

      {/* Conditions Section */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-slate-900 flex items-center gap-2">
          <Cloud className="w-4 h-4" /> Conditions (auto-detected where possible)
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day / Night *</label>
            <div className="space-y-2">
              <select
                value={formData.dayNight}
                onChange={e => handleChange('dayNight', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="day">☀ Daytime</option>
                <option value="night">🌙 Legal Night (30 min after sunset)</option>
              </select>
              {/* Manual override toggle when auto-detection might be wrong */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                <RotateCcw className="w-3 h-3" />
                <span>Auto-detected from start time</span>
                <button
                  type="button"
                  onClick={() => setManualDayNight(formData.dayNight === 'day' ? 'night' : 'day')}
                  className="ml-auto text-slate-500 hover:text-slate-700 underline"
                >
                  Override manually
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weather</label>
            <select
              value={formData.weather}
              onChange={e => handleChange('weather', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              {WEATHER_OPTIONS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Road Type</label>
            <select
              value={formData.roadType}
              onChange={e => handleChange('roadType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              {ROAD_TYPE_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Miles Driven (optional)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={formData.miles}
            onChange={e => handleChange('miles', parseFloat(e.target.value) || 0)}
            className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </fieldset>

      {/* Skills & Notes Section */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> Skills Practiced & Notes
        </legend>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select skills practiced (optional)</label>
          <button
            type="button"
            onClick={() => setShowSkills(!showSkills)}
            className="mb-3 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            {showSkills ? 'Hide' : 'Show'} Skills Checklist
          </button>
          
          {showSkills && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
              {SKILLS_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
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
                    className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                  />
                  {skill}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            rows={3}
            placeholder="e.g., Practiced parallel parking on Main St, highway merge at exit 12..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Update Drive' : 'Save Drive'}
        </button>
      </div>

      {errors.durationMinutes && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {errors.durationMinutes}
        </div>
      )}
    </form>
  );
}