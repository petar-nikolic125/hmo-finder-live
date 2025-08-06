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
  private readonly RATE_LIMIT_MINUTES = 5; // 5 minutes between scraping sessions
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

          // Convert scraped data to Property format - samo realni podaci
          const properties: Property[] = scrapedProperties.map((prop: any, index: number) => ({
            id: Math.floor(Math.random() * 1000000), // Generate random ID
            address: prop.address || `${prop.title || 'Unknown'}, ${params.city}`,
            price: parseInt(prop.price?.toString().replace(/[£,]/g, '')) || 0,
            bedrooms: parseInt(prop.bedrooms?.toString()) || 1,
            bathrooms: prop.bathrooms ? parseInt(prop.bathrooms?.toString()) : undefined, // Samo ako je stvarno pronađeno
            imageUrl: prop.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80',
            propertyUrl: prop.property_url || '',
            city: params.city,
            scrapedAt: new Date().toISOString()
          }));

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