import { Link } from 'react-router-dom';
import { WifiOff, Moon, ShieldCheck, FileText, CreditCard, Heart } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

const PROMISES = [
  {
    icon: WifiOff,
    title: 'Offline-first, always',
    text: 'Start a drive in a dead zone. Export your log on airplane mode. Your data lives on your device and works without signal — forever.',
  },
  {
    icon: ShieldCheck,
    title: 'No ads. Ever.',
    text: 'A screen teens glance at between stoplights should never show an ad. We make money from one optional unlock, not from attention.',
  },
  {
    icon: Moon,
    title: 'Accurate night-hour detection',
    text: 'We compute real sunset times for your state — not a guess from clock hours — so your night totals hold up at the DMV counter.',
  },
  {
    icon: FileText,
    title: 'DMV-ready export',
    text: 'Clean printable PDFs with signature lines, per-entry initials, and state-specific formats for the biggest states.',
  },
  {
    icon: CreditCard,
    title: 'One-time unlock, not a subscription',
    text: '$4.99 once for Lifetime Pro. No monthly fees, no dark patterns, no "your trial expired" emails.',
  },
];

export function About() {
  useSeo({
    title: 'About DriveLog — Why We Built It | DriveLog',
    description: "It's not complicated, it's just a log. Why we built an offline-first, ad-free driving hours tracker for teens and parents.",
    canonicalUrl: 'https://drivehours.app/about',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <header className="app-card-elevated p-8 sm:p-10 text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          It's not complicated, <span className="text-teal-700 dark:text-teal-400">it's just a log.</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          DriveLog helps American teens log supervised driving hours and walk into the DMV with paperwork
          that's organized, verified, and done.
        </p>
      </header>

      {/* Why we built it */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Why we built this</h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
          <p>
            Every state asks teen drivers to log dozens of supervised hours — up to 70 in Maine. And every
            family hits the same wall: paper logs get lost or filled out from memory weeks later, and the
            popular tracking apps crash, show ads between screens, demand a connection in places where
            there is none, and can't even pause a timer when you stop for gas.
          </p>
          <p>
            Hours logged over months are too important to lose to bad software. So we built the tool we
            wished existed: calm, honest, and boring in the best way. It saves everything locally, survives
            crashes, knows when the sun actually sets, and prints exactly what the DMV expects to see.
          </p>
        </div>
      </section>

      {/* Core promises */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Our promises to you</h2>
        <div className="grid gap-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="app-card p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing note */}
      <section className="app-card p-6 text-center space-y-2">
        <Heart className="w-5 h-5 text-red-400 mx-auto" aria-hidden="true" />
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
          Built by people who sat in the passenger seat too — white knuckles, empty parking lots, and all.
          Good luck out there, and congratulations on the license before you get it.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-14 px-8 mt-2 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm shadow-teal transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          Start logging for free
        </Link>
      </section>
    </div>
  );
}
