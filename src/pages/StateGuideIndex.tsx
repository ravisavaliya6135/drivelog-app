import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { US_STATES } from '../types';
import { useSeo } from '../hooks/useSeo';

/**
 * Directory of all 50 state driving-log requirement guides.
 * Hub for internal linking: Home → /dmv → /dmv/:stateCode.
 */
export function StateGuideIndex() {
  useSeo({
    title: 'Teen Driving Log Requirements by State (All 50) | DriveHours',
    description: 'Browse supervised driving hour requirements, night-hour rules, and official DMV log forms for all 50 US states. Free offline tracking with DriveHours.',
    canonicalUrl: 'https://drivehours.app/dmv',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
        <Link to="/" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> DriveHours
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">State Guides</span>
      </nav>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Requirements Database</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Teen Driving Log Requirements by State
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Pick your state to see total supervised hours, night-hour rules, permit ages, and the official
          DMV log form — plus how DriveHours tracks it all for free.
        </p>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {US_STATES.map(s => (
          <li key={s.code}>
            <Link
              to={`/dmv/${s.code.toLowerCase()}`}
              className="app-card p-3.5 block hover:border-teal-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[64px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{s.name}</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">{s.code}</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                {s.requiredHours}h total · {s.requiredNightHours}h night
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="app-card p-6 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Track every hour automatically — with legal night detection and DMV-ready PDF export.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm shadow-teal transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          Start Logging for Free
        </Link>
      </div>
    </div>
  );
}
