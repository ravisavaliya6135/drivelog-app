import { useState, useEffect } from 'react';
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

  const activeDriver = drivers.find(d => d.id === formData.driverId) || drivers[0] || { name: 'Alex' };
  const durationHours = Math.floor((formData.durationMinutes || 0) / 60);
  const durationMins = (formData.durationMinutes || 0) % 60;
  const formattedDuration = `${durationHours.toString().padStart(2, '0')}:${durationMins.toString().padStart(2, '0')}:00`;

  const weatherOptions = [
    { label: 'Sunny', icon: 'sunny' },
    { label: 'Cloudy', icon: 'cloud' },
    { label: 'Rainy', icon: 'rainy' },
    { label: 'Night/Fog', icon: 'foggy' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryToSave: DriveEntry = {
      id: formData.id || `drive_${Date.now()}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || new Date().toISOString(),
      endTime: formData.endTime || new Date().toISOString(),
      durationMinutes: formData.durationMinutes || 30,
      miles: formData.miles || 10,
      dayNight: formData.dayNight || 'day',
      weather: formData.weather || 'Sunny',
      roadType: formData.roadType || 'City',
      notes: formData.notes || '',
      isVerified: true,
      driverId: formData.driverId || drivers[0]?.id || '',
      vehicleId: formData.vehicleId || vehicles[0]?.id || '',
      initials: formData.initials || 'SP',
      state: selectedState,
      skills: formData.skills || ['General Practice'],
    };
    onSave(entryToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="px-2 sm:px-4 max-w-md mx-auto space-y-stack-md">
      
      {/* Celebratory Header */}
      <section className="text-center space-y-stack-sm">
        <h1 className="font-display-mobile text-display-mobile text-primary font-extrabold">
          {isEditing ? 'Edit Drive' : `Great job, ${activeDriver.name}!`}
        </h1>
        <div className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-on-secondary-container text-lg" data-weight="fill">
            social_leaderboard
          </span>
          <span className="font-label-bold text-label-bold text-xs">Milestone Drive Logged!</span>
        </div>
      </section>

      {/* Playful 3D Illustration Banner */}
      <div className="w-full h-40 bg-surface-container-lowest rounded-[20px] card-shadow overflow-hidden flex items-center justify-center border border-surface-variant relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/30 to-surface-container-lowest" />
        <img
          alt="Celebratory Trophy & Car"
          className="w-3/4 h-3/4 object-contain relative z-10"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByikw_JenbU_kexfdVI0vXwLsE_4XLwsCl-fIQ8EumCjJ4feak_5nbix4LS-KoHeVK8v9Gvy_P3i9ZLKMjFL7dEUkakN-t_K73RYK9rW1gV9woQy1Ec2V4XI7qsAiLpprn4a1ZZuhjpDQ8hjsa6fK_m94vV2d_cAIV0BmFb7c-TOgqKbWlHO_GgXbnDBNCYkqMoqJdbSCT_6To6Vd8TH9QzDK1aqbnecBr9qaEkj6McXPtKQgyhnEb"
        />
      </div>

      {/* Summary Details Card */}
      <section className="bg-surface-container-lowest rounded-[20px] p-5 card-shadow space-y-stack-md border border-surface-variant">
        <div className="flex justify-between items-end border-b border-surface-variant pb-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 font-medium">
              Total Drive Time
            </p>
            <p className="font-display-mobile text-display-mobile text-secondary font-extrabold tabular-nums">
              {formattedDuration}
            </p>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
              {new Date(formData.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="font-body-md text-body-md text-on-surface text-sm font-semibold">
              {formData.durationMinutes} mins practice
            </p>
          </div>
        </div>

        {/* Day / Night Breakdown Pill Switcher */}
        <div className="flex justify-around items-center pt-2">
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, dayNight: 'day' }))}
            className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
              formData.dayNight === 'day' ? 'bg-secondary-container/30 border border-secondary text-secondary' : 'opacity-70'
            }`}
          >
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl mb-1" data-weight="fill">
              light_mode
            </span>
            <p className="font-body-md text-sm font-bold text-on-surface">
              {formData.dayNight === 'day' ? formattedDuration : '00:00:00'}
            </p>
            <p className="font-label-sm text-xs text-on-surface-variant font-medium">Day</p>
          </button>

          <div className="h-10 w-px bg-surface-variant mx-2" />

          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, dayNight: 'night' }))}
            className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
              formData.dayNight === 'night' ? 'bg-primary-container/10 border border-primary-container text-primary-container' : 'opacity-70'
            }`}
          >
            <span className="material-symbols-outlined text-primary-fixed-dim text-2xl mb-1" data-weight="fill">
              dark_mode
            </span>
            <p className="font-body-md text-sm font-bold text-on-surface">
              {formData.dayNight === 'night' ? formattedDuration : '00:00:00'}
            </p>
            <p className="font-label-sm text-xs text-on-surface-variant font-medium">Night</p>
          </button>
        </div>
      </section>

      {/* Editable Fields: Weather & Notes */}
      <section className="space-y-stack-md">
        
        {/* Weather Chips */}
        <div className="space-y-1.5">
          <label className="font-label-bold text-label-bold text-on-surface font-bold text-sm">
            Weather Conditions
          </label>
          <div className="flex flex-wrap gap-2">
            {weatherOptions.map((opt) => {
              const isSelected = formData.weather === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, weather: opt.label }))}
                  className={`px-3.5 py-1.5 rounded-full border-2 font-label-bold text-xs flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-secondary bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Notes */}
        <div className="space-y-1.5">
          <label className="font-label-bold text-label-bold text-on-surface font-bold text-sm" htmlFor="route-notes">
            Route Notes
          </label>
          <textarea
            id="route-notes"
            rows={2}
            value={formData.notes || ''}
            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
            placeholder="How did the drive go? e.g., Practiced parallel parking and lane changes..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-[16px] p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all resize-none card-shadow"
          />
        </div>

        {/* Supervisor Initials & Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-label-bold text-label-bold text-on-surface font-bold text-xs mb-1 block">
              Supervisor Initials *
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={formData.initials || ''}
              onChange={(e) => setFormData(p => ({ ...p, initials: e.target.value.toUpperCase() }))}
              placeholder="e.g. DAD"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-sm uppercase font-bold text-center"
            />
          </div>
          <div>
            <label className="font-label-bold text-label-bold text-on-surface font-bold text-xs mb-1 block">
              Distance (Miles)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.miles || 0}
              onChange={(e) => setFormData(p => ({ ...p, miles: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-sm text-center font-bold"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-2 pb-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-full border border-outline-variant text-slate-700 font-label-bold text-sm hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-2 w-full bg-secondary text-on-secondary font-headline-md text-sm font-bold py-3.5 rounded-full btn-primary flex items-center justify-center gap-2 transition-transform shadow-md btn-3d"
        >
          <span className="material-symbols-outlined text-lg" data-weight="fill">save</span>
          Save Drive
        </button>
      </div>

    </form>
  );
}
