import { useState } from 'react';
import { Plus, User, Car, Trash2, X, Save, Edit2 } from 'lucide-react';
import type { DriverProfile, VehicleProfile } from '../types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

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

  const driverSheetRef = useAccessibleDialog(showAddDriver, resetDriverForm);
  const vehicleSheetRef = useAccessibleDialog(showAddVehicle, resetVehicleForm);

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
    <div className="space-y-8">
      
      {/* 1. Drivers Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <User className="h-4 w-4 text-teal-700 dark:text-teal-400" aria-hidden="true" /> Drivers & supervisors
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Profiles appear on your DMV report.</p>
          </div>
          <button
            type="button"
            onClick={() => { resetDriverForm(); setShowAddDriver(true); }}
            className="btn-primary min-h-11 py-2 px-3 text-xs font-bold whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Add Driver
          </button>
        </div>

        <div className="space-y-2">
          {drivers.map(driver => (
            <div key={driver.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${
                  driver.role === 'teen' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}>
                  {driver.name ? driver.name[0].toUpperCase() : 'D'}
                </div>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                    {driver.name}
                    {driver.isPrimaryDriver && <span className="badge-teal text-xs">Primary</span>}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300 capitalize">
                    {driver.role === 'teen' ? 'Student Driver' : 'Supervising Adult'} {driver.phone ? `• ${driver.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditDriver(driver)}
                  className="btn-ghost min-h-11 min-w-11 p-2"
                  aria-label={`Edit ${driver.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="btn-ghost min-h-11 min-w-11 p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  aria-label={`Delete ${driver.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Driver Modal */}
        {showAddDriver && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div ref={driverSheetRef} role="dialog" aria-modal="true" aria-labelledby="driver-sheet-title" tabIndex={-1} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h4 id="driver-sheet-title" className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingDriver ? 'Edit Driver Profile' : 'Add New Driver / Supervisor'}
                </h4>
                <button type="button" onClick={resetDriverForm} aria-label="Close driver profile form" className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDriverSubmit} className="space-y-3">
                <div>
                  <label htmlFor="driver-name" className="form-label">Full Name *</label>
                  <input
                    id="driver-name"
                    type="text"
                    required
                    value={driverForm.name}
                    onChange={e => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Alex Smith"
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="driver-role" className="form-label">Role</label>
                  <select
                    id="driver-role"
                    value={driverForm.role}
                    onChange={e => setDriverForm(prev => ({ ...prev, role: e.target.value as 'parent' | 'teen' }))}
                    className="form-input"
                  >
                    <option value="parent">Supervising Adult (Parent/Guardian)</option>
                    <option value="teen">Student Driver (Teen)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="driver-phone" className="form-label">Phone Number</label>
                  <input
                    id="driver-phone"
                    type="tel"
                    value={driverForm.phone}
                    onChange={e => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="form-input"
                  />
                </div>

                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={driverForm.isPrimaryDriver}
                    onChange={e => setDriverForm(prev => ({ ...prev, isPrimaryDriver: e.target.checked }))}
                    className="h-4 w-4 rounded text-teal-700 focus:ring-teal-600"
                  />
                  Set as primary default driver
                </label>

                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={resetDriverForm} className="btn-secondary min-h-12 flex-1 py-2.5 text-sm font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary min-h-12 flex-1 py-2.5 text-sm font-bold">
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
      <section className="space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Car className="h-4 w-4 text-teal-700 dark:text-teal-400" aria-hidden="true" /> Vehicle profiles
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Choose the vehicle used for each supervised drive.</p>
          </div>
          <button
            type="button"
            onClick={() => { resetVehicleForm(); setShowAddVehicle(true); }}
            className="btn-primary min-h-11 py-2 px-3 text-xs font-bold whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </button>
        </div>

        <div className="space-y-2">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {vehicle.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                    {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model} {vehicle.licensePlate ? `• ${vehicle.licensePlate}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditVehicle(vehicle)}
                  className="btn-ghost min-h-11 min-w-11 p-2"
                  aria-label={`Edit ${vehicle.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="btn-ghost min-h-11 min-w-11 p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  aria-label={`Delete ${vehicle.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Vehicle Modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div ref={vehicleSheetRef} role="dialog" aria-modal="true" aria-labelledby="vehicle-sheet-title" tabIndex={-1} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h4 id="vehicle-sheet-title" className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
                </h4>
                <button type="button" onClick={resetVehicleForm} aria-label="Close vehicle profile form" className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVehicleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="vehicle-name" className="form-label">Vehicle Nickname *</label>
                  <input
                    id="vehicle-name"
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
                    <label htmlFor="vehicle-make" className="form-label">Make *</label>
                    <input
                      id="vehicle-make"
                      type="text"
                      required
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g. Toyota"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-model" className="form-label">Model *</label>
                    <input
                      id="vehicle-model"
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
                    <label htmlFor="vehicle-year" className="form-label">Year</label>
                    <input
                      id="vehicle-year"
                      type="text"
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g. 2022"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-license-plate" className="form-label">License Plate</label>
                    <input
                      id="vehicle-license-plate"
                      type="text"
                      value={vehicleForm.licensePlate}
                      onChange={e => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      placeholder="e.g. 7XYZ123"
                      className="form-input uppercase"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={resetVehicleForm} className="btn-secondary min-h-12 flex-1 py-2.5 text-sm font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary min-h-12 flex-1 py-2.5 text-sm font-bold">
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
