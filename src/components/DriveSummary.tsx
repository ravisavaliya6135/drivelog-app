import { Sun, Moon, MapPin, Clock, CheckCircle2, Award, Route, ShieldCheck, Zap } from 'lucide-react';
import type { DriveEntry } from '../types';
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
      acc.miles += entry.miles || 0;
      return acc;
    },
    { day: 0, night: 0, total: 0, miles: 0 }
  );

  const dayHoursVal = totals.day / 60;
  const nightHoursVal = totals.night / 60;
  const totalHoursVal = totals.total / 60;

  const dayHours = dayHoursVal.toFixed(1);
  const nightHours = nightHoursVal.toFixed(1);
  const totalHours = totalHoursVal.toFixed(1);

  const dayProgress = Math.min(dayHoursVal / (state.requiredHours || 1), 1);
  const nightProgress = state.requiredNightHours > 0 ? Math.min(nightHoursVal / state.requiredNightHours, 1) : 1;
  const totalProgress = Math.min(totalHoursVal / (state.requiredHours || 1), 1);

  const isDayComplete = dayHoursVal >= state.requiredHours;
  const isNightComplete = nightHoursVal >= state.requiredNightHours;
  const isTotalComplete = totalHoursVal >= state.requiredHours && isNightComplete;

  const remainingTotalHours = Math.max(0, state.requiredHours - totalHoursVal).toFixed(1);
  const remainingNightHours = Math.max(0, state.requiredNightHours - nightHoursVal).toFixed(1);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Overall Progress Panel */}
      <div className={`glass-panel p-6 md:p-8 border ${isTotalComplete ? 'border-emerald-500/40 glow-emerald' : 'border-indigo-500/20'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {state.name} DMV Requirements
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {primaryDriver ? `Tracking progress for ${primaryDriver.name}` : 'Supervised driving hour compliance'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="glass-pill text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              State Goal: {state.requiredHours}h Total ({state.requiredNightHours}h Night)
            </span>
          </div>
        </div>

        {/* Primary Glow Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Overall Completion
            </span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
              {totalHours} <span className="text-xs font-normal text-muted">/ {state.requiredHours} hrs</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-sans">
                {Math.round(totalProgress * 100)}%
              </span>
            </span>
          </div>

          <div className="w-full h-4 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                isTotalComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 shadow-indigo-500/50'
              }`}
              style={{ width: `${totalProgress * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-muted pt-1">
            <span>{isTotalComplete ? '🎉 100% DMV Supervised Requirements Met!' : `${remainingTotalHours} hours remaining`}</span>
            <span>{drives.length} total logged sessions</span>
          </div>
        </div>

        {/* Dual Day vs Night Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDayComplete
              ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/5'
              : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Daytime Hours</span>
              </div>
              {isDayComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Met
                </span>
              ) : (
                <span className="text-[11px] text-muted">{Math.round(dayProgress * 100)}%</span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{dayHours}h</span>
              <span className="text-xs text-muted">/ {state.requiredHours - state.requiredNightHours}h day target</span>
            </div>

            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${dayProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Night Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isNightComplete
              ? 'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-500/5'
              : 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Legal Night Hours</span>
              </div>
              {isNightComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Met
                </span>
              ) : (
                <span className="text-[11px] text-muted">{remainingNightHours}h left</span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{nightHours}h</span>
              <span className="text-xs text-muted">/ {state.requiredNightHours}h mandatory</span>
            </div>

            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${nightProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <p className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatDuration(totals.total)}</p>
          <p className="text-[11px] text-muted uppercase font-medium">Logged Time</p>
        </div>

        <div className="glass-panel p-3.5 text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2">
            <Route className="w-4 h-4" />
          </div>
          <p className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{totals.miles.toFixed(1)} mi</p>
          <p className="text-[11px] text-muted uppercase font-medium">Total Distance</p>
        </div>

        <div className="glass-panel p-3.5 text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto mb-2">
            <Award className="w-4 h-4" />
          </div>
          <p className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-white tabular-nums">{drives.length}</p>
          <p className="text-[11px] text-muted uppercase font-medium">Trips Logged</p>
        </div>

        <div className="glass-panel p-3.5 text-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2 ${
            isTotalComplete ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          }`}>
            {isTotalComplete ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <p className={`text-sm md:text-base font-bold truncate ${isTotalComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {isTotalComplete ? 'DMV Ready' : 'In Training'}
          </p>
          <p className="text-[11px] text-muted uppercase font-medium">License Status</p>
        </div>
      </div>
    </div>
  );
}