import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkRecordSchema, insertSettingsSchema } from "@shared/schema";

// Helper function to parse time string and create full date
const parseTimeWithDate = (timeStr: string, date: string): Date | null => {
  if (!timeStr) return null;
  
  // If it's already a full ISO string, parse directly
  if (timeStr.includes('T') || timeStr.includes('-')) {
    const parsed = new Date(timeStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's just time (HH:MM), combine with date
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    const fullDateTime = `${date}T${hours.padStart(2, '0')}:${minutes}:00.000Z`;
    const parsed = new Date(fullDateTime);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
};

// Helper function to calculate work minutes and earnings
const calculateWorkMinutes = (clockIn?: Date, clockOut?: Date, breakMinutes: number = 0): number => {
  if (!clockIn || !clockOut) return 0;
  
  const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 1000 / 60);
  
  return Math.max(0, totalMinutes - breakMinutes);
};

const calculateEarnings = (workMinutes: number, hourlyRate: number, overtimeRate?: number, standardHours: number = 480): number => {
  if (workMinutes <= 0) return 0;
  
  if (workMinutes <= standardHours) {
    return Math.round((workMinutes / 60) * hourlyRate);
  }
  
  const regularEarnings = (standardHours / 60) * hourlyRate;
  const overtimeMinutes = workMinutes - standardHours;
  const overtimeEarnings = (overtimeMinutes / 60) * (overtimeRate || hourlyRate * 1.25);
  
  return Math.round(regularEarnings + overtimeEarnings);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Work Records API
  app.get("/api/records", async (req, res) => {
    try {
      const records = await storage.getAllWorkRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work records" });
    }
  });

  app.get("/api/records/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const records = await storage.getWorkRecordsByDate(date);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work records for date" });
    }
  });

  app.get("/api/records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const record = await storage.getWorkRecord(id);
      if (!record) {
        return res.status(404).json({ error: "Work record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work record" });
    }
  });

  app.post("/api/records", async (req, res) => {
    try {
      const validatedData = insertWorkRecordSchema.parse(req.body);
      const record = await storage.createWorkRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid work record data" });
    }
  });

  app.patch("/api/records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      console.log(`PATCH /api/records/${id} - Request body:`, JSON.stringify(updates, null, 2));
      
      // Check if any time-related fields are being updated
      const needsRecalculation = updates.clockIn || updates.clockOut || updates.breakStart || updates.breakEnd || updates.totalBreakMinutes !== undefined;
      
      if (needsRecalculation) {
        console.log('Recalculating work minutes and earnings...');
        const existing = await storage.getWorkRecord(id);
        if (!existing) {
          return res.status(404).json({ error: "Work record not found" });
        }
        
        console.log('Existing record:', JSON.stringify(existing, null, 2));
        
        // Get settings for calculation
        const settings = await storage.getSettings();
        console.log('Settings:', JSON.stringify(settings, null, 2));
        
        // Parse time values properly
        let clockIn: Date | null = null;
        let clockOut: Date | null = null;
        
        if (updates.clockIn) {
          clockIn = parseTimeWithDate(updates.clockIn, existing.date);
          if (!clockIn) {
            return res.status(400).json({ error: "Invalid clockIn time format" });
          }
        } else if (existing.clockIn) {
          clockIn = existing.clockIn;
        }
        
        if (updates.clockOut) {
          clockOut = parseTimeWithDate(updates.clockOut, existing.date);
          if (!clockOut) {
            return res.status(400).json({ error: "Invalid clockOut time format" });
          }
        } else if (existing.clockOut) {
          clockOut = existing.clockOut;
        }
        
        console.log('Parsed time values:', { clockIn, clockOut });
        
        // Calculate total break minutes
        let calculatedBreakMinutes = existing.totalBreakMinutes;
        
        if (updates.breakStart && updates.breakEnd) {
          const breakStart = parseTimeWithDate(updates.breakStart, existing.date);
          const breakEnd = parseTimeWithDate(updates.breakEnd, existing.date);
          
          if (!breakStart || !breakEnd) {
            return res.status(400).json({ error: "Invalid break time format" });
          }
          
          calculatedBreakMinutes = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000 / 60);
          console.log('Break calculation:', { breakStart, breakEnd, calculatedBreakMinutes });
        } else if (updates.totalBreakMinutes !== undefined) {
          calculatedBreakMinutes = updates.totalBreakMinutes;
        }
        
        // Calculate work minutes and earnings
        const totalWorkMinutes = calculateWorkMinutes(clockIn || undefined, clockOut || undefined, calculatedBreakMinutes);
        const earnings = calculateEarnings(totalWorkMinutes, settings.hourlyRate, settings.overtimeRate);
        
        console.log('Final calculations:', { totalWorkMinutes, earnings, calculatedBreakMinutes });
        
        // Add calculated values to updates
        updates.totalBreakMinutes = calculatedBreakMinutes;
        updates.totalWorkMinutes = totalWorkMinutes;
        updates.earnings = earnings;
        
        // Update the parsed date objects
        if (clockIn) updates.clockIn = clockIn;
        if (clockOut) updates.clockOut = clockOut;
        
        console.log('Final updates:', JSON.stringify(updates, null, 2));
      }
      
      const record = await storage.updateWorkRecord(id, updates);
      console.log('Updated record:', JSON.stringify(record, null, 2));
      res.json(record);
    } catch (error) {
      console.error('PATCH /api/records/:id error:', error);
      res.status(400).json({ error: "Failed to update work record" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // CSV Export API
  app.get("/api/export/csv", async (req, res) => {
    try {
      const records = await storage.getAllWorkRecords();
      const csvHeaders = ['日付', '出勤時刻', '退勤時刻', '休憩時間(分)', '実働時間(分)', '収益(円)'];
      const csvRows = records.map(record => [
        record.date,
        record.clockIn ? record.clockIn.toISOString() : '',
        record.clockOut ? record.clockOut.toISOString() : '',
        record.totalBreakMinutes.toString(),
        record.totalWorkMinutes.toString(),
        record.earnings.toString()
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=work_records.csv');
      res.send('\uFEFF' + csvContent); // Add BOM for proper UTF-8 encoding
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
