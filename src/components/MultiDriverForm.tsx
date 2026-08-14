import { useState } from 'react';
import { Plus, User, Car, Trash2, X, Save, Edit2 } from 'lucide-react';
import type { DriverProfile, VehicleProfile } from '../types';

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
    role: 'teen' as 'parent' | 'teen',
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
    setDriverForm({ name: '', role: 'teen', phone: '', isPrimaryDriver: false });
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
    if (!driverForm.name.trim() || !driverForm.phone.trim()) return;

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
    if (!vehicleForm.name.trim() || !vehicleForm.make.trim() || !vehicleForm.model.trim()) return;

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
    setDriverForm({ name: driver.name, role: driver.role, phone: driver.phone, isPrimaryDriver: driver.isPrimaryDriver });
    setShowAddDriver(true);
  };

  const handleEditVehicle = (vehicle: VehicleProfile) => {
    setEditingVehicle(vehicle);
    setVehicleForm({ name: vehicle.name, make: vehicle.make, model: vehicle.model, year: vehicle.year, licensePlate: vehicle.licensePlate });
    setShowAddVehicle(true);
  };

  const handleDeleteDriver = (id: string) => {
    if (drivers.length <= 1) {
      alert('You need at least one driver');
      return;
    }
    onDriversChange(drivers.filter(d => d.id !== id));
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      alert('You need at least one vehicle');
      return;
    }
    onVehiclesChange(vehicles.filter(v => v.id !== id));
  };

  return (
    <div className="card-gradient-accent space-y-8">
      {/* Drivers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5" /> Drivers
          </h3>
          <button
            onClick={() => { resetDriverForm(); setShowAddDriver(true); }}
            className="btn-primary text-sm px-4 py-2 touch-target no-tap-highlight"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>

        {drivers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No drivers added yet. Click "Add Driver" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map(driver => (
              <div key={driver.id} className="card-gradient flex items-center justify-between transition-smooth">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${driver.role === 'teen' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{driver.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      {driver.role === 'teen' ? 'Student Driver' : 'Supervising Adult'}
                      {driver.isPrimaryDriver && <span className="badge badge-primary">Primary</span>}
                    </p>
                    <p className="text-xs text-slate-400">{driver.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditDriver(driver)}
                    className="btn-ghost touch-target no-tap-highlight"
                    aria-label="Edit driver"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver.id)}
                    className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 touch-target no-tap-highlight"
                    aria-label="Delete driver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Driver Bottom Sheet */}
        {showAddDriver && (
          <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={resetDriverForm}>
            <div
              className="bottom-sheet safe-top p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-slate-900">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h4>
                <button onClick={resetDriverForm} className="btn-ghost touch-target no-tap-highlight">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={driverForm.name}
                    onChange={e => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field touch-target no-tap-highlight"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                  <select
                    value={driverForm.role}
                    onChange={e => setDriverForm(prev => ({ ...prev, role: e.target.value as 'parent' | 'teen' }))}
                    className="input-field touch-target no-tap-highlight"
                    required
                  >
                    <option value="teen">Student Driver (Teen)</option>
                    <option value="parent">Supervising Adult (Parent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={e => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="input-field touch-target no-tap-highlight"
                    required
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer touch-target no-tap-highlight">
                  <input
                    type="checkbox"
                    checked={driverForm.isPrimaryDriver}
                    onChange={e => setDriverForm(prev => ({ ...prev, isPrimaryDriver: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  Set as primary driver
                </label>
                <div className="flex gap-3 pt-4 safe-bottom">
                  <button
                    type="button"
                    onClick={resetDriverForm}
                    className="btn-secondary flex-1 touch-target no-tap-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 touch-target no-tap-highlight"
                  >
                    <Save className="w-4 h-4" />
                    {editingDriver ? 'Update' : 'Add'} Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* Vehicles Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5" /> Vehicles
          </h3>
          <button
            onClick={() => { resetVehicleForm(); setShowAddVehicle(true); }}
            className="btn-primary text-sm px-4 py-2 touch-target no-tap-highlight"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No vehicles added yet. Click "Add Vehicle" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="card-gradient-success flex items-center justify-between transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Car className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{vehicle.name}</p>
                    <p className="text-sm text-slate-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    <p className="text-xs text-slate-400">Plate: {vehicle.licensePlate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="btn-ghost touch-target no-tap-highlight"
                    aria-label="Edit vehicle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 touch-target no-tap-highlight"
                    aria-label="Delete vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Vehicle Bottom Sheet */}
        {showAddVehicle && (
          <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={resetVehicleForm}>
            <div
              className="bottom-sheet safe-top p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-slate-900">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h4>
                <button onClick={resetVehicleForm} className="btn-ghost touch-target no-tap-highlight">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nickname *</label>
                  <input
                    type="text"
                    value={vehicleForm.name}
                    onChange={e => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mom's Honda"
                    className="input-field touch-target no-tap-highlight"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Make *</label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="Honda"
                      className="input-field touch-target no-tap-highlight"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="CR-V"
                      className="input-field touch-target no-tap-highlight"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                    <input
                      type="text"
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2020"
                      className="input-field touch-target no-tap-highlight"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">License Plate</label>
                    <input
                      type="text"
                      value={vehicleForm.licensePlate}
                      onChange={e => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      placeholder="ABC1234"
                      className="input-field touch-target no-tap-highlight uppercase"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 safe-bottom">
                  <button
                    type="button"
                    onClick={resetVehicleForm}
                    className="btn-secondary flex-1 touch-target no-tap-highlight"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 touch-target no-tap-highlight"
                  >
                    <Save className="w-4 h-4" />
                    {editingVehicle ? 'Update' : 'Add'} Vehicle
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
