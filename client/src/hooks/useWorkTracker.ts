import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkRecord, WorkStatus, Settings } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { 
  calculateWorkMinutes, 
  calculateEarnings, 
  getTodayDateString, 
  getNextValidStatus 
} from '@/lib/timeCalculations';
import { saveWorkRecords, loadWorkRecords } from '@/lib/localStorage';

export const useWorkTracker = () => {
  const queryClient = useQueryClient();
  const [currentRecord, setCurrentRecord] = useState<WorkRecord | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch today's work record
  const todayDate = getTodayDateString();
  
  const { data: todayRecords = [], isLoading } = useQuery({
    queryKey: ['/api/records', todayDate],
    queryFn: async () => {
      try {
        // Try API first, fallback to localStorage
        const response = await fetch(`/api/records/date/${todayDate}`);
        if (response.ok) {
          const records = await response.json();
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
        }
        throw new Error('API not available');
      } catch {
        // Fallback to localStorage
        const localRecords = loadWorkRecords();
        return localRecords.filter(record => record.date === todayDate);
      }
    }
  });

  // Get settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          return await response.json();
        }
        throw new Error('API not available');
      } catch {
        // Return default settings if API fails
        return {
          id: 'main',
          hourlyRate: 3000,
          overtimeRate: 3750,
          targetHoursPerDay: 480,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }
  });

  // Create work record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: Partial<WorkRecord>) => {
      try {
        const response = await apiRequest('POST', '/api/records', data);
        return await response.json();
      } catch {
        // Fallback to localStorage
        const records = loadWorkRecords();
        const newRecord: WorkRecord = {
          id: Date.now().toString(),
          date: todayDate,
          status: 'not_started',
          totalBreakMinutes: 0,
          totalWorkMinutes: 0,
          earnings: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        const updatedRecords = [...records, newRecord];
        saveWorkRecords(updatedRecords);
        return newRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
    },
  });

  // Update work record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkRecord> }) => {
      try {
        const response = await apiRequest('PATCH', `/api/records/${id}`, data);
        return await response.json();
      } catch {
        // Fallback to localStorage
        const records = loadWorkRecords();
        const updatedRecords = records.map(record => 
          record.id === id 
            ? { ...record, ...data, updatedAt: new Date() }
            : record
        );
        saveWorkRecords(updatedRecords);
        return updatedRecords.find(r => r.id === id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
    },
  });

  // Get or create today's record
  useEffect(() => {
    if (todayRecords.length > 0) {
      setCurrentRecord(todayRecords[0]);
      setIsTimerRunning(todayRecords[0].status === 'working');
    } else if (!isLoading && todayRecords.length === 0) {
      // Create today's record if it doesn't exist
      const newRecord = {
        date: todayDate,
        status: 'not_started' as WorkStatus,
        totalBreakMinutes: 0,
        totalWorkMinutes: 0,
        earnings: 0,
      };
      createRecordMutation.mutate(newRecord);
    }
  }, [todayRecords, isLoading, todayDate]);

  // Real-time timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && currentRecord && settings) {
      interval = setInterval(() => {
        setCurrentRecord(prev => {
          if (!prev || !prev.clockIn) return prev;
          
          const now = new Date();
          const workMinutes = calculateWorkMinutes(prev.clockIn, now, prev.totalBreakMinutes);
          const earnings = calculateEarnings(workMinutes, settings.hourlyRate, settings.overtimeRate);
          
          const updated = {
            ...prev,
            totalWorkMinutes: workMinutes,
            earnings,
            updatedAt: now,
          };
          
          // Update localStorage in real-time
          const records = loadWorkRecords();
          const updatedRecords = records.map(record => 
            record.id === prev.id ? updated : record
          );
          saveWorkRecords(updatedRecords);
          
          return updated;
        });
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, currentRecord?.id, settings]);

  // Action handlers
  const handleClockIn = useCallback(() => {
    if (!currentRecord) return;
    
    const now = new Date();
    const newStatus = getNextValidStatus(currentRecord.status, 'clock_in');
    
    if (newStatus) {
      const updates = {
        status: newStatus,
        clockIn: now,
        clockOut: undefined,
      };
      
      updateRecordMutation.mutate({ id: currentRecord.id, data: updates });
      setIsTimerRunning(true);
    }
  }, [currentRecord, updateRecordMutation]);

  const handleBreakStart = useCallback(() => {
    if (!currentRecord) return;
    
    const now = new Date();
    const newStatus = getNextValidStatus(currentRecord.status, 'break_start');
    
    if (newStatus) {
      const updates = {
        status: newStatus,
        breakStart: now,
      };
      
      updateRecordMutation.mutate({ id: currentRecord.id, data: updates });
      setIsTimerRunning(false);
    }
  }, [currentRecord, updateRecordMutation]);

  const handleBreakEnd = useCallback(() => {
    if (!currentRecord || !currentRecord.breakStart) return;
    
    const now = new Date();
    const newStatus = getNextValidStatus(currentRecord.status, 'break_end');
    
    if (newStatus) {
      const breakDuration = Math.floor((now.getTime() - currentRecord.breakStart.getTime()) / 1000 / 60);
      const totalBreakMinutes = currentRecord.totalBreakMinutes + breakDuration;
      
      const updates = {
        status: newStatus,
        breakEnd: now,
        totalBreakMinutes,
      };
      
      updateRecordMutation.mutate({ id: currentRecord.id, data: updates });
      setIsTimerRunning(true);
    }
  }, [currentRecord, updateRecordMutation]);

  const handleClockOut = useCallback(() => {
    if (!currentRecord) return;
    
    const now = new Date();
    const newStatus = getNextValidStatus(currentRecord.status, 'clock_out');
    
    if (newStatus && settings) {
      // Handle ongoing break
      let totalBreakMinutes = currentRecord.totalBreakMinutes;
      if (currentRecord.status === 'on_break' && currentRecord.breakStart) {
        const breakDuration = Math.floor((now.getTime() - currentRecord.breakStart.getTime()) / 1000 / 60);
        totalBreakMinutes += breakDuration;
      }
      
      const workMinutes = calculateWorkMinutes(currentRecord.clockIn, now, totalBreakMinutes);
      const earnings = calculateEarnings(workMinutes, settings.hourlyRate, settings.overtimeRate);
      
      const updates = {
        status: newStatus,
        clockOut: now,
        totalBreakMinutes,
        totalWorkMinutes: workMinutes,
        earnings,
      };
      
      updateRecordMutation.mutate({ id: currentRecord.id, data: updates });
      setIsTimerRunning(false);
    }
  }, [currentRecord, updateRecordMutation, settings]);

  return {
    currentRecord,
    isTimerRunning,
    settings,
    isLoading,
    actions: {
      handleClockIn,
      handleBreakStart,
      handleBreakEnd,
      handleClockOut,
    },
    mutations: {
      createRecord: createRecordMutation,
      updateRecord: updateRecordMutation,
    }
  };
};