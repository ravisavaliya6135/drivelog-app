import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { submitFeedback } from '../utils/feedback';
import type { FeedbackCategory, FeedbackSource } from '../utils/feedback';
import { trackEvent } from '../utils/analytics';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'bug', label: 'Bug / something broke' },
  { value: 'suggestion', label: 'Suggestion / idea' },
  { value: 'dmv_acceptance', label: 'DMV acceptance feedback' },
  { value: 'payment', label: 'Payment issue' },
  { value: 'other', label: 'Something else' },
];

interface ContactFeedbackProps {
  source?: FeedbackSource;
}

export function ContactFeedback({ source = 'contact_page' }: ContactFeedbackProps) {
  useSeo({
    title: 'Contact & Feedback | DriveLog',
    description: 'Questions, bugs, or DMV feedback about DriveLog? Send us a note — it works offline too.',
    canonicalUrl: 'https://www.drivehours.app/contact',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    setResultMessage(null);
    setIsError(false);

    try {
      const { delivered } = await submitFeedback({
        name,
        email,
        category,
        message,
        source,
      });

      void trackEvent('feedback_submitted', {});

      if (delivered) {
        setResultMessage('Sent. Thank you — we read every message.');
      } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setResultMessage('Saved on this device. We\u2019ll send it when you\u2019re online.');
      } else {
        setResultMessage('Saved locally. Contact sync will be enabled when support is live.');
      }

      // Reset form after success
      setName('');
      setEmail('');
      setCategory('suggestion');
      setMessage('');
    } catch {
      setIsError(true);
      setResultMessage('Something went wrong saving your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Questions, bugs, or DMV feedback?
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Tell us what happened — especially if a DMV office said something about your log. Real feedback
          makes the app better for every family.
        </p>
      </header>

      {/* Privacy note */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <span>Please don't include sensitive personal documents in feedback (permit numbers, license scans, etc.).</span>
      </div>

      {/* Success / error message */}
      {resultMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
            isError
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm font-medium ${isError ? 'text-red-700 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
            {resultMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="app-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="fb-name" className="form-label">Name (optional)</label>
            <input
              id="fb-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ravi (Dad)"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="fb-email" className="form-label">Email (optional)</label>
            <input
              id="fb-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Only if you'd like a reply"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="fb-category" className="form-label">Category</label>
          <select
            id="fb-category"
            value={category}
            onChange={e => setCategory(e.target.value as FeedbackCategory)}
            className="form-input cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fb-message" className="form-label">Message *</label>
          <textarea
            id="fb-message"
            required
            rows={5}
            maxLength={2000}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. The night badge showed Day but my DMV log counted it as night…"
            className="form-input resize-y"
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/2000</p>
        </div>

        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="btn-primary w-full h-16 text-base font-bold shadow-teal flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Send className="w-5 h-5" aria-hidden="true" />
              <span>Send feedback</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          Works offline — your message is saved securely on this device first.
        </p>
      </form>
    </div>
  );
}
