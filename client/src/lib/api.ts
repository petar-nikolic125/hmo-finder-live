import { PropertySearchParams, PropertyWithAnalytics } from './types';

// API response structure for property search with professional messaging
export interface PropertySearchResponse {
  properties: PropertyWithAnalytics[];
  message?: string;
  hasExpandedResults?: boolean;
  totalCount?: number;
}

// API client that connects to the backend
class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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