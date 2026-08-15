import { useState } from 'react';
import { useDriveLog } from '../hooks/useDriveLog';
import { US_STATES } from '../types';
import { generatePDF, downloadPDF } from '../utils/pdf';
import { StateSelector } from '../components/StateSelector';

export function ExportDocs() {
  const { drives, drivers, vehicles, loading, dayMinutes, nightMinutes, totalHours } = useDriveLog();
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
    name: 'Family SUV',
    make: 'Toyota',
    model: 'RAV4',
    year: 2022,
    licensePlate: '7XYZ123',
  };

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];
  const dayHoursVal = Math.round(dayMinutes / 60);
  const nightHoursVal = Math.round(nightMinutes / 60);
  const totalHoursVal = Math.round(totalHours);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-margin-mobile pb-[100px] pt-stack-md flex flex-col gap-stack-lg relative z-10 max-w-md mx-auto">
      
      {/* Header & State Selector */}
      <section className="flex flex-col gap-stack-sm">
        <h1 className="font-display-mobile text-display-mobile text-on-surface font-extrabold">Export Log</h1>
        <p className="text-on-surface-variant font-body-md text-sm">Generate official DMV driving logs.</p>
        
        <div className="mt-2 bg-surface-container-lowest rounded-xl p-4 card-shadow flex items-center justify-between border border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl" data-weight="fill">location_on</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                DMV Format
              </span>
              <span className="font-label-bold text-label-bold text-on-surface font-bold">
                {state.name} ({state.code === 'CA' ? 'DL-236' : `${state.code} DMV Form`})
              </span>
            </div>
          </div>
          
          <StateSelector
            value={selectedState}
            onChange={(st) => {
              setSelectedState(st);
              localStorage.setItem('drivelog-state', st);
            }}
            className="w-28 text-xs font-semibold"
            showWarning={false}
          />
        </div>
      </section>

      {/* Preview Card */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-secondary-container to-primary-fixed rounded-2xl blur opacity-30" />
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_8px_30px_rgba(13,27,42,0.08)] relative overflow-hidden border border-surface-container-high flex flex-col items-center justify-center min-h-[200px]">
          
          {/* Stylized Document Graphic */}
          <div className="w-32 h-40 bg-background border-2 border-outline-variant/30 rounded-lg shadow-sm relative flex flex-col items-center p-3 transform rotate-[-2deg] transition-transform hover:rotate-0 duration-300">
            <div className="w-full h-2 bg-secondary-container rounded-sm mb-4" />
            <div className="w-full space-y-2">
              <div className="w-3/4 h-1.5 bg-outline-variant/40 rounded-full" />
              <div className="w-full h-1.5 bg-outline-variant/40 rounded-full" />
              <div className="w-5/6 h-1.5 bg-outline-variant/40 rounded-full" />
            </div>
            <div className="mt-auto w-full flex justify-between items-end border-t border-outline-variant/20 pt-2">
              <div className="w-8 h-8 rounded bg-surface-container" />
              <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full" />
            </div>
            {/* PDF Badge */}
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-error text-on-error rounded-full flex items-center justify-center shadow-md border-2 border-surface-container-lowest z-10">
              <span className="font-label-bold text-[10px] font-bold">PDF</span>
            </div>
          </div>

          <div className="mt-6 text-center z-10">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Ready to Print</h3>
            <p className="font-body-md text-on-surface-variant text-xs mt-0.5">
              Includes all mandatory DMV fields, hours breakdown, and supervisor signatures.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-2 gap-gutter">
        {/* Total Hours (Hero) */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-5 card-shadow border border-outline-variant/20 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col z-10">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 font-medium">
              Total Logged
            </span>
            <span className="font-display-mobile text-display-mobile text-primary font-extrabold">
              {totalHoursVal} <span className="text-body-lg text-on-surface-variant ml-1 font-normal text-base">hrs</span>
            </span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-secondary border-t-outline-variant flex items-center justify-center transform rotate-45 z-10">
            <span className="material-symbols-outlined transform -rotate-45 text-secondary text-2xl" data-weight="fill">
              done_all
            </span>
          </div>
        </div>

        {/* Day Hours */}
        <div className="bg-surface-container-lowest rounded-xl p-4 card-shadow border border-outline-variant/20 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
            <span className="material-symbols-outlined text-sm" data-weight="fill">light_mode</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {dayHoursVal} <span className="text-sm text-on-surface-variant font-normal">h</span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Daytime</span>
          </div>
        </div>

        {/* Night Hours */}
        <div className="bg-surface-container-lowest rounded-xl p-4 card-shadow border border-outline-variant/20 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container text-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-sm" data-weight="fill">dark_mode</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {nightHoursVal} <span className="text-sm text-on-surface-variant font-normal">h</span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Nighttime</span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col gap-stack-md mt-2">
        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="btn-tactile w-full h-14 rounded-full bg-secondary text-on-secondary font-headline-md text-body-lg font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,106,97,0.25)] active:translate-y-1 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl" data-weight="fill">picture_as_pdf</span>
          {isGenerating ? 'Generating PDF...' : downloadSuccess ? 'PDF Downloaded! 🎉' : 'Generate PDF'}
        </button>

        <button
          onClick={handleShare}
          className="w-full h-14 rounded-full bg-transparent text-primary-container font-headline-md text-body-lg font-bold flex items-center justify-center gap-2 border-2 border-outline-variant/50 hover:bg-surface-container-low transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-xl">ios_share</span>
          Share Log
        </button>
      </section>

    </main>
  );
}