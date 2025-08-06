import { type User, type InsertUser } from "@shared/schema";
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
    console.log('🔍 Storage getProperties called with params:', params);
    
    // Use property generator to create properties with analytics
    return propertyGenerator.generateProperties(params);
  }

  async getCities(): Promise<string[]> {
    return propertyGenerator.getCities();
  }
}

export const storage = new MemStorage();