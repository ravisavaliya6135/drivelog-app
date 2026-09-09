import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getActiveTimerRecord } from '../utils/db';

/**
 * Sitewide trust/support footer. Hidden during an active drive session
 * (zero-distraction in-car standard) and on the full-screen timer overlay.
 */
export function SiteFooter() {
  const [driveActive, setDriveActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const record = await getActiveTimerRecord();
        if (!cancelled) setDriveActive(Boolean(record?.isRunning));
      } catch {
        // offline-safe: default to showing footer
      }
    };
    void check();
    document.addEventListener('visibilitychange', check);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  if (driveActive) return null;

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/help">Help</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
          <FooterLink to="/terms">Terms</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </nav>

        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            DriveHours — it's not complicated, it's just a log.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            © {new Date().getFullYear()} DriveHours · A record-keeping tool. Verify current requirements with your local DMV.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-xs font-semibold min-h-[44px] inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-1 ${
          isActive
            ? 'text-teal-700 dark:text-teal-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
