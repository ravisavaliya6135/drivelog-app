import { useState } from 'react';
import { Sparkles, Check, ShieldCheck, X } from 'lucide-react';
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
  const { startCheckout } = useEntitlement();
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
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Unlock DriveLog Lifetime Pro
                </h3>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                  {PRO_LIFETIME_PRICE} One-Time • No Recurring Fees
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Reason Banner if applicable */}
          {reason && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              {reason}
            </div>
          )}

          {/* Feature List Bento */}
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Unlimited driving hours</strong> (Free tier capped at 20h)</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Official DMV PDF export</strong> for all 50 states</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>Multiple supervisors & vehicles</strong> tracking</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span><strong>100% Offline & Private</strong> — never expires</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Pricing & Checkout Action */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleUnlock}
              className="btn-primary w-full h-14 text-base font-bold shadow-teal flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Get Lifetime Pro for {PRO_LIFETIME_PRICE}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
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
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Unlock unlimited supervised hours with Lifetime Pro for {PRO_LIFETIME_PRICE}.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUpgradeClick}
        className="btn-primary py-2 px-3.5 text-xs font-bold whitespace-nowrap shadow-teal flex-shrink-0"
      >
        Upgrade
      </button>
    </div>
  );
}
