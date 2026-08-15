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
      {/* Subtle Mobile Bottom Banner (shown after interaction on Android or iOS) */}
      {pwa.showPrompt && !pwa.showIosInstructions && (
        <div className="fixed bottom-[90px] left-4 right-4 z-40 max-w-md mx-auto animate-slide-up">
          <div className="bg-surface-container-lowest rounded-2xl p-4 card-shadow border border-outline-variant/30 flex flex-col gap-3 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0 shadow-md shadow-secondary/20">
                <span className="material-symbols-outlined text-2xl" data-weight="fill">
                  directions_car
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-md text-sm font-bold text-primary truncate">
                  {pwa.isIOS ? 'Add DriveLog to Home Screen' : 'Install DriveLog App'}
                </h4>
                <p className="text-xs text-on-surface-variant font-medium">
                  {pwa.isIOS 
                    ? 'Access offline anytime from your home screen' 
                    : 'Fast offline logging & instant DMV reports'}
                </p>
              </div>
              <button
                type="button"
                onClick={pwa.dismissPrompt}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                aria-label="Dismiss installation prompt"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={pwa.dismissPrompt}
                className="flex-1 py-2 px-3 rounded-full text-xs font-label-bold text-on-surface-variant hover:bg-surface-container-low transition-colors text-center"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={pwa.triggerInstall}
                className="flex-2 py-2 px-4 rounded-full bg-secondary text-on-secondary text-xs font-label-bold font-bold btn-3d flex items-center justify-center gap-1.5 shadow-sm text-center"
              >
                <span className="material-symbols-outlined text-sm" data-weight="fill">
                  {pwa.isIOS ? 'add_to_home_screen' : 'download'}
                </span>
                {pwa.isIOS ? 'Add to Home Screen' : 'Install DriveLog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Mobile Step-by-Step Installation Modal / Bottom Sheet */}
      {pwa.showIosInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-t-[28px] sm:rounded-[28px] p-6 card-shadow border border-outline-variant/30 flex flex-col gap-4 animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md shadow-secondary/20">
                  <span className="material-symbols-outlined text-xl" data-weight="fill">directions_car</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-primary">
                    {pwa.isIOS ? 'Add to iPhone Home Screen' : 'Install DriveLog'}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">Takes less than 10 seconds</p>
                </div>
              </div>
              <button
                type="button"
                onClick={pwa.closeIosInstructions}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="bg-surface-container-low/70 rounded-2xl p-4 space-y-3.5 border border-outline-variant/20">
              {pwa.isIOS ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs font-body-md text-on-surface">
                      Tap the <strong className="text-primary font-bold">Share</strong> button <span className="inline-flex items-center align-middle px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/30 mx-0.5"><span className="material-symbols-outlined text-sm text-secondary">ios_share</span></span> at the bottom of Safari.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs font-body-md text-on-surface">
                      Scroll down and tap <strong className="text-primary font-bold">"Add to Home Screen"</strong> <span className="inline-flex items-center align-middle px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/30 mx-0.5"><span className="material-symbols-outlined text-sm text-secondary">add_box</span></span>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-xs font-body-md text-on-surface">
                      Tap <strong className="text-primary font-bold">"Add"</strong> in the top-right corner to finish.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs font-body-md text-on-surface">
                      Tap the browser menu <strong className="text-primary font-bold">(⋮)</strong> in Chrome/Edge.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs font-body-md text-on-surface">
                      Tap <strong className="text-primary font-bold">"Install app"</strong> or <strong className="text-primary font-bold">"Add to Home screen"</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Got It Button */}
            <button
              type="button"
              onClick={pwa.closeIosInstructions}
              className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-label-bold font-bold text-xs uppercase tracking-wider btn-3d shadow-md"
            >
              Got it
            </button>

          </div>
        </div>
      )}
    </>
  );
}
