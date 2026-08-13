import { Plus, Car, MapPin, Sun, Moon, Clock, CheckCircle, AlertCircle, ChevronRight, Download, Settings } from 'lucide-react';
import { useState } from 'react';
import { DriveTimer } from '../components/DriveTimer';
import { DriveSummary } from '../components/DriveSummary';
import { DriveLogEntry } from '../components/DriveLogEntry';
import { StateSelector } from '../components/StateSelector';
import { useDriveLog } from '../hooks/useDriveLog';
import { useNightDetection } from '../hooks/useNightDetection';
import { US_STATES } from '../types';

export function Home() {
  const { 
    drives, 
    drivers, 
    vehicles, 
    loading, 
    todaysDrives,
    dayMinutes, 
    nightMinutes, 
    totalHours,
    addDrive,
    refresh,
  } = useDriveLog();
  
  const { isNight } = useNightDetection();
  const [selectedState, setSelectedState] = useState(() => {
    // Try to get saved state from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);

  // Save state preference
  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    localStorage.setItem('drivelog-state', stateCode);
  };

  const handleTimerComplete = (data: { durationMinutes: number; startTime: Date; endTime: Date }) => {
    setShowLogEntry(true);
    setEditingDrive(null);
    // Pre-fill the form with timer data
    const today = new Date().toISOString().split('T')[0];
    const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    const primaryVehicle = vehicles[0];
    
    // Store timer data for the form
    sessionStorage.setItem('timer-drive-data', JSON.stringify({
      date: today,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      durationMinutes: data.durationMinutes,
      driverId: primaryDriver?.id || '',
      vehicleId: primaryVehicle?.id || '',
    }));
  };

  const handleLogEntrySave = (entry: any) => {
    addDrive(entry);
    setShowLogEntry(false);
    sessionStorage.removeItem('timer-drive-data');
  };

  const handleLogEntryCancel = () => {
    setShowLogEntry(false);
    setEditingDrive(null);
  };

  const handleEditDrive = (drive: any) => {
    setEditingDrive(drive);
    setShowLogEntry(true);
  };

  const handleDeleteDrive = async (id: string) => {
    if (confirm('Delete this drive entry?')) {
      // We need to use the removeDrive from useDriveLog
      // For now, just refresh
      refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your driving log...</p>
        </div>
      </div>
    );
  }

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DriveLog</h1>
                <p className="text-xs text-slate-500">Teen Driving Hours Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StateSelector 
                value={selectedState} 
                onChange={handleStateChange} 
                className="w-48"
                showWarning={false}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Timer Card - Always visible at top */}
        <section aria-labelledby="timer-heading">
          <h2 id="timer-heading" className="sr-only">Driving Timer</h2>
          <DriveTimer onDriveComplete={handleTimerComplete} />
        </section>

        {/* Today's Quick Stats */}
        <section aria-labelledby="today-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="today-heading" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              Today's Progress
            </h2>
            {todaysDrives.length > 0 && (
              <span className="text-sm text-slate-500">{todaysDrives.length} drive{ todaysDrives.length !== 1 ? 's' : '' } logged</span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Total Today"
              value={todaysDrives.reduce((sum, d) => sum + d.durationMinutes, 0) > 0 
                ? `${Math.floor(todaysDrives.reduce((sum, d) => sum + d.durationMinutes, 0) / 60)}h ${todaysDrives.reduce((sum, d) => sum + d.durationMinutes, 0) % 60}m`
                : '0m'}
              color="slate"
            />
            <StatCard
              icon={<Sun className="w-5 h-5" />}
              label="Day"
              value={todaysDrives.filter(d => d.dayNight === 'day').reduce((sum, d) => sum + d.durationMinutes, 0) > 0
                ? `${Math.floor(todaysDrives.filter(d => d.dayNight === 'day').reduce((sum, d) => sum + d.durationMinutes, 0) / 60)}h ${todaysDrives.filter(d => d.dayNight === 'day').reduce((sum, d) => sum + d.durationMinutes, 0) % 60}m`
                : '0m'}
              color="yellow"
            />
            <StatCard
              icon={<Moon className="w-5 h-5" />}
              label="Night"
              value={todaysDrives.filter(d => d.dayNight === 'night').reduce((sum, d) => sum + d.durationMinutes, 0) > 0
                ? `${Math.floor(todaysDrives.filter(d => d.dayNight === 'night').reduce((sum, d) => sum + d.durationMinutes, 0) / 60)}h ${todaysDrives.filter(d => d.dayNight === 'night').reduce((sum, d) => sum + d.durationMinutes, 0) % 60}m`
                : '0m'}
              color="blue"
            />
          </div>
        </section>

        {/* Overall Progress Summary */}
        <DriveSummary 
          drives={drives} 
          selectedState={selectedState} 
          primaryDriver={primaryDriver || null} 
        />

        {/* Quick Actions */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ActionCard
              icon={<Plus className="w-5 h-5" />}
              title="Log Drive Manually"
              description="Add a past drive entry"
              onClick={() => { setShowLogEntry(true); setEditingDrive(null); }}
            />
            <ActionCard
              icon={<Download className="w-5 h-5" />}
              title="Export PDF"
              description="Generate DMV log"
              onClick={() => { /* Navigate to export */ }}
            />
            <ActionCard
              icon={<MapPin className="w-5 h-5" />}
              title="Change State"
              description={`Current: ${state.name}`}
              onClick={() => { /* State selector is in header */ }}
            />
            <ActionCard
              icon={<Settings className="w-5 h-5" />}
              title="Settings"
              description="Drivers, vehicles, preferences"
              onClick={() => { /* Navigate to settings */ }}
            />
          </div>
        </section>

        {/* Recent Drives */}
        {drives.length > 0 && (
          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-heading" className="text-lg font-semibold text-slate-900">Recent Drives</h2>
              <span className="text-sm text-slate-500">{drives.length} total entries</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {drives.slice(0, 5).map(drive => (
                <DriveRow 
                  key={drive.id} 
                  drive={drive} 
                  drivers={drivers}
                  vehicles={vehicles}
                  onEdit={handleEditDrive}
                  onDelete={handleDeleteDrive}
                />
              ))}
              {drives.length > 5 && (
                <div className="px-4 py-3 border-t border-slate-200 text-center">
                  <span className="text-sm text-slate-500">+ {drives.length - 5} more entries</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {drives.length === 0 && (
          <section className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No drives logged yet</h3>
            <p className="text-slate-500 mb-6">Start your first drive using the timer above, or log a past drive manually.</p>
            <button
              onClick={() => { setShowLogEntry(true); setEditingDrive(null); }}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700 flex items-center justify-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Log First Drive
            </button>
          </section>
        )}

        {/* Modal for Drive Entry */}
        {showLogEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto" style={{ maxHeight: '100vh' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mt-10 mb-10">
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
      </main>
    </div>
  );
}

// Helper components
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.slate}`}>
          {icon}
        </span>
      </div>
      <p className="text-xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
    >
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600 mb-3">{icon}</div>
      <h3 className="font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  );
}

function DriveRow({ drive, drivers, vehicles, onEdit, onDelete }: { drive: any; drivers: any[]; vehicles: any[]; onEdit: (drive: any) => void; onDelete: (id: string) => void }) {
  const driver = drivers.find(d => d.id === drive.driverId);
  const vehicle = vehicles.find(v => v.id === drive.vehicleId);
  
  return (
    <div className="px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${drive.dayNight === 'night' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {drive.dayNight === 'night' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-medium text-slate-900">{driver?.name || 'Unknown'}</p>
            <p className="text-sm text-slate-500">
              {new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
              {drive.durationMinutes} min • 
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown vehicle'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(drive)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
            aria-label="Edit"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}