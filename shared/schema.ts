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
  postcode: text("postcode").notNull(),
  price: integer("price").notNull(),
  size: integer("size").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  imageUrl: text("image_url").notNull(),
  primeLocationUrl: text("prime_location_url").notNull(),
  description: text("description").notNull(),
  hasGarden: boolean("has_garden").notNull().default(false),
  hasParking: boolean("has_parking").notNull().default(false),
  isArticle4: boolean("is_article4").notNull().default(false),
  yearlyProfit: integer("yearly_profit").notNull(),
  leftInDeal: integer("left_in_deal").notNull(),
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
