import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime() 
    });
  });

  // Portfolio data endpoints (if needed for future CMS integration)
  app.get("/api/profile", (req, res) => {
    res.json({
      name: "Tulio Cunha",
      title: "Full-stack Developer",
      location: "Remote",
      status: "Available for projects"
    });
  });

  app.get("/api/projects", (req, res) => {
    // This would come from storage in a real application
    res.json([
      {
        id: "1",
        name: "Terminal Portfolio",
        description: "A vintage CRT-inspired portfolio website with interactive terminal interface.",
        stack: ["React", "TypeScript", "Tailwind"],
        featured: true
      }
    ]);
  });

  // Terminal command logging endpoint (optional)
  app.post("/api/terminal/log", (req, res) => {
    const { command, timestamp } = req.body;
    // Log terminal usage for analytics (implement as needed)
    console.log(`Terminal command: ${command} at ${timestamp}`);
    res.json({ logged: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
