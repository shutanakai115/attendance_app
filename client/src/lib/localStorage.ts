import { WorkRecord, Settings } from "@shared/schema";

const STORAGE_KEYS = {
  WORK_RECORDS: 'timeTracker_workRecords',
  SETTINGS: 'timeTracker_settings',
  BACKUP: 'timeTracker_backup'
};

// Work Records
export const saveWorkRecords = (records: WorkRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_RECORDS, JSON.stringify(records));
    // Create backup
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify({
      workRecords: records,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save work records:', error);
  }
};

export const loadWorkRecords = (): WorkRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WORK_RECORDS);
    if (!stored) return [];
    
    const records = JSON.parse(stored);
    // Convert date strings back to Date objects
    return records.map((record: any) => ({
      ...record,
      clockIn: record.clockIn ? new Date(record.clockIn) : undefined,
      clockOut: record.clockOut ? new Date(record.clockOut) : undefined,
      breakStart: record.breakStart ? new Date(record.breakStart) : undefined,
      breakEnd: record.breakEnd ? new Date(record.breakEnd) : undefined,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load work records:', error);
    return [];
  }
};

// Settings
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (): Settings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return null;
    
    const settings = JSON.parse(stored);
    return {
      ...settings,
      createdAt: new Date(settings.createdAt),
      updatedAt: new Date(settings.updatedAt)
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};

// Backup and Recovery
export const createBackup = (): string => {
  const records = loadWorkRecords();
  const settings = loadSettings();
  
  const backup = {
    records,
    settings,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  
  return JSON.stringify(backup, null, 2);
};

export const restoreFromBackup = (backupData: string): boolean => {
  try {
    const backup = JSON.parse(backupData);
    
    if (backup.records) {
      saveWorkRecords(backup.records);
    }
    
    if (backup.settings) {
      saveSettings(backup.settings);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Check storage availability
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};