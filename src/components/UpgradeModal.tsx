import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEntitlement, PRO_LIFETIME_PRICE } from '../contexts/EntitlementContext';
import { AuthModal } from './AuthModal';

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
  const { isPro, startCheckout } = useEntitlement();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
        <div className="bg-surface-container-lowest max-w-md w-full rounded-t-[28px] sm:rounded-[28px] p-6 card-shadow border border-outline-variant/30 flex flex-col gap-4 animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <span className="material-symbols-outlined text-xl" data-weight="fill">
                  workspace_premium
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-base font-bold text-primary">DriveLog Lifetime</h3>
                <p className="text-[11px] text-on-surface-variant">One-time payment • Never expires</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Reason Alert (if user reached free 20h limit) */}
          {reason && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 font-medium">
              {reason}
            </div>
          )}

          {/* Pricing Hero Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary-container/40 to-surface-container-low border border-secondary/20 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-on-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm" data-weight="fill">star</span>
              Lifetime Pro Access
            </div>
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="font-display text-3xl font-extrabold text-primary">{PRO_LIFETIME_PRICE}</span>
              <span className="text-xs text-on-surface-variant font-semibold">one-time</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              No monthly subscriptions • No recurring fees • No ads
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 py-1">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs flex-shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </span>
              <span className="text-xs font-semibold text-on-surface">Unlimited driving practice logs</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs flex-shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </span>
              <span className="text-xs font-semibold text-on-surface">Official DMV-ready PDF log export for all 50 states</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs flex-shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </span>
              <span className="text-xs font-semibold text-on-surface">Multi-driver & multi-vehicle accounts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs flex-shrink-0">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </span>
              <span className="text-xs font-semibold text-on-surface">100% offline functionality & local privacy</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* CTA Action */}
          {isPro ? (
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base" data-weight="fill">verified</span>
              You have Lifetime Pro!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUnlock}
              disabled={loading}
              className="w-full py-4 rounded-full bg-secondary text-on-secondary font-headline-md text-xs font-bold uppercase tracking-wider btn-3d shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting to Checkout...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" data-weight="fill">bolt</span>
                  Unlock Lifetime Pro — {PRO_LIFETIME_PRICE}
                </>
              )}
            </button>
          )}

          <p className="text-[10px] text-center text-on-surface-variant">
            Secure payment powered by Stripe. All driving logs stay safe on your device.
          </p>

        </div>
      </div>

      {/* Auth Modal if user needs to login before payment */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        title="Sign In to Purchase Lifetime Pro"
        subtitle="We will link your Lifetime Pro entitlement to your email so you can restore it anytime."
      />
    </>
  );
}

export function UpgradeCard({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const { isPro, totalHoursLogged, freeHoursRemaining, isLimitReached, isApproachingLimit } = useEntitlement();

  if (isPro) return null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 card-shadow border border-secondary/30 flex flex-col gap-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg" data-weight="fill">workspace_premium</span>
          </div>
          <div>
            <h4 className="font-headline-md text-xs font-bold text-primary">
              {isLimitReached ? 'Free 20-Hour Limit Reached' : 'DriveLog Lifetime Pro'}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isLimitReached
                ? 'Unlock unlimited hours for just $4.99 one-time'
                : isApproachingLimit
                ? `${freeHoursRemaining}h remaining on Free tier`
                : `${totalHoursLogged}/20 hours logged on Free tier`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUpgradeClick}
          className="px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-label-bold font-bold btn-3d"
        >
          {PRO_LIFETIME_PRICE} One-Time
        </button>
      </div>
    </div>
  );
}
