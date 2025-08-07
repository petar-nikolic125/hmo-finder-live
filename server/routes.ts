import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type PropertySearchParams } from "./storage";
import { scrapingService } from "./services/scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties API routes
  app.get("/api/properties", async (req, res) => {
    try {
      console.log("🔍 API /properties called with query:", req.query);
      // Enhanced parameter validation and edge case handling for stress testing
      let count = req.query.count ? parseInt(req.query.count as string) : 50;
      let minRooms = req.query.minRooms ? parseInt(req.query.minRooms as string) : 
                     req.query.minBedrooms ? parseInt(req.query.minBedrooms as string) : undefined;
      let maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
      
      // Extreme edge case validation to prevent system abuse
      if (count > 50) {
        console.log(`⚠️ Large count requested (${count}), capping at 50`);
        count = 50;
      }
      
      if (maxPrice && maxPrice > 10000000) {
        console.log(`⚠️ Extreme price requested (£${maxPrice}), capping at £10M`);
        maxPrice = 10000000;
      }
      
      if (minRooms && minRooms > 15) {
        console.log(`⚠️ Extreme bedroom count requested (${minRooms}), capping at 15`);
        minRooms = 15;
      }
      
      // NO STRESS TEST MODE - Always use real scraping only
      
      const searchParams: PropertySearchParams = {
        city: req.query.city as string,
        postcode: req.query.postcode as string, // New postcode search support
        count,
        minRooms,
        maxPrice,
        keywords: req.query.keywords as string,
        stressTest: false
      };

      const result = await storage.getProperties(searchParams);
      
      console.log(`✅ Returning ${result.properties.length} properties for ${searchParams.city}`);
      
      // Return the structured result with professional messaging
      res.json({
        properties: result.properties,
        message: result.message,
        hasExpandedResults: result.hasExpandedResults,
        totalCount: result.properties.length
      });
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

  // Clear cache endpoint for debugging
  app.delete("/api/cache", async (req, res) => {
    try {
      await scrapingService.clearCache();
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
