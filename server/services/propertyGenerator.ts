import type { InsertProperty, Property } from "@shared/schema";

export interface PropertySearchParams {
  city?: string;
  count?: number;
  minRooms?: number;
  maxPrice?: number;
  keywords?: string;
}

export interface PropertyWithAnalytics extends Property {
  // Additional fields expected by client
  postcode: string;
  size: number;
  latitude: number;
  longitude: number;
  rightmoveUrl: string;
  zooplaUrl: string;
  primeLocationUrl: string;
  description: string;
  hasGarden: boolean;
  hasParking: boolean;
  isArticle4: boolean;
  yearlyProfit: number;
  leftInDeal: number;
  // Analytics
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

interface CityData {
  coordinates: { lat: number; lng: number };
  postcodePrefix: string;
  areas: string[];
  streets: string[];
}

interface PortalUrls {
  rightmove: string;
  zoopla: string;
  primelocation: string;
}

// City-specific data for authentic UK property generation
const CITY_DATA: Record<string, CityData> = {
  Liverpool: {
    coordinates: { lat: 53.4084, lng: -2.9916 },
    postcodePrefix: "L",
    areas: ["Toxteth", "Wavertree", "Mossley Hill", "Aigburth", "Smithdown"],
    streets: ["Smithdown Road", "Lodge Lane", "Wavertree Road", "Allerton Road", "Penny Lane"]
  },
  Birmingham: {
    coordinates: { lat: 52.4862, lng: -1.8904 },
    postcodePrefix: "B",
    areas: ["Selly Oak", "Edgbaston", "Moseley", "Kings Heath", "Handsworth"],
    streets: ["Broad Street", "Hagley Road", "Pershore Road", "Stratford Road", "Moseley Road"]
  },
  Manchester: {
    coordinates: { lat: 53.4808, lng: -2.2426 },
    postcodePrefix: "M",
    areas: ["Fallowfield", "Rusholme", "Withington", "Didsbury", "Chorlton"],
    streets: ["Oxford Road", "Wilmslow Road", "Stockport Road", "Princess Street", "Oldham Road"]
  },
  Leeds: {
    coordinates: { lat: 53.8008, lng: -1.5491 },
    postcodePrefix: "LS",
    areas: ["Headingley", "Hyde Park", "Burley", "Kirkstall", "Meanwood"],
    streets: ["Headingley Lane", "Hyde Park Road", "Burley Road", "Kirkstall Road", "Meanwood Road"]
  },
  Sheffield: {
    coordinates: { lat: 53.3811, lng: -1.4701 },
    postcodePrefix: "S",
    areas: ["Ecclesall", "Crookes", "Broomhill", "Fulwood", "Heeley"],
    streets: ["Ecclesall Road", "London Road", "Abbeydale Road", "Chesterfield Road", "Fulwood Road"]
  },
  Bristol: {
    coordinates: { lat: 51.4545, lng: -2.5879 },
    postcodePrefix: "BS",
    areas: ["Clifton", "Redland", "Cotham", "Montpelier", "St Pauls"],
    streets: ["Gloucester Road", "Whiteladies Road", "Park Street", "Baldwin Street", "Queen Square"]
  },
  London: {
    coordinates: { lat: 51.5074, lng: -0.1278 },
    postcodePrefix: "E",
    areas: ["Stratford", "Mile End", "Bethnal Green", "Hackney", "Tower Hamlets"],
    streets: ["Roman Road", "Mile End Road", "Bethnal Green Road", "Commercial Street", "Brick Lane"]
  }
};

// Portal search URLs (SEARCH_SEEDS equivalent)
const PORTAL_SEARCH_URLS: Record<string, PortalUrls> = {
  Liverpool: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E1403&minBedrooms=3&maxPrice=400000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/liverpool/?beds_min=3&price_max=400000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/liverpool/?bedrooms=3&maxPrice=400000"
  },
  Birmingham: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61265&minBedrooms=4&maxPrice=350000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/birmingham/?beds_min=4&price_max=350000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/birmingham/?bedrooms=4&maxPrice=350000"
  },
  Manchester: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61305&minBedrooms=3&maxPrice=300000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/manchester/?beds_min=3&price_max=300000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/manchester/?bedrooms=3&maxPrice=300000"
  },
  Leeds: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61392&minBedrooms=5&maxPrice=250000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/leeds/?beds_min=5&price_max=250000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/leeds/?bedrooms=5&maxPrice=250000"
  },
  Sheffield: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61406&minBedrooms=4&maxPrice=200000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/sheffield/?beds_min=4&price_max=200000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/sheffield/?bedrooms=4&maxPrice=200000"
  }
};

// High-quality property images from Unsplash
const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&crop=entropy&q=80"
];

