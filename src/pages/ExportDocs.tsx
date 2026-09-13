import { useState } from 'react';
import {
  Download,
  Share2,
  CheckCircle2,
  Printer,
  MapPin,
  Clock,
  FileCheck
} from 'lucide-react';
import { useDriveLog } from '../hooks/useDriveLog';
import { StateSelector } from '../components/StateSelector';
import { US_STATES } from '../types';
import { useSeo } from '../hooks/useSeo';

export function ExportDocs() {
  useSeo({
    title: 'DMV Driving Log PDF Export & 50-State Compliance | DriveLog',
    description: 'Generate an official state DMV-compliant supervised driving practice log PDF report for your road test licensing appointment.',
    canonicalUrl: 'https://www.drivehours.app/export',
    noindex: true,
  });

  const { drives, drivers, vehicles, dayMinutes, nightMinutes, totalHours } = useDriveLog();
  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0] || {
    id: 'driver_default',
    name: 'Alex Teen',
    permitNumber: 'P1234567',
    permitIssueDate: '2024-01-01',
    targetDate: '2024-12-31',
    requiredHours: 50,
    requiredNightHours: 10,
    isPrimaryDriver: true,
  };

  const primaryVehicle = vehicles[0] || {
    id: 'veh_default',
    name: 'Family Vehicle',
    make: 'Toyota',
    model: 'RAV4',
    year: 2022,
    licensePlate: '7XYZ123',
  };

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];
  const totalHoursVal = Number(totalHours.toFixed(1));
  const dayHoursVal = Number((dayMinutes / 60).toFixed(1));
  const nightHoursVal = Number((nightMinutes / 60).toFixed(1));

  const isNightMet = nightHoursVal >= state.requiredNightHours;
  const isTotalMet = totalHoursVal >= state.requiredHours;
  const isDmvReady = isTotalMet && isNightMet;

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const { generatePDF, downloadPDF } = await import('../utils/pdf');
      const blob = await generatePDF(drives, primaryDriver, primaryVehicle, selectedState);
      downloadPDF(blob, `DriveLog-${state.code}-${new Date().toISOString().split('T')[0]}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DriveLog Supervised Practice Report (${state.code})`,
          text: `Teen driving progress: ${totalHoursVal} total hours logged (${dayHoursVal}h Day, ${nightHoursVal}h Night).`,
          url: window.location.origin,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleGeneratePdf();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-sm dark:bg-teal-700">
            <FileCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Document center</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">DMV log export</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review your state requirements, then create a clean record to bring to your licensing appointment.
            </p>
          </div>
        </div>
      </header>

      {/* 2. State & Format Selector */}
      <section className="app-card space-y-4 p-5" aria-labelledby="export-state-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="export-state-heading" className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
              Licensing state
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Requirements and report details update with this selection.</p>
          </div>
          <span className="badge-teal">
            {state.code} DMV Form
          </span>
        </div>

        <StateSelector
          value={selectedState}
          onChange={(newCode) => {
            setSelectedState(newCode);
            localStorage.setItem('drivelog-state', newCode);
          }}
        />
      </section>

      {/* 3. Document Readiness Preview Card */}
      <section className="app-card-elevated space-y-6 p-5 sm:p-6" aria-labelledby="document-readiness-heading">
        
        {/* Document Header Preview */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-teal flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Document readiness</p>
              <h2 id="document-readiness-heading" className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {state.name} Driving Log Report
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Driver:</span> {primaryDriver.name}
                <span aria-hidden="true"> · </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Vehicle:</span> {primaryVehicle.name}
              </p>
            </div>
          </div>

          <span className={`w-fit text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 flex items-center gap-1 ${
            isDmvReady
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {isDmvReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {isDmvReady ? 'DMV Ready' : 'In Progress'}
          </span>
        </div>

        {/* Readiness Bento Stats */}
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Total logged</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
              {totalHoursVal}h
            </dd>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">of {state.requiredHours}h required</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Day practice</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
              {dayHoursVal}h
            </dd>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">of {state.requiredHours - state.requiredNightHours}h target</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Night practice</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
              {nightHoursVal}h
            </dd>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">of {state.requiredNightHours}h required</p>
          </div>
        </dl>

        {/* Success Alert */}
        {downloadSuccess && (
          <div role="status" className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>PDF generated and downloaded successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={isGenerating || drives.length === 0}
            onClick={handleGeneratePdf}
            className="btn-primary w-full min-h-16 text-base font-bold shadow-teal flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Compiling DMV PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate Official DMV PDF ({drives.length} Drives)</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary min-h-12 py-3 text-sm font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Summary</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              className="btn-secondary min-h-12 py-3 text-sm font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>Print Preview</span>
            </button>
          </div>
        </div>

        <p className="border-t border-slate-200 pt-4 text-center text-xs leading-5 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Complies with state DMV log formats. All calculations are stored locally on your device.
        </p>

      </section>

    </div>
  );
}
