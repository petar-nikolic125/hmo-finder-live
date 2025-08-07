import { PropertySearchParams, PropertyWithAnalytics } from './types';
import { apiMonitor } from './api-monitor';

// API response structure for property search with professional messaging
export interface PropertySearchResponse {
  properties: PropertyWithAnalytics[];
  message?: string;
  hasExpandedResults?: boolean;
  totalCount?: number;
}

// API client that connects to the backend
class ApiClient {
  private getBaseUrl(): string {
    // In production (deployed), use the current domain
    // In development, use relative URLs which will go to the Express server
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return ''; // Use relative URLs in development
      } else {
        return ''; // Use relative URLs in production too, as they should go to the same server
      }
    }
    return '';
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const fullUrl = `${baseUrl}${url}`;
    
    console.log(`🔍 API Request: ${fullUrl}`);
    
    try {
      // Check connection status before making request
      if (!apiMonitor.isConnected()) {
        console.warn('⚠️ API appears disconnected, attempting anyway...');
      }

      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
        ...options,
      });

      console.log(`📡 API Response: ${response.status} for ${fullUrl}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, { url: fullUrl, dataSize: JSON.stringify(data).length });
      
      // Enhanced debugging for production properties endpoint
      if (fullUrl.includes('/api/properties')) {
        console.log('🏠 Properties data structure:', {
          hasProperties: !!data.properties,
          propertiesLength: data.properties?.length || 0,
          hasMessage: !!data.message,
          hasExpandedResults: !!data.hasExpandedResults,
          dataKeys: Object.keys(data),
          firstProperty: data.properties?.[0] ? {
            hasId: !!data.properties[0].id,
            hasAddress: !!data.properties[0].address,
            hasPrice: !!data.properties[0].price,
            keys: Object.keys(data.properties[0])
          } : 'no properties',
          rawDataSample: JSON.stringify(data).substring(0, 200) + '...'
        });
      }
      
      return data;
    } catch (error) {
      console.error(`🚨 Request failed for ${fullUrl}:`, error);
      throw error;
    }
  }

  async getProperties(params: PropertySearchParams = {}): Promise<PropertySearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.city) searchParams.append('city', params.city);
    if (params.count) searchParams.append('count', params.count.toString());
    if (params.minRooms) searchParams.append('minRooms', params.minRooms.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.keywords) searchParams.append('keywords', params.keywords);

    const url = `/api/properties?${searchParams.toString()}`;
    return this.request<PropertySearchResponse>(url);
  }

  async getCities(): Promise<string[]> {
    return this.request<string[]>('/api/cities');
  }

  async ping(): Promise<{ now: number }> {
    return this.request<{ now: number }>('/api/ping');
  }
}

export const apiClient = new ApiClient();