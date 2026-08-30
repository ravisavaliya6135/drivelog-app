import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Clock, Play, FileText, Settings as SettingsIcon, Car } from 'lucide-react';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { SiteFooter } from './components/SiteFooter';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for fast code-split performance
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const LogDrive = lazy(() => import('./pages/LogDrive').then(m => ({ default: m.LogDrive })));
const ExportDocs = lazy(() => import('./pages/ExportDocs').then(m => ({ default: m.ExportDocs })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const StateGuide = lazy(() => import('./pages/StateGuide').then(m => ({ default: m.StateGuide })));
const StateGuideIndex = lazy(() => import('./pages/StateGuideIndex').then(m => ({ default: m.StateGuideIndex })));
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
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 pt-safe transition-colors">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_2px_12px_rgba(20,184,166,0.35)]">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">DriveHours</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-teal-600 dark:text-teal-400/90 uppercase tracking-wider">Supervised Log</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `min-h-11 inline-flex items-center px-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/log"
            className={({ isActive }) =>
              `min-h-11 inline-flex items-center px-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              `min-h-11 inline-flex items-center px-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            Export
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `min-h-11 inline-flex items-center px-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
