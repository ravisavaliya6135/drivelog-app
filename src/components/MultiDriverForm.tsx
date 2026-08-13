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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
      {/* Drivers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5" /> Drivers
          </h3>
          <button
            onClick={() => { resetDriverForm(); setShowAddDriver(true); }}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1"
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
              <div key={driver.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${driver.role === 'teen' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {driver.role === 'teen' ? <User className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{driver.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      {driver.role === 'teen' ? 'Student Driver' : 'Supervising Adult'}
                      {driver.isPrimaryDriver && <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-900 text-white rounded">Primary</span>}
                    </p>
                    <p className="text-xs text-slate-400">{driver.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditDriver(driver)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
                    aria-label="Edit driver"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete driver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Driver Modal */}
        {showAddDriver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h4>
                <button onClick={resetDriverForm} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={driverForm.name}
                    onChange={e => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <select
                    value={driverForm.role}
                    onChange={e => setDriverForm(prev => ({ ...prev, role: e.target.value as 'parent' | 'teen' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  >
                    <option value="teen">Student Driver (Teen)</option>
                    <option value="parent">Supervising Adult (Parent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={e => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={driverForm.isPrimaryDriver}
                    onChange={e => setDriverForm(prev => ({ ...prev, isPrimaryDriver: e.target.checked }))}
                    className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                  />
                  Set as primary driver
                </label>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetDriverForm}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700"
                  >
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
            className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1"
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
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-slate-600" />
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
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
                    aria-label="Edit vehicle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Vehicle Modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h4>
                <button onClick={resetVehicleForm} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nickname *</label>
                  <input
                    type="text"
                    value={vehicleForm.name}
                    onChange={e => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mom's Honda"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
                    <input
                      type="text"
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="Honda"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="CR-V"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                    <input
                      type="text"
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2020"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label>
                    <input
                      type="text"
                      value={vehicleForm.licensePlate}
                      onChange={e => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                      placeholder="ABC1234"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-uppercase"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVehicleForm}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700"
                  >
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