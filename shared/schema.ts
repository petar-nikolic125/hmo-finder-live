import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
});

// Property schema
export const propertySchema = z.object({
  id: z.number(),
  address: z.string(),
  price: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number().optional(), // Opciono jer ne možemo uvek da ga nađemo
  imageUrl: z.string(),
  propertyUrl: z.string(),
  city: z.string(),
  scrapedAt: z.string(),
});

export const insertPropertySchema = propertySchema.omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = z.infer<typeof propertySchema>;
