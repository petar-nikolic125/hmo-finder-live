# HMO Property Search Application

## Overview
A full-stack TypeScript application for searching HMO (House in Multiple Occupation) properties with real-time analytics. The app enables users to search properties by city, apply filters, and view detailed financial analytics. The business vision is to provide a comprehensive tool for property investors, offering key capabilities like city-based search, advanced filtering, financial analytics (ROI, yields, cashflow), and direct integration with real estate portals. The project aims to provide an accurate and efficient solution for identifying profitable HMO investments.

## User Preferences
- Focus on clean, professional property search interface
- Emphasize financial analytics and ROI calculations
- Maintain authentic portal integration with real search URLs
- Responsive design for mobile and desktop users
- Ready for production deployment on Vercel platform

## System Architecture

### Frontend
- **Framework**: React with Wouter for routing
- **UI**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite
- **UI/UX Decisions**: Professional color scheme, unified search interface (merged Hero and Filter sections), AI-powered animated loading screen with intelligent analysis stages, three-column responsive footer layout, full-width UK skyline hero section with dynamic animations. Enhanced property visuals with city-specific architectural illustrations.

### Backend
- **Framework**: Express.js
- **Storage**: Real-time scraping only (no synthetic data fallbacks)
- **API Endpoints**: `/api/properties` (search with filters), `/api/cities` (available cities list), `/api/ping` (health check)
- **Scraping**: Single prime_scraper.py for real property data from Zoopla and PrimeLocation with zero fake data fallbacks

### Data Model
Properties include basic info (address, price, size, bedrooms, bathrooms) and comprehensive financial analytics (ROI, yields, cashflow, DSCR, payback years). Portal integration uses `SEARCH_SEEDS` for Rightmove and Zoopla URLs.

### Key Features
- **Production Deployment Ready**: Critical production deployment issues resolved - searches now work reliably on hosting platforms like Render
- **Authentic Data Only**: Real property scraping from Zoopla and PrimeLocation with zero synthetic/fake data fallbacks
- **Enhanced Error Handling**: Production-safe caching system with /tmp/ file paths and comprehensive fallback mechanisms
- **Parameter Compatibility**: Fixed frontend/backend parameter synchronization for reliable property searches
- **Intelligent Deduplication**: Optimized fuzzy matching algorithm to prevent over-filtering while maintaining data quality
- **Enhanced City Coverage**: Improved scraper with better URL generation for London, Leeds, Cambridge, Oxford, and 20+ UK cities
- **Financial Analytics**: ROI, yields, and cashflow calculations based on real market data and city-specific rental estimates
- **Cache Management**: Production-optimized caching with proper rate limiting and development-friendly testing modes
- **Enhanced Property Volume**: Successfully delivering 60-70 unique properties per search with authentic addresses
- **Responsive Design**: Mobile-first approach with enhanced loading states and error handling

### System Design Choices
- **Client-Server Separation**: Clear separation with frontend handling UI/display and backend managing data generation/APIs.
- **Pure Scraping Strategy**: Single prime_scraper.py for authentic web scraping from Zoopla and PrimeLocation with zero synthetic data generation.
- **Advanced Deduplication**: Levenshtein distance algorithm for fuzzy matching, preventing over-filtering while maintaining data quality.
- **Query Management**: TanStack Query for efficient data fetching, caching, and error handling with improved cache invalidation.
- **Robustness**: Enhanced property validation, intelligent address normalization, and multi-tier fallbacks for consistent user experience.
- **Performance**: Optimized property processing pipeline, reduced API response times, and smarter caching mechanisms.

## External Dependencies
- **Real Estate Portals**: Zoopla.co.uk, Rightmove, PrimeLocation (for search URLs and scraping)
- **UI Library**: Shadcn/ui
- **CSS Framework**: Tailwind CSS
- **State Management Library**: TanStack Query
- **Routing Library**: Wouter
- **Build Tool**: Vite
- **Deployment Platform**: Vercel