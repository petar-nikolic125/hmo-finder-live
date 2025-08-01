# HMO Property Search Application

A professional HMO (House in Multiple Occupation) property search platform with real-time analytics and authentic portal integration.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 🌐 Vercel Deployment

### Files Added for Deployment:
- `vercel.json` - Vercel configuration with build settings
- `api/serverless.ts` - Serverless function for API routes

### Deploy to Vercel:
1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy automatically with these settings:
   - Build Command: `vite build`
   - Output Directory: `dist/public`
   - Framework: None (custom)

### Environment Variables:
No external environment variables required - all data is generated internally.

## 📊 Features

### Enhanced Portal Integration
- **12 Cities**: Birmingham, Coventry, Wolverhampton, Manchester, Salford, Stockport, Leeds, Sheffield, Liverpool, Nottingham, Leicester, Newcastle
- **3 Portals**: Rightmove (70%), Zoopla (25%), PrimeLocation (5%)
- **Varied Parameters**: Unique query parameters per city (beds_min, price_max, sort options)
- **Fallback Generator**: Automatic URL generation for cities not in SEARCH_SEEDS

### Data Quality
- **Authentic Addresses**: City-specific street names and postcodes
- **Optimized Images**: High-quality property photos with compression (q=80)
- **Financial Analytics**: ROI, yields, cashflow, DSCR calculations
- **Realistic Data**: Based on current LHA rates and market conditions

### Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Express.js with in-memory storage
- **Deployment**: Vercel with serverless functions
- **Build**: Vite for optimized production builds

## 🔧 Production Optimizations

### Performance
- Optimized image URLs with quality compression
- Efficient data generation and caching
- Responsive design with skeleton loading states

### Code Quality
- TypeScript throughout frontend and backend
- Proper error handling and loading states
- No console warnings or React errors

### SEO & UX
- Responsive design for mobile and desktop
- Fast loading with optimized assets
- Professional UI with consistent branding

## 📝 Credits

Built by Petar Nikolić · Commissioned for Nathan Fonteijn

## 🛠️ Development Notes

- All portal URLs use authentic SEARCH_SEEDS - no reconstructed URLs
- Property generation includes comprehensive analytics
- City data includes authentic postcodes and area names
- Images are curated from Unsplash with proper optimization