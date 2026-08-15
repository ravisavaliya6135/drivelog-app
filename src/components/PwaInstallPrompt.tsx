import { Car, Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallPromptProps {
  hook?: ReturnType<typeof usePwaInstall>;
}

export function PwaInstallPrompt({ hook }: PwaInstallPromptProps) {
  const pwa = hook || usePwaInstall();

  // Never render on desktop, or if already running as installed standalone PWA
  if (!pwa.isMobile || pwa.isStandalone) {
    return null;
  }

  return (
    <>
      {/* Subtle Mobile Bottom Banner */}
      {pwa.showPrompt && !pwa.showIosInstructions && (
        <div className="fixed bottom-[80px] left-4 right-4 z-40 max-w-md mx-auto animate-slide-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-elevated border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {pwa.isIOS ? 'Add DriveLog to Home Screen' : 'Install DriveLog App'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pwa.isIOS 
                    ? 'Access offline anytime from your home screen' 
                    : 'Fast offline logging & instant DMV reports'}
                </p>
              </div>
              <button
                type="button"
                onClick={pwa.dismissPrompt}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Dismiss installation prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={pwa.dismissPrompt}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={pwa.triggerInstall}
                className="flex-1 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold shadow-teal flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{pwa.isIOS ? 'Instructions' : 'Install'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS "Add to Home Screen" Bottom Sheet Modal */}
      {pwa.showIosInstructions && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Add to Home Screen (iOS)
                </h3>
              </div>
              <button
                type="button"
                onClick={pwa.dismissIosInstructions}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Step Instruction Card */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Tap the <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1"><Share className="w-3 h-3 text-teal-600 inline" /> Share</strong> button at the bottom of Safari.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Scroll down and tap <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-teal-600 inline" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right corner to install DriveLog.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={pwa.dismissIosInstructions}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
