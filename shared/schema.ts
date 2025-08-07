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

// Property schema - comprehensive schema matching actual scraped data
export const propertySchema = z.object({
  id: z.number(),
  address: z.string(),
  postcode: z.string(),
  price: z.number(),
  size: z.number().optional(),
  bedrooms: z.number(),
  bathrooms: z.number().optional(),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string(),
  propertyUrl: z.string(),
  primeLocationUrl: z.string(),
  rightmoveUrl: z.string(),
  zooplaUrl: z.string(),
  city: z.string(),
  scrapedAt: z.string(),
  description: z.string(),
  hasGarden: z.boolean(),
  hasParking: z.boolean(),
  isArticle4: z.boolean(),
  yearlyProfit: z.number(),
  leftInDeal: z.number(),
  isExpandedResult: z.boolean().optional(),
  // Financial Analytics
  lhaWeekly: z.number().optional(),
  grossYield: z.number().optional(),
  netYield: z.number().optional(),
  roi: z.number().optional(),
  paybackYears: z.number().optional(),
  monthlyCashflow: z.number().optional(),
  dscr: z.number().optional(),
  stampDuty: z.number().optional(),
  refurbCost: z.number().optional(),
  totalInvested: z.number().optional(),
  profitabilityScore: z.string().optional(),
  gross_yield: z.number().optional(), // Backend field name
});

export const insertPropertySchema = propertySchema.omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = z.infer<typeof propertySchema>;
