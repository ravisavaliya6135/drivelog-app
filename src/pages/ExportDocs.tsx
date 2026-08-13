import { ArrowLeft, Download, Printer, CheckCircle, AlertTriangle, FileText, Loader2, Settings, MapPin } from 'lucide-react';
import { useState } from 'react';
import { PdfExport } from '../components/PdfExport';
import { StateSelector } from '../components/StateSelector';
import { DriveSummary } from '../components/DriveSummary';
import { useDriveLog } from '../hooks/useDriveLog';
import { US_STATES } from '../types';

export function ExportDocs() {
  const { drives, drivers, vehicles, loading } = useDriveLog();
  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  const primaryDriver = drivers.find(d => d.isPrimaryDriver) || drivers[0];
  const primaryVehicle = vehicles[0];
  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    localStorage.setItem('drivelog-state', stateCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Export DMV Log</h1>
              <p className="text-xs text-slate-500">Generate printable PDF for your state</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* State Selector */}
        <StateSelector 
          value={selectedState} 
          onChange={handleStateChange} 
          showWarning={true}
          className="mb-6"
        />

        {/* Progress Summary */}
        <DriveSummary 
          drives={drives} 
          selectedState={selectedState} 
          primaryDriver={primaryDriver || null} 
        />

        {/* PDF Export */}
        <PdfExport
          drives={drives}
          driver={primaryDriver}
          vehicle={primaryVehicle}
          selectedState={selectedState}
          isReady={drives.length > 0 && !!primaryDriver && !!primaryVehicle}
        />

        {/* Requirements Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            DMV Visit Checklist
          </h3>
          <div className="space-y-3">
            <ChecklistItem 
              label="Print 2 copies of the PDF log" 
              done={true}
            />
            <ChecklistItem 
              label="Both student and supervising adult sign" 
              done={true}
            />
            <ChecklistItem 
              label="Bring vehicle registration & insurance" 
              done={drives.length > 0}
            />
            <ChecklistItem 
              label="Check state DMV website for current requirements" 
              done={true}
            />
            <ChecklistItem 
              label="Bring learner's permit & photo ID" 
              done={true}
            />
            {state.requiresSpecificApp && (
              <ChecklistItem 
                label={`Verify if ${state.name} requires official app (${state.appName})`} 
                done={false}
                warning
              />
            )}
          </div>
        </div>

        {/* Tips */}
        <details className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <summary className="font-medium text-slate-700 cursor-pointer flex items-center gap-2 list-none">
            <span>💡</span> Tips for a Smooth DMV Visit
          </summary>
          <div className="mt-4 text-sm text-slate-600 space-y-2">
            <p>• Arrive early — DMV wait times can be long</p>
            <p>• Bring all required documents in a folder</p>
            <p>• Make sure the vehicle passes inspection (lights, signals, brakes)</p>
            <p>• Some states allow digital log submission — ask at the counter</p>
            <p>• Keep a photo backup of your log on your phone</p>
            <p>• The supervising adult must be present for the driving test</p>
          </div>
        </details>
      </main>
    </div>
  );
}

function ChecklistItem({ label, done, warning }: { label: string; done: boolean; warning?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${warning ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
        {done && <CheckCircle className="w-4 h-4 text-white" />}
      </div>
      <span className={`text-sm ${done ? 'text-slate-600 line-through' : 'text-slate-900'} ${warning ? 'text-amber-800' : ''}`}>
        {label}
      </span>
    </div>
  );
}