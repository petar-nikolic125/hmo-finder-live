import { PropertySearchParams, PropertyWithAnalytics } from './types';
import { generatePropertiesForCity, getAvailableCities } from './generator';

// Mock API client - simulates real backend calls
class ApiClient {
  private baseDelay = 300; // Simulate network latency

  private delay(ms: number = this.baseDelay) {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
  }

  async getProperties(params: PropertySearchParams = {}): Promise<PropertyWithAnalytics[]> {
    await this.delay();
    
    const {
      city = 'Birmingham',
      count = 12,
      minSize = 90,
      maxPrice = 500000,
      excludeArticle4 = true,
      sortBy = 'profit'
    } = params;

    let properties = generatePropertiesForCity(city, count * 2); // Generate extra for filtering

    // Apply filters
    properties = properties.filter(p => 
      p.size >= minSize && 
      p.price <= maxPrice && 
      (!excludeArticle4 || !p.isArticle4)
    );

    // Apply sorting
    properties.sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.yearlyProfit - a.yearlyProfit;
        case 'price':
          return a.price - b.price;
        case 'size':
          return b.size - a.size;
        case 'recent':
          return Math.random() - 0.5; // Random for "recent"
        default:
          return b.yearlyProfit - a.yearlyProfit;
      }
    });

    // Return requested count
    return properties.slice(0, count);
  }

  async getCities(): Promise<string[]> {
    await this.delay(100);
    return getAvailableCities();
  }

  async ping(): Promise<{ now: number }> {
    await this.delay(50);
    return { now: Date.now() };
  }
}

export const apiClient = new ApiClient();