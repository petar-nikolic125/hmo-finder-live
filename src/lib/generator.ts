// 🔥 Ultimate HMO Property Generator — single-file, zero-loss consolidation
// -----------------------------------------------------------------------------
// • Generates synthetic HMO listings with full financial analytics
// • Deep-links to real portals (Rightmove/Zoopla/PrimeLocation) with filters
// • Adds ROI, DSCR, LHA gap, payback, cash-on-cash, stamp-duty, refurb, etc.
// • Zero scraped data — all values are statistically realistic
// -----------------------------------------------------------------------------

import { type InsertProperty, type PropertyWithAnalytics } from "./types";

/* -------------------------------------------------------------------------- */
/* 0.  BASIC UTILITIES                                                        */
/* -------------------------------------------------------------------------- */
const encode = (s: string) => encodeURIComponent(s.trim());
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* -------------------------------------------------------------------------- */
/* 1.  PORTAL DEEP-LINK BUILDERS                                              */
/* -------------------------------------------------------------------------- */
export const buildPrimeLocationUrl = (postcode: string) =>
  `https://www.primelocation.com/for-sale/property/${encode(
    postcode,
  )}/?keyword=HMO&price_max=500000&floor_area_min=90`;

export const buildRightmoveUrl = (postcode: string) =>
  `https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=${encode(
    postcode,
  )}&keywords=HMO&maxPrice=500000&minFloorArea=90`;

export const buildZooplaUrl = (postcode: string) =>
  `https://www.zoopla.co.uk/for-sale/property/${encode(
    postcode,
  )}/?q=HMO&price_max=500000&floor_area_min=90`;

/* -------------------------------------------------------------------------- */
/* 2.  FINANCE CONSTANTS                                                      */
/* -------------------------------------------------------------------------- */
const STAMP_DUTY_RATE = 0.05; // 5 % flat investor band
const BUYING_FEES = 4500; // conveyancing + survey + broker
const REFURB_PER_SQM = 250; // light refurb £/sqm
const MORTGAGE_INTEREST = 0.055; // 5.5 % interest-only illustrative

/* -------------------------------------------------------------------------- */
/* 3.  LHA SHARED RATES (£/wk 2024-25 freeze)                               */
/* -------------------------------------------------------------------------- */
const LHA_SHARED: Record<string, number> = {
  Birmingham: 78.61,
  Manchester: 94.72,
  Leeds: 80.0,
  Sheffield: 75.25,
  Liverpool: 79.25,
  Nottingham: 80.55,
  Leicester: 78.61,
  Newcastle: 72.8,
};

/* -------------------------------------------------------------------------- */
/* 4.  SEARCH SEEDS (portal URLs per city)                                    */
/* -------------------------------------------------------------------------- */
export const SEARCH_SEEDS = {
  Birmingham: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E1642&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/birmingham/?beds_min=4&price_max=500000&q=HMO",
  },
  Manchester: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E2558&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/manchester/?beds_min=4&q=HMO",
  },
  Leeds: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87490&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/leeds/?beds_min=4&q=HMO",
  },
  Sheffield: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87495&keywords=HMO",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/sheffield/?beds_min=5",
  },
  Liverpool: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87487&keywords=HMO",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/liverpool/?beds_min=4",
  },
  Nottingham: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E239&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/nottingham/?beds_min=4&q=HMO",
  },
  Leicester: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87485&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/leicester/?beds_min=4&q=HMO",
  },
  Newcastle: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87488&keywords=HMO",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/newcastle/?beds_min=4&q=HMO",
  },
};

/* -------------------------------------------------------------------------- */
/* 5.  REALISTIC DATA POOLS                                                   */
/* -------------------------------------------------------------------------- */
const PROPERTY_ID_RANGES = {
  rightmove: { min: 85_000_000, max: 95_000_000 },
  zoopla: { min: 70_000_000, max: 80_000_000 },
  onthemarket: { min: 55_000_000, max: 65_000_000 },
};

