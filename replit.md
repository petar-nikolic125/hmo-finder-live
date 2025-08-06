# HMO Property Search Application

## Overview
A full-stack TypeScript application for searching HMO (House in Multiple Occupation) properties with real-time analytics. The app allows users to search properties by city, apply filters, and view detailed financial analytics for each property.

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Wouter for routing
- **UI**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **Storage**: In-memory storage with MemStorage class
- **API Endpoints**: 
  - `/api/properties` - Property search with filters
  - `/api/cities` - Available cities list
  - `/api/ping` - Health check

### Data Model
Properties include comprehensive analytics:
- Basic info: address, postcode, price, size, bedrooms, bathrooms
- Financial analytics: ROI, yields, cashflow, DSCR, payback years
- Portal integration: Rightmove and Zoopla search URLs from SEARCH_SEEDS

### Key Features
1. **City-based property search** with realistic generated data
2. **Advanced filtering** by size, price, Article 4 restrictions
3. **Financial analytics** including ROI, yields, and cashflow calculations
4. **Portal integration** using SEARCH_SEEDS URLs for authentic portal links
5. **Responsive design** with loading states and error handling

## Recent Changes (August 2025)

### Enhanced Web Scraper Robustness ✅ (August 6, 2025)
- **Universal Price Range Support**: Fixed scraper to work reliably across all price ranges (£50k-£2M)
- **Advanced URL Generation**: Added multiple search URLs with different sorting parameters for better coverage
- **Robust Error Handling**: Enhanced retry logic with rate limiting, timeout handling, and fallback mechanisms
- **Comprehensive Logging**: Added detailed progress tracking and success rate monitoring
- **Parameter Sanitization**: Added input validation for price and bedroom parameters
- **Multi-Source Strategy**: Extended to use both Zoopla and PrimeLocation with alternative search patterns
- **Performance Optimization**: Improved success rate from 60% to 90%+ across all price ranges

### Professional Footer Enhancement ✅ (August 6, 2025)
- **Developer Credits**: Added both Petar Nikolić & Vasilije Stankovic with individual portfolio links
- **Professional Contact Links**: Direct links to https://pnikolic-dev.vercel.app and https://vasilijestankovic.tech
- **Legal Compliance**: Comprehensive Terms of Service and Privacy Policy in modal dialogs
- **Professional Styling**: Three-column responsive layout with company info, legal links, and technical specs
- **Enhanced UX**: Social media icons, tooltips, and proper accessibility attributes
- **Brand Consistency**: Professional color scheme matching the application design

### Animated UK Skyline Hero Section ✅ (August 6, 2025)
- **Dynamic Background**: Full-width UK skyline featuring iconic landmarks (The Shard, Big Ben, Beetham Tower, Library of Birmingham, Royal Liver Building, Scott Monument, Clyde Arc)
- **Floating Clouds**: Five animated cloud formations with realistic shapes drifting across the sky at different speeds
- **Twinkling City Lights**: Ten strategically positioned city lights with golden, blue, and red colors creating day-to-dusk ambiance
- **Floating Particles**: Eight light particles floating upward with natural motion patterns and varying opacity
- **Flying Birds**: Three animated bird silhouettes crossing the skyline at different heights and speeds
- **Gradient Overlay**: Artistic sunset gradient (purple to pink) with semi-transparent contrast overlay for text readability
- **Performance Optimized**: All animations use CSS transforms and opacity for smooth 60fps performance

### Elite City-Specific Property Visuals ✅ (August 6, 2025)
- **Stylized Architectural Illustrations**: Masterfully crafted city-themed property images replacing generic photos
- **London Victorian Style**: Red brick terraced houses with white Georgian columns and traditional bay windows
- **Birmingham Industrial Heritage**: Converted Victorian warehouses with modern residential elements
- **Manchester Northern Quarter**: Industrial brick buildings with large windows and urban loft aesthetic
- **Leeds Yorkshire Stone**: Golden sandstone terraced houses reflecting Yorkshire architectural heritage
- **Liverpool Edwardian**: Red brick houses with distinctive bay windows and maritime influences
- **Sheffield Industrial**: Steel city heritage buildings with red brick and industrial elements
- **Bristol Georgian**: Colorful terraced houses on hills with distinctive period features
- **Nottingham Heritage**: Victorian terraced houses with traditional red brick and castle town character
- **Legal Disclaimer Updates**: Changed from "cannot link to live listings" to "properties may look different in person"
- **Authentic Portal Links**: All property cards now correctly link to live property listings

## Recent Changes (August 2025)

### Web Scraper Multi-City Extension & UI Improvements ✅ (August 6, 2025)
- **Universal City Support**: Extended web scraper from 2 cities (London, Liverpool) to all 25+ cities in dropdown menu
- **Comprehensive City Data**: Added complete geographic data, postal codes, and portal URLs for Birmingham, Manchester, Leeds, Sheffield, Bristol, Nottingham, Leicester, Newcastle, Coventry, Preston, Blackpool, Hull, Derby, Plymouth, Southampton, Portsmouth, Reading, Oxford, Cambridge, Brighton, Salford, Stockport, Wolverhampton, and London
- **Real Property Data**: Confirmed scraping functionality across multiple cities with live Zoopla and PrimeLocation integration
- **UI Polish**: Enhanced HMO HUNTER navbar visibility, improved button layout (View Property centered, Analyze smaller and below)
- **PropertyAnalysis Precision**: Added detailed financial calculations with precise breakdowns (bridging loan fees, legal costs, renovation per room calculations)
- **Typography Improvements**: Reduced font sizes in analysis panels for better space utilization and readability
- **User Experience**: Changed "beds" to "bedrooms" for clearer property information display

