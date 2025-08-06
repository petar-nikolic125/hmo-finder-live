export interface InsertProperty {
  address: string;
  postcode: string;
  price: number;
  size?: number; // Opciono - prikazuje se samo ako je stvarno pronađeno
  bedrooms: number;
  bathrooms?: number; // Opciono - prikazuje se samo ako je stvarno pronađeno
  latitude: number;
  longitude: number;
  imageUrl: string;
  propertyUrl: string;
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
  profitabilityScore?: string;
}

export interface PropertySearchParams {
  city?: string;
  count?: number;
  minRooms?: number;
  maxPrice?: number;
  keywords?: string;
}