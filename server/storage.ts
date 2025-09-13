import { type WorkRecord, type Settings, type InsertWorkRecord, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Work Records
  getWorkRecord(id: string): Promise<WorkRecord | undefined>;
  getWorkRecordsByDate(date: string): Promise<WorkRecord[]>;
  getAllWorkRecords(): Promise<WorkRecord[]>;
  createWorkRecord(record: InsertWorkRecord): Promise<WorkRecord>;
  updateWorkRecord(id: string, updates: Partial<WorkRecord>): Promise<WorkRecord>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private workRecords: Map<string, WorkRecord>;
  private settings: Settings;

  constructor() {
    this.workRecords = new Map();
    this.settings = {
      id: 'main',
      hourlyRate: 3000,
      overtimeRate: 3750,
      targetHoursPerDay: 480, // 8 hours in minutes
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Work Records
  async getWorkRecord(id: string): Promise<WorkRecord | undefined> {
    return this.workRecords.get(id);
  }

  async getWorkRecordsByDate(date: string): Promise<WorkRecord[]> {
    return Array.from(this.workRecords.values()).filter(
      (record) => record.date === date,
    );
  }

  async getAllWorkRecords(): Promise<WorkRecord[]> {
    return Array.from(this.workRecords.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createWorkRecord(insertRecord: InsertWorkRecord): Promise<WorkRecord> {
    const id = randomUUID();
    const record: WorkRecord = {
      ...insertRecord,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workRecords.set(id, record);
    return record;
  }

  async updateWorkRecord(id: string, updates: Partial<WorkRecord>): Promise<WorkRecord> {
    const existing = this.workRecords.get(id);
    if (!existing) {
      throw new Error(`Work record not found: ${id}`);
    }
    
    const updated: WorkRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.workRecords.set(id, updated);
    return updated;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
