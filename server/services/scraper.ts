import { spawn } from "child_process";
import path from "path";
import crypto from "crypto";
import { db } from "../db";
import { properties, searchCache, type Property, type InsertProperty } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface SearchParams {
  city: string;
  minBedrooms: number;
  maxPrice: number;
  keywords: string;
}

export class ScrapingService {
  private readonly RATE_LIMIT_MINUTES = 5; // 5 minutes between scraping sessions

  private generateSearchHash(params: SearchParams): string {
    const searchString = `${params.city}-${params.minBedrooms}-${params.maxPrice}-${params.keywords}`;
    return crypto.createHash('md5').update(searchString).digest('hex');
  }

  async canScrapeNow(params: SearchParams): Promise<boolean> {
    const searchHash = this.generateSearchHash(params);
    
    try {
      const lastSearch = await db
        .select()
        .from(searchCache)
        .where(eq(searchCache.searchHash, searchHash))
        .limit(1);

      if (lastSearch.length === 0) {
        return true; // No previous search found
      }

      const lastScrapedTime = new Date(lastSearch[0].lastScraped);
      const now = new Date();
      const timeDiff = now.getTime() - lastScrapedTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      return minutesDiff >= this.RATE_LIMIT_MINUTES;
    } catch (error) {
      console.error('Error checking scrape rate limit:', error);
      return false;
    }
  }

  async getCachedResults(params: SearchParams): Promise<Property[]> {
    const searchHash = this.generateSearchHash(params);
    
    try {
      const cachedSearch = await db
        .select()
        .from(searchCache)
        .where(eq(searchCache.searchHash, searchHash))
        .limit(1);

      if (cachedSearch.length === 0) {
        return [];
      }

      // Get properties from the last search
      const cachedProperties = await db
        .select()
        .from(properties)
        .where(and(
          eq(properties.city, params.city),
          eq(properties.bedrooms, params.minBedrooms)
        ))
        .orderBy(desc(properties.scrapedAt))
        .limit(30);

      return cachedProperties;
    } catch (error) {
      console.error('Error getting cached results:', error);
      return [];
    }
  }

  async scrapeProperties(params: SearchParams): Promise<Property[]> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(process.cwd(), 'server/scraper/zoopla_scraper.py');
      const args = [
        pythonScript,
        params.city,
        params.minBedrooms.toString(),
        params.maxPrice.toString(),
        params.keywords
      ];

      console.log(`Running Python scraper with args:`, args);

      const pythonProcess = spawn('python', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('Python scraper stderr:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error(`Python scraper exited with code ${code}`);
          console.error('Error output:', errorOutput);
          reject(new Error(`Scraper failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          // Parse the JSON output from the Python script
          const result = JSON.parse(output);
          const scrapedProperties = result.properties;

          if (!scrapedProperties || scrapedProperties.length === 0) {
            console.log('No properties found during scraping');
            resolve([]);
            return;
          }

          // Save properties to database
          const propertiesToInsert: InsertProperty[] = scrapedProperties.map((prop: any) => ({
            address: prop.address,
            price: prop.price,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            imageUrl: prop.image_url,
            propertyUrl: prop.property_url,
            city: params.city,
            scrapedAt: prop.scraped_at
          }));

          // Clear old properties for this city to avoid duplication
          await db
            .delete(properties)
            .where(eq(properties.city, params.city));

          // Insert new properties
          const insertedProperties = await db
            .insert(properties)
            .values(propertiesToInsert)
            .returning();

          // Update search cache
          const searchHash = this.generateSearchHash(params);
          const now = new Date().toISOString();

          await db
            .insert(searchCache)
            .values({
              city: params.city,
              minBedrooms: params.minBedrooms,
              maxPrice: params.maxPrice,
              keywords: params.keywords,
              searchHash,
              lastScraped: now,
              resultCount: insertedProperties.length
            })
            .onConflictDoUpdate({
              target: searchCache.searchHash,
              set: {
                lastScraped: now,
                resultCount: insertedProperties.length
              }
            });

          console.log(`Successfully scraped and saved ${insertedProperties.length} properties for ${params.city}`);
          resolve(insertedProperties);

        } catch (parseError) {
          console.error('Error parsing scraper output:', parseError);
          console.error('Raw output:', output);
          reject(new Error(`Failed to parse scraper output: ${parseError}`));
        }
      });

      // Set a timeout to prevent hanging
      setTimeout(() => {
        pythonProcess.kill('SIGTERM');
        reject(new Error('Scraper timeout after 60 seconds'));
      }, 60000);
    });
  }

  async searchProperties(params: SearchParams): Promise<Property[]> {
    try {
      const canScrape = await this.canScrapeNow(params);
      
      if (!canScrape) {
        console.log('Rate limit active, returning cached results');
        return await this.getCachedResults(params);
      }

      console.log('Scraping new properties for:', params);
      return await this.scrapeProperties(params);

    } catch (error) {
      console.error('Error in searchProperties:', error);
      
      // Fallback to cached results if scraping fails
      console.log('Scraping failed, attempting to return cached results');
      return await this.getCachedResults(params);
    }
  }
}

export const scrapingService = new ScrapingService();