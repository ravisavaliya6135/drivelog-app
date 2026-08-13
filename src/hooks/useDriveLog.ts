import { useState, useEffect, useCallback } from 'react';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';
import {
  saveDrive,
  getAllDrives,
  getDrivesByDate,
  getDrivesByDriver,
  deleteDrive,
  saveDriver,
  getAllDrivers,
  deleteDriver,
  saveVehicle,
  getAllVehicles,
  deleteVehicle,
  generateId,
  formatDuration,
  calculateDayNightSplit,
  getTotalHours,
} from '../utils/db';

export function useDriveLog() {
  const [drives, setDrives] = useState<DriveEntry[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allDrives, allDrivers, allVehicles] = await Promise.all([
        getAllDrives(),
        getAllDrivers(),
        getAllVehicles(),
      ]);
      setDrives(allDrives.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
      setDrivers(allDrivers);
      setVehicles(allVehicles);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drive operations
  const addDrive = useCallback(async (entry: Omit<DriveEntry, 'id'>) => {
    const newEntry: DriveEntry = { ...entry, id: generateId() };
    await saveDrive(newEntry);
    setDrives(prev => [newEntry, ...prev].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    return newEntry;
  }, []);

  const updateDrive = useCallback(async (entry: DriveEntry) => {
    await saveDrive(entry);
    setDrives(prev => prev.map(d => d.id === entry.id ? entry : d).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
  }, []);

  const removeDrive = useCallback(async (id: string) => {
    await deleteDrive(id);
    setDrives(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDrivesForDate = useCallback(async (date: string) => {
    return getDrivesByDate(date);
  }, []);

  const getDrivesForDriver = useCallback(async (driverId: string) => {
    return getDrivesByDriver(driverId);
  }, []);

  // Driver operations
  const addDriver = useCallback(async (driver: Omit<DriverProfile, 'id'>) => {
    const newDriver: DriverProfile = { ...driver, id: generateId() };
    await saveDriver(newDriver);
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  }, []);

  const removeDriver = useCallback(async (id: string) => {
    await deleteDriver(id);
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  // Vehicle operations
  const addVehicle = useCallback(async (vehicle: Omit<VehicleProfile, 'id'>) => {
    const newVehicle: VehicleProfile = { ...vehicle, id: generateId() };
    await saveVehicle(newVehicle);
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, []);

  const removeVehicle = useCallback(async (id: string) => {
    await deleteVehicle(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  // Computed values
  const todaysDrives = drives.filter(d => d.date === new Date().toISOString().split('T')[0]);
  const { day, night } = calculateDayNightSplit(drives);
  const totalHours = getTotalHours(drives);

  return {
    // State
    drives,
    drivers,
    vehicles,
    loading,
    todaysDrives,
    
    // Computed
    dayMinutes: day,
    nightMinutes: night,
    totalHours,
    totalMinutes: day + night,
    
    // Drive actions
    addDrive,
    updateDrive,
    removeDrive,
    getDrivesForDate,
    getDrivesForDriver,
    
    // Driver actions
    addDriver,
    removeDriver,
    
    // Vehicle actions
    addVehicle,
    removeVehicle,
    
    // Utilities
    formatDuration,
    refresh: loadAllData,
  };
}