import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Clock, Play, FileText, Settings as SettingsIcon, Car, Shield, User, Bell } from 'lucide-react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

// Lazy load pages for fast code-split performance
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const LogDrive = lazy(() => import('./pages/LogDrive').then(m => ({ default: m.LogDrive })));
const ExportDocs = lazy(() => import('./pages/ExportDocs').then(m => ({ default: m.ExportDocs })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4 max-w-xl mx-auto">
      <div className="h-44 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
      <div className="h-28 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
      <div className="h-16 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
}

function TopHeader({ activeRole, onToggleRole }: { activeRole: 'teen' | 'parent'; onToggleRole: (role: 'teen' | 'parent') => void }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 pt-safe transition-colors">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">DriveLog</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Supervised Log</span>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => onToggleRole('teen')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeRole === 'teen'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Teen
          </button>
          <button
            type="button"
            onClick={() => onToggleRole('parent')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeRole === 'parent'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Parent
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/log"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            Export
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function BottomNavbar() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        {/* History */}
        <NavLink
          to="/log"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">History</span>
        </NavLink>

        {/* Center Record Drive CTA */}
        <div className="flex justify-center -mt-5">
          <NavLink
            to="/?modal=timer"
            className="w-13 h-13 p-3.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-teal flex items-center justify-center active:scale-95 transition-all duration-150 border-4 border-white dark:border-slate-900"
            aria-label="Record driving session"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </NavLink>
        </div>

        {/* Export */}
        <NavLink
          to="/export"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Export</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <SettingsIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Settings</span>
        </NavLink>

      </div>
    </nav>
  );
}

export default function App() {
  const [activeRole, setActiveRole] = useState<'teen' | 'parent'>('teen');

  return (
    <BrowserRouter>
      <AuthProvider>
        <EntitlementProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24 md:pb-8 selection:bg-teal-500 selection:text-white antialiased transition-colors">
              <TopHeader activeRole={activeRole} onToggleRole={setActiveRole} />

              <main id="main" className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 md:py-6">
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/log" element={<LogDrive />} />
                    <Route path="/export" element={<ExportDocs />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Suspense>
              </main>

              <PwaInstallPrompt />
              <BottomNavbar />
            </div>
          </ThemeProvider>
        </EntitlementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}