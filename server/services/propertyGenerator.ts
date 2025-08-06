import type { InsertProperty, Property } from "@shared/schema";

export interface PropertySearchParams {
  city?: string;
  count?: number;
  minRooms?: number;
  maxPrice?: number;
  keywords?: string;
  postcode?: string;  // New postcode search feature
  stressTest?: boolean; // Flag for stress testing mode
}

export interface PropertyWithAnalytics extends Property {
  // Additional fields expected by client
  postcode: string;
  size?: number; // Opciono - samo ako je stvarno pronađeno
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
  profitabilityScore?: string;
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
  },
  Nottingham: {
    coordinates: { lat: 52.9548, lng: -1.1581 },
    postcodePrefix: "NG",
    areas: ["Lenton", "Beeston", "Radford", "Forest Fields", "Hyson Green"],
    streets: ["Derby Road", "Alfreton Road", "Mansfield Road", "Ilkeston Road", "Gregory Boulevard"]
  },
  Leicester: {
    coordinates: { lat: 52.6369, lng: -1.1398 },
    postcodePrefix: "LE",
    areas: ["Stoneygate", "Clarendon Park", "West End", "Highfields", "Evington"],
    streets: ["London Road", "Narborough Road", "Hinckley Road", "Belgrave Road", "Evington Road"]
  },
  Newcastle: {
    coordinates: { lat: 54.9783, lng: -1.6178 },
    postcodePrefix: "NE",
    areas: ["Jesmond", "Heaton", "Byker", "Sandyford", "Fenham"],
    streets: ["Northumberland Street", "Grainger Street", "Clayton Street", "Grey Street", "Osborne Road"]
  },
  Coventry: {
    coordinates: { lat: 52.4068, lng: -1.5197 },
    postcodePrefix: "CV",
    areas: ["Earlsdon", "Chapelfields", "Stoke", "Radford", "Hillfields"],
    streets: ["Warwick Road", "Holyhead Road", "Foleshill Road", "Binley Road", "Allesley Old Road"]
  },
  Preston: {
    coordinates: { lat: 53.7632, lng: -2.7031 },
    postcodePrefix: "PR",
    areas: ["Ribbleton", "Fulwood", "Ashton", "Deepdale", "Fishwick"],
    streets: ["Blackpool Road", "Garstang Road", "New Hall Lane", "Watling Street Road", "Ribbleton Avenue"]
  },
  Blackpool: {
    coordinates: { lat: 53.8175, lng: -3.0357 },
    postcodePrefix: "FY",
    areas: ["South Shore", "Marton", "Bispham", "Layton", "Stanley Park"],
    streets: ["Promenade", "Church Street", "Whitegate Drive", "Lytham Road", "Central Drive"]
  },
  Hull: {
    coordinates: { lat: 53.7676, lng: -0.3274 },
    postcodePrefix: "HU",
    areas: ["Newland", "Boulevard", "Avenues", "Spring Bank", "Anlaby Road"],
    streets: ["Spring Bank", "Anlaby Road", "Beverley Road", "Hessle Road", "Holderness Road"]
  },
  Derby: {
    coordinates: { lat: 52.9225, lng: -1.4746 },
    postcodePrefix: "DE",
    areas: ["Normanton", "Chaddesden", "Allestree", "Mackworth", "Spondon"],
    streets: ["London Road", "Burton Road", "Uttoxeter Road", "Ashbourne Road", "Kedleston Road"]
  },
  Plymouth: {
    coordinates: { lat: 50.3755, lng: -4.1427 },
    postcodePrefix: "PL",
    areas: ["Mutley", "St Judes", "Greenbank", "Peverell", "Ford"],
    streets: ["Mutley Plain", "Union Street", "North Road East", "Tavistock Road", "Mannamead Road"]
  },
  Southampton: {
    coordinates: { lat: 50.9097, lng: -1.4044 },
    postcodePrefix: "SO",
    areas: ["Portswood", "Highfield", "Swaythling", "Shirley", "Millbrook"],
    streets: ["Above Bar Street", "London Road", "Winchester Road", "Shirley Road", "Burgess Road"]
  },
  Portsmouth: {
    coordinates: { lat: 50.8198, lng: -1.0880 },
    postcodePrefix: "PO",
    areas: ["Southsea", "Fratton", "Copnor", "Milton", "Buckland"],
    streets: ["Commercial Road", "London Road", "Kingston Road", "Fratton Road", "Albert Road"]
  },
  Reading: {
    coordinates: { lat: 51.4543, lng: -0.9781 },
    postcodePrefix: "RG",
    areas: ["Coley", "Whitley", "Tilehurst", "Caversham", "Earley"],
    streets: ["Oxford Road", "Bath Road", "Basingstoke Road", "Whitley Street", "Kings Road"]
  },
  Oxford: {
    coordinates: { lat: 51.7520, lng: -1.2577 },
    postcodePrefix: "OX",
    areas: ["Jericho", "Cowley", "Headington", "Summertown", "Iffley"],
    streets: ["High Street", "Cornmarket Street", "St Aldates", "Headington Road", "Cowley Road"]
  },
  Cambridge: {
    coordinates: { lat: 52.2053, lng: 0.1218 },
    postcodePrefix: "CB",
    areas: ["Mill Road", "Romsey", "Cherry Hinton", "Chesterton", "Petersfield"],
    streets: ["Mill Road", "Hills Road", "Newmarket Road", "Huntingdon Road", "Cherry Hinton Road"]
  },
  Brighton: {
    coordinates: { lat: 50.8225, lng: -0.1372 },
    postcodePrefix: "BN",
    areas: ["Kemptown", "Hanover", "Preston Park", "Moulsecoomb", "Whitehawk"],
    streets: ["London Road", "Preston Road", "Ditchling Road", "Lewes Road", "Edward Street"]
  },
  Salford: {
    coordinates: { lat: 53.4875, lng: -2.2901 },
    postcodePrefix: "M",
    areas: ["Ordsall", "Pendleton", "Weaste", "Seedley", "Little Hulton"],
    streets: ["Chapel Street", "Eccles New Road", "Liverpool Street", "Regent Road", "Bolton Road"]
  },
  Stockport: {
    coordinates: { lat: 53.4106, lng: -2.1575 },
    postcodePrefix: "SK",
    areas: ["Edgeley", "Shaw Heath", "Davenport", "Cheadle Heath", "Reddish"],
    streets: ["Wellington Road", "London Road", "Buxton Road", "Bramhall Lane", "Stockport Road"]
  },
  Wolverhampton: {
    coordinates: { lat: 52.5864, lng: -2.1285 },
    postcodePrefix: "WV",
    areas: ["Whitmore Reans", "Park Village", "Dunstall Hill", "Penn", "Tettenhall"],
    streets: ["Wolverhampton Road", "Penn Road", "Stafford Road", "Compton Road", "Chapel Ash"]
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
  },
  Bristol: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61268&minBedrooms=3&maxPrice=500000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/bristol/?beds_min=3&price_max=500000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/bristol/?bedrooms=3&maxPrice=500000"
  },
  Nottingham: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61384&minBedrooms=4&maxPrice=250000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/nottingham/?beds_min=4&price_max=250000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/nottingham/?bedrooms=4&maxPrice=250000"
  },
  Leicester: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61378&minBedrooms=3&maxPrice=200000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/leicester/?beds_min=3&price_max=200000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/leicester/?bedrooms=3&maxPrice=200000"
  },
  Newcastle: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87490&minBedrooms=3&maxPrice=180000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/newcastle/?beds_min=3&price_max=180000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/newcastle/?bedrooms=3&maxPrice=180000"
  },
  Coventry: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61281&minBedrooms=4&maxPrice=220000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/coventry/?beds_min=4&price_max=220000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/coventry/?bedrooms=4&maxPrice=220000"
  },
  Preston: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61389&minBedrooms=5&maxPrice=150000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/preston/?beds_min=5&price_max=150000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/preston/?bedrooms=5&maxPrice=150000"
  },
  Blackpool: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61264&minBedrooms=4&maxPrice=120000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/blackpool/?beds_min=4&price_max=120000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/blackpool/?bedrooms=4&maxPrice=120000"
  },
  Hull: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61371&minBedrooms=3&maxPrice=100000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/hull/?beds_min=3&price_max=100000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/hull/?bedrooms=3&maxPrice=100000"
  },
  Derby: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61282&minBedrooms=4&maxPrice=180000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/derby/?beds_min=4&price_max=180000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/derby/?bedrooms=4&maxPrice=180000"
  },
  Plymouth: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61388&minBedrooms=3&maxPrice=250000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/plymouth/?beds_min=3&price_max=250000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/plymouth/?bedrooms=3&maxPrice=250000"
  },
  Southampton: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61408&minBedrooms=3&maxPrice=350000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/southampton/?beds_min=3&price_max=350000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/southampton/?bedrooms=3&maxPrice=350000"
  },
  Portsmouth: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61389&minBedrooms=3&maxPrice=300000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/portsmouth/?beds_min=3&price_max=300000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/portsmouth/?bedrooms=3&maxPrice=300000"
  },
  Reading: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61393&minBedrooms=3&maxPrice=500000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/reading/?beds_min=3&price_max=500000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/reading/?bedrooms=3&maxPrice=500000"
  },
  Oxford: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61385&minBedrooms=3&maxPrice=600000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/oxford/?beds_min=3&price_max=600000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/oxford/?bedrooms=3&maxPrice=600000"
  },
  Cambridge: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61270&minBedrooms=3&maxPrice=650000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/cambridge/?beds_min=3&price_max=650000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/cambridge/?bedrooms=3&maxPrice=650000"
  },
  Brighton: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61267&minBedrooms=3&maxPrice=450000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/brighton/?beds_min=3&price_max=450000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/brighton/?bedrooms=3&maxPrice=450000"
  },
  Salford: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61401&minBedrooms=3&maxPrice=220000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/salford/?beds_min=3&price_max=220000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/salford/?bedrooms=3&maxPrice=220000"
  },
  Stockport: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61414&minBedrooms=4&maxPrice=250000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/stockport/?beds_min=4&price_max=250000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/stockport/?bedrooms=4&maxPrice=250000"
  },
  Wolverhampton: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E61428&minBedrooms=4&maxPrice=180000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/wolverhampton/?beds_min=4&price_max=180000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/wolverhampton/?bedrooms=4&maxPrice=180000"
  },
  London: {
    rightmove: "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87490&minBedrooms=3&maxPrice=800000&sortType=6",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/london/?beds_min=3&price_max=800000&q=HMO",
    primelocation: "https://www.primelocation.com/for-sale/property/london/?bedrooms=3&maxPrice=800000"
  }
};

