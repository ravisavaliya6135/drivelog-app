import { useState, useEffect, useRef } from 'react';
import { Plus, User, Car, Trash2, X, Save, Edit2, Check } from 'lucide-react';
import type { DriverProfile, VehicleProfile } from '../types';

function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

interface MultiDriverFormProps {
  drivers: DriverProfile[];
  vehicles: VehicleProfile[];
  onDriversChange: (drivers: DriverProfile[]) => void;
  onVehiclesChange: (vehicles: VehicleProfile[]) => void;
}

export function MultiDriverForm({ drivers, vehicles, onDriversChange, onVehiclesChange }: MultiDriverFormProps) {
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverProfile | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleProfile | null>(null);
  const driverSheetRef = useFocusTrap(showAddDriver);
  const vehicleSheetRef = useFocusTrap(showAddVehicle);

  const [driverForm, setDriverForm] = useState({
    name: '',
    role: 'parent' as 'parent' | 'teen',
    phone: '',
    isPrimaryDriver: false,
  });

  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
  });

  const resetDriverForm = () => {
    setDriverForm({ name: '', role: 'parent', phone: '', isPrimaryDriver: false });
    setEditingDriver(null);
    setShowAddDriver(false);
  };

  const resetVehicleForm = () => {
    setVehicleForm({ name: '', make: '', model: '', year: '', licensePlate: '' });
    setEditingVehicle(null);
    setShowAddVehicle(false);
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.name.trim()) return;

    if (editingDriver) {
      const updated = drivers.map(d => d.id === editingDriver.id ? { ...driverForm, id: editingDriver.id } : d);
      onDriversChange(updated);
    } else {
      const newDriver: DriverProfile = {
        ...driverForm,
        id: `driver-${Date.now()}`,
      };
      onDriversChange([...drivers, newDriver]);
    }
    resetDriverForm();
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.name.trim() || !vehicleForm.make.trim()) return;

    if (editingVehicle) {
      const updated = vehicles.map(v => v.id === editingVehicle.id ? { ...vehicleForm, id: editingVehicle.id } : v);
      onVehiclesChange(updated);
    } else {
      const newVehicle: VehicleProfile = {
        ...vehicleForm,
        id: `vehicle-${Date.now()}`,
      };
      onVehiclesChange([...vehicles, newVehicle]);
    }
    resetVehicleForm();
  };

  const handleEditDriver = (driver: DriverProfile) => {
    setEditingDriver(driver);
    setDriverForm({ name: driver.name, role: driver.role, phone: driver.phone || '', isPrimaryDriver: Boolean(driver.isPrimaryDriver) });
    setShowAddDriver(true);
  };

  const handleEditVehicle = (vehicle: VehicleProfile) => {
    setEditingVehicle(vehicle);
    setVehicleForm({ name: vehicle.name, make: vehicle.make, model: vehicle.model, year: vehicle.year || '', licensePlate: vehicle.licensePlate || '' });
    setShowAddVehicle(true);
  };

  const handleDeleteDriver = (id: string) => {
    if (drivers.length <= 1) {
      alert('You need at least one supervisor or driver profile.');
      return;
    }
    onDriversChange(drivers.filter(d => d.id !== id));
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      alert('You need at least one vehicle profile.');
      return;
    }
    onVehiclesChange(vehicles.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Drivers Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-600" /> Drivers & Supervisors
          </h3>
          <button
            type="button"
            onClick={() => { resetDriverForm(); setShowAddDriver(true); }}
            className="btn-primary py-1.5 px-3 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Driver
          </button>
        </div>

        <div className="space-y-2">
          {drivers.map(driver => (
            <div key={driver.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  driver.role === 'teen' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}>
                  {driver.name ? driver.name[0].toUpperCase() : 'D'}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {driver.name}
                    {driver.isPrimaryDriver && <span className="badge-teal text-[10px]">Primary</span>}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                    {driver.role === 'teen' ? 'Student Driver' : 'Supervising Adult'} {driver.phone ? `• ${driver.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditDriver(driver)}
                  className="btn-ghost p-1.5"
                  aria-label="Edit driver"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="btn-ghost p-1.5 text-red-500 hover:text-red-600"
                  aria-label="Delete driver"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Driver Modal */}
        {showAddDriver && (
          <div ref={driverSheetRef} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingDriver ? 'Edit Driver Profile' : 'Add New Driver / Supervisor'}
                </h4>
                <button type="button" onClick={resetDriverForm} className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDriverSubmit} className="space-y-3">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={driverForm.name}
                    onChange={e => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Alex Smith"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    value={driverForm.role}
                    onChange={e => setDriverForm(prev => ({ ...prev, role: e.target.value as 'parent' | 'teen' }))}
                    className="form-input"
                  >
                    <option value="parent">Supervising Adult (Parent/Guardian)</option>
                    <option value="teen">Student Driver (Teen)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={e => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="form-input"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={driverForm.isPrimaryDriver}
                    onChange={e => setDriverForm(prev => ({ ...prev, isPrimaryDriver: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  Set as primary default driver
                </label>

                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={resetDriverForm} className="btn-secondary flex-1 py-2.5 text-xs font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs font-bold">
                    <Save className="w-3.5 h-3.5" />
                    {editingDriver ? 'Save Changes' : 'Add Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* 2. Vehicles Section */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Car className="w-4 h-4 text-teal-600" /> Vehicle Profiles
          </h3>
          <button
            type="button"
            onClick={() => { resetVehicleForm(); setShowAddVehicle(true); }}
            className="btn-primary py-1.5 px-3 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </button>
        </div>

        <div className="space-y-2">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    {vehicle.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model} {vehicle.licensePlate ? `• ${vehicle.licensePlate}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditVehicle(vehicle)}
                  className="btn-ghost p-1.5"
                  aria-label="Edit vehicle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="btn-ghost p-1.5 text-red-500 hover:text-red-600"
                  aria-label="Delete vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Vehicle Modal */}
        {showAddVehicle && (
          <div ref={vehicleSheetRef} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
                </h4>
                <button type="button" onClick={resetVehicleForm} className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVehicleSubmit} className="space-y-3">
                <div>
                  <label className="form-label">Vehicle Nickname *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.name}
                    onChange={e => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Family SUV"
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">Make *</label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g. Toyota"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Model *</label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g. RAV4"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">Year</label>
                    <input
                      type="text"
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g. 2022"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">License Plate</label>
                    <input
                      type="text"
                      value={vehicleForm.licensePlate}
                      onChange={e => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      placeholder="e.g. 7XYZ123"
                      className="form-input uppercase"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={resetVehicleForm} className="btn-secondary flex-1 py-2.5 text-xs font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs font-bold">
                    <Save className="w-3.5 h-3.5" />
                    {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
