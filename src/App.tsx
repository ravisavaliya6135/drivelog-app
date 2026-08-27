import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Clock, Play, FileText, Settings as SettingsIcon } from 'lucide-react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { SiteFooter } from './components/SiteFooter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DriveLogLogo } from './components/DriveLogLogo';

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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 pt-safe transition-colors">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <DriveLogLogo className="h-10 w-10 shrink-0 shadow-sm" />
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">DriveLog</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Supervised Log</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `shell-nav-link ${
                isActive ? 'shell-nav-link-active' : ''
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/log"
            className={({ isActive }) =>
              `shell-nav-link ${
                isActive ? 'shell-nav-link-active' : ''
              }`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              `shell-nav-link ${
                isActive ? 'shell-nav-link-active' : ''
              }`
            }
          >
            Export
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `shell-nav-link ${
                isActive ? 'shell-nav-link-active' : ''
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        
        {/* Home */}
        <NavLink
          to="/"
          end
          aria-label="Home"
          className={({ isActive }) =>
            `mobile-nav-link ${
              isActive ? 'mobile-nav-link-active' : ''
            }`
          }
        >
          <HomeIcon aria-hidden="true" className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Home</span>
        </NavLink>

        {/* History */}
        <NavLink
          to="/log"
          aria-label="Driving history"
          className={({ isActive }) =>
            `mobile-nav-link ${
              isActive ? 'mobile-nav-link-active' : ''
            }`
          }
        >
          <Clock aria-hidden="true" className="w-5 h-5 mb-0.5" />
          <span className="text-xs">History</span>
        </NavLink>

        {/* Center Record Drive CTA */}
        <div className="flex justify-center -mt-5">
          <NavLink
            to="/?modal=timer"
            className="w-16 h-16 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-teal flex items-center justify-center active:scale-95 transition-all duration-150 border-4 border-white dark:border-slate-900"
            aria-label="Record driving session"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </NavLink>
        </div>

        {/* Export */}
        <NavLink
          to="/export"
          aria-label="Export documents"
          className={({ isActive }) =>
            `mobile-nav-link ${
              isActive ? 'mobile-nav-link-active' : ''
            }`
          }
        >
          <FileText aria-hidden="true" className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Export</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={({ isActive }) =>
            `mobile-nav-link ${
              isActive ? 'mobile-nav-link-active' : ''
            }`
          }
        >
          <SettingsIcon aria-hidden="true" className="w-5 h-5 mb-0.5" />
          <span className="text-xs">Settings</span>
        </NavLink>

      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EntitlementProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24 md:pb-8 selection:bg-teal-500 selection:text-white antialiased transition-colors">
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
          </ThemeProvider>
        </EntitlementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
