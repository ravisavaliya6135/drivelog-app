import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Clock, Play, FileText, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { SiteFooter } from './components/SiteFooter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrandLogo } from './components/BrandLogo';

// Lazy load pages for fast code-split performance
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const LogDrive = lazy(() => import('./pages/LogDrive').then(m => ({ default: m.LogDrive })));
const ExportDocs = lazy(() => import('./pages/ExportDocs').then(m => ({ default: m.ExportDocs })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const StateGuide = lazy(() => import('./pages/StateGuide').then(m => ({ default: m.StateGuide })));
const StateGuideIndex = lazy(() => import('./pages/StateGuideIndex').then(m => ({ default: m.StateGuideIndex })));
const NightDrivingHoursGuide = lazy(() => import('./pages/NightDrivingHoursGuide').then(m => ({ default: m.NightDrivingHoursGuide })));
const FiftyHourDrivingLogGuide = lazy(() => import('./pages/FiftyHourDrivingLogGuide').then(m => ({ default: m.FiftyHourDrivingLogGuide })));
const DmvDrivingHoursVerificationGuide = lazy(() => import('./pages/DmvDrivingHoursVerificationGuide').then(m => ({ default: m.DmvDrivingHoursVerificationGuide })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const HelpCenter = lazy(() => import('./pages/HelpCenter').then(m => ({ default: m.HelpCenter })));
const ContactFeedback = lazy(() => import('./pages/ContactFeedback').then(m => ({ default: m.ContactFeedback })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4 max-w-xl mx-auto">
      <div className="h-44 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
      <div className="h-28 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
      <div className="h-16 bg-slate-200/70 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
}

function TopHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#080C14]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 pt-safe transition-colors shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="hover:opacity-90 transition-opacity focus:outline-none">
          <BrandLogo size="md" />
        </NavLink>

        {/* Desktop Nav & Theme Action */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `min-h-10 inline-flex items-center px-4 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300 dark:border dark:border-teal-500/35' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/log"
              className={({ isActive }) =>
                `min-h-10 inline-flex items-center px-4 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300 dark:border dark:border-teal-500/35' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/export"
              className={({ isActive }) =>
                `min-h-10 inline-flex items-center px-4 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300 dark:border dark:border-teal-500/35' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              Export
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `min-h-10 inline-flex items-center px-4 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300 dark:border dark:border-teal-500/35' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              Settings
            </NavLink>
          </nav>

          {/* Theme Quick Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNavbar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `min-h-16 flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Home</span>
        </NavLink>

        {/* History */}
        <NavLink
          to="/log"
          className={({ isActive }) =>
            `min-h-16 flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-xs">History</span>
        </NavLink>

        {/* Center Record Drive CTA */}
        <div className="flex justify-center -mt-5">
          <NavLink
            to="/?modal=timer"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-[0_0_25px_rgba(20,184,166,0.45)] flex items-center justify-center active:scale-95 transition-all duration-150 border-4 border-white dark:border-[#0B0F19]"
            aria-label="Record driving session"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </NavLink>
        </div>

        {/* Export */}
        <NavLink
          to="/export"
          className={({ isActive }) =>
            `min-h-16 flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Export</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `min-h-16 flex flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <SettingsIcon className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Settings</span>
        </NavLink>

      </div>
    </nav>
  );
}

function AppShell() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col pb-24 md:pb-8 selection:bg-teal-500 selection:text-white antialiased transition-colors">
      <Toaster
        position="top-center"
        richColors
        closeButton
        theme={resolvedTheme}
        toastOptions={{
          className: 'rounded-2xl font-sans text-xs font-semibold shadow-xl border border-slate-200 dark:border-slate-800',
        }}
      />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">
        Skip to main content
      </a>
      <TopHeader />

      <main id="main" className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 md:py-6">
        <Suspense fallback={<PageSkeleton />}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/log" element={<LogDrive />} />
              <Route path="/export" element={<ExportDocs />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Programmatic SEO state guides — /dmv/ca, /dmv/tx, ... all 50 states */}
              <Route path="/dmv" element={<StateGuideIndex />} />
              <Route path="/night-driving-hours" element={<NightDrivingHoursGuide />} />
              <Route path="/50-hour-driving-log" element={<FiftyHourDrivingLogGuide />} />
              <Route path="/does-dmv-check-driving-hours" element={<DmvDrivingHoursVerificationGuide />} />
              <Route path="/dmv/:stateCode" element={<StateGuide />} />
              {/* Trust & support pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactFeedback />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<div className="app-card p-8 text-center"><h1 className="text-2xl font-bold">Page not found</h1><p className="mt-2 text-slate-500">This page does not exist.</p></div>} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>

      <PwaInstallPrompt />
      <SiteFooter />
      <BottomNavbar />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <EntitlementProvider>
            <ThemeProvider>
              <AppShell />
            </ThemeProvider>
          </EntitlementProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
