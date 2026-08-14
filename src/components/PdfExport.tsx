import { useState } from 'react';
import { Download, Printer, CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import type { DriveEntry, DriverProfile, VehicleProfile, StateInfo } from '../types';
import { US_STATES } from '../types';
import { generatePDF, downloadPDF } from '../utils/pdf.tsx';

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

  const isTotalComplete = totals.total / 60 >= state.requiredHours && totals.night / 60 >= state.requiredNightHours;

  const handleGenerate = async () => {
    if (!driver || !vehicle || drives.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const blob = await generatePDF(drives, driver, vehicle, selectedState);
      downloadPDF(blob, `DriveLog-${state.code}-${new Date().toISOString().split('T')[0]}.pdf`);
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
    
    setIsGenerating(true);
    setError(null);
    
    try {
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No drives logged yet</h3>
        <p className="text-slate-500 mb-6">Add at least one drive entry to generate a PDF</p>
        <div className="text-sm text-slate-400">PDF will include all entries, totals, and signature lines</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Export DMV Log
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate a printable PDF for {state.name} DMV requirements
          </p>
        </div>
        {generated && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">PDF downloaded!</span>
          </div>
        )}
      </div>

      {/* Preview Summary */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> What's included in the PDF
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{drives.length} drive entries</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{(totals.total / 60).toFixed(1)}h total</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{(totals.day / 60).toFixed(1)}h day / {(totals.night / 60).toFixed(1)}h night</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{totals.miles} miles</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Driver & vehicle info</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Adult initials per entry</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Signature lines</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{state.name} requirements</span>
          </div>
        </div>
      </div>

      {/* State Requirements Check */}
      <div className={`p-4 rounded-xl border ${isTotalComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${isTotalComplete ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {isTotalComplete ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-medium text-slate-900">
              {isTotalComplete ? 'Requirements Met!' : 'Requirements Not Yet Met'}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {isTotalComplete 
                ? `You've logged ${(totals.total / 60).toFixed(1)}h total and ${(totals.night / 60).toFixed(1)}h night. This meets ${state.name}'s requirements of ${state.requiredHours}h total and ${state.requiredNightHours}h night.`
                : `You need ${(state.requiredHours - totals.total / 60).toFixed(1)}h more total and ${Math.max(0, state.requiredNightHours - totals.night / 60).toFixed(1)}h more night driving.`
              }
            </p>
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !driver || !vehicle || drives.length === 0}
          className="py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
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
          className="py-3 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

      {/* Tips */}
      <details className="group bg-slate-50 rounded-lg p-4 border border-slate-200">
        <summary className="font-medium text-slate-700 cursor-pointer flex items-center gap-2 list-none">
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