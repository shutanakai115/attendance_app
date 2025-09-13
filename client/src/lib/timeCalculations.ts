import { WorkRecord, WorkStatus } from "@shared/schema";

export const calculateWorkMinutes = (clockIn?: Date, clockOut?: Date, breakMinutes: number = 0): number => {
  if (!clockIn) return 0;
  
  const endTime = clockOut || new Date();
  const totalMinutes = Math.floor((endTime.getTime() - clockIn.getTime()) / 1000 / 60);
  
  return Math.max(0, totalMinutes - breakMinutes);
};

export const calculateEarnings = (workMinutes: number, hourlyRate: number, overtimeRate?: number, standardHours: number = 480): number => {
  if (workMinutes <= standardHours) {
    return (workMinutes / 60) * hourlyRate;
  }
  
  const regularEarnings = (standardHours / 60) * hourlyRate;
  const overtimeMinutes = workMinutes - standardHours;
  const overtimeEarnings = (overtimeMinutes / 60) * (overtimeRate || hourlyRate * 1.25);
  
  return regularEarnings + overtimeEarnings;
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}時間${mins.toString().padStart(2, '0')}分`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getNextValidStatus = (currentStatus: WorkStatus, action: 'clock_in' | 'break_start' | 'break_end' | 'clock_out'): WorkStatus | null => {
  const validTransitions: Record<WorkStatus, Record<string, WorkStatus>> = {
    'not_started': { 'clock_in': 'working' },
    'working': { 'break_start': 'on_break', 'clock_out': 'finished' },
    'on_break': { 'break_end': 'working', 'clock_out': 'finished' },
    'finished': { 'clock_in': 'working' }
  };
  
  return validTransitions[currentStatus]?.[action] || null;
};

export const isOvertime = (workMinutes: number, targetHours: number = 480): boolean => {
  return workMinutes > targetHours;
};

export const calculateMonthlyStats = (records: WorkRecord[]) => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyRecords = records.filter(record => record.date.startsWith(currentMonth));
  
  const totalMinutes = monthlyRecords.reduce((sum, record) => sum + record.totalWorkMinutes, 0);
  const totalEarnings = monthlyRecords.reduce((sum, record) => sum + record.earnings, 0);
  const workingDays = monthlyRecords.filter(record => record.totalWorkMinutes > 0).length;
  
  return {
    totalHours: totalMinutes / 60,
    totalEarnings,
    workingDays,
    averageHoursPerDay: workingDays > 0 ? totalMinutes / 60 / workingDays : 0
  };
};