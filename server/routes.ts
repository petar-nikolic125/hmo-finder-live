import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type PropertySearchParams } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties API routes
  app.get("/api/properties", async (req, res) => {
    try {
      // Enhanced parameter validation and edge case handling for stress testing
      let count = req.query.count ? parseInt(req.query.count as string) : 12;
      let minRooms = req.query.minRooms ? parseInt(req.query.minRooms as string) : undefined;
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
      
      // Detect potential stress testing patterns
      const stressTest = req.query.stressTest === 'true';
      const isLikelyStressTest = stressTest || (
        (maxPrice && (maxPrice < 50000 || maxPrice > 5000000)) ||
        (minRooms && minRooms > 10) ||
        (count > 30)
      );
      
      if (isLikelyStressTest) {
        console.log('🔥 STRESS TEST MODE DETECTED - Using enhanced robust handling');
      }
      
      const searchParams: PropertySearchParams = {
        city: req.query.city as string,
        postcode: req.query.postcode as string, // New postcode search support
        count,
        minRooms,
        maxPrice,
        keywords: req.query.keywords as string,
        stressTest: isLikelyStressTest
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

  // Stress testing endpoint for extreme edge cases
  app.post("/api/stress-test", async (req, res) => {
    try {
      console.log('🔥 STRESS TEST INITIATED');
      const testCases = [
        { city: "London", minRooms: 10, maxPrice: 50000, keywords: "HMO", description: "Extreme low price, high bedrooms" },
        { city: "Cambridge", minRooms: 1, maxPrice: 10000000, keywords: "", description: "Extreme high price" },
        { postcode: "M1 1AA", minRooms: 15, maxPrice: 1000000, keywords: "luxury", description: "Manchester postcode, extreme bedrooms" },
        { city: "Brighton", minRooms: 20, maxPrice: 100000, keywords: "student", description: "Impossible parameters" }
      ];

      const results = [];
      for (const testCase of testCases) {
        console.log(`Testing: ${testCase.description}`);
        try {
          const searchParams: PropertySearchParams = {
            ...testCase,
            count: 5,
            stressTest: true
          };
          const properties = await storage.getProperties(searchParams);
          results.push({
            testCase: testCase.description,
            success: properties.length > 0,
            propertyCount: properties.length,
            firstProperty: properties[0]?.address || "No properties found"
          });
        } catch (error) {
          results.push({
            testCase: testCase.description,
            success: false,
            error: (error as Error).message
          });
        }
      }

      res.json({ message: "Stress test completed", results });
    } catch (error) {
      console.error("Stress test failed:", error);
      res.status(500).json({ error: "Stress test failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
