import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkRecordSchema, insertSettingsSchema } from "@shared/schema";

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
      const record = await storage.updateWorkRecord(id, updates);
      res.json(record);
    } catch (error) {
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