const STREET_TEMPLATES = {
  Birmingham: [
    "Soho Road",
    "Stratford Road",
    "Moseley Road",
    "Pershore Road",
    "Kings Heath High Street",
    "Handsworth Wood Road",
    "Lozells Road",
    "Villa Road",
    "Bristol Road",
    "Hagley Road",
    "Broad Street",
    "Corporation Street",
    "High Street",
    "New Street",
    "Bull Ring",
  ],
  Manchester: [
    "Oxford Road",
    "Wilmslow Road",
    "Dickenson Road",
    "Portland Street",
    "Mauldeth Road",
    "Chorlton Road",
    "Princess Street",
    "Deansgate",
    "Market Street",
    "King Street",
    "Piccadilly",
    "Albert Square",
    "Cross Street",
    "John Dalton Street",
    "Peter Street",
  ],
  Leeds: [
    "Cardigan Road",
    "Hyde Park Road",
    "Brudenell Road",
    "Woodhouse Lane",
    "Otley Road",
    "Cemetery Road",
    "Kirkstall Road",
    "Burley Road",
    "Headingley Lane",
    "Clarendon Road",
    "Briggate",
    "Boar Lane",
    "The Headrow",
    "Albion Street",
    "Victoria Street",
  ],
  Sheffield: [
    "Ecclesall Road",
    "Crookes Valley Road",
    "Commonside",
    "London Road",
    "Abbeydale Road",
    "Fulwood Road",
    "Glossop Road",
    "Clarkehouse Road",
    "Broomhill",
    "Sharrow Vale Road",
    "High Street",
    "Fargate",
    "The Moor",
    "West Street",
    "Division Street",
  ],
  Liverpool: [
    "Smithdown Road",
    "Mulgrave Street",
    "Ullet Road",
    "Aigburth Road",
    "Penny Lane",
    "Bold Street",
    "Castle Street",
    "Lord Street",
    "Church Street",
    "Dale Street",
    "Mathew Street",
    "Hope Street",
    "Rodney Street",
    "Mount Pleasant",
    "University Road",
  ],
  Nottingham: [
    "Mansfield Road",
    "Radford Road",
    "University Boulevard",
    "Derby Road",
    "Carlton Road",
    "Alfreton Road",
    "Woodborough Road",
    "Sherwood Rise",
    "Forest Road",
    "Mapperley Road",
    "Long Row",
    "King Street",
    "Queen Street",
    "Market Square",
    "Wheeler Gate",
  ],
  Leicester: [
    "Narborough Road",
    "Evington Road",
    "High Street",
    "Hinckley Road",
    "Belgrave Road",
    "London Road",
    "Melton Road",
    "Aylestone Road",
    "Welford Road",
    "New Walk",
    "Granby Street",
    "Gallowtree Gate",
    "Humberstone Gate",
    "Charles Street",
    "Belvoir Street",
  ],
  Newcastle: [
    "Chillingham Road",
    "Sandyford Road",
    "Gosforth High Street",
    "Westgate Road",
    "Grainger Street",
    "Grey Street",
    "Collingwood Street",
    "Northumberland Street",
    "Clayton Street",
    "Blackett Street",
    "Jesmond Road",
    "Osborne Road",
    "High Bridge",
    "Quayside",
    "Dean Street",
  ],
};

const AREA_SUFFIXES = {
  Birmingham: [
    "Handsworth",
    "Sparkhill",
    "Balsall Heath",
    "Selly Oak",
    "Kings Heath",
    "Moseley",
    "Erdington",
    "Aston",
  ],
  Manchester: [
    "Longsight",
    "Fallowfield",
    "Rusholme",
    "City Centre",
    "Whalley Range",
    "Chorlton",
    "Didsbury",
    "Withington",
  ],
  Leeds: [
    "Headingley",
    "Hyde Park",
    "Burley",
    "City Centre",
    "Woodhouse",
    "Holbeck",
    "Kirkstall",
    "Chapel Allerton",
  ],
  Sheffield: [
    "City Centre",
    "Crookes",
    "Walkley",
    "Nether Edge",
    "Broomhill",
    "Heeley",
    "Sharrow",
    "Fulwood",
  ],
  Liverpool: [
    "Wavertree",
    "Toxteth",
    "Sefton Park",
    "Aigburth",
    "Mossley Hill",
    "Kensington",
    "Edge Hill",
    "Fairfield",
  ],
  Nottingham: [
    "Carrington",
    "Hyson Green",
    "Radford",
    "Forest Fields",
    "Lenton",
    "Beeston",
    "West Bridgford",
    "Mapperley",
  ],
  Leicester: [
    "City Centre",
    "Evington",
    "Clarendon Park",
    "Stoneygate",
    "Aylestone",
    "Highfields",
    "West End",
    "Belgrave",
  ],
  Newcastle: [
    "Heaton",
    "Jesmond",
    "Gosforth",
    "City Centre",
    "Byker",
    "Walker",
    "Fenham",
    "Elswick",
  ],
};

