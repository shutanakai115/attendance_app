import { z } from "zod";

export type WorkStatus = 'not_started' | 'working' | 'on_break' | 'finished';

export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalBreakMinutes: number;
  totalWorkMinutes: number;
  status: WorkStatus;
  earnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  hourlyRate: number;
  overtimeRate: number;
  targetHoursPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyStats {
  totalHours: number;
  totalEarnings: number;
  workingDays: number;
  averageHoursPerDay: number;
}

export const insertWorkRecordSchema = z.object({
  date: z.string(),
  status: z.enum(['not_started', 'working', 'on_break', 'finished']),
  clockIn: z.date().optional(),
  clockOut: z.date().optional(),
  breakStart: z.date().optional(),
  breakEnd: z.date().optional(),
  totalBreakMinutes: z.number().default(0),
  totalWorkMinutes: z.number().default(0),
  earnings: z.number().default(0),
});

export const insertSettingsSchema = z.object({
  hourlyRate: z.number().min(0),
  overtimeRate: z.number().min(0),
  targetHoursPerDay: z.number().min(0),
});

export type InsertWorkRecord = z.infer<typeof insertWorkRecordSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
