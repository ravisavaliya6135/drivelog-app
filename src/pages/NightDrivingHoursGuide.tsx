import { ArrowLeft, CheckCircle2, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { US_STATES } from '../types';

const SITE_URL = 'https://drivehours.app';

export function NightDrivingHoursGuide() {
  useSeo({
    title: 'How Many Night Driving Hours Are Required? | DriveHours',
    description: 'See supervised driving and night-hour requirements for every US state, then keep a clear practice log before your road test.',
    canonicalUrl: `${SITE_URL}/night-driving-hours`,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DriveHours', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Night Driving Hours', item: `${SITE_URL}/night-driving-hours` },
    ],
  };

  return (
    <article className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
        <Link to="/" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> DriveHours
        </Link>
        <span className="text-slate-400">/</span>
        <Link to="/dmv" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline">State Guides</Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Night Driving Hours</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">State requirements</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          How Many Night Driving Hours Are Required?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Night-driving requirements vary by state. Use this table to find your total supervised-practice target and night-hour target, then check your state guide before your road test.
        </p>
      </header>

      <aside className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700 dark:border-teal-900/70 dark:bg-teal-950/30 dark:text-slate-200">
        <p>
          <strong>Verify before your road test:</strong> licensing rules and forms can change. DriveHours helps you organize your practice log; your state licensing agency is the source of truth.
        </p>
      </aside>

      <section className="app-card overflow-hidden" aria-labelledby="state-requirements-table">
        <h2 id="state-requirements-table" className="sr-only">Supervised driving and night-hour requirements by state</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-700 dark:text-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">State</th>
                <th scope="col" className="px-4 py-3 font-bold text-right">Total hours</th>
                <th scope="col" className="px-4 py-3 font-bold text-right">Night hours</th>
                <th scope="col" className="px-4 py-3 font-bold text-right">Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {US_STATES.map(state => (
                <tr key={state.code}>
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    {state.name}
                  </th>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">{state.requiredHours}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">{state.requiredNightHours}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dmv/${state.code.toLowerCase()}`}
                      className="inline-flex min-h-11 items-center font-semibold text-teal-700 hover:underline dark:text-teal-300"
                    >
                      View guide
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="app-card p-6 text-center space-y-3">
        <CheckCircle2 className="w-7 h-7 text-teal-600 mx-auto" aria-hidden="true" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keep every practice drive in one place</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Track supervised drives offline, see day and night totals, and export a clear record when you are ready.
        </p>
        <Link
          to="/"
          className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-teal-600 px-8 text-sm font-bold text-white shadow-teal transition-all hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          Start Logging for Free
        </Link>
      </section>
    </article>
  );
}
