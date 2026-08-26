import { Link, useParams } from 'react-router-dom';
import { MapPin, Moon, Sun, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { StateInfo } from '../types';
import { US_STATES } from '../types';
import { useSeo } from '../hooks/useSeo';

const SITE_URL = 'https://drivehours.app';

function formatAge(age?: number): string {
  if (age === undefined) return 'Varies — check DMV';
  return Number.isInteger(age) ? `${age} years` : `${age} years`;
}

/** True when dmvFormName is a specific form code (e.g. "MV-262") vs a generic label. */
function hasFormCode(formName?: string): boolean {
  return Boolean(formName && /\d/.test(formName));
}

export function getStateByCode(code?: string): StateInfo | undefined {
  if (!code) return undefined;
  return US_STATES.find(s => s.code.toLowerCase() === code.toLowerCase());
}

export function StateGuide() {
  const { stateCode } = useParams<{ stateCode: string }>();
  const state = getStateByCode(stateCode);

  // Generate meta tags even before we know if the state is valid (avoids hook order issues)
  const seoState = state || US_STATES[0];
  const seoValid = Boolean(state);

  useSeo({
    title: `${seoState.name} Teen Driving Log Requirements | DriveLog`,
    description: `Track your ${seoState.name} supervised driving hours with legal night detection. DMV-ready PDF export. Free to start.`,
    canonicalUrl: `${SITE_URL}/dmv/${seoState.code}`,
    noindex: !seoValid,
  });

  if (!state) {
    return (
      <div className="app-card p-10 text-center space-y-4 animate-fade-in">
        <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
        <h1 className="font-bold text-base text-slate-900 dark:text-white">State not found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We don't have a guide for "{stateCode}". Browse all states below.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2">
          {US_STATES.map(s => (
            <Link
              key={s.code}
              to={`/dmv/${s.code.toLowerCase()}`}
              className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950"
            >
              {s.code}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const dayHoursNeeded = state.requiredHours - state.requiredNightHours;
  const otherStates = US_STATES.filter(s => s.code !== state.code).slice(0, 11);
  const year = new Date().getFullYear();

  // FAQPage structured data for rich search snippets — generated per state
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How many driving hours are required in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${state.name} requires ${state.requiredHours} total supervised driving hours, including at least ${state.requiredNightHours} hours of night driving.`,
        },
      },
      {
        '@type': 'Question',
        name: `What counts as night driving in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Night driving generally begins around civil twilight or roughly 30 minutes after sunset and ends at sunrise. ${state.name} requires at least ${state.requiredNightHours} of the ${state.requiredHours} supervised hours to be completed at night.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the official DMV driving log form for ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: state.dmvFormName
            ? `${state.name} uses form ${state.dmvFormName}. DriveLog generates a printable log formatted to match its requirements.`
            : `${state.name} accepts a generic supervised driving log that includes dates, durations, and supervisor initials.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I use a digital driving log app in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. DriveLog is a free offline-first app that automatically tracks your ${state.name} supervised driving hours, detects legal night driving, and exports a printable DMV-ready PDF log.`,
        },
      },
    ],
  };

  return (
    <article className="space-y-6 animate-fade-in max-w-3xl">

      {/* FAQPage structured data for rich search snippets.
          dangerouslySetInnerHTML is required so quotes are NOT HTML-escaped
          (crawlers parse this as raw JSON). Content is app-generated, no user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
        <Link to="/" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> DriveLog
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{state.name} Driving Requirements</span>
      </nav>

      {/* H1 */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {state.name} Teen Driving Log Requirements ({year})
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Everything teens and parents need to know about supervised practice hours,
          night driving rules, and DMV paperwork for a {state.name} provisional license.
        </p>
      </header>

      {/* Quick Reference Table */}
      <section className="app-card overflow-hidden" aria-label={`${state.name} quick reference`}>
        <h2 className="sr-only">{state.name} requirements at a glance</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 w-1/2">
                Total supervised hours
              </th>
              <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                {state.requiredHours} hours
              </td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Night hours required
              </th>
              <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                {state.requiredNightHours} hours
              </td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Day hours (non-night)
              </th>
              <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {dayHoursNeeded} hours
              </td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Minimum permit age
              </th>
              <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                {formatAge(state.minPermitAge)}
              </td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Minimum license age
              </th>
              <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                {formatAge(state.minLicenseAge)}
              </td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Official DMV log form
              </th>
              <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                {state.dmvFormName ? (
                  <a
                    href={state.dmvFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {hasFormCode(state.dmvFormName) ? `Form ${state.dmvFormName}` : 'Official supervised driving log'}
                  </a>
                ) : (
                  <span>Generic log accepted</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Night driving explainer */}
      <section className="app-card p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-500" />
          What counts as night driving in {state.name}?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Most states — including {state.name} — define legal night driving astronomically, not by a fixed
          clock time. Night hours generally begin around civil twilight or roughly{' '}
          <strong className="text-slate-800 dark:text-slate-200">30 minutes after sunset</strong>, and end
          around sunrise. That means a drive at 8:45 PM in June may count as day, while a 6:00 PM drive in
          December counts as night.
        </p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>{state.name} requires at least <strong>{state.requiredNightHours} of your {state.requiredHours} hours</strong> to be completed at night.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Sunset shifts daily — a fixed schedule like "drive after 7 PM" can misclassify hours on your DMV log.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>DriveLog calculates sunset for your location automatically and classifies each session as day or night using official astronomical data — no guesswork.</span>
          </li>
        </ul>
      </section>

      {/* How DriveLog helps */}
      <section className="app-card p-5 space-y-3 bg-gradient-to-br from-teal-50/60 to-transparent dark:from-teal-950/30">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          Track your {state.name} hours the easy way
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          DriveLog's free driving timer works 100% offline, auto-detects legal night hours, tracks multiple
          supervisors and vehicles, and exports a printable{hasFormCode(state.dmvFormName) ? ` ${state.dmvFormName}-style` : ''} log
          formatted for the {state.name} DMV — including signature lines and per-entry initials.
        </p>
      </section>

      {/* Primary CTA */}
      <div className="space-y-3">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full h-16 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-base shadow-teal transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          Start Logging for Free
        </Link>
        <p className="text-center text-[11px] text-slate-400">
          Free for your first 20 hours • No account required • Works offline
        </p>
      </div>

      {/* Internal linking: related state guides */}
      <section className="pt-2 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Other state guides
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {otherStates.map(s => (
            <Link
              key={s.code}
              to={`/dmv/${s.code.toLowerCase()}`}
              className="px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950 transition-colors text-center"
            >
              {s.name}
            </Link>
          ))}
          <Link
            to="/dmv"
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </section>

    </article>
  );
}
