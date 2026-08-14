import { useState, useEffect, ErrorBoundary, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, NavLink } from 'react-router-dom';
import { Car, ClipboardList, FileText, Settings, Home, Menu, X, ChevronDown, Sun, Moon, WifiOff } from 'lucide-react';
import { ThemeProvider } from './hooks/useTheme';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const LogDrive = lazy(() => import('./pages/LogDrive').then(m => ({ default: m.LogDrive })));
const ExportDocs = lazy(() => import('./pages/ExportDocs').then(m => ({ default: m.ExportDocs })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Skeleton loader for lazy pages
function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-slate-200 rounded w-3/4" />
      <div className="h-32 bg-slate-200 rounded" />
      <div className="h-24 bg-slate-200 rounded" />
      <div className="h-24 bg-slate-200 rounded" />
      <div className="h-24 bg-slate-200 rounded" />
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { dayMinutes, nightMinutes, totalHours } = useDriveLog();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/log', label: 'Log Drive', icon: ClipboardList },
    { path: '/export', label: 'Export PDF', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden dark:bg-slate-900 dark:border-slate-700">
      <div className="flex justify-around py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors ${
                isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const { dayMinutes, nightMinutes, totalHours } = useDriveLog();
  const isOnline = useOnlineStatus();
  const { resolvedTheme } = useTheme();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 md:hidden dark:bg-slate-900 dark:border-slate-700">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(true)}
              ref={menuButtonRef}
              className="p-2 text-muted hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">DriveLog</h1>
              <p className="text-muted-sm">Teen Driving Hours Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Sun className="w-3 h-3 text-yellow-500" />
              <span>{Math.floor(dayMinutes / 60)}h {dayMinutes % 60}m</span>
              <Moon className="w-3 h-3 text-blue-500 ml-2" />
              <span>{Math.floor(nightMinutes / 60)}h {nightMinutes % 60}m</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { dayMinutes, nightMinutes, totalHours, drivers, vehicles } = useDriveLog();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/log', label: 'Log Drive', icon: ClipboardList },
    { path: '/export', label: 'Export PDF', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Keyboard: Escape closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus management: return focus to menu button when closed
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen && menuButtonRef.current) {
      menuButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">DriveLog</h2>
                <p className="text-muted-sm">Teen Driving Hours Tracker</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-muted-sm uppercase tracking-wide mb-3">Total Progress</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalHours.toFixed(1)}h</p>
                <p className="text-muted-xs">Total</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-2xl font-bold text-yellow-600 tabular-nums">{Math.floor(dayMinutes / 60)}h {dayMinutes % 60}m</p>
                <p className="text-muted-xs">Day</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-2xl font-bold text-blue-600 tabular-nums">{Math.floor(nightMinutes / 60)}h {nightMinutes % 60}m</p>
                <p className="text-muted-xs">Night</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'text-muted hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted'}`} aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-muted-xs text-center">
              v1.0.0 • Privacy-first • Offline-capable
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <AppHeader />
        <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        
        <main id="main" className="pb-16 md:pb-0">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/log" element={<LogDrive />} />
              <Route path="/export" element={<ExportDocs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>

        {/* Desktop Navigation */}\n        <nav className="hidden md:fixed md:bottom-0 md:left-0 md:right-0 bg-white border-t border-slate-200 z-40 dark:bg-slate-900 dark:border-slate-700" aria-label="Desktop navigation">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-around py-2">
              <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-current={({ isActive }) => isActive ? 'page' : undefined} aria-label="Home">
                <Home className={`w-6 h-6 ${({ isActive }) => isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-hidden="true" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/log" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-current={({ isActive }) => isActive ? 'page' : undefined} aria-label="Log Drive">
                <ClipboardList className={`w-6 h-6 ${({ isActive }) => isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-hidden="true" />
                <span>Log Drive</span>
              </NavLink>
              <NavLink to="/export" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-current={({ isActive }) => isActive ? 'page' : undefined} aria-label="Export PDF">
                <FileText className={`w-6 h-6 ${({ isActive }) => isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-hidden="true" />
                <span>Export PDF</span>
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 text-sm transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-current={({ isActive }) => isActive ? 'page' : undefined} aria-label="Settings">
                <Settings className={`w-6 h-6 ${({ isActive }) => isActive ? 'text-slate-900 dark:text-slate-100' : 'text-muted'}`} aria-hidden="true" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </nav>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}