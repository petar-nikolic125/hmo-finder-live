import { users, properties, type User, type InsertUser, type Property, type InsertProperty } from "@shared/schema";

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
  minSize?: number;
  maxPrice?: number;
  excludeArticle4?: boolean;
  sortBy?: 'profit' | 'price' | 'size' | 'recent';
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]>;
  getCities(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userCurrentId: number;

  constructor() {
    this.users = new Map();
    this.userCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProperties(params: PropertySearchParams): Promise<PropertyWithAnalytics[]> {
    // This will be implemented to use the generator
    const { generatePropertiesForCity } = await import("../client/src/lib/generator");
    const {
      city = 'Birmingham',
      count = 12,
      minSize = 90,
      maxPrice = 500000,
      excludeArticle4 = true,
      sortBy = 'profit'
    } = params;

    // Generate properties using the same logic as the frontend
    let generatedProperties = generatePropertiesForCity(city, count * 2);

    // Add IDs to the generated properties to match PropertyWithAnalytics type
    let properties: PropertyWithAnalytics[] = generatedProperties.map((p, index) => ({
      ...p,
      id: index + 1
    }));

    // Apply filters
    properties = properties.filter(p => 
      p.size >= minSize && 
      p.price <= maxPrice && 
      (!excludeArticle4 || !p.isArticle4)
    );

    // Apply sorting
    properties.sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.yearlyProfit - a.yearlyProfit;
        case 'price':
          return a.price - b.price;
        case 'size':
          return b.size - a.size;
        case 'recent':
          return Math.random() - 0.5;
        default:
          return b.yearlyProfit - a.yearlyProfit;
      }
    });

    return properties.slice(0, count);
  }

  async getCities(): Promise<string[]> {
    const { getAvailableCities } = await import("../client/src/lib/generator");
    return getAvailableCities();
  }
}

export const storage = new MemStorage();
