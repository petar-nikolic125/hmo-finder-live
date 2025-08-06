import { users, type User, type InsertUser, type Property } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { scrapingService } from "./services/scraper";
import { propertyGenerator, type PropertySearchParams, type PropertyWithAnalytics } from "./services/propertyGenerator";

// Export the types for use in other modules
export type { PropertySearchParams, PropertyWithAnalytics };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]>;
  getCities(): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]> {
    console.log('🔍 Storage getProperties called with params:', params);
    
    try {
      // First try to get real scraped data
      const scrapedProperties = await scrapingService.searchProperties({
        city: params.city || 'Liverpool',
        minBedrooms: params.minRooms || 3,
        maxPrice: params.maxPrice || 400000,
        keywords: params.keywords || ''
      });

      console.log(`📊 Scraper returned ${scrapedProperties.length} properties`);

      if (scrapedProperties.length > 0) {
        // Convert scraped properties to PropertyWithAnalytics format
        const propertiesWithAnalytics = scrapedProperties.map((prop: Property, index: number) => {
          console.log(`🏠 Processing scraped property ${index + 1}:`, prop.address);
          
          // Generate analytics for scraped property
          return propertyGenerator.enhancePropertyWithAnalytics(prop, params);
        });

        console.log(`✅ Returning ${propertiesWithAnalytics.length} enhanced scraped properties`);
        return propertiesWithAnalytics;
      } else {
        console.log('⚠️  No scraped properties found, falling back to generated data');
        // Fallback to generated properties if no scraped data available
        return propertyGenerator.generateProperties(params);
      }
    } catch (error) {
      console.error('❌ Error fetching scraped properties:', error);
      console.log('⚠️  Falling back to generated data due to error');
      return propertyGenerator.generateProperties(params);
    }
  }

  async getCities(): Promise<string[]> {
    return propertyGenerator.getCities();
  }
}

export const storage = new DatabaseStorage();