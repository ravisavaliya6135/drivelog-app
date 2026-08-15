import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDriveLog } from '../hooks/useDriveLog';
import { useEntitlement } from '../contexts/EntitlementContext';
import { UpgradeCard, UpgradeModal } from '../components/UpgradeModal';
import { US_STATES } from '../types';
import { DriveTimer } from '../components/DriveTimer';
import { DriveLogEntry } from '../components/DriveLogEntry';

export function Home() {
  const navigate = useNavigate();
  const { isPro, isLimitReached, isApproachingLimit } = useEntitlement();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
  } = useDriveLog();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  // Modal deep links
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [editingDrive, setEditingDrive] = useState<typeof drives[0] | null>(null);

  useEffect(() => {
    const modal = searchParams.get('modal');
    const editId = searchParams.get('edit');

    if (modal === 'timer') {
      setShowTimerModal(true);
      setShowLogEntry(false);
    } else if (modal === 'log-entry') {
      setShowLogEntry(true);
      setShowTimerModal(false);
      if (editId) {
        const d = drives.find(item => item.id === editId);
        if (d) setEditingDrive(d);
      }
    } else {
      setShowTimerModal(false);
      setShowLogEntry(false);
      setEditingDrive(null);
    }
  }, [searchParams, drives]);

  const updateModalUrl = (modal: string | null, editId?: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (modal) {
      params.set('modal', modal);
      if (editId) params.set('edit', editId);
      else params.delete('edit');
    } else {
      params.delete('modal');
      params.delete('edit');
    }
    setSearchParams(params, { replace: true });
  };

  const handleTimerComplete = (data: { durationMinutes: number; startTime: Date; endTime: Date }) => {
    setShowTimerModal(false);
    setShowLogEntry(true);
    updateModalUrl('log-entry');
    const today = new Date().toISOString().split('T')[0];
    const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
    const primaryVehicle = vehicles[0];

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
    setEditingDrive(null);
    updateModalUrl(null);
    sessionStorage.removeItem('timer-drive-data');
  };

  const handleLogEntryCancel = () => {
    setShowLogEntry(false);
    setEditingDrive(null);
    updateModalUrl(null);
  };

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];
  const requiredHours = state.requiredHours || 50;
  const currentTotalHours = Math.round(totalHours);
  const dayHoursVal = Math.round(dayMinutes / 60);
  const nightHoursVal = Math.round(nightMinutes / 60);

  // SVG Progress Ring calculations
  const circumference = 251.2;
  const dayProgressRatio = Math.min((dayMinutes / 60) / requiredHours, 1);
  const dayOffset = circumference - dayProgressRatio * circumference;
  const totalProgressRatio = Math.min(totalHours / requiredHours, 1);
  const totalOffset = circumference - totalProgressRatio * circumference;

  const milestoneText = totalProgressRatio >= 1
    ? 'All 50 Hours Completed! 🎉'
    : totalProgressRatio >= 0.5
    ? 'Over halfway there! 🚀'
    : totalProgressRatio >= 0.25
    ? 'Great start, keep it up! 💪'
    : 'Almost halfway! 🎉';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 px-margin-mobile flex flex-col gap-stack-lg max-w-md mx-auto overflow-y-auto">
      
      {/* Progress Section */}
      <section className="bg-surface-container-lowest rounded-[24px] p-6 card-shadow flex flex-col items-center justify-center mt-2 border border-surface-container-high/40">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-4">
          {/* SVG Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              className="text-surface-container-high stroke-current"
              cx="50"
              cy="50"
              fill="transparent"
              r="40"
              strokeWidth="12"
            />
            {/* Progress Ring (Day) */}
            <circle
              className="text-secondary stroke-current progress-ring__circle"
              cx="50"
              cy="50"
              fill="transparent"
              r="40"
              strokeDasharray="251.2"
              strokeDashoffset={dayOffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
            {/* Progress Ring (Night - Stacked) */}
            <circle
              className="text-primary-container stroke-current progress-ring__circle"
              cx="50"
              cy="50"
              fill="transparent"
              r="40"
              strokeDasharray="251.2"
              strokeDashoffset={totalOffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="flex flex-col items-center text-center z-10">
            <span className="font-display-mobile text-display-mobile text-primary font-extrabold">{currentTotalHours}</span>
            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">/ {requiredHours} hrs</span>
          </div>
        </div>

        <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-bold text-label-bold inline-flex items-center gap-2 mb-6 shadow-sm">
          <span>{milestoneText}</span>
        </div>

        {/* Stats Breakdown */}
        <div className="flex w-full justify-around gap-4 border-t border-surface-container pt-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center text-secondary mb-1">
              <span className="material-symbols-outlined material-symbols-fill text-2xl">light_mode</span>
            </div>
            <span className="font-headline-md text-headline-md text-primary font-bold">{dayHoursVal}h</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Day</span>
          </div>
          <div className="w-px bg-surface-container self-stretch" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container mb-1">
              <span className="material-symbols-outlined material-symbols-fill text-2xl">dark_mode</span>
            </div>
            <span className="font-headline-md text-headline-md text-primary font-bold">{nightHoursVal}h</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Night</span>
          </div>
        </div>
      </section>

      {/* Tasteful Upgrade Card when approaching or reached 20 hours */}
      {(isApproachingLimit || isLimitReached) && (
        <UpgradeCard onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {/* Recent Drives Carousel */}
      <section className="flex flex-col gap-stack-sm mt-2">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">Recent Drives</h2>
          <button
            onClick={() => navigate('/log')}
            className="font-label-bold text-label-bold text-secondary flex items-center hover:opacity-80 transition-opacity"
          >
            View All <span className="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
          </button>
        </div>

        {drives.length > 0 ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-gutter pb-4 -mx-margin-mobile px-margin-mobile snap-x snap-mandatory">
            {drives.slice(0, 5).map((drive) => {
              const driver = drivers.find(d => d.id === drive.driverId);
              const durationHours = Math.floor(drive.durationMinutes / 60);
              const durationMins = drive.durationMinutes % 60;
              const formattedDuration = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

              return (
                <div
                  key={drive.id}
                  onClick={() => {
                    setEditingDrive(drive);
                    setShowLogEntry(true);
                    updateModalUrl('log-entry', drive.id);
                  }}
                  className="bg-surface-container-lowest rounded-[20px] p-5 min-w-[260px] max-w-[280px] snap-center card-shadow border border-surface-container-high/50 flex-shrink-0 cursor-pointer hover:border-secondary transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`rounded-lg px-3 py-1 font-label-sm text-label-sm flex items-center gap-1 font-bold ${
                      drive.dayNight === 'night'
                        ? 'bg-primary-container/10 text-primary-container'
                        : 'bg-secondary-container/30 text-on-secondary-container'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {drive.dayNight === 'night' ? 'dark_mode' : 'sunny'}
                      </span>{' '}
                      {drive.dayNight === 'night' ? 'Night' : 'Day'}
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="font-headline-lg text-headline-lg text-primary font-bold mb-1">{formattedDuration}</div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-container">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-xs font-bold text-on-surface-variant">
                      {driver?.name ? driver.name[0].toUpperCase() : 'D'}
                    </div>
                    <span className="font-body-md text-sm text-on-surface-variant font-medium">
                      {driver?.name || 'Driver'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-[20px] p-6 text-center card-shadow border border-surface-container-high/50">
            <p className="text-on-surface-variant text-sm">No drives logged yet. Start your first supervised trip below!</p>
          </div>
        )}
      </section>

      {/* 3D CTA Button Zone */}
      <div className="mt-auto pt-4 pb-2 flex justify-center sticky bottom-[90px] z-30">
        <button
          onClick={() => {
            setShowTimerModal(true);
            updateModalUrl('timer');
          }}
          className="bg-[#0D9488] text-white w-full max-w-sm rounded-[24px] h-[72px] flex items-center justify-center gap-3 font-headline-md text-headline-md font-bold transition-all duration-200 btn-3d shadow-lg"
        >
          <span className="material-symbols-outlined material-symbols-fill text-3xl">play_arrow</span>
          Start Drive
        </button>
      </div>

      {/* Live Driving Timer Modal / Sheet */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-background max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-2">
              <span className="font-headline-md text-headline-md text-primary font-bold">Live Driving Session</span>
              <button
                onClick={() => {
                  setShowTimerModal(false);
                  updateModalUrl(null);
                }}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <DriveTimer onDriveComplete={handleTimerComplete} />
          </div>
        </div>
      )}

      {/* Celebratory Summary & Save Drive Modal */}
      {showLogEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-background max-w-md w-full rounded-t-[32px] sm:rounded-[32px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-2">
              <span className="font-headline-md text-headline-md text-primary font-bold">Drive Summary</span>
              <button
                onClick={handleLogEntryCancel}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={
          isLimitReached 
            ? 'You have tracked 20 hours on the free tier. Unlock Lifetime Pro for unlimited driving logs.' 
            : undefined
        }
      />

    </main>
  );
}