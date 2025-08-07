import { spawn } from "child_process";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { type Property } from "@shared/schema";

export interface SearchParams {
  city: string;
  minBedrooms: number;
  maxPrice: number;
  keywords: string;
}

interface CachedSearch {
  searchHash: string;
  lastScraped: string;
  properties: Property[];
}

export class ScrapingService {
  private readonly RATE_LIMIT_MINUTES = 2; // 2 minutes between scraping sessions for better performance
  private readonly CACHE_FILE = path.join(process.cwd(), 'server/data/scrape_cache.json');
  private cache: Record<string, CachedSearch> = {};

  constructor() {
    this.loadCache();
  }

  private async loadCache() {
    try {
      // Ensure the data directory exists
      await fs.mkdir(path.dirname(this.CACHE_FILE), { recursive: true });
      
      const data = await fs.readFile(this.CACHE_FILE, 'utf-8');
      this.cache = JSON.parse(data);
      console.log('📁 Loaded scrape cache with', Object.keys(this.cache).length, 'entries');
    } catch (error) {
      console.log('📁 No existing cache found, starting fresh');
      this.cache = {};
    }
  }

  private async saveCache() {
    try {
      await fs.writeFile(this.CACHE_FILE, JSON.stringify(this.cache, null, 2));
      console.log('💾 Saved scrape cache');
    } catch (error) {
      console.error('❌ Error saving cache:', error);
    }
  }

  private generateSearchHash(params: SearchParams): string {
    const searchString = `${params.city}-${params.minBedrooms}-${params.maxPrice}-${params.keywords}`;
    return crypto.createHash('md5').update(searchString).digest('hex');
  }

  async canScrapeNow(params: SearchParams): Promise<boolean> {
    const searchHash = this.generateSearchHash(params);
    const cached = this.cache[searchHash];
    
    if (!cached) {
      return true; // No previous search found
    }

    const lastScrapedTime = new Date(cached.lastScraped);
    const now = new Date();
    const timeDiff = now.getTime() - lastScrapedTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff >= this.RATE_LIMIT_MINUTES;
  }

  // Enhanced method to find flexible cache matches for dynamic filtering
  private findFlexibleCacheMatch(params: SearchParams): { key: string; data: Property[] } | null {
    const targetPrice = params.maxPrice;
    const targetBedrooms = params.minBedrooms;
    
    for (const [key, cached] of Object.entries(this.cache)) {
      // Parse the cache key to extract parameters
      const keyParts = key.split('-');
      if (keyParts.length >= 3 && keyParts[0] === params.city) {
        try {
          const cachedBedrooms = parseInt(keyParts[keyParts.length - 2]);
          const cachedPrice = parseInt(keyParts[keyParts.length - 1]);
          
          // Check if parameters are within acceptable range (±20% price, ±1 bedroom)
          const priceRange = targetPrice * 0.2;
          const bedroomRange = 1;
          
          if (Math.abs(cachedPrice - targetPrice) <= priceRange &&
              Math.abs(cachedBedrooms - targetBedrooms) <= bedroomRange) {
            
            // Check if cache is still fresh
            const lastScrapedTime = new Date(cached.lastScraped);
            const now = new Date();
            const timeDiff = now.getTime() - lastScrapedTime.getTime();
            const minutesDiff = timeDiff / (1000 * 60);
            
            if (minutesDiff < this.RATE_LIMIT_MINUTES) {
              return { key, data: cached.properties };
            }
          }
        } catch (e) {
          continue; // Skip malformed cache keys
        }
      }
    }
    return null;
  }

  async getCachedResults(params: SearchParams): Promise<Property[]> {
    const searchHash = this.generateSearchHash(params);
    const cached = this.cache[searchHash];
    
    if (!cached) {
      return [];
    }

    console.log(`📦 Returning ${cached.properties.length} cached properties for ${params.city}`);
    return cached.properties;
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

      console.log(`🚀 Pokretam Zoopla scraper za ${params.city}, sobe: ${params.minBedrooms}+, cena: £${params.maxPrice}`);

      const pythonProcess = spawn('python3', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
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
        console.log(`Python scraper process finished with code: ${code}`);
        
        if (code !== 0) {
          console.error(`Python scraper exited with code ${code}`);
          console.error('Error output:', errorOutput);
          reject(new Error(`Scraper failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          console.log('Raw scraper output (first 500 chars):', output.substring(0, 500));
          
          // Find the JSON part in the output - Python scraper might output debug info before JSON
          const jsonStart = output.indexOf('[');
          if (jsonStart === -1) {
            console.log('No JSON array found, trying to find object');
            const objStart = output.indexOf('{');
            if (objStart === -1) {
              throw new Error('No JSON found in scraper output');
            }
          }
          
          const jsonOutput = output.substring(jsonStart !== -1 ? jsonStart : output.indexOf('{'));
          console.log('Extracted JSON (first 200 chars):', jsonOutput.substring(0, 200));
          
          // Parse the JSON output from the Python script
          const scrapedProperties = JSON.parse(jsonOutput);
          console.log(`✅ Successfully parsed ${scrapedProperties.length} properties`);

          if (!scrapedProperties || scrapedProperties.length === 0) {
            console.log('No properties found during scraping');
            resolve([]);
            return;
          }

          // Convert scraped data to Property format with deduplication
          const seenProperties = new Set<string>();
          const properties: Property[] = [];
          
          for (const prop of scrapedProperties) {
            const address = prop.address || `${prop.title || 'Unknown'}, ${params.city}`;
            const price = parseInt(prop.price?.toString().replace(/[£,]/g, '')) || 0;
            const bedrooms = parseInt(prop.bedrooms?.toString()) || 1;
            
            // Create unique identifier based on address, price, and bedrooms
            const uniqueKey = `${address}-${price}-${bedrooms}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
            
            // Skip if we've already seen this property
            if (seenProperties.has(uniqueKey)) {
              console.log(`🔄 Skipping duplicate property: ${address} (£${price})`);
              continue;
            }
            
            seenProperties.add(uniqueKey);
            
            // Generate consistent ID based on property characteristics (not random)
            const propertyId = parseInt(crypto.createHash('md5').update(uniqueKey).digest('hex').substring(0, 8), 16);
            
            properties.push({
              id: propertyId,
              address,
              price,
              bedrooms,
              bathrooms: prop.bathrooms ? parseInt(prop.bathrooms?.toString()) : undefined,
              imageUrl: prop.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80',
              propertyUrl: prop.property_url || '',
              city: params.city,
              scrapedAt: new Date().toISOString()
            });
          }
          
          console.log(`✅ After deduplication: ${properties.length} unique properties (from ${scrapedProperties.length} scraped)`);
          
          if (properties.length === 0) {
            console.log('⚠️ No unique properties after deduplication');
          }

          // Cache the results
          const searchHash = this.generateSearchHash(params);
          this.cache[searchHash] = {
            searchHash,
            lastScraped: new Date().toISOString(),
            properties
          };
          
          await this.saveCache();
          console.log(`💾 Cached ${properties.length} scraped properties for ${params.city}`);
          
          resolve(properties);

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