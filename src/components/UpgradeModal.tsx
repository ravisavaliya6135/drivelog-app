import { useState, useEffect } from 'react';
import { Sparkles, Check, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntitlement, PRO_LIFETIME_PRICE, FREE_HOURS_LIMIT } from '../contexts/EntitlementContext';
import { AuthModal } from './AuthModal';
import { US_STATES } from '../types';
import { trackEvent } from '../utils/analytics';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
}: UpgradeModalProps) {
  const { user } = useAuth();
  const { startCheckout, totalHoursLogged } = useEntitlement();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useAccessibleDialog(isOpen && !showAuthModal, onClose);

  // Milestone context: compare logged hours against the user's selected state requirement
  const selectedStateCode = typeof window !== 'undefined'
    ? localStorage.getItem('drivelog-state') || 'CA'
    : 'CA';
  const stateInfo = US_STATES.find(s => s.code === selectedStateCode) || US_STATES[4];
  const isMilestone = totalHoursLogged >= FREE_HOURS_LIMIT;
  const stateProgressPct = Math.min(100, Math.round((totalHoursLogged / Math.max(1, stateInfo.requiredHours)) * 100));

  // Analytics: paywall impression — fires once per modal open
  useEffect(() => {
    if (isOpen) {
      void trackEvent('paywall_viewed', {
        totalHoursLogged,
        state: selectedStateCode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUnlock = async () => {
    setError(null);
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    const { url, error: checkoutErr } = await startCheckout();
    setLoading(false);

    if (checkoutErr) {
      if (checkoutErr.message === 'AUTH_REQUIRED') {
        setShowAuthModal(true);
      } else {
        setError(checkoutErr.message);
      }
    } else if (url) {
      window.location.href = url;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title" tabIndex={-1} className="bg-white dark:bg-[#131C2E] max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-teal-500/30 flex flex-col gap-4 animate-slide-up">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-[0_2px_12px_rgba(20,184,166,0.35)] flex-shrink-0 ${
                isMilestone ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : 'bg-gradient-to-br from-teal-500 to-emerald-400'
              }`}>
                {isMilestone ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                {isMilestone ? (
                  <>
                    <h3 id="upgrade-modal-title" className="font-extrabold text-base text-slate-900 dark:text-white">
                      You just hit {FREE_HOURS_LIMIT} hours!
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                      Milestone unlocked — keep the streak going
                    </p>
                  </>
                ) : (
                  <>
                    <h3 id="upgrade-modal-title" className="font-extrabold text-base text-slate-900 dark:text-white">
                      Unlock DriveHours Lifetime Pro
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                      {PRO_LIFETIME_PRICE} One-Time • No Recurring Fees
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="btn-ghost rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Milestone Subtext */}
          {isMilestone && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed -mt-1">
              You're <strong className="text-slate-900 dark:text-white">{stateProgressPct}%</strong> of the way to your{' '}
              <strong className="text-slate-900 dark:text-white">{stateInfo.name}</strong> license. Unlock unlimited
              logging + DMV-ready PDF export for just <strong>{PRO_LIFETIME_PRICE}</strong> — one time, forever.
            </p>
          )}

          {/* Progress Toward State Requirement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{stateInfo.name} license progress</span>
              <span className="font-mono tabular-nums font-bold">
                {totalHoursLogged} / {stateInfo.requiredHours} hrs
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stateProgressPct >= 100
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                }`}
                style={{ width: `${Math.max(2, stateProgressPct)}%` }}
              />
            </div>
          </div>

          {/* Reason Banner if applicable */}
          {reason && !isMilestone && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              {reason}
            </div>
          )}

          {/* Feature List Bento */}
          <div className="space-y-2.5 py-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/25">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Unlimited driving hours</strong> (Free tier capped at 20h)</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/25">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Official DMV PDF export</strong> for all 50 states</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/25">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Multiple supervisors & vehicles</strong> tracking</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/25">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>100% Offline & Private</strong> — never expires</span>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-red-500/15 text-red-300 text-xs font-bold border border-red-500/30">
              {error}
            </div>
          )}

          {/* Pricing & Checkout Action (≥64px touch target) */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleUnlock}
              className="w-full min-h-[64px] h-16 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-base shadow-[0_4px_25px_rgba(20,184,166,0.4)] hover:shadow-[0_6px_30px_rgba(20,184,166,0.55)] border border-teal-400/30 flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-[#0B0F19]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Unlock Lifetime Pro — {PRO_LIFETIME_PRICE}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-12 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-center block"
            >
              Not now
            </button>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Secure checkout via Stripe • One-time payment • Never charged again
            </p>
          </div>

        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleUnlock();
        }}
        title="Sign In to Continue"
        subtitle="Sign in with your email to attach your Lifetime Pro purchase to your account."
      />
    </>
  );
}

export function UpgradeCard({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  return (
    <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
            Approaching 20h Free Limit
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Unlock unlimited supervised hours with Lifetime Pro for {PRO_LIFETIME_PRICE}.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUpgradeClick}
        className="btn-primary min-h-12 py-2 px-3.5 text-xs font-bold whitespace-nowrap shadow-teal flex-shrink-0"
      >
        Upgrade
      </button>
    </div>
  );
}
