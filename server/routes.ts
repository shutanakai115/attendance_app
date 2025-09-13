import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkRecordSchema, insertSettingsSchema } from "@shared/schema";

// Helper function to calculate work minutes and earnings
const calculateWorkMinutes = (clockIn?: Date, clockOut?: Date, breakMinutes: number = 0): number => {
  if (!clockIn) return 0;
  
  const endTime = clockOut || new Date();
  const totalMinutes = Math.floor((endTime.getTime() - clockIn.getTime()) / 1000 / 60);
  
  return Math.max(0, totalMinutes - breakMinutes);
};

const calculateEarnings = (workMinutes: number, hourlyRate: number, overtimeRate?: number, standardHours: number = 480): number => {
  if (workMinutes <= standardHours) {
    return (workMinutes / 60) * hourlyRate;
  }
  
  const regularEarnings = (standardHours / 60) * hourlyRate;
  const overtimeMinutes = workMinutes - standardHours;
  const overtimeEarnings = (overtimeMinutes / 60) * (overtimeRate || hourlyRate * 1.25);
  
  return regularEarnings + overtimeEarnings;
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

  app.get("/api/records/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const records = await storage.getWorkRecordsByDate(date);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work records for date" });
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
      
      // If clockIn and clockOut are provided, recalculate work minutes and earnings
      if (updates.clockIn || updates.clockOut) {
        console.log('Recalculating work minutes and earnings...');
        const existing = await storage.getWorkRecord(id);
        if (!existing) {
          return res.status(404).json({ error: "Work record not found" });
        }
        
        console.log('Existing record:', JSON.stringify(existing, null, 2));
        
        // Get settings for calculation
        const settings = await storage.getSettings();
        console.log('Settings:', JSON.stringify(settings, null, 2));
        
        // Use updated values or fall back to existing values
        const clockIn = updates.clockIn ? new Date(updates.clockIn) : existing.clockIn;
        const clockOut = updates.clockOut ? new Date(updates.clockOut) : existing.clockOut;
        const totalBreakMinutes = updates.totalBreakMinutes !== undefined ? updates.totalBreakMinutes : existing.totalBreakMinutes;
        
        console.log('Time values:', { clockIn, clockOut, totalBreakMinutes });
        
        // Calculate total break minutes from break times if provided
        let calculatedBreakMinutes = totalBreakMinutes;
        if (updates.breakStart && updates.breakEnd) {
          const breakStart = new Date(updates.breakStart);
          const breakEnd = new Date(updates.breakEnd);
          calculatedBreakMinutes = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000 / 60);
          console.log('Break calculation:', { breakStart, breakEnd, calculatedBreakMinutes });
        }
        
        // Calculate work minutes and earnings
        const totalWorkMinutes = calculateWorkMinutes(clockIn, clockOut, calculatedBreakMinutes);
        const earnings = calculateEarnings(totalWorkMinutes, settings.hourlyRate, settings.overtimeRate);
        
        console.log('Calculations:', { totalWorkMinutes, earnings, calculatedBreakMinutes });
        
        // Add calculated values to updates
        updates.totalBreakMinutes = calculatedBreakMinutes;
        updates.totalWorkMinutes = totalWorkMinutes;
        updates.earnings = earnings;
        
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