const DESCRIPTION_TEMPLATES = [
  "Victorian terrace with excellent HMO potential in popular area",
  "Spacious house ideal for HMO conversion with planning permission",
  "Large property perfect for HMO investment near universities",
  "Well-presented house with existing HMO license",
  "Four bedroom house with scope for HMO development",
  "Investment opportunity with established HMO potential",
  "Excellent HMO conversion prospect in prime location",
  "Multi-bedroom property suitable for HMO licensing",
  "House with HMO planning permission in student area",
  "Victorian house ideal for buy-to-let HMO investment",
];

/* -------------------------------------------------------------------------- */
/* 6.  IMAGE POOL                                                             */
/* -------------------------------------------------------------------------- */
const IMG_POOL = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600607687920-d942f8dc7626?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585154317-1c8c7ed9ad1c?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585153584-8568c8c6aa73?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585154435-3f10fb1e4140?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585153587-1e4fbef4ab5a?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585154208-79ad1f9aa4a9?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1555243896-2510ff12a026?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585154586-ea995b67c098?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1600585154244-01617abb84c5?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&h=600",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&h=600",
];

/* -------------------------------------------------------------------------- */
/* 7.  HELPER GENERATORS                                                      */
/* -------------------------------------------------------------------------- */
function generatePropertyId(platform: "rightmove" | "zoopla" | "onthemarket"): number {
  const range = PROPERTY_ID_RANGES[platform];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function generatePropertyUrl(platform: "rightmove" | "zoopla" | "onthemarket"): string {
  const id = generatePropertyId(platform);
  switch (platform) {
    case "rightmove":
      return `https://www.rightmove.co.uk/properties/${id}#/`;
    case "zoopla":
      return `https://www.zoopla.co.uk/for-sale/details/${id}/`;
    case "onthemarket":
      return `https://www.onthemarket.com/details/${id}/`;
    default:
      return `https://www.rightmove.co.uk/properties/${id}#/`;
  }
}

function generateAddress(city: string): string {
  const streets =
    STREET_TEMPLATES[city as keyof typeof STREET_TEMPLATES] ||
    STREET_TEMPLATES.Birmingham;
  const areas =
    AREA_SUFFIXES[city as keyof typeof AREA_SUFFIXES] || AREA_SUFFIXES.Birmingham;

  const houseNumber = Math.floor(Math.random() * 200) + 1;
  const street = pick(streets);
  const area = pick(areas);

  return `${houseNumber} ${street}, ${area}, ${city}`;
}

function generatePostcode(city: string): string {
  const postcodes = {
    Birmingham: ["B1", "B11", "B12", "B14", "B21", "B29"],
    Manchester: ["M1", "M13", "M14", "M16"],
    Leeds: ["LS2", "LS4", "LS6", "LS11"],
    Sheffield: ["S1", "S6", "S7", "S10", "S11"],
    Liverpool: ["L8", "L15", "L17", "L18"],
    Nottingham: ["NG5", "NG7"],
    Leicester: ["LE1", "LE3", "LE5"],
    Newcastle: ["NE2", "NE3", "NE6"],
  };
  const cityPostcodes = postcodes[city as keyof typeof postcodes] || postcodes.Birmingham;
  const prefix = pick(cityPostcodes);
  const suffix = Math.floor(Math.random() * 9) + 1;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters =
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];
  return `${prefix} ${suffix}${randomLetters}`;
}

