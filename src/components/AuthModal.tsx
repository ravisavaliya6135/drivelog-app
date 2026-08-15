import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign In or Create Account',
  subtitle = 'Enter your email to receive a passwordless magic sign-in link.',
}: AuthModalProps) {
  const { signInWithMagicLink, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const { error } = await signInWithMagicLink(email);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSent(true);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-t-[28px] sm:rounded-[28px] p-6 card-shadow border border-outline-variant/30 flex flex-col gap-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md shadow-secondary/20">
              <span className="material-symbols-outlined text-xl" data-weight="fill">
                lock
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-primary">{title}</h3>
              <p className="text-[11px] text-on-surface-variant">Passwordless & secure</p>
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

        {sent ? (
          /* Email Sent State */
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl" data-weight="fill">
                mark_email_read
              </span>
            </div>
            <h4 className="font-headline-md text-base font-bold text-primary">Magic Link Sent!</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              We sent a secure login link to <strong className="text-primary">{email}</strong>. Open the link in your email on this device to sign in.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-full bg-secondary text-on-secondary font-label-bold text-xs font-bold btn-3d mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-on-surface-variant">{subtitle}</p>

            <div>
              <label className="font-label-bold text-xs text-on-surface font-bold mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  autoFocus
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {!isConfigured && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px]">
                ℹ️ Demo note: Add <code className="font-mono">VITE_SUPABASE_URL</code> & <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to enable live email delivery.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-headline-md text-xs font-bold uppercase tracking-wider btn-3d shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" data-weight="fill">send</span>
                  Send Magic Link
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
