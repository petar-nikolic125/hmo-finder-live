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