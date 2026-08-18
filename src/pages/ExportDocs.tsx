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
    canonicalUrl: 'https://drivelog-app.vercel.app/export',
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
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">DMV Log Export</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate an official, DMV-compliant driving log PDF for your state licensing appointment.
        </p>
      </div>

      {/* 2. State & Format Selector */}
      <div className="app-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            Target State Requirement
          </label>
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
      </div>

      {/* 3. Document Readiness Preview Card */}
      <div className="app-card-elevated p-6 space-y-5">
        
        {/* Document Header Preview */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-teal flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {state.name} Driving Log Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Driver: <strong className="text-slate-700 dark:text-slate-300">{primaryDriver.name}</strong> • Vehicle: <strong className="text-slate-700 dark:text-slate-300">{primaryVehicle.name}</strong>
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${
            isDmvReady
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {isDmvReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {isDmvReady ? 'DMV Ready' : 'In Progress'}
          </span>
        </div>

        {/* Readiness Bento Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Logged</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalHoursVal}h
            </span>
            <span className="text-[10px] text-slate-400 block">/ {state.requiredHours}h target</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Day Practice</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {dayHoursVal}h
            </span>
            <span className="text-[10px] text-slate-400 block">/ {state.requiredHours - state.requiredNightHours}h target</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Night Practice</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {nightHoursVal}h
            </span>
            <span className="text-[10px] text-slate-400 block">/ {state.requiredNightHours}h target</span>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
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
            className="btn-primary w-full h-14 text-base font-bold shadow-teal flex items-center justify-center gap-2 disabled:opacity-50"
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
              className="btn-secondary py-3 text-xs font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Summary</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              className="btn-secondary py-3 text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>Print Preview</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          Complies with state DMV log formats. All calculations are stored locally on your device.
        </p>

      </div>

    </div>
  );
}