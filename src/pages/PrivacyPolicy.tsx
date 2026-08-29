import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, WifiOff, EyeOff, Car, Users } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy | DriveLog',
    description: 'What DriveLog stores on your device, what (little) leaves it, and why. No ads, no GPS tracking, no sale of personal data.',
    canonicalUrl: 'https://drivehours.app/privacy',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trust</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: {new Date().getFullYear()}</p>
      </header>

      <Section title="What DriveLog does">
        <p>
          DriveLog is a simple tool for teens and parents to log supervised driving practice hours and
          export a printable log formatted for DMV appointments. It is a record-keeping utility — nothing more,
          nothing hidden.
        </p>
      </Section>

      <Section title="What is stored on your device">
        <ul className="list-disc pl-5 space-y-1">
          <li>Drive entries (dates, times, durations, road conditions, notes)</li>
          <li>Driver and vehicle profiles you create</li>
          <li>Your selected state and app preferences</li>
          <li>A crash-recovery timer snapshot while a drive is active</li>
        </ul>
        <p className="flex items-start gap-2 pt-1">
          <HardDrive className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          All of this lives in your browser's local storage (IndexedDB) on your device.
          It never leaves your phone unless you explicitly back it up or sign in to an account.
        </p>
      </Section>

      <Section title="What may be sent to our servers">
        <p>If you create an account or enable feedback/analytics features, a small amount of data may reach Supabase, our hosting provider:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Email address</strong> — only if you sign in with a magic link</li>
          <li><strong>Purchase status</strong> — if you buy Lifetime Pro, we store that the purchase is active</li>
          <li><strong>Anonymous usage events</strong> — e.g. "a drive was started in CA". No names, no locations.</li>
          <li><strong>Feedback messages</strong> — only what you voluntarily type into the feedback form</li>
        </ul>
        <p className="flex items-start gap-2 pt-1">
          <EyeOff className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          Your actual driving logs are not uploaded. They belong to your device and your family.
        </p>
      </Section>

      <Section title="No ads. No tracking. No selling data.">
        <ul className="list-disc pl-5 space-y-1 flex items-start gap-2">
          <WifiOff className="w-4 h-4 text-teal-700 mt-1 flex-shrink-0" />
        </ul>
        <p>We show zero advertisements. We have no third-party ad trackers or social pixels. We do not sell, rent, or share personal data with anyone. The app is funded by one optional $4.99 Lifetime Pro unlock — not by your attention.</p>
      </Section>

      <Section title="No GPS tracking while driving">
        <p className="flex items-start gap-2">
          <Car className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          DriveLog does not access your GPS location. Night detection uses your state's approximate coordinates
          (the state capital) to compute sunset times — your precise location is never recorded or transmitted.
        </p>
      </Section>

      <Section title="Offline-first design">
        <p>
          Every core feature — starting drives, logging hours, verifying entries, and exporting PDFs — works
          completely without internet. Data is saved locally first; any account sync is optional and secondary.
          If you never sign in, DriveLog works identically forever.
        </p>
      </Section>

      <Section title="Shared family use">
        <p className="flex items-start gap-2">
          <Users className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
          DriveLog is designed to be used openly by teens and parents together on a shared device. Parents can
          review every entry and verify them before DMV submission. We recommend keeping verification honest —
          DMV officials may ask about recorded hours.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          DriveLog sets no advertising or tracking cookies. We use only browser local storage
          (IndexedDB and localStorage) to remember your logs and preferences on your own device —
          the same mechanism any notes app uses. There is nothing to "accept" because there is
          nothing tracking you across sites.
        </p>
      </Section>

      <Section title="Third-party services">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — hosts optional account sign-in, purchase records, feedback, and anonymous usage events</li>
          <li><strong>Stripe</strong> — processes the optional $4.99 Lifetime Pro payment. Card details go directly to Stripe; we never see them.</li>
          <li><strong>Vercel</strong> — serves the app itself</li>
        </ul>
        <p>That's the entire list. No ad networks, no analytics services, no social SDKs.</p>
      </Section>

      <Section title="Your rights: export & deletion">
        <p>
          You own your data. <strong>Export</strong>: Settings → Data Backup produces a complete JSON file of
          every drive, driver, and vehicle at any time. <strong>Delete</strong>: Settings → Clear Local Data
          permanently erases everything stored on the device. If you signed in and want your server-side account
          deleted too, contact us via the feedback page and we'll remove it.
        </p>
      </Section>

      <Section title="Accuracy disclaimer">
        <p>
          DriveLog is a logging tool, not an authority on licensing law. You are responsible for verifying your
          state's current requirements with your local DMV. DMV acceptance of exported documents may vary by state
          and situation — please review your exported PDF before submitting it.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Reach us via the{' '}
          <Link to="/contact" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline">feedback page</Link>{' '}
          — messages sent there go straight to the team.
        </p>
      </Section>
    </div>
  );
}
