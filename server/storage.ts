import { users, properties, type User, type InsertUser, type Property } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { scrapingService, type SearchParams } from "./services/scraper";

// Property with analytics type for the frontend
export type PropertyWithAnalytics = Property & {
  lhaWeekly: number;
  grossYield: number;
  netYield: number;
  roi: number;
  paybackYears: number;
  monthlyCashflow: number;
  dscr: number;
  stampDuty: number;
  refurbCost: number;
  totalInvested: number;
};

export interface PropertySearchParams {
  city?: string;
  count?: number;
  minRooms?: number;
  maxPrice?: number;
  keywords?: string;
}

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

  private calculateAnalytics(property: Property): PropertyWithAnalytics {
    const price = property.price;
    
    // Rough estimates for financial calculations
    const stampDuty = Math.round(price * 0.03); // 3% stamp duty
    const refurbCost = 15000; // Fixed refurb cost estimate
    const totalInvested = price + stampDuty + refurbCost;
    
    // LHA rates - rough estimates based on bedrooms
    const lhaWeekly = property.bedrooms <= 1 ? 85 : 
                      property.bedrooms === 2 ? 110 :
                      property.bedrooms === 3 ? 135 :
                      property.bedrooms === 4 ? 160 : 185;
                      
    const monthlyRental = lhaWeekly * 4.33; // weeks per month
    const yearlyRental = monthlyRental * 12;
    
    // Yields
    const grossYield = (yearlyRental / price) * 100;
    const netYield = ((yearlyRental * 0.8) / price) * 100; // 80% after expenses
    
    // ROI and payback
    const yearlyProfit = yearlyRental * 0.6; // 60% after all expenses
    const roi = (yearlyProfit / totalInvested) * 100;
    const paybackYears = totalInvested / yearlyProfit;
    
    // Monthly cashflow
    const monthlyCashflow = Math.round(yearlyProfit / 12);
    
    // DSCR (Debt Service Coverage Ratio) - assuming 75% LTV mortgage
    const mortgageAmount = price * 0.75;
    const monthlyMortgage = mortgageAmount * 0.005; // rough 6% annual rate
    const dscr = monthlyRental / monthlyMortgage;

    return {
      ...property,
      lhaWeekly,
      grossYield: Math.round(grossYield * 10) / 10,
      netYield: Math.round(netYield * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      paybackYears: Math.round(paybackYears * 10) / 10,
      monthlyCashflow,
      dscr: Math.round(dscr * 10) / 10,
      stampDuty,
      refurbCost,
      totalInvested
    };
  }

  async getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]> {
    const {
      city = 'Liverpool',
      count = 12,
      minRooms = 1,
      maxPrice = 500000,
      keywords = 'HMO'
    } = params;

    try {
      // Use the scraping service to get fresh data
      const searchParams: SearchParams = {
        city,
        minBedrooms: minRooms,
        maxPrice,
        keywords
      };

      const scrapedProperties = await scrapingService.searchProperties(searchParams);
      
      // Calculate analytics for each property
      const propertiesWithAnalytics = scrapedProperties.map(property => 
        this.calculateAnalytics(property)
      );

      return propertiesWithAnalytics.slice(0, count);

    } catch (error) {
      console.error('Error fetching properties:', error);
      
      // Fallback: try to get any cached properties from database
      const cachedProperties = await db
        .select()
        .from(properties)
        .where(eq(properties.city, city))
        .orderBy(desc(properties.scrapedAt))
        .limit(count);

      return cachedProperties.map(property => this.calculateAnalytics(property));
    }
  }

  async getCities(): Promise<string[]> {
    // UK cities commonly searched for HMO properties
    return [
      "Liverpool", "Birmingham", "Manchester", "Leeds", "Sheffield", 
      "Bristol", "Nottingham", "Leicester", "Newcastle", "Coventry",
      "Preston", "Blackpool", "Hull", "Derby", "Plymouth", 
      "Southampton", "Portsmouth", "Reading", "Oxford", "Cambridge",
      "Brighton", "Salford", "Stockport", "Wolverhampton", "London"
    ];
  }
}

export const storage = new DatabaseStorage();