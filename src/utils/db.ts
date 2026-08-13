import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { DriveEntry, DriverProfile, VehicleProfile } from '../types';

interface DriveLogDB extends DBSchema {
  drives: {
    key: string;
    value: DriveEntry;
    indexes: { 'by-date': string; 'by-driver': string; 'by-state': string };
  };
  drivers: {
    key: string;
    value: DriverProfile;
  };
  vehicles: {
    key: string;
    value: VehicleProfile;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'DriveLogDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<DriveLogDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DriveLogDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DriveLogDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Drives store
      const driveStore = db.createObjectStore('drives', { keyPath: 'id' });
      driveStore.createIndex('by-date', 'date');
      driveStore.createIndex('by-driver', 'driverId');
      driveStore.createIndex('by-state', 'state');

      // Drivers store
      db.createObjectStore('drivers', { keyPath: 'id' });

      // Vehicles store
      db.createObjectStore('vehicles', { keyPath: 'id' });

      // Settings store
      db.createObjectStore('settings', { keyPath: 'key' });
    },
  });

  return dbInstance;
}

// Drive operations
export async function saveDrive(entry: DriveEntry): Promise<void> {
  const db = await getDB();
  await db.put('drives', entry);
}

export async function getDrive(id: string): Promise<DriveEntry | undefined> {
  const db = await getDB();
  return db.get('drives', id);
}

export async function getAllDrives(): Promise<DriveEntry[]> {
  const db = await getDB();
  return db.getAll('drives');
}

export async function getDrivesByDate(date: string): Promise<DriveEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('drives', 'by-date', date);
}

export async function getDrivesByDriver(driverId: string): Promise<DriveEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('drives', 'by-driver', driverId);
}

export async function getDrivesByState(state: string): Promise<DriveEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('drives', 'by-state', state);
}

export async function deleteDrive(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('drives', id);
}

// Driver operations
export async function saveDriver(driver: DriverProfile): Promise<void> {
  const db = await getDB();
  await db.put('drivers', driver);
}

export async function getAllDrivers(): Promise<DriverProfile[]> {
  const db = await getDB();
  return db.getAll('drivers');
}

export async function getDriver(id: string): Promise<DriverProfile | undefined> {
  const db = await getDB();
  return db.get('drivers', id);
}

export async function deleteDriver(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('drivers', id);
}

// Vehicle operations
export async function saveVehicle(vehicle: VehicleProfile): Promise<void> {
  const db = await getDB();
  await db.put('vehicles', vehicle);
}

export async function getAllVehicles(): Promise<VehicleProfile[]> {
  const db = await getDB();
  return db.getAll('vehicles');
}

export async function getVehicle(id: string): Promise<VehicleProfile | undefined> {
  const db = await getDB();
  return db.get('vehicles', id);
}

export async function deleteVehicle(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vehicles', id);
}

// Settings operations
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value as T | undefined;
}

// Utility: generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility: format duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Utility: calculate day/night split
export function calculateDayNightSplit(entries: DriveEntry[]): { day: number; night: number } {
  return entries.reduce(
    (acc, entry) => {
      if (entry.dayNight === 'day') {
        acc.day += entry.durationMinutes;
      } else {
        acc.night += entry.durationMinutes;
      }
      return acc;
    },
    { day: 0, night: 0 }
  );
}

// Utility: get total hours
export function getTotalHours(entries: DriveEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.durationMinutes, 0) / 60;
}