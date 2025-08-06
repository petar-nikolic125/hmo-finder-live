import { type User, type InsertUser } from "@shared/schema";
import { propertyGenerator, type PropertySearchParams, type PropertyWithAnalytics } from "./services/propertyGenerator";
import { scrapingService } from "./services/scraper";

// Export the types for use in other modules
export type { PropertySearchParams, PropertyWithAnalytics };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]>;
  getCities(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private nextUserId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]> {
    console.log('🔍 MemStorage: Tražim oglase sa parametrima:', params);
    
    try {
      // Pokušaj da scrape-uješ prave oglase sa Zoopla
      const scrapedProperties = await scrapingService.searchProperties({
        city: params.city || 'Liverpool',
        minBedrooms: params.minRooms || 3,
        maxPrice: params.maxPrice || 400000,
        keywords: params.keywords || 'HMO'
      });

      if (scrapedProperties.length > 0) {
        console.log(`✅ Vraćam ${scrapedProperties.length} scraped oglasa za ${params.city}`);
        
        // Konvertuj scraped properties u PropertyWithAnalytics format
        const propertiesWithAnalytics = scrapedProperties.map(prop => {
          return propertyGenerator.enhancePropertyWithAnalytics(prop, params);
        });

        return propertiesWithAnalytics;
      } else {
        console.log('⚠️ Nema scraped oglasa, koristim generatore');
        // Fallback na generated properties ako nema scraped podataka
        return propertyGenerator.generateProperties(params);
      }
    } catch (error) {
      console.error('❌ Greška pri scraping-u:', error);
      console.log('⚠️ Koristim generatore zbog greške');
      return propertyGenerator.generateProperties(params);
    }
  }

  async getCities(): Promise<string[]> {
    return propertyGenerator.getCities();
  }
}

export const storage = new MemStorage();