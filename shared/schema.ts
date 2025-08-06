import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  imageUrl: text("image_url").notNull(),
  propertyUrl: text("property_url").notNull(),
  city: text("city").notNull(),
  scrapedAt: text("scraped_at").notNull(),
});

// Search cache table to implement rate limiting
export const searchCache = pgTable("search_cache", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  minBedrooms: integer("min_bedrooms").notNull(),
  maxPrice: integer("max_price").notNull(),
  keywords: text("keywords").notNull(),
  searchHash: text("search_hash").notNull().unique(),
  lastScraped: text("last_scraped").notNull(),
  resultCount: integer("result_count").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
