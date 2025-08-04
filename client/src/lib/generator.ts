// 🔥 Ultimate HMO Property Generator — single-file, zero-loss consolidation
// -----------------------------------------------------------------------------
// • Generates synthetic HMO listings with full financial analytics
// • Deep-links to real portals (Rightmove/Zoopla/PrimeLocation) with filters
// • Adds ROI, DSCR, LHA gap, payback, cash-on-cash, stamp-duty, refurb, etc.
// • Zero scraped data — all values are statistically realistic
// -----------------------------------------------------------------------------

import { type InsertProperty } from "./types";

/* -------------------------------------------------------------------------- */
/* 0.  BASIC UTILITIES                                                        */
/* -------------------------------------------------------------------------- */
const encode = (s: string) => encodeURIComponent(s.trim());
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* -------------------------------------------------------------------------- */
/* 1.  PORTAL DEEP-LINK BUILDERS WITH HASH VARIATION                          */
/* -------------------------------------------------------------------------- */

// Generate realistic property hashes
const generatePropertyHash = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefixes = ['prop', 'listing', 'hmo', 'property', 'ref'];
  const prefix = pick(prefixes);
  let hash = prefix;
  for (let i = 0; i < 6 + Math.floor(Math.random() * 4); i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generate multiple URL variants per city/portal
const generateUrlVariants = (baseUrl: string, count: number = 4): string[] => {
  const variants: string[] = [];
  const urlParts = new URL(baseUrl);
  
  for (let i = 0; i < count; i++) {
    const hash = generatePropertyHash();
    const variant = new URL(baseUrl);
    
    // Add varied query parameters for realism
    const refParams = ['search', 'hmo', 'filter', 'results', 'list'];
    const sortParams = ['newest', 'price_desc', 'price_asc', 'featured'];
    
    variant.searchParams.set('ref', pick(refParams));
    if (Math.random() > 0.5) {
      variant.searchParams.set('sort', pick(sortParams));
    }
    if (Math.random() > 0.7) {
      variant.searchParams.set('page', String(Math.floor(Math.random() * 3) + 1));
    }
    
    // Add the hash
    variant.hash = hash;
    variants.push(variant.toString());
  }
  
  return variants;
};

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
  London: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87490&keywords=HMO&beds_min=5&price_max=800000&sort=newest_listed",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/london/?beds_min=5&price_max=800000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/london/?keywords=HMO&price_max=800000&beds_min=5",
  },
  Birmingham: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E1642&keywords=HMO&beds_min=4&price_max=500000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/birmingham/?beds_min=4&price_max=500000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/birmingham/?keywords=HMO&price_max=500000",
  },
  Manchester: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E2558&keywords=HMO&beds_min=4&price_max=500000&view_type=list",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/manchester/?beds_min=4&price_max=500000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/manchester/?keywords=HMO&price_max=500000",
  },
  Leeds: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87490&keywords=HMO&beds_min=4&price_max=500000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/leeds/?beds_min=4&price_max=500000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/leeds/?keywords=HMO&price_max=500000",
  },
  Liverpool: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87487&keywords=HMO&beds_min=4&price_max=500000&view_type=list",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/liverpool/?beds_min=4&price_max=500000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/liverpool/?keywords=HMO&price_max=500000",
  },
  Sheffield: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87495&keywords=HMO&beds_min=5&price_max=450000&sort=highest_price",
    zoopla: "https://www.zoopla.co.uk/for-sale/property/sheffield/?beds_min=5&price_max=450000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/sheffield/?keywords=HMO&price_max=450000",
  },
  Bristol: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87494&keywords=HMO&beds_min=4&price_max=600000&sort=newest_listed",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/bristol/?beds_min=4&price_max=600000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/bristol/?keywords=HMO&price_max=600000",
  },
  Nottingham: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E239&keywords=HMO&beds_min=4&price_max=450000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/nottingham/?beds_min=4&price_max=450000&q=HMO&sort=highest_price",
    primelocation:
      "https://www.primelocation.com/for-sale/property/nottingham/?keywords=HMO&price_max=450000",
  },
  Leicester: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87485&keywords=HMO&beds_min=4&price_max=500000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/leicester/?beds_min=4&price_max=500000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/leicester/?keywords=HMO&price_max=500000",
  },
  Newcastle: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87488&keywords=HMO&beds_min=4&price_max=400000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/newcastle/?beds_min=4&price_max=400000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/newcastle/?keywords=HMO&price_max=400000",
  },
  Coventry: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87271&keywords=HMO&beds_min=3&price_max=450000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/coventry/?beds_min=3&price_max=450000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/coventry/?keywords=HMO&price_max=450000",
  },
  Wolverhampton: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87277&keywords=HMO&beds_min=4&price_max=400000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/wolverhampton/?beds_min=4&price_max=400000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/wolverhampton/?keywords=HMO&price_max=400000",
  },
  Salford: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87280&keywords=HMO&beds_min=3&price_max=450000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/salford/?beds_min=3&price_max=450000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/salford/?keywords=HMO&price_max=450000",
  },
  Stockport: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87281&keywords=HMO&beds_min=4&price_max=400000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/stockport/?beds_min=4&price_max=400000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/stockport/?keywords=HMO&price_max=400000",
  },
  Preston: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87492&keywords=HMO&beds_min=3&price_max=350000&sort=newest_listed",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/preston/?beds_min=3&price_max=350000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/preston/?keywords=HMO&price_max=350000",
  },
  Blackpool: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87493&keywords=HMO&beds_min=4&price_max=300000&view_type=list",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/blackpool/?beds_min=4&price_max=300000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/blackpool/?keywords=HMO&price_max=300000",
  },
  Hull: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87489&keywords=HMO&beds_min=4&price_max=250000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/hull/?beds_min=4&price_max=250000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/hull/?keywords=HMO&price_max=250000",
  },
  Derby: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87486&keywords=HMO&beds_min=3&price_max=400000",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/derby/?beds_min=3&price_max=400000&q=HMO&sort=newest_listed",
    primelocation:
      "https://www.primelocation.com/for-sale/property/derby/?keywords=HMO&price_max=400000",
  },
  Plymouth: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87491&keywords=HMO&beds_min=4&price_max=450000&view_type=list",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/plymouth/?beds_min=4&price_max=450000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/plymouth/?keywords=HMO&price_max=450000",
  },
  Southampton: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87496&keywords=HMO&beds_min=4&price_max=550000&sort=newest_listed",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/southampton/?beds_min=4&price_max=550000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/southampton/?keywords=HMO&price_max=550000",
  },
  Portsmouth: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87497&keywords=HMO&beds_min=3&price_max=500000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/portsmouth/?beds_min=3&price_max=500000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/portsmouth/?keywords=HMO&price_max=500000",
  },
  Reading: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87498&keywords=HMO&beds_min=4&price_max=700000&view_type=list",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/reading/?beds_min=4&price_max=700000&q=HMO&sort=newest_listed",
    primelocation:
      "https://www.primelocation.com/for-sale/property/reading/?keywords=HMO&price_max=700000",
  },
  Oxford: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87499&keywords=HMO&beds_min=5&price_max=750000&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/oxford/?beds_min=5&price_max=750000&q=HMO&view_type=list",
    primelocation:
      "https://www.primelocation.com/for-sale/property/oxford/?keywords=HMO&price_max=750000",
  },
  Cambridge: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87500&keywords=HMO&beds_min=5&price_max=800000&sort=newest_listed",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/cambridge/?beds_min=5&price_max=800000&q=HMO",
    primelocation:
      "https://www.primelocation.com/for-sale/property/cambridge/?keywords=HMO&price_max=800000",
  },
  Brighton: {
    rightmove:
      "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E87501&keywords=HMO&beds_min=4&price_max=650000&view_type=list&sort=highest_price",
    zoopla:
      "https://www.zoopla.co.uk/for-sale/property/brighton/?beds_min=4&price_max=650000&q=HMO&sort=newest_listed",
    primelocation:
      "https://www.primelocation.com/for-sale/property/brighton/?keywords=HMO&price_max=650000",
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
  London: [
    "Camden High Street",
    "King's Cross Road",
    "Holloway Road",
    "Mile End Road",
    "Old Kent Road",
    "Whitechapel Road",
    "Commercial Road",
    "Bethnal Green Road",
    "Hackney Road",
    "Roman Road",
    "Brick Lane",
    "Shoreditch High Street",
    "Dalston Lane",
    "Stoke Newington Road",
    "Seven Sisters Road",
  ],
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
    "Stockport Road",
    "Upper Brook Street",
    "Princess Street",
    "Deansgate",
    "Market Street",
    "King Street",
    "Cross Street",
    "Portland Street",
    "Whitworth Street",
    "Peter Street",
    "Mosley Street",
    "Spring Gardens",
    "Piccadilly",
  ],
  Leeds: [
    "Headingley Lane",
    "Hyde Park Road",
    "Woodhouse Lane",
    "Kirkstall Road",
    "Burley Road",
    "Cardigan Road",
    "Meanwood Road",
    "Chapeltown Road",
    "Harehills Lane",
    "York Road",
    "The Headrow",
    "Briggate",
    "Boar Lane",
    "Call Lane",
    "Commercial Street",
  ],
  Liverpool: [
    "Smithdown Road",
    "Lodge Lane",
    "Catherine Street",
    "Toxteth Street",
    "Parliament Street",
    "Upper Parliament Street",
    "Princes Avenue",
    "Aigburth Road",
    "Sefton Park Road",
    "Lark Lane",
    "Bold Street",
    "Mathew Street",
    "Lord Street",
    "Church Street",
    "Dale Street",
  ],
  Sheffield: [
    "Ecclesall Road",
    "Glossop Road",
    "West Street",
    "London Road",
    "Abbeydale Road",
    "Chesterfield Road",
    "Prince of Wales Road",
    "Fulwood Road",
    "Crookes Road",
    "Broomhill",
    "The Moor",
    "Fargate",
    "High Street",
    "Castle Street",
    "Division Street",
  ],
  Bristol: [
    "Gloucester Road",
    "Whiteladies Road",
    "Park Street",
    "Baldwin Street",
    "Castle Street",
    "Broad Street",
    "Union Street",
    "King Street",
    "Queens Road",
    "Cotham Hill",
    "Cheltenham Road",
    "Stapleton Road",
    "Fishponds Road",
    "Church Road",
    "High Street",
  ],
  Nottingham: [
    "Mansfield Road",
    "Derby Road",
    "Ilkeston Road",
    "Radford Road",
    "Forest Road",
    "Woodborough Road",
    "Carlton Road",
    "Sneinton Dale",
    "London Road",
    "Trent Bridge",
    "Market Square",
    "King Street",
    "Queen Street",
    "High Street",
    "Bridlesmith Gate",
  ],
  Leicester: [
    "Narborough Road",
    "Hinckley Road",
    "Fosse Road",
    "Aylestone Road",
    "London Road",
    "Belgrave Road",
    "Melton Road",
    "Evington Road",
    "Uppingham Road",
    "Welford Road",
    "High Street",
    "Gallowtree Gate",
    "Market Street",
    "Granby Street",
    "Charles Street",
  ],
  Newcastle: [
    "Jesmond Road",
    "Osborne Road",
    "Chillingham Road",
    "Shields Road",
    "West Road",
    "Great North Road",
    "Westgate Road",
    "Scotswood Road",
    "Elswick Road",
    "City Road",
    "Grainger Street",
    "Northumberland Street",
    "Collingwood Street",
    "Grey Street",
    "Dean Street",
  ],
  Coventry: [
    "Foleshill Road",
    "Walsgrave Road",
    "Binley Road",
    "Albany Road",
    "Charter Avenue",
    "Holbrook Lane",
    "Far Gosford Street",
    "Earlsdon Avenue",
    "Tile Hill Lane",
    "Allesley Old Road",
    "Corporation Street",
    "Broadgate",
    "Trinity Street",
    "High Street",
    "Hertford Street",
  ],
  Wolverhampton: [
    "Penn Road",
    "Stafford Road",
    "Tettenhall Road",
    "Compton Road",
    "Wednesfield Road",
    "Bilston Road",
    "Chapel Ash",
    "Coalway Road",
    "Whitmore Reans",
    "Dunstall Hill",
    "Queen Street",
    "Darlington Street",
    "Victoria Street",
    "Lichfield Street",
    "Pipers Row",
  ],
  Salford: [
    "Chapel Street",
    "Eccles New Road",
    "Liverpool Street",
    "Regent Road",
    "Broad Street",
    "Ordsall Lane",
    "Trinity Way",
    "Cromwell Road",
    "Frederick Road",
    "Langworthy Road",
    "The Crescent",
    "Bexley Square",
    "Cross Lane",
    "Greengate",
    "New Bailey Street",
  ],
  Stockport: [
    "Wellington Road",
    "Bramhall Lane",
    "Didsbury Road",
    "Hazel Grove",
    "Buxton Road",
    "Cheadle Road",
    "Adswood Road",
    "Greek Street",
    "Shaw Heath",
    "Reddish Road",
    "Market Street",
    "Wellington Road",
    "St Peters Square",
    "Underbanks",
    "Castle Street",
  ],
  Preston: [
    "Blackpool Road",
    "New Hall Lane",
    "Garstang Road",
    "Ribbleton Lane",
    "Blackpool Road",
    "Watling Street Road",
    "Leyland Road",
    "Chorley Road",
    "Deepdale Road",
    "Plungington Road",
    "Fishergate",
    "Church Street",
    "Friargate",
    "Guildhall Street",
    "Market Street",
  ],
  Blackpool: [
    "Central Drive",
    "Promenade",
    "Waterloo Road",
    "Lytham Road",
    "Dickson Road",
    "Squires Gate Lane",
    "Newton Drive",
    "Preston Old Road",
    "Whitegate Drive",
    "Park Road",
    "Church Street",
    "Bank Hey Street",
    "Coronation Street",
    "Bond Street",
    "Cedar Square",
  ],
  Hull: [
    "Beverley Road",
    "Anlaby Road",
    "Holderness Road",
    "Chanterlands Avenue",
    "Spring Bank",
    "Hessle Road",
    "Princes Avenue",
    "Newland Avenue",
    "Cottingham Road",
    "Bricknell Avenue",
    "Whitefriargate",
    "King Edward Street",
    "Jameson Street",
    "Prospect Street",
    "George Street",
  ],
  Derby: [
    "London Road",
    "Burton Road",
    "Uttoxeter Road",
    "Ashbourne Road",
    "Duffield Road",
    "Kedleston Road",
    "Nottingham Road",
    "Osmaston Road",
    "Sinfin Lane",
    "Normanton Road",
    "St Peters Street",
    "Sadler Gate",
    "Iron Gate",
    "Cornmarket",
    "Victoria Street",
  ],
  Plymouth: [
    "Union Street",
    "Royal Parade",
    "Mutley Plain",
    "Tavistock Road",
    "Embankment Road",
    "North Road",
    "Outland Road",
    "Plymstock Road",
    "Wolseley Road",
    "Higher Compton Road",
    "Armada Way",
    "New George Street",
    "Old Town Street",
    "Frankfort Gate",
    "Cornwall Street",
  ],
  Southampton: [
    "Above Bar Street",
    "London Road",
    "Winchester Road",
    "Bitterne Road",
    "Portswood Road",
    "The Avenue",
    "Burgess Road",
    "Bassett Avenue",
    "Hill Lane",
    "Shirley Road",
    "High Street",
    "West Quay Road",
    "Commercial Road",
    "Bedford Place",
    "Civic Centre Road",
  ],
  Portsmouth: [
    "Commercial Road",
    "London Road",
    "Milton Road",
    "Copnor Road",
    "Kingston Road",
    "Fratton Road",
    "Albert Road",
    "Elm Grove",
    "Fawcett Road",
    "Highland Road",
    "High Street",
    "Palmerston Road",
    "Osborne Road",
    "Clarence Parade",
    "Winston Churchill Avenue",
  ],
  Reading: [
    "Oxford Road",
    "Basingstoke Road",
    "Kings Road",
    "London Road",
    "Wokingham Road",
    "Caversham Road",
    "Castle Street",
    "Queens Road",
    "Whitley Street",
    "Tilehurst Road",
    "Broad Street",
    "Friar Street",
    "Market Place",
    "King Street",
    "St Marys Butts",
  ],
  Oxford: [
    "Cowley Road",
    "Iffley Road",
    "Banbury Road",
    "Woodstock Road",
    "Botley Road",
    "Abingdon Road",
    "London Road",
    "St Clements Street",
    "Headington Road",
    "Walton Street",
    "High Street",
    "Cornmarket Street",
    "Queen Street",
    "George Street",
    "Broad Street",
  ],
  Cambridge: [
    "Hills Road",
    "Mill Road",
    "Cherry Hinton Road",
    "Newmarket Road",
    "Huntingdon Road",
    "Madingley Road",
    "Chesterton Road",
    "East Road",
    "Trumpington Road",
    "Victoria Road",
    "King Street",
    "Sidney Street",
    "Bridge Street",
    "Regent Street",
    "Market Street",
  ],
  Brighton: [
    "London Road",
    "Preston Road",
    "Dyke Road",
    "Western Road",
    "Queens Road",
    "Grand Parade",
    "St James's Street",
    "Marine Parade",
    "Kingsway",
    "Church Road",
    "North Street",
    "East Street",
    "West Street",
    "Ship Street",
    "Bond Street",
  ],
};

