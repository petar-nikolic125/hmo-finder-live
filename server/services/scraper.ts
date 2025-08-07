import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';

export interface SearchParams {
  city: string;
  postcode?: string;
  count?: number;
  minBedrooms: number;
  maxPrice?: number;
  keywords?: string;
  stressTest?: boolean;
}

export interface Property {
  id: number;
  address: string;
  postcode: string;
  price: number;
  size?: number;
  bedrooms: number;
  bathrooms?: number;
  latitude: number;
  longitude: number;
  imageUrl: string;
  propertyUrl: string;
  primeLocationUrl: string;
  rightmoveUrl: string;
  zooplaUrl: string;
  city: string;
  scrapedAt: string;
  description: string;
  hasGarden: boolean;
  hasParking: boolean;
  isArticle4: boolean;
  yearlyProfit: number;
  leftInDeal: number;
  isExpandedResult?: boolean;
  // Financial fields that come from scraper
  gross_yield?: number;
  profitability_score?: string;
}

interface CacheEntry {
  searchHash: string;
  lastScraped: string;
  properties: Property[];
}

interface CacheData {
  [key: string]: CacheEntry;
}

export class ScrapingService {
  private cache: CacheData = {};
  private readonly cacheFile = process.env.NODE_ENV === 'production' ? '/tmp/scrape_cache.json' : '.local/scrape_cache.json';
  private readonly rateLimitMs = process.env.NODE_ENV === 'production' ? 300000 : 60000; // Cache for 5 minutes in production, 1 minute in dev

