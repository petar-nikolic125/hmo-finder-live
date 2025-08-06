import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type PropertySearchParams } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties API routes
  app.get("/api/properties", async (req, res) => {
    try {
      const searchParams: PropertySearchParams = {
        city: req.query.city as string,
        count: req.query.count ? parseInt(req.query.count as string) : undefined,
        minRooms: req.query.minRooms ? parseInt(req.query.minRooms as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        keywords: req.query.keywords as string,
      };

      const properties = await storage.getProperties(searchParams);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ error: "Failed to fetch cities" });
    }
  });

  // Health check endpoint
  app.get("/api/ping", (req, res) => {
    res.json({ now: Date.now() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
