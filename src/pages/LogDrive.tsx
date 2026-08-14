import { ArrowLeft, Save, X, Calendar, MapPin, Cloud, Road, ClipboardList, UserCheck, Truck, Car, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { StateSelector } from '../components/StateSelector';
import { useDriveLog } from '../hooks/useDriveLog';
import { useNightDetection } from '../hooks/useNightDetection';
import { useTheme } from '../hooks/useTheme';
import { US_STATES, WEATHER_OPTIONS, ROAD_TYPE_OPTIONS, SKILLS_OPTIONS } from '../types';

export function LogDrive() {
  const { drivers, vehicles, loading, addDrive } = useDriveLog();
  const { getNightStatus } = useNightDetection();
  const { resolvedTheme } = useTheme();
  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });
  const [showSkills, setShowSkills] = useState(false);

  if (loading) {
    return (
      <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center safe-bottom`}>
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    localStorage.setItem('drivelog-state', stateCode);
  };

  const handleSave = async (entry: any) => {
    await addDrive(entry);
    // Navigate back to home
    window.history.back();
  };

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} pb-20 safe-bottom`}>
      {/* Header */}
      <header className="glass-header safe-top">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="btn-ghost touch-target transition-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Log Drive Manually</h1>
              <p className="text-xs text-muted">Fill in all required fields</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <section aria-labelledby="state-selector-heading">
          <h2 id="state-selector-heading" className="sr-only">Select State for DMV Log</h2>
          <div className="card-gradient-accent mb-6">
            <StateSelector
              value={selectedState}
              onChange={handleStateChange}
              showWarning={true}
            />
          </div>
        </section>

        <section aria-labelledby="log-form-heading">
          <h2 id="log-form-heading" className="sr-only">Log Drive Form</h2>
          <DriveLogEntry
            drivers={drivers}
            vehicles={vehicles}
            selectedState={selectedState}
            onSave={handleSave}
            onCancel={() => window.history.back()}
            isEditing={false}
          />
        </section>
      </main>
    </div>
  );
}