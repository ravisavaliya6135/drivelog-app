import { useState } from 'react';
import { Download, Printer, CheckCircle, AlertTriangle, FileText, Loader2, Lock } from 'lucide-react';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';
import { US_STATES } from '../types';
import { useEntitlement } from '../contexts/EntitlementContext';
import { UpgradeModal } from './UpgradeModal';
import { trackEvent } from '../utils/analytics';

// NOTE: @react-pdf/renderer (~1.3MB) is intentionally NOT statically imported.
// It is loaded on demand via dynamic import() inside handleGenerate/handlePrint
// so the Export page itself stays lightweight for users who are only previewing
// their totals. Repeat imports resolve instantly from the module cache.

interface PdfExportProps {
  drives: DriveEntry[];
  driver: DriverProfile | null;
  vehicle: VehicleProfile | null;
  selectedState: string;
  isReady: boolean;
}

export function PdfExport({ drives, driver, vehicle, selectedState, isReady }: PdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Paywall: DMV PDF export is blocked once the free tier limit is exceeded.
  const { isPro, isLimitReached } = useEntitlement();
  const exportBlocked = !isPro && isLimitReached;

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

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

  const totalHoursLogged = totals.total / 60;
  const nightHoursLogged = totals.night / 60;
  const totalCheckPassed = totalHoursLogged >= state.requiredHours;
  const nightCheckPassed = nightHoursLogged >= state.requiredNightHours;
  const isTotalComplete = totalCheckPassed && nightCheckPassed;

  const handleGenerate = async () => {
    if (!driver || !vehicle || drives.length === 0) return;
    if (exportBlocked) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { generatePDF, downloadPDF } = await import('../utils/pdf');
      const blob = await generatePDF(drives, driver, vehicle, selectedState);
      downloadPDF(blob, `DriveHours-${state.code}-${new Date().toISOString().split('T')[0]}.pdf`);
      // Business analytics: export volume per state (no PII)
      void trackEvent('pdf_exported', {
        state: selectedState,
        totalHours: Number((totals.total / 60).toFixed(1)),
      });
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!driver || !vehicle || drives.length === 0) return;
    if (exportBlocked) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { generatePDF } = await import('../utils/pdf');
      const blob = await generatePDF(drives, driver, vehicle, selectedState);
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }, 500);
        };
      }
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (err) {
      setError('Failed to generate PDF for printing.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isReady) {
    return (
      <div className="card-gradient text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No drives logged yet</h3>
        <p className="text-muted mb-6">Add at least one drive entry to generate a PDF</p>
        <div className="text-sm text-muted">PDF will include all entries, totals, and signature lines</div>
      </div>
    );
  }

  return (
    <div className="card-gradient space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Export DMV Log
          </h2>
          <p className="text-sm text-muted mt-1">
            Generate a printable PDF for {state.name} DMV requirements
          </p>
        </div>
        {generated && (
          <div className="badge badge-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>PDF downloaded!</span>
          </div>
        )}
      </div>

      {/* Preview Summary */}
      <div className="glass rounded-xl p-5">
        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" /> What's included in the PDF
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{drives.length} drive entries</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{(totals.total / 60).toFixed(1)}h total</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{(totals.day / 60).toFixed(1)}h day / {(totals.night / 60).toFixed(1)}h night</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{totals.miles} miles</span>
          </div>
        </div>
        <div className="divider" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Driver & vehicle info</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Adult initials per entry</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Signature lines</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 transition-smooth">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{state.name} requirements</span>
          </div>
        </div>
      </div>

      {/* DMV Compliance Check */}
      <div className={`p-4 rounded-xl border transition-smooth ${isTotalComplete ? 'card-gradient-success' : 'card-gradient-warning'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg transition-smooth ${isTotalComplete ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {isTotalComplete ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 dark:text-white">DMV Compliance Check — {state.name}</h4>

            {/* Per-requirement verification rows */}
            <div className="mt-3 space-y-2">
              <div className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${
                totalCheckPassed
                  ? 'border-green-200 bg-green-50/70 dark:border-green-800 dark:bg-green-950/40'
                  : 'border-red-200 bg-red-50/70 dark:border-red-800 dark:bg-red-950/40'
              }`}>
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {totalCheckPassed
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  Total supervised hours
                </span>
                <span className={`font-mono font-bold tabular-nums ${
                  totalCheckPassed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalHoursLogged.toFixed(1)}h / {state.requiredHours}h
                </span>
              </div>

              <div className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${
                nightCheckPassed
                  ? 'border-green-200 bg-green-50/70 dark:border-green-800 dark:bg-green-950/40'
                  : 'border-red-200 bg-red-50/70 dark:border-red-800 dark:bg-red-950/40'
              }`}>
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {nightCheckPassed
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  Night driving hours
                </span>
                <span className={`font-mono font-bold tabular-nums ${
                  nightCheckPassed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {nightHoursLogged.toFixed(1)}h / {state.requiredNightHours}h
                </span>
              </div>
            </div>

            {!isTotalComplete && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5">
                You need {(state.requiredHours - totalHoursLogged).toFixed(1)}h more total and{' '}
                {Math.max(0, state.requiredNightHours - nightHoursLogged).toFixed(1)}h more night driving.
              </p>
            )}
            {isTotalComplete && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5">
                You've met {state.name}'s requirements of {state.requiredHours}h total and {state.requiredNightHours}h night.
              </p>
            )}
            {state.requiresSpecificApp && (
              <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Note: {state.name} may require their official app ({state.appName}). Check DMV.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="badge-danger flex items-center gap-2 py-2.5 transition-smooth">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Paywall Notice */}
      {exportBlocked && (
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-teal-600 text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white text-sm">PDF export is a Pro feature</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              You've passed the 20 free hours. Unlock Lifetime Pro for $4.99 — one time — to export your DMV-ready log.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !driver || !vehicle || drives.length === 0}
          className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${exportBlocked ? 'opacity-80' : ''}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : exportBlocked ? (
            <>
              <Lock className="w-5 h-5" />
              Unlock PDF Export
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          disabled={isGenerating || !driver || !vehicle || drives.length === 0}
          className={`btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${exportBlocked ? 'opacity-80' : ''}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Printer className="w-5 h-5" />
              Print Directly
            </>
          )}
        </button>
      </div>

      {/* Upgrade Modal (paywall) */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Tips */}
      <details className="group glass rounded-lg p-4 cursor-pointer">
        <summary className="font-medium text-slate-700 cursor-pointer flex items-center gap-2 list-none transition-smooth hover:text-slate-900">
          <span>💡</span> Tips for DMV Visit
        </summary>
        <div className="mt-3 text-sm text-slate-600 space-y-2">
          <p>• Print 2 copies: one for DMV, one for your records</p>
          <p>• Both student and supervising adult must sign</p>
          <p>• Bring vehicle registration and insurance</p>
          <p>• Check your state DMV website for current requirements</p>
          <p>• Some states accept digital logs — ask at the counter</p>
        </div>
      </details>
    </div>
  );
}
