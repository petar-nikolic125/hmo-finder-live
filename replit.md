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
- **Scraping**: Enhanced Python scraper with improved city mappings for Leeds, Cambridge, and 20+ UK cities

### Data Model
Properties include basic info (address, price, size, bedrooms, bathrooms) and comprehensive financial analytics (ROI, yields, cashflow, DSCR, payback years). Portal integration uses `SEARCH_SEEDS` for Rightmove and Zoopla URLs.

### Key Features
- **Authentic Data Only**: Real property scraping from Zoopla and PrimeLocation with zero synthetic/fake data fallbacks
- **Enhanced City Coverage**: Improved scraper with better URL generation for London, Leeds, Cambridge, Oxford, and 20+ UK cities
- **Unified Search Interface**: Single comprehensive search bar combining city, price, and bedroom filters
- **AI Loading Experience**: Intelligent animated loading screen simulating AI analysis with dynamic status messages
- **Financial Analytics**: ROI, yields, and cashflow calculations based on real market data and city-specific rental estimates
- **Cache Management**: Automatic cache clearing to prevent stale data display
- **High Volume Results**: Maximized property limits (150 total, 100 per URL) with deduplication for diverse property listings
- **Responsive Design**: Mobile-first approach with enhanced loading states and error handling

### System Design Choices
- **Client-Server Separation**: Clear separation with frontend handling UI/display and backend managing data generation/APIs.
- **Data Generation Strategy**: Properties generated using realistic UK property data, city-specific details, and financial calculations based on LHA rates. `SEARCH_SEEDS` object is the single source of truth for portal URLs.
- **Query Management**: TanStack Query for efficient data fetching, caching, and error handling.
- **Robustness**: Implemented bulletproof stress testing, multi-tier emergency fallbacks, dynamic filter robustness, and enhanced error recovery mechanisms to ensure consistent results.
- **Performance**: Image optimization, CSS transforms for animations, and file-based caching for scraped data.

## External Dependencies
- **Real Estate Portals**: Zoopla.co.uk, Rightmove, PrimeLocation (for search URLs and scraping)
- **UI Library**: Shadcn/ui
- **CSS Framework**: Tailwind CSS
- **State Management Library**: TanStack Query
- **Routing Library**: Wouter
- **Build Tool**: Vite
- **Deployment Platform**: Vercel