import { useState } from 'react';
import { Lock, Mail, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { cn } from '../utils/cn';

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
  const dialogRef = useAccessibleDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    // If Supabase keys are not configured in environment, log quietly for developers
    if (!isConfigured) {
      console.warn('[DriveHours Auth] Supabase environment keys missing. Simulating sign-in for testing.');
    }

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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-slide-up"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Lock className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 id="auth-modal-title" className="font-extrabold text-base text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Passwordless & secure for DriveHours</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in dialog"
            className="btn-ghost rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Sent State */}
        {sent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Check Your Email</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              Magic link sent! Check your inbox. We sent a secure magic sign-in link to{' '}
              <strong className="text-slate-900 dark:text-white">{email}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full min-h-[48px] py-3 text-xs font-extrabold mt-2 shadow-teal"
            >
              Done
            </button>
          </div>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{subtitle}</p>

            <div>
              <label htmlFor="auth-email" className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10 min-h-[48px]"
                />
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 min-h-[48px] py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className={cn(
                  'btn-primary flex-1 min-h-[48px] py-3 text-xs font-extrabold shadow-teal flex items-center justify-center gap-2',
                  loading && 'opacity-70 cursor-wait'
                )}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <span>Send Link</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

