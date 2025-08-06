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
- **UI/UX Decisions**: Professional color scheme, three-column responsive footer layout, full-width UK skyline hero section with dynamic animations (floating clouds, twinkling city lights, floating particles, flying birds, gradient overlay), and stylized architectural illustrations for property visuals (city-specific styles like London Victorian, Birmingham Industrial, Manchester Northern Quarter). Typography improvements for readability.

### Backend
- **Framework**: Express.js
- **Storage**: In-memory storage with MemStorage class
- **API Endpoints**: `/api/properties` (search with filters), `/api/cities` (available cities list), `/api/ping` (health check)

### Data Model
Properties include basic info (address, price, size, bedrooms, bathrooms) and comprehensive financial analytics (ROI, yields, cashflow, DSCR, payback years). Portal integration uses `SEARCH_SEEDS` for Rightmove and Zoopla URLs.

### Key Features
- City-based property search with realistic generated data and multi-tier fallback for robust results.
- Advanced filtering by size, price, and Article 4 restrictions, with dynamic parameter adjustment for city-specific pricing.
- Financial analytics including ROI, yields, and cashflow calculations, with city-specific rental estimates.
- Portal integration using authentic `SEARCH_SEEDS` URLs.
- Responsive design with loading states and error handling.
- Postcode search functionality with radius-based property discovery.
- Universal city support for web scraping across 25+ cities.
- Enhanced web scraper robustness with universal price range support, advanced URL generation, retry logic, and multi-source strategy (Zoopla, PrimeLocation).

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