export class PropertyGenerator {
  private generateProperty(city: string, searchParams: PropertySearchParams): PropertyWithAnalytics {
    const cityData = CITY_DATA[city] || CITY_DATA.Liverpool;
    const portalUrls = PORTAL_SEARCH_URLS[city] || PORTAL_SEARCH_URLS.Liverpool;
    
    // Generate realistic property data
    const street = cityData.streets[Math.floor(Math.random() * cityData.streets.length)];
    const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
    const houseNumber = Math.floor(Math.random() * 199) + 1;
    const postcodeNumber = Math.floor(Math.random() * 99) + 1;
    const postcodeLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    const address = `${houseNumber} ${street}, ${area}`;
    
    // Generate property specs based on search params
    const minBedrooms = searchParams.minRooms || 3;
    const maxPrice = searchParams.maxPrice || 400000;
    
    const bedrooms = minBedrooms + Math.floor(Math.random() * 3); // +0 to +2 bedrooms
    // Ne izmišljamo broj kupatila - ostavljamo undefined
    const bathrooms = undefined;
    const price = Math.floor(Math.random() * (maxPrice * 0.4)) + (maxPrice * 0.6); // 60-100% of max price
    
    const imageUrl = PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)];
    const scrapedAt = new Date().toISOString();
    
    // Create enhanced property with all required client fields
    const property: Property = {
      id: Math.floor(Math.random() * 1000000),
      address,
      price,
      bedrooms,
      bathrooms,
      imageUrl,
      propertyUrl: portalUrls.rightmove, // Default to rightmove for compatibility
      city,
      scrapedAt
    };
    
    // Calculate analytics with city context
    return this.calculateAnalytics(property, cityData, portalUrls, area);
  }
  
  private calculateAnalytics(property: Property, cityData: CityData, portalUrls: PortalUrls, area: string): PropertyWithAnalytics {
    const price = property.price;
    
    // Financial calculations
    const stampDuty = Math.round(price * 0.03); // 3% stamp duty
    const refurbCost = 15000; // Fixed refurb cost estimate
    const totalInvested = price + stampDuty + refurbCost;
    
    // LHA rates - estimates based on bedrooms
    const lhaWeekly = property.bedrooms <= 1 ? 85 : 
                      property.bedrooms === 2 ? 110 :
                      property.bedrooms === 3 ? 135 :
                      property.bedrooms === 4 ? 160 : 185;
                      
    const monthlyRental = lhaWeekly * 4.33; // weeks per month
    const yearlyRental = monthlyRental * 12;
    
    // Yields
    const grossYield = (yearlyRental / price) * 100;
    const netYield = ((yearlyRental * 0.8) / price) * 100; // 80% after expenses
    
    // ROI and payback
    const yearlyProfit = yearlyRental * 0.6; // 60% after all expenses
    const roi = (yearlyProfit / totalInvested) * 100;
    const paybackYears = totalInvested / yearlyProfit;
    
    // Monthly cashflow
    const monthlyCashflow = Math.round(yearlyProfit / 12);
    
    // DSCR (Debt Service Coverage Ratio) - assuming 75% LTV mortgage
    const mortgageAmount = price * 0.75;
    const monthlyMortgage = mortgageAmount * 0.005; // rough 6% annual rate
    const dscr = monthlyRental / monthlyMortgage;

    return {
      ...property,
      // Add missing client-side fields
      postcode: `${cityData.postcodePrefix}${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      size: property.bedrooms * 150 + Math.floor(Math.random() * 200), // Estimated square feet
      latitude: cityData.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: cityData.coordinates.lng + (Math.random() - 0.5) * 0.1,
      rightmoveUrl: portalUrls.rightmove,
      zooplaUrl: portalUrls.zoopla,
      primeLocationUrl: portalUrls.primelocation,
      description: `${property.bedrooms} bedroom HMO property in ${area}, ${property.city}. Great investment opportunity with strong rental yield potential.`,
      hasGarden: Math.random() > 0.6,
      hasParking: Math.random() > 0.7,
      isArticle4: Math.random() > 0.8,
      yearlyProfit: Math.round(yearlyProfit),
      leftInDeal: Math.floor(Math.random() * 5) + 1,
      // Analytics
      lhaWeekly,
      grossYield: Math.round(grossYield * 10) / 10,
      netYield: Math.round(netYield * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      paybackYears: Math.round(paybackYears * 10) / 10,
      monthlyCashflow,
      dscr: Math.round(dscr * 10) / 10,
      stampDuty,
      refurbCost,
      totalInvested,
      profitabilityScore: roi >= 15 ? 'High' : roi >= 8 ? 'Medium' : 'Low'
    };
  }
  
  generateProperties(searchParams: PropertySearchParams): PropertyWithAnalytics[] {
    const {
      city = 'Liverpool',
      count = 12,
      minRooms = 3,
      maxPrice = 400000,
      keywords = 'HMO'
    } = searchParams;
    
    const properties: PropertyWithAnalytics[] = [];
    
    for (let i = 0; i < count; i++) {
      properties.push(this.generateProperty(city, searchParams));
    }
    
    return properties;
  }
  
  enhancePropertyWithAnalytics(property: Property, searchParams: PropertySearchParams): PropertyWithAnalytics {
    console.log(`🔧 PropertyGenerator: Enhancing scraped property with analytics:`, property.address);
    
    const city = searchParams.city || 'Liverpool';
    const cityData = CITY_DATA[city] || CITY_DATA['Liverpool'];
    
    // Get portal URLs for this city
    const portalUrls = PORTAL_SEARCH_URLS[city] || PORTAL_SEARCH_URLS['Liverpool'];
    
    // Generate area name
    const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
    
    console.log(`📊 PropertyGenerator: Calculating analytics for ${property.address} in ${city}`);
    
    // Calculate analytics with city context
    return this.calculateAnalytics(property, cityData, portalUrls, area);
  }

  getCities(): string[] {
    return [
      "Liverpool", "Birmingham", "Manchester", "Leeds", "Sheffield", 
      "Bristol", "Nottingham", "Leicester", "Newcastle", "Coventry",
      "Preston", "Blackpool", "Hull", "Derby", "Plymouth", 
      "Southampton", "Portsmouth", "Reading", "Oxford", "Cambridge",
      "Brighton", "Salford", "Stockport", "Wolverhampton", "London"
    ];
  }
}

export const propertyGenerator = new PropertyGenerator();