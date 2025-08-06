import { users, type User, type InsertUser, type Property } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
    // Use the property generator to create properties with analytics
    return propertyGenerator.generateProperties(params);
  }

  async getCities(): Promise<string[]> {
    return propertyGenerator.getCities();
  }
}

export const storage = new DatabaseStorage();