export interface InsertProperty {
  address: string;
  postcode: string;
  price: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  imageUrl: string;
  primeLocationUrl: string;
  rightmoveUrl: string;
  zooplaUrl: string;
  description: string;
  hasGarden: boolean;
  hasParking: boolean;
  isArticle4: boolean;
  yearlyProfit: number;
  leftInDeal: number;
}

export interface PropertyWithAnalytics extends InsertProperty {
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
}

export interface PropertySearchParams {
  city?: string;
  count?: number;
  minSize?: number;
  maxPrice?: number;
  excludeArticle4?: boolean;
  sortBy?: 'profit' | 'price' | 'size' | 'recent';
}