import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

const SITE_URL = 'https://drivehours.app';

export function FiftyHourDrivingLogGuide() {
  useSeo({
    title: '50-Hour Driving Log: How to Track Supervised Practice | DriveHours',
    description: 'Learn what to record in a supervised driving log, how to track day and night practice, and where to check your state’s required hours.',
    canonicalUrl: `${SITE_URL}/50-hour-driving-log`,
  });

  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'DriveHours', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: '50-Hour Driving Log', item: `${SITE_URL}/50-hour-driving-log` },
  ] };

  return <article className="max-w-3xl mx-auto space-y-6 animate-fade-in">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs"><Link to="/" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> DriveHours</Link><span className="text-slate-400">/</span><span className="text-slate-500">50-Hour Driving Log</span></nav>
    <header className="space-y-3"><div className="flex items-center gap-2"><FileText className="w-5 h-5 text-teal-600" /><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Practice record</span></div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">How to Keep a 50-Hour Driving Log</h1><p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">A 50-hour driving log is a clear record of supervised practice. Some states use 50 hours, while others require a different total, so check your state guide before you plan your practice.</p></header>
    <aside className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700 dark:border-teal-900/70 dark:bg-teal-950/30 dark:text-slate-200"><strong>Start with your state’s rule:</strong> use the official licensing agency as the source of truth for required hours, signatures, and forms.</aside>
    <section className="app-card p-5 space-y-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">What to record for every practice drive</h2><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">{['Date and start/end time','Total driving time','Whether the session counts as day or night practice','Supervising adult and any required signature','Road conditions, route, or notes that help you remember the drive'].map(item => <li key={item} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />{item}</li>)}</ul></section>
    <section className="app-card p-5 space-y-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Keep the total easy to check</h2><p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Log each drive as it happens, keep day and night totals separate, and review the record with your supervising adult before your licensing appointment. A complete, legible record is easier to compare with your state’s instructions.</p><div className="flex flex-col gap-2 text-sm font-semibold"><Link to="/dmv" className="text-teal-700 hover:underline dark:text-teal-300">Find your state’s supervised-driving requirement</Link><Link to="/night-driving-hours" className="text-teal-700 hover:underline dark:text-teal-300">See how night driving hours vary by state</Link><Link to="/does-dmv-check-driving-hours" className="text-teal-700 hover:underline dark:text-teal-300">Prepare a clear record for your licensing appointment</Link></div></section>
    <section className="app-card p-6 text-center space-y-3"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Keep your practice log together</h2><p className="text-sm text-slate-600 dark:text-slate-300">Track supervised drives offline, see your progress, and export a clear record when you are ready.</p><Link to="/" className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-teal-600 px-8 text-sm font-bold text-white shadow-teal hover:bg-teal-700">Start Logging for Free</Link></section>
  </article>;
}
