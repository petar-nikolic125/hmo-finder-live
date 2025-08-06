import { PropertySearchParams, InsertProperty } from './types';

// Enhanced property type with analytics
export type PropertyWithAnalytics = InsertProperty & {
  lhaWeekly: number;
  grossYield: number;
  netYield: number;
  roi: number;
  paybackYears: number;
  monthlyCashflow: number;
  dscr: number;
  stampDuty: number;
  refurbCost: number;
  totalInvested: number;
  profitabilityScore?: string;
  size?: number;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  rightmoveUrl?: string;
  zooplaUrl?: string;
  primeLocationUrl?: string;
  description?: string;
};

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

  async getProperties(params: PropertySearchParams = {}): Promise<PropertyWithAnalytics[]> {
    const searchParams = new URLSearchParams();
    
    if (params.city) searchParams.append('city', params.city);
    if (params.count) searchParams.append('count', params.count.toString());
    if (params.minRooms) searchParams.append('minRooms', params.minRooms.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.keywords) searchParams.append('keywords', params.keywords);

    const url = `/api/properties?${searchParams.toString()}`;
    return this.request<PropertyWithAnalytics[]>(url);
  }

  async getCities(): Promise<string[]> {
    return this.request<string[]>('/api/cities');
  }

  async ping(): Promise<{ now: number }> {
    return this.request<{ now: number }>('/api/ping');
  }
}

export const apiClient = new ApiClient();