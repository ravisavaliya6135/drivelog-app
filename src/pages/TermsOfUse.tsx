import { Link } from 'react-router-dom';
import { FileText, Scale, AlertCircle, CreditCard, ShieldAlert } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export function TermsOfUse() {
  useSeo({
    title: 'Terms of Use | DriveLog',
    description: 'The simple terms for using DriveLog: an informational logging tool, not legal advice. You are responsible for accurate entries and verifying DMV requirements.',
    canonicalUrl: 'https://www.drivehours.app/terms',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trust</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Terms of Use</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: {new Date().getFullYear()}</p>
      </header>

      <Section title="Acceptance of terms">
        <p>
          By using DriveLog you agree to these terms. They are intentionally short and readable — we think
          legal documents should be too.
        </p>
      </Section>

      <Section title="Informational tool — not legal advice">
        <p className="flex items-start gap-2">
          <Scale className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          DriveLog provides hour-tracking and document-formatting tools for general informational purposes.
          It does not provide legal advice and does not determine your eligibility for a driver's license.
          Licensing requirements change and vary by jurisdiction; always confirm current rules with your state DMV.
        </p>
      </Section>

      <Section title="Your responsibility for accurate entries">
        <p>
          You are responsible for the accuracy of the hours, dates, and conditions you record. Falsifying a
          driving log may carry serious legal consequences in your state. Parents/guardians should review entries
          and verify only drives that were genuinely completed under qualified supervision.
        </p>
      </Section>

      <Section title="No guarantee of DMV acceptance" >
        <p className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          While our exports follow common DMV log formats, individual offices may have their own requirements or
          prefer official state forms. We cannot guarantee every exported document will be accepted in every
          circumstance. Please review exported PDFs before submission and bring backup documentation when possible.
        </p>
      </Section>

      <Section title="Age requirements & parental consent">
        <p>
          DriveLog is intended for teens of driving-permit age (typically 15+) and their parents or guardians.
          The app is designed for shared family use on a family device, and parents supervising a minor's
          driving are expected to review and verify logged hours. The app does not knowingly collect personal
          information from children under 13; drive logs stay on the family's device by design.
        </p>
      </Section>

      <Section title="Prohibited uses">
        <ul className="list-disc pl-5 space-y-1">
          <li>Falsifying driving hours, conditions, or supervisor signatures</li>
          <li>Using the app while actively driving (it's for the passenger seat — always)</li>
          <li>Reselling, reverse-engineering for malicious purposes, or using the service to harm others</li>
        </ul>
      </Section>

      <Section title="Payments (Lifetime Pro)">
        <p className="flex items-start gap-2">
          <CreditCard className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          DriveLog's free tier includes up to 20 logged hours. An optional one-time payment of $4.99 unlocks
          unlimited logging and PDF export forever — no subscription, no recurring charges. Payments are processed
          securely by Stripe; we never see or store your card details. Because Pro is delivered instantly
          and in full, purchases are final — but if anything goes wrong, contact us through the feedback page
          and we'll work to make it right.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          To the maximum extent permitted by law, DriveLog is provided "as is" without warranties of any kind.
          We are not liable for denied applications, lost data, missed appointments, or any indirect damages
          arising from use of the app. Keep backups of important records (the Settings page includes a JSON export).
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the United States and the state of the app operator's
          principal place of business, without regard to conflict-of-law principles. Consumer rights under
          your local law are not affected.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Reach us via the{' '}
          <Link to="/contact" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline">feedback page</Link>.
        </p>
      </Section>
    </div>
  );
}