// City-specific stylized architectural illustrations
const CITY_ARCHITECTURAL_IMAGES: Record<string, string[]> = {
  London: [
    "/attached_assets/generated_images/London_architectural_style_illustration_d62e91fc.png"
  ],
  Birmingham: [
    "/attached_assets/generated_images/Birmingham_architectural_style_illustration_e7bdd330.png"
  ],
  Manchester: [
    "/attached_assets/generated_images/Manchester_architectural_style_illustration_5386b916.png"
  ],
  Leeds: [
    "/attached_assets/generated_images/Leeds_architectural_style_illustration_90838b2c.png"
  ],
  Liverpool: [
    "/attached_assets/generated_images/Liverpool_architectural_style_illustration_31614007.png"
  ],
  Sheffield: [
    "/attached_assets/generated_images/Sheffield_industrial_style_illustration_4acbb255.png"
  ],
  Bristol: [
    "/attached_assets/generated_images/Bristol_Georgian_style_illustration_33851534.png"
  ],
  Nottingham: [
    "/attached_assets/generated_images/Nottingham_heritage_style_illustration_6f368e3c.png"
  ]
};

// Default fallback images for cities without specific illustrations
const DEFAULT_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&crop=entropy&q=80"
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
    // Ne izmišljamo broj kupatila - ostavljamo undefined za generisane properties
    const bathrooms = undefined;
    const price = Math.floor(Math.random() * (maxPrice * 0.4)) + (maxPrice * 0.6); // 60-100% of max price
    
    // Get city-specific architectural illustration or fallback to generic images
    const cityImages = CITY_ARCHITECTURAL_IMAGES[city] || [];
    const imageUrl = cityImages.length > 0 
      ? cityImages[Math.floor(Math.random() * cityImages.length)]
      : DEFAULT_PROPERTY_IMAGES[Math.floor(Math.random() * DEFAULT_PROPERTY_IMAGES.length)];
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
      size: undefined, // Ne izmišljamo kvadraturu - koristiće se samo ako je scraped
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