  constructor() {
    this.loadCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      this.cache = JSON.parse(data);
      console.log(`📁 Loaded scrape cache with ${Object.keys(this.cache).length} entries`);
    } catch (error) {
      console.log('📁 No existing cache found, starting fresh');
      this.cache = {};
    }
  }

  private async saveCache(): Promise<void> {
    try {
      // Create directory only if not in /tmp
      if (!this.cacheFile.startsWith('/tmp/')) {
        await fs.mkdir('.local', { recursive: true });
      }
      await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2));
      console.log('💾 Saved scrape cache');
    } catch (error) {
      console.error('Error saving cache:', error);
      // In production, continue even if cache save fails
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Cache save failed in production, continuing without cache');
      }
    }
  }

  private generateSearchHash(params: SearchParams): string {
    const key = `${params.city}-${params.minBedrooms || 1}-${params.maxPrice || 500000}-${params.keywords || 'HMO'}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  private async canScrapeNow(params: SearchParams): Promise<boolean> {
    const searchHash = this.generateSearchHash(params);
    const cached = this.cache[searchHash];
    
    if (!cached) {
      console.log('🚀 No cache found, allowing scrape');
      return true;
    }
    
    const lastScraped = new Date(cached.lastScraped);
    const now = new Date();
    const timeDiff = now.getTime() - lastScraped.getTime();
    const canScrape = timeDiff > this.rateLimitMs;
    
    console.log(`⏰ Cache check: Last scraped ${Math.floor(timeDiff/1000)}s ago, rate limit ${this.rateLimitMs/1000}s, can scrape: ${canScrape}`);
    
    // In development, still respect reasonable cache times
    if (process.env.NODE_ENV === 'development' && timeDiff > 30000) {
      console.log('🔧 Development mode: allowing scrape after 30s');
      return true;
    }
    
    return canScrape;
  }

  private async cacheResults(params: SearchParams, properties: Property[]): Promise<void> {
    const searchHash = this.generateSearchHash(params);
    this.cache[searchHash] = {
      searchHash,
      lastScraped: new Date().toISOString(),
      properties
    };
    await this.saveCache();
  }

  private findFlexibleCacheMatch(params: SearchParams): { data: Property[]; } | null {
    for (const entry of Object.values(this.cache)) {
      if (entry.properties.length > 0 && entry.properties[0].city.toLowerCase() === params.city.toLowerCase()) {
        const filtered = entry.properties.filter(p => 
          (p.bedrooms >= (params.minBedrooms || 1)) &&
          (p.price <= (params.maxPrice || 500000))
        );
        if (filtered.length > 5) {
          return { data: filtered.slice(0, 20) };
        }
      }
    }
    return null;
  }

  async clearCache(): Promise<void> {
    this.cache = {};
    await this.saveCache();
    console.log('🧹 Cache cleared');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getCityAliases(city: string): string[] {
    const aliases: Record<string, string[]> = {
      'london': ['sw1', 'w1', 'ec1', 'nw1', 'se1', 'e1', 'n1', 'wc1', 'greater london'],
      'manchester': ['mcr', 'greater manchester'],
      'birmingham': ['bham', 'west midlands'],
      'liverpool': ['merseyside'],
      'leeds': ['west yorkshire'],
      'sheffield': ['south yorkshire'],
      'bristol': ['gloucestershire'],
      'glasgow': ['lanarkshire'],
      'edinburgh': ['lothian'],
      'cardiff': ['wales', 'cymru']
    };
    
    return aliases[city.toLowerCase()] || [];
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

  private convertScrapedToProperties(scrapedProperties: any[], params: SearchParams): { properties: Property[], hasExpandedResults: boolean } {
    const seenProperties = new Map<string, any>();
    const properties: Property[] = [];
    const expandedProperties: Property[] = [];
    const maxPriceLimit = params.maxPrice || 500000;
          
    for (const prop of scrapedProperties) {
      const address = prop.address || `${prop.title || 'Unknown'}, ${params.city}`;
      const price = parseInt(prop.price?.toString().replace(/[£,]/g, '')) || 0;
      const bedrooms = parseInt(prop.bedrooms?.toString()) || 1;
      
      // Skip only clearly invalid properties - be very permissive
      if (!address || address.length < 3 || price <= 1000) {
        continue;
      }
      
      // STRICT PRICE FILTERING - respect user's maximum price criteria
      const isWithinPriceLimit = price <= maxPriceLimit;
      const isWithinExpandedLimit = price <= (maxPriceLimit * 1.15); // Allow 15% tolerance for "similar" properties
      
      // Skip properties that are way over the price limit (more than 15% over)
      if (!isWithinExpandedLimit) {
        console.log(`💰 Skipping over-priced property: ${address} (£${price.toLocaleString()}) - exceeds ${(maxPriceLimit * 1.15).toLocaleString()} limit`);
        continue;
      }
      
      // Skip obviously invalid addresses - be more specific
      const addressLower = address.toLowerCase();
      const invalidAddressPrefixes = [
        'related searches',
        'similar properties', 
        'recommended',
        'you might also like',
        'search results',
        'filter by',
        'no results found',
        'currently available for sale in',
        'properties for sale in'
      ];
      
      const isInvalidAddress = invalidAddressPrefixes.some(prefix => 
        addressLower.includes(prefix)
      );
      
      if (isInvalidAddress) {
        console.log(`🚫 Skipping invalid address: ${address}`);
        continue;
      }
      
      // More lenient city validation - accept if address contains city name or looks like a real address
      const searchCity = params.city.toLowerCase();
      const hasCity = addressLower.includes(searchCity) || 
                     addressLower.includes(searchCity.substring(0, 4)) ||
                     this.getCityAliases(searchCity).some(alias => addressLower.includes(alias.toLowerCase()));
      
      const looksLikeAddress = addressLower.match(/\b(street|road|avenue|lane|drive|close|way|place|crescent|terrace|park|grove|gardens|view|hill|green|court)\b/) ||
                              addressLower.match(/^\d+\s+\w+/) ||
                              addressLower.includes(' l\d') || // Liverpool postcodes
                              addressLower.includes(' m\d') || // Manchester postcodes
                              addressLower.includes(' b\d'); // Birmingham postcodes
      
      // MUCH more permissive - only skip obviously fake addresses
      if (!hasCity && !looksLikeAddress && addressLower.length < 10) {
        console.log(`🚫 Skipping non-address: ${address} (searching for ${params.city})`);
        continue;
      }
      
      // DEBUG: Log what properties we're accepting (remove after migration)
      // console.log(`✅ Accepting property: ${address} (£${price.toLocaleString()}) - ${bedrooms} bed | HasCity: ${hasCity} | LooksLikeAddress: ${looksLikeAddress}`);
      
      // Create intelligent unique identifier with price tolerance
      const normalizedAddress = address.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const priceRange = Math.floor(price / (price * 0.05)) * (price * 0.05);
      const baseKey = `${normalizedAddress}-${bedrooms}-${Math.floor(priceRange)}`;
      
      // Check for similar properties (fuzzy matching) - be less aggressive
      let isDuplicate = false;
      for (const [existingKey, existingProp] of Array.from(seenProperties.entries())) {
        const addressSimilarity = this.calculateSimilarity(normalizedAddress, existingKey.split('-')[0]);
        const priceDiff = Math.abs(price - existingProp.price) / price;
        
        // Only mark as duplicate if VERY similar (99%+ similarity, same price, same bedrooms)
        if (addressSimilarity > 0.99 && priceDiff < 0.01 && bedrooms === existingProp.bedrooms) {
          console.log(`🔄 Skipping exact duplicate: ${address} (£${price}) - identical to ${existingProp.address}`);
          isDuplicate = true;
          break;
        }
      }
      
      if (isDuplicate) {
        continue;
      }
      
      seenProperties.set(baseKey, { address, price, bedrooms });
      
      const propertyId = parseInt(crypto.createHash('md5').update(baseKey + Date.now()).digest('hex').substring(0, 8), 16);
      
      const propertyObj: any = {
        id: propertyId,
        address,
        price,
        bedrooms,
        bathrooms: prop.bathrooms ? parseInt(prop.bathrooms?.toString()) : undefined,
        imageUrl: prop.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&q=80',
        propertyUrl: prop.property_url || '',
        city: params.city,
        scrapedAt: new Date().toISOString(),
        isExpandedResult: !isWithinPriceLimit
      };
      
      // Add additional fields if available
      if (prop.postcode) propertyObj.postcode = prop.postcode;
      if (prop.latitude) propertyObj.latitude = prop.latitude;
      if (prop.longitude) propertyObj.longitude = prop.longitude;
      if (prop.description) propertyObj.description = prop.description;
      if (prop.area_sqm) propertyObj.area_sqm = prop.area_sqm;
      
      // Investment analysis fields
      const investmentFields = [
        'lha_weekly', 'gross_yield', 'net_yield', 'roi', 'payback_years',
        'monthly_cashflow', 'yearly_profit', 'total_invested', 'stamp_duty',
        'refurb_cost', 'dscr', 'profitability_score', 'left_in_deal',
        'has_garden', 'has_parking', 'is_article_4'
      ];
      
      investmentFields.forEach(field => {
        if (prop[field] !== undefined) {
          propertyObj[field] = prop[field];
        }
      });
      
      // Portal URLs
      if (prop.rightmove_url) propertyObj.rightmoveUrl = prop.rightmove_url;
      if (prop.zoopla_url) propertyObj.zooplaUrl = prop.zoopla_url;
      if (prop.primelocation_url) propertyObj.primeLocationUrl = prop.primelocation_url;
      
      // Separate properties within price limit vs expanded results
      if (isWithinPriceLimit) {
        properties.push(propertyObj);
      } else {
        expandedProperties.push(propertyObj);
      }
    }
    
    // Prioritize properties within price limit, then add expanded results if needed
    const allProperties = [...properties, ...expandedProperties];
    const hasExpandedResults = expandedProperties.length > 0 && properties.length < 10;
    
    console.log(`📊 Price filtering results: ${properties.length} within £${maxPriceLimit.toLocaleString()}, ${expandedProperties.length} expanded results`);
    
    return { properties: allProperties, hasExpandedResults };
  }

  async scrapeProperties(params: SearchParams): Promise<Property[]> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(process.cwd(), 'server/scraper/prime_scraper.py');
      const args = [
        pythonScript,
        params.city,
        params.minBedrooms.toString(),
        (params.maxPrice || 500000).toString(),
        params.keywords || 'HMO'
      ];

      console.log(`🔍 Using prime_scraper.py for REAL property data - NO FAKE DATA`);

      // Production-safe Python execution with timeout
      const pythonCmd = process.env.NODE_ENV === 'production' ? 'python3' : 'python3';
      const pythonProcess = spawn(pythonCmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: { ...process.env, PYTHONPATH: process.cwd() },
        timeout: 60000 // 60 second timeout for production
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
          
          // In production, try to return cached results instead of failing completely
          if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Production error detected, attempting cache fallback...');
            const cachedResults = await this.getCachedResults(params);
            if (cachedResults.length > 0) {
              console.log(`📦 Using cached fallback: ${cachedResults.length} properties`);
              resolve(cachedResults);
              return;
            }
            
            // Try flexible cache match as last resort
            const flexibleMatch = this.findFlexibleCacheMatch(params);
            if (flexibleMatch && flexibleMatch.data.length > 0) {
              console.log(`📦 Using flexible cache fallback: ${flexibleMatch.data.length} properties`);
              resolve(flexibleMatch.data);
              return;
            }
          }
          
          reject(new Error(`Scraper failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          console.log('Raw scraper output (first 500 chars):', output.substring(0, 500));
          
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
          
          const scrapedProperties = JSON.parse(jsonOutput);
          console.log(`✅ Successfully parsed ${scrapedProperties.length} properties`);
          
          // DEBUG: Log first few properties to understand the structure (remove after migration)
          // if (scrapedProperties.length > 0) {
          //   console.log('🔍 DEBUG: First 3 scraped properties:');
          //   scrapedProperties.slice(0, 3).forEach((prop, i) => {
          //     console.log(`  ${i+1}. Address: "${prop.address}" | Price: ${prop.price} | Bedrooms: ${prop.bedrooms}`);
          //   });
          // }

          if (!scrapedProperties || scrapedProperties.length === 0) {
            console.log('⚠️ No scraped properties found. Returning empty array - no fake data fallback.');
            resolve([]);
            return;
          }

          const result = this.convertScrapedToProperties(scrapedProperties, params);
          const { properties, hasExpandedResults } = result;
          
          console.log(`✅ After deduplication: ${properties.length} unique properties (from ${scrapedProperties.length} scraped)`);
          
          if (properties.length > 0) {
            await this.cacheResults(params, properties);
            console.log(`💾 Cached ${properties.length} scraped properties for ${params.city}`);
          }
          
          // Add professional messaging for expanded results
          if (hasExpandedResults) {
            const maxPrice = params.maxPrice || 500000;
            console.log(`🗺 Professional message: Some results exceed £${maxPrice.toLocaleString()} to provide additional investment options`);
          }
          
          console.log(`✅ Returning ${properties.length} real scraped properties for ${params.city}`);
          resolve(properties);
        } catch (error) {
          console.error('Error processing scraper output:', error);
          
          // In production, try cache fallback before failing
          if (process.env.NODE_ENV === 'production') {
            console.log('🔄 JSON parsing failed in production, trying cache fallback...');
            const cachedResults = await this.getCachedResults(params);
            if (cachedResults.length > 0) {
              console.log(`📦 Using cached fallback after JSON error: ${cachedResults.length} properties`);
              resolve(cachedResults);
              return;
            }
          }
          
          reject(error);
        }
      });
    });
  }

  async searchProperties(params: SearchParams): Promise<Property[]> {
    try {
      console.log(`🔍 Starting search for ${params.city} with minBedrooms: ${params.minBedrooms}, maxPrice: ${params.maxPrice}`);
      
      const canScrape = await this.canScrapeNow(params);
      
      if (!canScrape) {
        console.log('⏰ Rate limit active, checking for cached results');
        const cachedResults = await this.getCachedResults(params);
        
        if (cachedResults.length > 0) {
          console.log(`📦 Returning ${cachedResults.length} cached properties for ${params.city}`);
          return cachedResults;
        } else {
          console.log('⚠️ No exact cache match, trying flexible match...');
          const flexibleMatch = this.findFlexibleCacheMatch(params);
          if (flexibleMatch && flexibleMatch.data.length > 0) {
            console.log(`📦 Using flexible cache match with ${flexibleMatch.data.length} properties`);
            return flexibleMatch.data;
          }
          console.log('❌ No flexible cache match found either');
        }
        
        // If rate limited and no cache, force scrape anyway in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: Forcing scrape despite rate limit');
        } else {
          console.log('⚠️ Production rate limit enforced, returning empty');
          return [];
        }
      }

      console.log('🚀 Proceeding with fresh scrape');
      const properties = await this.scrapeProperties(params);
      console.log(`✅ Scraping completed, returning ${properties.length} properties`);
      return properties;

    } catch (error) {
      console.error('❌ Error in search properties:', error);
      
      // STRICT: Only return cached REAL scraped data, never generate fake data
      const cachedResults = await this.getCachedResults(params);
      
      if (cachedResults.length > 0) {
        console.log(`📦 Error fallback: Returning ${cachedResults.length} cached REAL properties`);
        return cachedResults;
      }
      
      // NO fake data generation - return empty array if no real data available
      console.log('⚠️ No real properties available after error, returning empty array');
      return [];
    }
  }
}

export const scrapingService = new ScrapingService();