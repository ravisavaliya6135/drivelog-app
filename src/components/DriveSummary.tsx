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
    <div className="card-gradient space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            {state.name} Progress
          </h2>
          {primaryDriver && (
            <p className="text-sm text-muted mt-1">Primary driver: {primaryDriver.name}</p>
          )}
        </div>
        <StateBadge state={state} />
      </div>

      {/* Overall Progress */}
      <div className={`card-gradient-accent ${isTotalComplete ? 'card-gradient-success' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-slate-700">Total Progress</span>
          <span className="stat-value text-lg">{totalHours}h / {state.requiredHours}h</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-smooth ${
              isTotalComplete ? 'gradient-success' : 'gradient-primary'
            }`}
            style={{ width: `${totalProgress * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {isTotalComplete ? (
            <span className="badge-success flex items-center gap-1 w-fit"><CheckCircle className="w-4 h-4" /> Requirements met!</span>
          ) : (
            `${((1 - totalProgress) * 100).toFixed(0)}% to go`
          )}
        </p>
      </div>

      {/* Day / Night Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Day Hours */}
        <div className={`card-gradient ${isDayComplete ? 'card-gradient-warning' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span className="font-medium text-slate-700">Daytime Hours</span>
          </div>
          <div className="stat-value text-3xl tabular-nums">{dayHours}h</div>
          <div className="text-sm text-muted">Required: {state.requiredHours}h</div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-smooth ${isDayComplete ? 'gradient-warning' : 'gradient-primary'}`}
              style={{ width: `${dayProgress * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {isDayComplete ? (
              <span className="badge-success flex items-center gap-1 w-fit">✓ Complete</span>
            ) : (
              `${(state.requiredHours - totals.day / 60).toFixed(1)}h remaining`
            )}
          </p>
        </div>

        {/* Night Hours */}
        <div className={`card-gradient ${isNightComplete ? 'card-gradient-success' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <span className="font-medium text-slate-700">Legal Night Hours</span>
          </div>
          <div className="stat-value text-3xl tabular-nums">{nightHours}h</div>
          <div className="text-sm text-muted">Required: {state.requiredNightHours}h</div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-smooth ${isNightComplete ? 'gradient-success' : 'gradient-primary'}`}
              style={{ width: `${nightProgress * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {isNightComplete ? (
              <span className="badge-success flex items-center gap-1 w-fit">✓ Complete</span>
            ) : (
              `${(state.requiredNightHours - totals.night / 60).toFixed(1)}h remaining`
            )}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <p className="stat-value text-2xl tabular-nums">{formatDuration(totals.total)}</p>
          <p className="text-xs text-muted">Total Time</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <p className="stat-value text-2xl tabular-nums">{totals.miles} mi</p>
          <p className="text-xs text-muted">Total Miles</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <ClipboardList className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <p className="stat-value text-2xl tabular-nums">{drives.length}</p>
          <p className="text-xs text-muted">Entries</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className={`p-2 rounded-lg ${isTotalComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isTotalComplete ? <CheckCircle className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
            </span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${isTotalComplete ? 'text-emerald-600' : 'text-amber-600'}`}>{isTotalComplete ? 'Ready for DMV' : 'In Progress'}</p>
          <p className="text-xs text-muted">Status</p>
        </div>
      </div>

      {/* State Requirements Notice */}
      {state.requiresSpecificApp && (
        <div className="card-gradient-warning flex items-start gap-3">
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
    <div className="badge badge-primary">
      {state.code} — {state.requiredHours}h / {state.requiredNightHours}h night
    </div>
  );
}