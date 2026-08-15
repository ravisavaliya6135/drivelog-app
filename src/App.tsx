import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { EntitlementProvider } from './contexts/EntitlementContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const LogDrive = lazy(() => import('./pages/LogDrive').then(m => ({ default: m.LogDrive })));
const ExportDocs = lazy(() => import('./pages/ExportDocs').then(m => ({ default: m.ExportDocs })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Skeleton loader for lazy pages
function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 max-w-md mx-auto">
      <div className="h-64 bg-surface-container-lowest rounded-[24px] card-shadow" />
      <div className="h-32 bg-surface-container-lowest rounded-[20px] card-shadow" />
      <div className="h-16 bg-secondary/30 rounded-[24px]" />
    </div>
  );
}

function TopHeader({ activeRole, onToggleRole }: { activeRole: 'teen' | 'parent'; onToggleRole: (role: 'teen' | 'parent') => void }) {
  return (
    <header className="w-full top-0 pt-safe bg-surface/90 dark:bg-surface/90 backdrop-blur-md sticky z-40 h-16 flex justify-between items-center px-margin-mobile border-b border-outline-variant/15">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container relative bg-surface-container-high shadow-sm">
          <img
            alt="Teen Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPmfijFgWI_L0imCLyjnq2Uzs6ucGsT0cyvi_enj7Zve0elET3DceRAGRoNX79RjeIbtr0NyQm4mm8m_-avkc4WDR4CYxNhHg0uo58_e0gUr6kJsFvQtKCUUfBMYlddRTbzdj2Bgo9-PIrEeCgCxFY53JnrA832HGJ_GfAo0Q0wzqMJQP6sRPTjJMxau58yxSR7pHAt1T2L0dECD6mrSo0N0Y0RIIe6AYYH59uVTVgOYTN5aMP7i0"
          />
        </div>
        <span className="font-headline-md text-headline-md text-primary font-bold hidden sm:inline">DriveLog</span>
      </div>

      {/* Role Toggle */}
      <div className="bg-surface-container-high rounded-full p-1 flex items-center shadow-inner relative">
        <button
          type="button"
          onClick={() => onToggleRole('teen')}
          className={`relative z-10 w-[72px] sm:w-[80px] py-1.5 font-label-bold text-label-bold text-center rounded-full transition-all duration-200 ${
            activeRole === 'teen'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Teen
        </button>
        <button
          type="button"
          onClick={() => onToggleRole('parent')}
          className={`relative z-10 w-[72px] sm:w-[80px] py-1.5 font-label-bold text-label-bold text-center rounded-full transition-all duration-200 ${
            activeRole === 'parent'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Parent
        </button>
      </div>

      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low transition-transform active:scale-95 duration-200"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}

function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe bg-surface/85 backdrop-blur-md h-[80px] rounded-t-xl border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(13,27,42,0.05)] md:hidden">
      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
            isActive ? 'text-secondary font-label-bold' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined mb-0.5 ${isActive ? 'material-symbols-fill' : ''}`}>home</span>
            <span className="font-label-sm text-[11px]">Home</span>
          </>
        )}
      </NavLink>

      {/* Record (Center FAB style) */}
      <NavLink
        to="/?modal=timer"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-16 h-full relative transition-all duration-200 ${
            isActive ? 'text-secondary font-label-bold' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <div className="absolute -top-6 bg-secondary text-on-secondary rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-4 border-background active:scale-95 transition-transform">
          <span className="material-symbols-outlined material-symbols-fill text-2xl">radio_button_checked</span>
        </div>
        <span className="font-label-sm text-[11px] mt-7">Record</span>
      </NavLink>

      {/* History */}
      <NavLink
        to="/log"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
            isActive ? 'text-secondary font-label-bold' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined mb-0.5 ${isActive ? 'material-symbols-fill' : ''}`}>history</span>
            <span className="font-label-sm text-[11px]">History</span>
          </>
        )}
      </NavLink>

      {/* Export */}
      <NavLink
        to="/export"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
            isActive ? 'text-secondary font-label-bold' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined mb-0.5 ${isActive ? 'material-symbols-fill' : ''}`}>share</span>
            <span className="font-label-sm text-[11px]">Export</span>
          </>
        )}
      </NavLink>

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
            isActive ? 'text-secondary font-label-bold' : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined mb-0.5 ${isActive ? 'material-symbols-fill' : ''}`}>settings</span>
            <span className="font-label-sm text-[11px]">Settings</span>
          </>
        )}
      </NavLink>
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
            <div className="bg-background text-on-background font-body-md min-h-screen relative pb-[90px] md:pb-0 overflow-x-hidden selection:bg-secondary selection:text-on-secondary">
              
              {/* Decorative Background */}
              <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute inset-0 bg-pattern" />
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-secondary-container/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[30%] bg-primary-fixed/30 rounded-full blur-3xl" />
              </div>

              <TopHeader activeRole={activeRole} onToggleRole={setActiveRole} />

              {/* Desktop Navigation Cluster */}
              <div className="hidden md:flex fixed top-0 right-0 h-16 items-center px-margin-mobile gap-6 z-50">
                <NavLink to="/" className={({ isActive }) => `px-5 py-1.5 rounded-full transition-all duration-200 font-label-bold text-sm ${isActive ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
                  Home
                </NavLink>
                <NavLink to="/?modal=timer" className={({ isActive }) => `px-5 py-1.5 rounded-full transition-all duration-200 font-label-bold text-sm text-on-surface-variant hover:text-primary`}>
                  Record
                </NavLink>
                <NavLink to="/log" className={({ isActive }) => `px-5 py-1.5 rounded-full transition-all duration-200 font-label-bold text-sm ${isActive ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
                  History
                </NavLink>
                <NavLink to="/export" className={({ isActive }) => `px-5 py-1.5 rounded-full transition-all duration-200 font-label-bold text-sm ${isActive ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
                  Export
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `px-5 py-1.5 rounded-full transition-all duration-200 font-label-bold text-sm ${isActive ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
                  Settings
                </NavLink>
              </div>

              <main id="main" className="pt-2 md:pt-4">
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