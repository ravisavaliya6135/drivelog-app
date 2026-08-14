import { ArrowLeft, Save, X, User, Car, Trash2, Edit2, Plus, MapPin, Bell, Moon, Sun, Download, Wrench, Info, Shield, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MultiDriverForm } from '../components/MultiDriverForm';
import { StateSelector } from '../components/StateSelector';
import { useDriveLog } from '../hooks/useDriveLog';
import { useTheme } from '../hooks/useTheme';
import { US_STATES } from '../types';

export function Settings() {
  const { drivers, vehicles, loading, refresh } = useDriveLog();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [selectedState, setSelectedState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('drivelog-state') || 'CA';
    }
    return 'CA';
  });
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles' | 'preferences' | 'about'>('drivers');
  const [showExportData, setShowExportData] = useState(false);
  const [exportData, setExportData] = useState('');

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
    if (!confirm('This will delete ALL drives, drivers, and vehicles. This cannot be undone. Are you sure?')) return;
    if (!confirm('Last chance! Type "DELETE" to confirm.')) return;
    
    const { getAllDrives, getAllDrivers, getAllVehicles, deleteDrive, deleteDriver, deleteVehicle } = await import('../utils/db');
    const [allDrives, allDrivers, allVehicles] = await Promise.all([
      getAllDrives(),
      getAllDrivers(),
      getAllVehicles(),
    ]);
    
    await Promise.all([
      ...allDrives.map(d => deleteDrive(d.id)),
      ...allDrivers.map(d => deleteDriver(d.id)),
      ...allVehicles.map(v => deleteVehicle(v.id)),
    ]);
    
    await refresh();
    alert('All data cleared.');
  };

  if (loading) {
      return (
        <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center safe-top safe-bottom`}>
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      );
    }

  const state = US_STATES.find(s => s.code === selectedState) || US_STATES[4];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} pb-20 safe-top safe-bottom`}>
      {/* Header */}
      <header className="glass-header safe-top">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="btn-ghost rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Settings</h1>
              <p className="text-xs text-muted">Manage drivers, vehicles & preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="card-gradient-accent !p-1.5">
          <nav className="flex gap-1" aria-label="Settings tabs">
            <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')}>
              <User className="w-4 h-4" /> Drivers
            </TabButton>
            <TabButton active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')}>
              <Car className="w-4 h-4" /> Vehicles
            </TabButton>
            <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}>
              <MapPin className="w-4 h-4" /> Preferences
            </TabButton>
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
              <Info className="w-4 h-4" /> About
            </TabButton>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'drivers' && (
          <section aria-labelledby="drivers-heading">
            <h2 id="drivers-heading" className="text-lg font-semibold text-slate-900 mb-4">Manage Drivers</h2>
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

        {activeTab === 'vehicles' && (
          <section aria-labelledby="vehicles-heading">
            <h2 id="vehicles-heading" className="text-lg font-semibold text-slate-900 mb-4">Manage Vehicles</h2>
            <p className="text-muted mb-4">Use the Drivers tab to manage vehicles (they're grouped together).</p>
            <div className="text-center py-8">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-muted">Vehicle management is in the Drivers tab</p>
            </div>
          </section>
        )}

        {activeTab === 'preferences' && (
                  <section className="space-y-6" aria-labelledby="preferences-heading">
                    <h2 id="preferences-heading" className="text-lg font-semibold text-slate-900">Preferences</h2>
            
                    {/* Appearance / Theme */}
                    <div className="card-gradient">
                      <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-yellow-500" /> Appearance
                      </h3>
                      <p className="text-sm text-muted mb-4">
                        Choose your preferred color scheme. System follows your device settings.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium border-2 transition-smooth ${
                            theme === 'light'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          aria-pressed={theme === 'light'}
                        >
                          <Sun className="w-5 h-5" /> Light
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium border-2 transition-smooth ${
                            theme === 'dark'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          aria-pressed={theme === 'dark'}
                        >
                          <Moon className="w-5 h-5" /> Dark
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium border-2 transition-smooth ${
                            theme === 'system'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          aria-pressed={theme === 'system'}
                        >
                          <Monitor className="w-5 h-5" /> System
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Current: <span className="font-medium capitalize">{theme}</span> 
                        {theme === 'system' && <span className="text-muted"> ({resolvedTheme})</span>}
                      </p>
                    </div>

                    {/* Default State */}
                    <div className="card-gradient">
              <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Default State
              </h3>
              <p className="text-sm text-muted mb-4">
                This determines legal night calculations and DMV requirements for PDF export.
              </p>
              <StateSelector
                value={selectedState}
                onChange={handleStateChange}
                showWarning={true}
              />
            </div>

            {/* Data Management */}
            <div className="card-gradient-accent">
              <h3 className="text-md font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-500" />
                Data Backup & Restore
              </h3>
              <p className="text-sm text-muted mb-4">
                Export all your data as JSON for backup or to transfer to another device.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportAllData}
                  className="btn-primary"
                >
                  <Download className="w-4 h-4" />
                  Export All Data (JSON)
                </button>
                <label className="btn-secondary cursor-pointer">
                  <Download className="w-4 h-4" />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              {showExportData && (
                <div className="mt-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50 transition-smooth">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Backup Data (copy or download)</span>
                    <button
                      onClick={() => { setShowExportData(false); }}
                      className="btn-ghost !p-1 text-muted hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={exportData}
                    readOnly
                    rows={8}
                    className="input-field font-mono text-xs"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleDownloadExport}
                      className="btn-primary !px-3 !py-1.5 !text-sm"
                    >
                      Download .json File
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(exportData); alert('Copied to clipboard!'); }}
                      className="btn-secondary !px-3 !py-1.5 !text-sm"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="card-gradient-warning border-red-200">
              <h3 className="text-md font-medium text-red-700 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-red-600 mb-4">
                These actions are irreversible. Use with extreme caution.
              </p>
              <button
                onClick={handleClearAllData}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-smooth"
              >
                <Trash2 className="w-4 h-4" />
                Clear ALL Data (Drives, Drivers, Vehicles)
              </button>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="space-y-6" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-lg font-semibold text-slate-900">About DriveLog</h2>
            
            <div className="card-gradient-accent">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">DriveLog</h3>
                <p className="text-muted mt-1">Teen Driving Hours Tracker</p>
                <span className="badge-primary mt-2">Version 1.0.0</span>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <p>
                  DriveLog is a privacy-first, offline-capable Progressive Web App designed to help parents 
                  and teens track supervised driving hours for DMV license requirements.
                </p>
                <p>
                  <strong>Key Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Offline-first — works without internet</li>
                  <li>Auto day/night detection (legal 30-min after sunset)</li>
                  <li>DMV-ready PDF export for all 50 states</li>
                  <li>Multi-driver & multi-vehicle support</li>
                  <li>No ads, no tracking, no subscriptions</li>
                  <li>Installable as a native-like app (PWA)</li>
                </ul>

                <p className="pt-4 border-t border-slate-200">
                  <strong>Built with:</strong> React 18, TypeScript, Tailwind CSS, IndexedDB, @react-pdf/renderer, SunCalc
                </p>
                <p>
                  <strong>Privacy:</strong> All data stays on your device. No analytics, no cloud sync, no accounts required.
                </p>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="card-gradient-warning">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Important Legal Disclaimer
                <span className="badge-warning">Important</span>
              </h4>
              <p className="text-sm text-amber-700">
                DriveLog is a record-keeping tool only. It does not guarantee license approval or DMV acceptance.
                Requirements vary by state and change over time. Always verify current requirements with your
                local DMV before your licensing appointment. Some states may require specific forms or digital submissions.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 ${
        active ? 'nav-pill-active' : 'nav-pill'
      }`}
      aria-selected={active}
    >
      {children}
    </button>
  );
}