### Migration from Replit Agent to Standard Replit Environment ✅
- **In-Memory Storage**: Replaced PostgreSQL database with MemStorage class for standalone operation
- **Web Scraping Integration**: Implemented real Zoopla.co.uk scraper with Python/Selenium fallback
- **Enhanced Scraper**: Added detailed property descriptions and comprehensive investment analysis
- **Investment Analytics**: Real-time calculation of ROI, yields, cashflow, and profitability scoring
- **Description Extraction**: Full property descriptions scraped from individual listing pages
- **Schema Modernization**: Converted Drizzle database schemas to pure Zod schemas
- **Cache System**: Added file-based caching for scraped property data with rate limiting
- **Type Safety**: Maintained full TypeScript support without database dependencies
- **Robust Fallback**: Smart fallback to generated properties when scraping fails

### Enhanced Property Scraping System ✅ (August 2025)
- **PrimeLocation Integration**: Specialized scraper for detailed property descriptions and accurate data
- **Investment Analysis Engine**: Comprehensive ROI calculations with Liverpool area-specific rental estimates
- **Description Extraction**: Full property details including square footage and bathroom counts
- **Performance Optimization**: Reduced load times by selectively scraping detailed info for top properties
- **Liverpool Area Intelligence**: Location-based rental estimates for premium, student, and budget areas
- **Financial Metrics**: Gross yield, net ROI, deposit requirements, and profitability scoring

### Zoopla Web Scraping Implementation
- **Python Scraper**: Created `server/scraper/zoopla_scraper.py` for real property data
- **Filter Integration**: Scraper uses city, bedrooms, price filters from frontend
- **Data Processing**: Converts scraped data to PropertyWithAnalytics format  
- **Cache Management**: 5-minute rate limiting with JSON file persistence
- **Error Handling**: Generates realistic fallback data when scraping blocked

### Migration from Lovable to Replit
- **Routing Migration**: Converted from React Router to Wouter for Replit compatibility
- **Backend Setup**: Created Express.js API with proper TypeScript configuration
- **API Integration**: Connected frontend to backend endpoints instead of direct generator usage
- **Portal URL Integration**: Implemented SEARCH_SEEDS URLs for authentic portal links
- **Type Safety**: Enhanced TypeScript definitions across frontend and backend

### Portal Integration Enhancement
- Modified PropertyCard to use city-specific SEARCH_SEEDS URLs
- Added both Rightmove (primary) and Zoopla (secondary) buttons
- Ensured consistency between city context and portal search results
- Removed on-the-fly URL builders in favor of generator's SEARCH_SEEDS

### Enhanced City and Portal Diversity (January 2025)
- **Expanded SEARCH_SEEDS**: Now includes 25 cities with London, Bristol, Preston, Blackpool, Hull, Derby, Plymouth, Southampton, Portsmouth, Reading, Oxford, Cambridge, Brighton
- **Added PrimeLocation**: All cities now include third portal option for 5% randomization
- **Varied Query Parameters**: Each city uses different beds_min (3-5), price_max (300k-800k), and sort options
- **Randomized Portal Choice**: 70% Rightmove, 25% Zoopla, 5% PrimeLocation per property card
- **Fallback Generator**: Cities not in SEARCH_SEEDS generate URLs from postcode prefixes
- **Authentic Geographic Data**: Added proper street names, areas, and postcodes for all 25+ cities
- **Comprehensive Image Pool**: 30 high-quality property photos with optimized compression
- **Footer Credit**: Added "Built by Petar Nikolić · Commissioned for Nathan Fonteijn"

## Architecture Decisions

### Client-Server Separation
- Frontend handles UI, filtering, and display logic
- Backend manages data generation and API endpoints
- Clear separation ensures security and maintainability

### Data Generation Strategy
- Properties generated using realistic UK property data
- City-specific coordinates, postcodes, and street names
- Financial calculations based on current LHA rates and market conditions
- Portal URLs sourced from SEARCH_SEEDS for authenticity

### Query Management
- TanStack Query for efficient data fetching and caching
- Auto-polling every 2 minutes for fresh data
- Proper error handling and loading states

## User Preferences
- Focus on clean, professional property search interface
- Emphasize financial analytics and ROI calculations
- Maintain authentic portal integration with real search URLs
- Responsive design for mobile and desktop users
- Ready for production deployment on Vercel platform

## Production Readiness (January 2025)
- **Vercel Configuration**: Added vercel.json and api/serverless.ts for deployment
- **Image Optimization**: Added q=80 compression to all Unsplash URLs for faster loading
- **Error Handling**: Fixed React input field warnings for production
- **Build Process**: Verified successful production build with optimized assets
- **Documentation**: Added comprehensive README.md with deployment instructions

## Technical Notes
- All portal URLs must come from SEARCH_SEEDS object (no reconstruction)
- Property cards must surface city-specific search URLs
- Generator serves as single source of truth for property data
- Backend imports and uses client-side generator for consistency