import { Sun, Moon, MapPin, Clock, CheckCircle, AlertCircle, ClipboardList, AlertTriangle } from 'lucide-react';
import type { DriveEntry, StateInfo } from '../types';
import { US_STATES } from '../types';

interface DriveSummaryProps {
  drives: DriveEntry[];
  selectedState: string;
  primaryDriver?: { name: string } | null;
}

export function DriveSummary({ drives, selectedState, primaryDriver }: DriveSummaryProps) {
  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4]; // Default CA

  const totals = drives.reduce(
    (acc, entry) => {
      if (entry.dayNight === 'day') {
        acc.day += entry.durationMinutes;
      } else {
        acc.night += entry.durationMinutes;
      }
      acc.total += entry.durationMinutes;
      acc.miles += entry.miles;
      return acc;
    },
    { day: 0, night: 0, total: 0, miles: 0 }
  );

  const dayHours = (totals.day / 60).toFixed(1);
  const nightHours = (totals.night / 60).toFixed(1);
  const totalHours = (totals.total / 60).toFixed(1);

  const dayProgress = Math.min((totals.day / 60) / state.requiredHours, 1);
  const nightProgress = state.requiredNightHours > 0 ? Math.min((totals.night / 60) / state.requiredNightHours, 1) : 1;
  const totalProgress = Math.min((totals.total / 60) / state.requiredHours, 1);

  const isDayComplete = totals.day / 60 >= state.requiredHours;
  const isNightComplete = totals.night / 60 >= state.requiredNightHours;
  const isTotalComplete = totals.total / 60 >= state.requiredHours && isNightComplete;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" />
            {state.name} Progress
          </h2>
          {primaryDriver && (
            <p className="text-sm text-slate-500 mt-1">Primary driver: {primaryDriver.name}</p>
          )}
        </div>
        <StateBadge state={state} />
      </div>

      {/* Overall Progress */}
      <div className="bg-slate-50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-slate-700">Total Progress</span>
          <span className="font-bold text-slate-900">{totalHours}h / {state.requiredHours}h</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTotalComplete ? 'bg-green-500' : 'bg-slate-600'
            }`}
            style={{ width: `${totalProgress * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {isTotalComplete ? (
            <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Requirements met!</span>
          ) : (
            `${((1 - totalProgress) * 100).toFixed(0)}% to go`
          )}
        </p>
      </div>

      {/* Day / Night Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Day Hours */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-slate-700">Daytime Hours</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">{dayHours}h</div>
          <div className="text-sm text-slate-500">Required: {state.requiredHours}h</div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isDayComplete ? 'bg-yellow-500' : 'bg-slate-600'}`}
              style={{ width: `${dayProgress * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isDayComplete ? '✓ Complete' : `${(state.requiredHours - totals.day / 60).toFixed(1)}h remaining`}
          </p>
        </div>

        {/* Night Hours */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-slate-700">Legal Night Hours</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">{nightHours}h</div>
          <div className="text-sm text-slate-500">Required: {state.requiredNightHours}h</div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isNightComplete ? 'bg-blue-500' : 'bg-slate-600'}`}
              style={{ width: `${nightProgress * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isNightComplete ? '✓ Complete' : `${(state.requiredNightHours - totals.night / 60).toFixed(1)}h remaining`}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Time"
          value={formatDuration(totals.total)}
          color="slate"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Total Miles"
          value={`${totals.miles} mi`}
          color="blue"
        />
        <StatCard
          icon={<ClipboardList className="w-5 h-5" />}
          label="Entries"
          value={drives.length.toString()}
          color="green"
        />
        <StatCard
          icon={isTotalComplete ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          label="Status"
          value={isTotalComplete ? 'Ready for DMV' : 'In Progress'}
          color={isTotalComplete ? 'green' : 'amber'}
        />
      </div>

      {/* State Requirements Notice */}
      {state.requiresSpecificApp && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">State-specific requirement:</p>
            <p>{state.name} may require using their official app ({state.appName}). Check your DMV.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function StateBadge({ state }: { state: StateInfo }) {
  return (
    <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
      {state.code} — {state.requiredHours}h / {state.requiredNightHours}h night
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-700',
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
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}