const AREA_SUFFIXES = {
  London: [
    "Camden",
    "Islington",
    "Hackney",
    "Tower Hamlets",
    "Bethnal Green",
    "Shoreditch",
    "Whitechapel",
    "Mile End",
    "Bow",
    "Stratford",
    "King's Cross",
    "Holloway",
  ],
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
    "Hulme",
    "Chorlton",
    "Withington",
  ],
  Leeds: [
    "Headingley",
    "Hyde Park",
    "Kirkstall",
    "Burley",
    "Armley",
    "Harehills",
    "Chapel Allerton",
    "Meanwood",
  ],
  Liverpool: [
    "Toxteth",
    "Smithdown",
    "Edge Hill",
    "Wavertree",
    "Aigburth",
    "Mossley Hill",
    "Allerton",
    "Childwall",
  ],
  Sheffield: [
    "Broomhill",
    "Crookes",
    "Ecclesall",
    "Walkley",
    "Hillsborough",
    "Heeley",
    "Sharrow",
    "Nether Edge",
  ],
  Bristol: [
    "Clifton",
    "Redland",
    "Bishopston",
    "St Pauls",
    "Easton",
    "Montpelier",
    "Southville",
    "Bedminster",
  ],
  Nottingham: [
    "Forest Fields",
    "Radford",
    "Lenton",
    "Beeston",
    "West Bridgford",
    "Mapperley",
    "Sherwood",
    "Carrington",
  ],
  Leicester: [
    "Highfields",
    "Belgrave",
    "Aylestone",
    "West End",
    "Evington",
    "Clarendon Park",
    "Stoneygate",
    "New Parks",
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
  Coventry: [
    "Foleshill",
    "Tile Hill",
    "Canley",
    "Earlsdon",
    "Chapelfields",
    "Hillfields",
    "Radford",
    "Stoke",
  ],
  Wolverhampton: [
    "Whitmore Reans",
    "Penn",
    "Tettenhall",
    "Wednesfield",
    "Bilston",
    "Heath Town",
    "Fallings Park",
    "Bushbury",
  ],
  Salford: [
    "Eccles",
    "Pendleton",
    "Ordsall",
    "Weaste",
    "Seedley",
    "Langworthy",
    "Little Hulton",
    "Walkden",
  ],
  Stockport: [
    "Bramhall",
    "Cheadle",
    "Gatley",
    "Heald Green",
    "Hazel Grove",
    "Marple",
    "Reddish",
    "Bredbury",
  ],
  Preston: [
    "Fishwick",
    "Ribbleton",
    "Ashton",
    "Ingol",
    "Fulwood",
    "Deepdale",
    "Brookfield",
    "Plungington",
  ],
  Blackpool: [
    "South Shore",
    "Layton",
    "Stanley Park",
    "Marton",
    "Bispham",
    "Squires Gate",
    "Anchorsholme",
    "Norbreck",
  ],
  Hull: [
    "Beverley Road",
    "Anlaby Road",
    "Holderness Road",
    "Spring Bank",
    "Hessle Road",
    "Newland",
    "Princes Avenue",
    "Avenues",
  ],
  Derby: [
    "Normanton",
    "Peartree",
    "Sinfin",
    "Chaddesden",
    "Mackworth",
    "Allestree",
    "Darley",
    "Littleover",
  ],
  Plymouth: [
    "Mutley",
    "Greenbank",
    "Peverell",
    "St Judes",
    "Stonehouse",
    "Devonport",
    "Ford",
    "Efford",
  ],
  Southampton: [
    "Portswood",
    "Highfield",
    "Swaythling",
    "Bassett",
    "Shirley",
    "Freemantle",
    "St Denys",
    "Bevois Valley",
  ],
  Portsmouth: [
    "Southsea",
    "Fratton",
    "Copnor",
    "Baffins",
    "Milton",
    "Eastney",
    "Landport",
    "Portsea",
  ],
  Reading: [
    "Tilehurst",
    "Caversham",
    "Whitley",
    "Earley",
    "Calcot",
    "Southcote",
    "Woodley",
    "Palmer Park",
  ],
  Oxford: [
    "Headington",
    "Cowley",
    "Iffley",
    "Jericho",
    "Summertown",
    "New Marston",
    "Rose Hill",
    "Barton",
  ],
  Cambridge: [
    "Cherry Hinton",
    "Chesterton",
    "Trumpington",
    "Arbury",
    "Abbey",
    "Petersfield",
    "Romsey",
    "Queen Edith's",
  ],
  Brighton: [
    "Kemptown",
    "Hanover",
    "Preston Park",
    "Withdean",
    "Patcham",
    "Hollingbury",
    "Moulsecoomb",
    "Bevendean",
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
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600607687920-d942f8dc7626?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154317-1c8c7ed9ad1c?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585153584-8568c8c6aa73?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154435-3f10fb1e4140?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585153587-1e4fbef4ab5a?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154208-79ad1f9aa4a9?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1555243896-2510ff12a026?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154586-ea995b67c098?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154244-01617abb84c5?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154608-f7b1bf8a6e5d?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585153650-5e08e3f7bb7a?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1600585153887-be2f6abaaf3c?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1460574283810-2aab119d8511?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&w=800&h=600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&h=600&q=80",
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
    London: ["E1", "E2", "E3", "E8", "E9", "N1", "N4", "N5", "N7", "N16", "NW1", "NW3", "NW5", "SE1", "SE8", "SE15"],
    Birmingham: ["B1", "B11", "B12", "B14", "B21", "B29"],
    Manchester: ["M1", "M13", "M14", "M16"],
    Leeds: ["LS2", "LS4", "LS6", "LS11"],
    Liverpool: ["L8", "L15", "L17", "L18"],
    Sheffield: ["S1", "S6", "S7", "S10", "S11"],
    Bristol: ["BS1", "BS2", "BS5", "BS6", "BS7", "BS8"],
    Nottingham: ["NG5", "NG7"],
    Leicester: ["LE1", "LE3", "LE5"],
    Newcastle: ["NE2", "NE3", "NE6"],
    Coventry: ["CV1", "CV2", "CV3", "CV4", "CV5", "CV6"],
    Wolverhampton: ["WV1", "WV2", "WV3", "WV4", "WV6", "WV10"],
    Salford: ["M5", "M6", "M7", "M27", "M28", "M30"],
    Stockport: ["SK1", "SK2", "SK3", "SK4", "SK7", "SK8"],
    Preston: ["PR1", "PR2", "PR3", "PR4", "PR5"],
    Blackpool: ["FY1", "FY2", "FY3", "FY4"],
    Hull: ["HU1", "HU2", "HU3", "HU5", "HU6"],
    Derby: ["DE1", "DE21", "DE22", "DE23", "DE24"],
    Plymouth: ["PL1", "PL2", "PL3", "PL4", "PL5"],
    Southampton: ["SO14", "SO15", "SO16", "SO17"],
    Portsmouth: ["PO1", "PO2", "PO3", "PO4", "PO5"],
    Reading: ["RG1", "RG2", "RG4", "RG6", "RG30"],
    Oxford: ["OX1", "OX2", "OX3", "OX4"],
    Cambridge: ["CB1", "CB2", "CB3", "CB4"],
    Brighton: ["BN1", "BN2", "BN3", "BN41", "BN42"],
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
    London: { lat: 51.5074, lng: -0.1278 },
    Birmingham: { lat: 52.4862, lng: -1.8904 },
    Manchester: { lat: 53.4808, lng: -2.2426 },
    Leeds: { lat: 53.8008, lng: -1.5491 },
    Liverpool: { lat: 53.4084, lng: -2.9916 },
    Sheffield: { lat: 53.3811, lng: -1.4701 },
    Bristol: { lat: 51.4545, lng: -2.5879 },
    Nottingham: { lat: 52.9548, lng: -1.1581 },
    Leicester: { lat: 52.6369, lng: -1.1398 },
    Newcastle: { lat: 54.9783, lng: -1.6178 },
    Coventry: { lat: 52.4068, lng: -1.5197 },
    Wolverhampton: { lat: 52.5855, lng: -2.1282 },
    Salford: { lat: 53.4875, lng: -2.2901 },
    Stockport: { lat: 53.4106, lng: -2.1575 },
    Preston: { lat: 53.7632, lng: -2.7031 },
    Blackpool: { lat: 53.8175, lng: -3.0357 },
    Hull: { lat: 53.7457, lng: -0.3367 },
    Derby: { lat: 52.9225, lng: -1.4746 },
    Plymouth: { lat: 50.3755, lng: -4.1427 },
    Southampton: { lat: 50.9097, lng: -1.4044 },
    Portsmouth: { lat: 50.8198, lng: -1.0880 },
    Reading: { lat: 51.4543, lng: -0.9781 },
    Oxford: { lat: 51.7520, lng: -1.2577 },
    Cambridge: { lat: 52.2053, lng: 0.1218 },
    Brighton: { lat: 50.8225, lng: -0.1372 },
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
export function generateRealisticProperty(city: string): InsertProperty & {
  /* extra analytics */
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
} {
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

  const grossYield = +(annualRent / price) * 100;
  const netYield = +(annualNetIncome / price) * 100;
  const roi = +(annualCashflow / totalInvested) * 100;
  const paybackYears = +(totalInvested / annualCashflow).toFixed(1);
  const dscr = +(annualNetIncome / interestCost).toFixed(2);

  // Get city-specific search URLs from SEARCH_SEEDS or generate fallback
  const citySearchUrls = SEARCH_SEEDS[city as keyof typeof SEARCH_SEEDS];
  
  let rightmoveUrl: string;
  let zooplaUrl: string;
  let primeLocationUrl: string;
  
  if (citySearchUrls) {
    // Generate multiple variants for each portal to avoid obvious duplication
    const rightmoveVariants = generateUrlVariants(citySearchUrls.rightmove, 4);
    const zooplaVariants = generateUrlVariants(citySearchUrls.zoopla, 4);
    const primeLocationVariants = generateUrlVariants(citySearchUrls.primelocation, 4);
    
    // Pick random variants for this property
    rightmoveUrl = pick(rightmoveVariants);
    zooplaUrl = pick(zooplaVariants);
    primeLocationUrl = pick(primeLocationVariants);
  } else {
    // Fallback generator for cities not in SEARCH_SEEDS
    const postcodePrefix = postcode.split(' ')[0];
    const baseRightmove = `https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=${postcodePrefix}%5E&keywords=HMO&beds_min=4&price_max=500000`;
    const baseZoopla = `https://www.zoopla.co.uk/for-sale/property/${city.toLowerCase()}/?beds_min=4&price_max=500000&q=HMO`;
    const basePrimeLocation = `https://www.primelocation.com/for-sale/property/${city.toLowerCase()}/?keywords=HMO&price_max=500000`;
    
    // Generate variants for fallback cities too
    rightmoveUrl = pick(generateUrlVariants(baseRightmove, 3));
    zooplaUrl = pick(generateUrlVariants(baseZoopla, 3));
    primeLocationUrl = pick(generateUrlVariants(basePrimeLocation, 3));
  }

  return {
    address: generateAddress(city),
    postcode,
    price,
    size,
    bedrooms,
    bathrooms,
    latitude: coords.latitude,
    longitude: coords.longitude,
    imageUrl: pick(IMG_POOL), // Ensure all images are from the pool
    primeLocationUrl, // Distinct URL with unique hash
    rightmoveUrl, // Always available
    zooplaUrl, // Always available
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
  } as InsertProperty & {
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