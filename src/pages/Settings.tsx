import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  User, 
  Car, 
  MapPin, 
  Moon, 
  Sun, 
  Monitor, 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Shield, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  LogOut, 
  Sparkles, 
  RotateCcw,
  X
} from 'lucide-react';
import { MultiDriverForm } from '../components/MultiDriverForm';
import { StateSelector } from '../components/StateSelector';
import { useDriveLog } from '../hooks/useDriveLog';
import { useTheme } from '../hooks/useTheme';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useAuth } from '../contexts/AuthContext';
import { useEntitlement, PRO_LIFETIME_PRICE } from '../contexts/EntitlementContext';
import { AuthModal } from '../components/AuthModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { useSeo } from '../hooks/useSeo';

export function Settings() {
  useSeo({
    title: 'State DMV Requirements & App Settings | DriveLog',
    description: 'Configure your state driving targets, manage student drivers & supervisor profiles, and customize app appearance.',
    canonicalUrl: 'https://drivelog-app.vercel.app/settings',
    noindex: true,
  });

  const { drivers, vehicles, refresh } = useDriveLog();
  const { theme, setTheme } = useTheme();
  const pwa = usePwaInstall();
  const { user, signOut } = useAuth();
  const { isPro, totalHoursLogged, freeHoursRemaining, isLimitReached, refreshEntitlement } = useEntitlement();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });

  const [activeTab, setActiveTab] = useState<'account' | 'requirements' | 'drivers' | 'preferences' | 'about'>('account');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [exportData, setExportData] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Check for Stripe Checkout return
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setPaymentSuccessNotice(true);
      refreshEntitlement();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      newParams.delete('session_id');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, refreshEntitlement, setSearchParams]);

  const handleRestorePurchase = async () => {
    setRestoreMessage('Checking entitlement status with server...');
    const hasPro = await refreshEntitlement();
    if (hasPro) {
      setRestoreMessage('✅ Lifetime Pro active and verified!');
    } else {
      setRestoreMessage('No active Lifetime Pro purchase found for this account.');
    }
    setTimeout(() => setRestoreMessage(null), 5000);
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    localStorage.setItem('drivelog-state', stateCode);
  };

  const handleExportAllData = async () => {
    const { getAllDrives, getAllDrivers, getAllVehicles } = await import('../utils/db');
    const [allDrives, allDrivers, allVehicles] = await Promise.all([
      getAllDrives(),
      getAllDrivers(),
      getAllVehicles(),
    ]);
    const data = { drives: allDrives, drivers: allDrivers, vehicles: allVehicles, state: selectedState, exportedAt: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    setExportData(json);
    setShowExportData(true);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DriveLog-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const { saveDrive, saveDriver, saveVehicle, saveSetting } = await import('../utils/db');
        
        if (data.drives) {
          for (const drive of data.drives) {
            await saveDrive(drive);
          }
        }
        if (data.drivers) {
          for (const driver of data.drivers) {
            await saveDriver(driver);
          }
        }
        if (data.vehicles) {
          for (const vehicle of data.vehicles) {
            await saveVehicle(vehicle);
          }
        }
        if (data.state) {
          await saveSetting('drivelog-state', data.state);
          setSelectedState(data.state);
        }
        
        await refresh();
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
        console.error(err);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    if (!confirm('This will delete ALL drives, drivers, and vehicles from this device. Are you sure?')) return;
    if (!confirm('Final confirmation: Click OK to permanently erase local data.')) return;
    
    const { getAllDrives, getAllDrivers, getAllVehicles, deleteDrive, deleteDriver, deleteVehicle } = await import('../utils/db');
    const [allDrives, allDrivers, allVehicles] = await Promise.all([
      getAllDrives(),
      getAllDrivers(),
      getAllVehicles(),
    ]);

    for (const drive of allDrives) {
      await deleteDrive(drive.id);
    }
    for (const driver of allDrivers) {
      await deleteDriver(driver.id);
    }
    for (const vehicle of allVehicles) {
      await deleteVehicle(vehicle.id);
    }

    await refresh();
    alert('All local data cleared.');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account, supervisors, vehicles, and app preferences.
        </p>
      </div>

      {/* 2. Tab Navigation */}
      <div className="app-card p-1.5 overflow-x-auto hide-scrollbar">
        <nav className="flex gap-1 min-w-max" aria-label="Settings tabs">
          <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
            <User className="w-3.5 h-3.5" /> Account
          </TabButton>
          <TabButton active={activeTab === 'requirements'} onClick={() => setActiveTab('requirements')}>
            <MapPin className="w-3.5 h-3.5" /> State Goal
          </TabButton>
          <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')}>
            <Car className="w-3.5 h-3.5" /> Drivers & Cars
          </TabButton>
          <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}>
            <Monitor className="w-3.5 h-3.5" /> Preferences
          </TabButton>
          <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
            <Info className="w-3.5 h-3.5" /> About
          </TabButton>
        </nav>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB: Account & Membership */}
      {activeTab === 'account' && (
        <section className="space-y-4 animate-fade-in">
          
          {/* Payment Success Alert */}
          {paymentSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Payment Successful!</h4>
                  <p className="text-xs">Your DriveLog Lifetime Pro entitlement is now active.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentSuccessNotice(false)}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* User Profile Card */}
          <div className="app-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {user ? user.email : 'Guest Mode (Offline)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user 
                      ? 'Authenticated with Supabase Magic Link' 
                      : 'All data is stored locally on this device.'}
                  </p>
                </div>
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="btn-danger py-2 px-3.5 text-xs font-bold self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary py-2 px-4 text-xs font-bold self-start sm:self-auto"
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In / Create Account
                </button>
              )}
            </div>
          </div>

          {/* Membership Tier Card */}
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Membership Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isPro ? 'Lifetime access to all premium features.' : 'Free tier covers your first 20 practice hours.'}
                </p>
              </div>

              {isPro ? (
                <span className="badge-teal text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Lifetime Pro
                </span>
              ) : (
                <span className="badge-amber text-xs font-bold">
                  Free ({totalHoursLogged}/20h)
                </span>
              )}
            </div>

            {!isPro && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Free Progress</span>
                  <span>{totalHoursLogged} / 20 hours ({freeHoursRemaining}h left)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-teal-600'}`}
                    style={{ width: `${Math.min(100, (totalHoursLogged / 20) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {!isPro ? (
              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-teal-900 dark:text-teal-200">
                    DriveLog Lifetime Pro — {PRO_LIFETIME_PRICE}
                  </h4>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400">
                    One-time payment • Unlimited driving logs • DMV exports • No subscriptions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap shadow-teal"
                >
                  Unlock for {PRO_LIFETIME_PRICE}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                ✓ Unlimited hours logging active. 100% offline capable.
              </div>
            )}

            {/* Restore Purchase */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRestorePurchase}
                className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Purchase / Refresh Status
              </button>
              {restoreMessage && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{restoreMessage}</span>
              )}
            </div>
          </div>

        </section>
      )}

      {/* TAB: State Requirements */}
      {activeTab === 'requirements' && (
        <section className="app-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              State DMV Licensing Targets
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your licensing state to automatically apply legal day/night driving hour requirements and DMV report formats.
          </p>
          <StateSelector
            value={selectedState}
            onChange={handleStateChange}
          />
        </section>
      )}

      {/* TAB: Drivers & Vehicles */}
      {activeTab === 'drivers' && (
        <section className="app-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Supervising Drivers & Vehicles
            </h2>
          </div>
          <MultiDriverForm
            drivers={drivers}
            vehicles={vehicles}
            onDriversChange={async (newDrivers) => {
              const { saveDriver } = await import('../utils/db');
              for (const driver of newDrivers) {
                await saveDriver(driver);
              }
              await refresh();
            }}
            onVehiclesChange={async (newVehicles) => {
              const { saveVehicle } = await import('../utils/db');
              for (const vehicle of newVehicles) {
                await saveVehicle(vehicle);
              }
              await refresh();
            }}
          />
        </section>
      )}

      {/* TAB: Preferences */}
      {activeTab === 'preferences' && (
        <section className="space-y-4 animate-fade-in">
          
          {/* Appearance */}
          <div className="app-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" /> Color Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred color theme or match your device system settings.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  theme === 'light'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  theme === 'dark'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  theme === 'system'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Monitor className="w-4 h-4" /> System
              </button>
            </div>
          </div>

          {/* PWA Installation */}
          <div className="app-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-600" /> App Installation (PWA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pwa.isStandalone
                ? 'DriveLog is running as an installed standalone app with full offline capabilities.'
                : 'Install DriveLog to your home screen for quick offline access while driving.'}
            </p>

            {pwa.isStandalone ? (
              <span className="badge-teal">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> DriveLog is Installed
              </span>
            ) : (
              <button
                type="button"
                onClick={pwa.triggerInstall}
                className="btn-primary py-2.5 px-4 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                {pwa.isIOS ? 'Add to Home Screen Instructions' : 'Install DriveLog App'}
              </button>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="app-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600" /> Data Backup & Restore
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export all local driving logs and vehicle profiles as a JSON file to transfer between devices.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportAllData}
                className="btn-secondary py-2.5 px-4 text-xs font-bold"
              >
                <Download className="w-4 h-4" /> Export Backup (.json)
              </button>
              <label className="btn-secondary py-2.5 px-4 text-xs font-bold cursor-pointer">
                <Upload className="w-4 h-4" /> Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            {showExportData && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Backup JSON Preview</span>
                  <button onClick={() => setShowExportData(false)} className="text-slate-400 hover:text-slate-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={exportData}
                  readOnly
                  rows={4}
                  className="form-input font-mono text-[10px]"
                />
                <button
                  type="button"
                  onClick={handleDownloadExport}
                  className="btn-primary py-1.5 px-3 text-xs font-bold"
                >
                  Download .json File
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="app-card p-5 border-red-200 dark:border-red-900/60 space-y-3">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear Local Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently erase all driving logs, drivers, and vehicles stored on this device.
            </p>
            <button
              type="button"
              onClick={handleClearAllData}
              className="btn-danger py-2 px-4 text-xs font-bold"
            >
              Clear All Local Data
            </button>
          </div>

        </section>
      )}

      {/* TAB: About */}
      {activeTab === 'about' && (
        <section className="space-y-4 animate-fade-in">
          <div className="app-card p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-teal">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">DriveLog</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supervised Teen Driving Log • Version 1.0.0</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Privacy-first, offline-capable PWA designed for parents and teens to track supervised practice hours and export state DMV-compliant reports.
            </p>
          </div>

          <div className="app-card p-5 border-amber-200 dark:border-amber-900/50 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Important Legal Disclaimer
            </h4>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
              DriveLog is a record-keeping utility. Requirements vary by state and change periodically. Always verify current DMV requirements in your jurisdiction prior to your licensing appointment.
            </p>
          </div>
        </section>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'nav-pill-active' : 'nav-pill'}
      aria-selected={active}
    >
      {children}
    </button>
  );
}