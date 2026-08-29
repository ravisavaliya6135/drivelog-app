import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Moon, ShieldCheck, FileText, BatteryCharging,
  Smartphone, Smartphone as AndroidIcon, Landmark, Lock, Sparkles, ChevronDown, LifeBuoy
} from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

interface HelpItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  answer: React.ReactNode;
}

const HELP_ITEMS: HelpItem[] = [
  {
    id: 'first-drive',
    icon: Play,
    question: 'How do I start my first drive?',
    answer: (
      <>
        <p>Tap the big teal <strong>Start Driving Session</strong> button on the Home screen (or the play button in the bottom bar).</p>
        <p>The timer works fully offline. Use <strong>Pause</strong> for gas stops or drive-thrus — your total keeps building. When you arrive, tap <strong>Stop</strong>, add conditions and miles, then save.</p>
      </>
    ),
  },
  {
    id: 'night-hours',
    icon: Moon,
    question: 'How are night hours calculated?',
    answer: (
      <>
        <p>DriveLog doesn't guess from clock times. It calculates the actual sunset for your state, then counts hours beginning about <strong>30 minutes after sunset</strong> — matching how most DMVs define legal night driving.</p>
        <p>A sun or moon badge appears automatically during a drive. You never have to mark it yourself.</p>
      </>
    ),
  },
  {
    id: 'parent-verification',
    icon: ShieldCheck,
    question: 'How does parent verification work?',
    answer: (
      <>
        <p>Every drive entry has a <strong>Parent Sign-Off</strong> toggle. Until it's switched on, the entry shows an amber "Awaiting parent sign-off" badge.</p>
        <p>When a parent reviews the drive and confirms it happened, they toggle it to green "Verified" with their initials. Verified entries appear in the exported PDF with initials per line — exactly what DMV reviewers look for.</p>
      </>
    ),
  },
  {
    id: 'pdf-export',
    icon: FileText,
    question: 'How does PDF export work?',
    answer: (
      <>
        <p>Open the <strong>Export</strong> page to see your totals versus your state's requirements — green checks when you've met them. Tap <strong>Download PDF</strong> for a printable log with signature lines, or <strong>Print Directly</strong>.</p>
        <p>Export works completely offline. Bring two copies to the DMV: one for them, one for your records.</p>
      </>
    ),
  },
  {
    id: 'app-closed',
    icon: BatteryCharging,
    question: 'What happens if the app closes during a drive?',
    answer: (
      <>
        <p>Nothing is lost. The timer saves itself every second, so if your phone dies, the app crashes, or iOS kills the tab — reopening DriveLog restores the exact time using real wall-clock math.</p>
        <p>You'll see a calm "Drive timer recovered. No time was lost." message. Even a drive that backgrounded overnight credits correctly.</p>
      </>
    ),
  },
  {
    id: 'install-ios',
    icon: Smartphone,
    question: 'How do I install on iPhone?',
    answer: (
      <>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open this site in Safari</li>
          <li>Tap the <strong>Share</strong> button at the bottom of the screen</li>
          <li>Scroll and tap <strong>Add to Home Screen</strong></li>
        </ol>
        <p>It launches full-screen like a regular app and works offline.</p>
      </>
    ),
  },
  {
    id: 'install-android',
    icon: AndroidIcon,
    question: 'How do I install on Android?',
    answer: (
      <>
        <p>Chrome will show an <strong>Install app</strong> banner after a visit or two — tap it and confirm.</p>
        <p>You can also use the ⋮ menu → <strong>Add to Home screen</strong>. Same result: an offline-capable home screen app.</p>
      </>
    ),
  },
  {
    id: 'dmv-differs',
    icon: Landmark,
    question: "What if my DMV has different rules?",
    answer: (
      <>
        <p>Pick your state in <strong>Settings → State Goal</strong> — we pre-load hour targets for all 50 states. But states update rules occasionally, so always double-check your local DMV's current requirements.</p>
        <p>If something looks wrong, tell us via the feedback page — include your state and what your DMV said.</p>
      </>
    ),
  },
  {
    id: 'free-limit',
    icon: Lock,
    question: 'Why does the app stop at 20 hours on free?',
    answer: (
      <>
        <p>The first 20 hours are completely free — enough for many families to finish smaller-state requirements. Beyond that, unlimited logging and PDF export require Lifetime Pro.</p>
        <p>In-progress drives are never interrupted; the gate only applies to new drives and exports. There are no ads and no subscriptions — just one fair unlock.</p>
      </>
    ),
  },
  {
    id: 'unlock-pro',
    icon: Sparkles,
    question: 'How do I unlock Pro?',
    answer: (
      <>
        <p>When you reach 20 hours you'll see a milestone screen with an unlock button — or find it anytime under <strong>Settings → Account</strong>.</p>
        <p><strong>$4.99 once.</strong> Unlimited hours, DMV PDF export, multiple supervisors and vehicles — forever, on any device where you sign in. Purchases are handled securely by Stripe.</p>
      </>
    ),
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: HelpItem; isOpen: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  return (
    <div className="app-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`help-panel-${item.id}`}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset min-h-[64px]"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1 font-bold text-sm text-slate-900 dark:text-white">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={`help-panel-${item.id}`}
        role="region"
        aria-label={item.question}
        hidden={!isOpen}
        className="px-4 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 ml-1"
      >
        {item.answer}
      </div>
    </div>
  );
}

export function HelpCenter() {
  useSeo({
    title: 'Help Center & FAQ | DriveLog',
    description: 'How to start a drive, how night hours are calculated, parent verification, offline PDF export, installing on iPhone & Android, and unlocking Pro.',
    canonicalUrl: 'https://drivehours.app/help',
  });

  const [openId, setOpenId] = useState<string | null>('first-drive');

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Help Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Straight answers to the questions parents and teens actually ask.
        </p>
      </header>

      <div className="space-y-2.5">
        {HELP_ITEMS.map(item => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </div>

      <div className="app-card p-5 text-center space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Didn't find your answer?
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center h-14 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-teal transition-all active:scale-[0.98]"
        >
          Send us feedback
        </Link>
      </div>
    </div>
  );
}