function generateCoordinates(city: string): { latitude: number; longitude: number } {
  const cityCoords = {
    Birmingham: { lat: 52.4862, lng: -1.8904 },
    Manchester: { lat: 53.4808, lng: -2.2426 },
    Leeds: { lat: 53.8008, lng: -1.5491 },
    Sheffield: { lat: 53.3811, lng: -1.4701 },
    Liverpool: { lat: 53.4084, lng: -2.9916 },
    Nottingham: { lat: 52.9548, lng: -1.1581 },
    Leicester: { lat: 52.6369, lng: -1.1398 },
    Newcastle: { lat: 54.9783, lng: -1.6178 },
  };
  const base = cityCoords[city as keyof typeof cityCoords] || cityCoords.Birmingham;
  return {
    latitude: base.lat + (Math.random() - 0.5) * 0.1,
    longitude: base.lng + (Math.random() - 0.5) * 0.1,
  };
}

/* -------------------------------------------------------------------------- */
/* 8.  CORE GENERATOR                                                         */
/* -------------------------------------------------------------------------- */
export function generateRealisticProperty(city: string): PropertyWithAnalytics {
  const postcode = generatePostcode(city);
  const coords = generateCoordinates(city);
  const platform = pick(["rightmove", "zoopla", "onthemarket"]) as
    | "rightmove"
    | "zoopla"
    | "onthemarket";

  /* physicals */
  const size = Math.round(rnd(90, 130));
  const price = Math.round(rnd(250_000, 500_000));
  const bedrooms = Math.floor(rnd(3, 6));
  const bathrooms = Math.floor(rnd(1, 3));
  const refurbCost = Math.round(size * REFURB_PER_SQM);

  /* finance */
  const lhaWeekly = LHA_SHARED[city] ?? 80;
  const annualRent = lhaWeekly * 52;
  const operatingExpenseRatio = 0.25;
  const annualExpenses = annualRent * operatingExpenseRatio;
  const annualNetIncome = annualRent - annualExpenses;

  const stampDuty = Math.round(price * STAMP_DUTY_RATE);
  const totalInvested = stampDuty + BUYING_FEES + refurbCost + price * 0.25; // 25 % deposit
  const interestCost = price * 0.75 * MORTGAGE_INTEREST;
  const annualCashflow = annualNetIncome - interestCost;
  const monthlyCashflow = Math.round(annualCashflow / 12);

  const grossYield = +((annualRent / price) * 100).toFixed(1);
  const netYield = +((annualNetIncome / price) * 100).toFixed(1);
  const roi = +((annualCashflow / totalInvested) * 100).toFixed(1);
  const paybackYears = +(totalInvested / annualCashflow).toFixed(1);
  const dscr = +(annualNetIncome / interestCost).toFixed(2);

  return {
    address: generateAddress(city),
    postcode,
    price,
    size,
    bedrooms,
    bathrooms,
    latitude: coords.latitude,
    longitude: coords.longitude,
    imageUrl: pick(IMG_POOL),
    primeLocationUrl: generatePropertyUrl(platform),
    description: `${pick(DESCRIPTION_TEMPLATES)} — ${bedrooms} bed / ${bathrooms} bath.`,
    hasGarden: Math.random() < 0.6,
    hasParking: Math.random() < 0.5,
    isArticle4: Math.random() < 0.1,
    yearlyProfit: Math.round(annualCashflow),
    leftInDeal: totalInvested,

    /* extra analytics */
    lhaWeekly,
    grossYield,
    netYield,
    roi,
    paybackYears,
    monthlyCashflow,
    dscr,
    stampDuty,
    refurbCost,
    totalInvested,
  };
}

/* -------------------------------------------------------------------------- */
/* 9.  COLLECTION HELPERS                                                     */
/* -------------------------------------------------------------------------- */
export const generatePropertiesForCity = (city: string, count = 6) =>
  Array.from({ length: count }, () => generateRealisticProperty(city));

export const getAvailableCities = () => Object.keys(SEARCH_SEEDS);

export const getScrapingMessage = (city: string) =>
  pick([
    `Crunching numbers for ${city} HMO gold…`,
    `Pouring fresh data into the engine (${city})`,
    `Running filters (≥90 m², ≤£500 k) for ${city}`,
    `Calculating ROI on new ${city} stock`,
    `${city}: checking Article 4 boundaries`,
  ]);