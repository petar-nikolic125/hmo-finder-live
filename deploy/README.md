# Multi-Platform Deployment Guide

This HMO Property Search application is production-ready for deployment across multiple platforms. Choose your preferred hosting solution:

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended for Frontend + Serverless)
```bash
npm install -g vercel
vercel
```
Uses the included `vercel.json` configuration.

### 2. Render (Full-Stack Hosting)
**Build Command:**
```bash
npm install && npm run build && mkdir -p server/public && cp -r dist/public/* server/public/
```
**Start Command:** `npm start`

### 3. Railway
```bash
railway login
railway init
railway up
```

### 4. Heroku
```bash
git push heroku main
```

### 5. DigitalOcean App Platform
Connect your Git repository and use:
- **Build Command:** `npm run build && node scripts/post-build.js`
- **Run Command:** `npm start`

## 🔧 Production Features

✅ **Port Flexibility** - Uses `process.env.PORT` or fallback to 5000
✅ **Static File Serving** - Properly configured for production builds
✅ **Environment Detection** - Auto-switches between dev/prod modes
✅ **Build Path Fix** - Automated copying of static assets to correct location
✅ **Python Dependencies** - Handles web scraping requirements in production
✅ **Error Handling** - Comprehensive error responses and logging
✅ **CORS Ready** - Configured for cross-origin requests
✅ **TypeScript** - Full TypeScript support in production builds

## 🐍 Python Requirements

The app requires Python packages for web scraping:
- `requests`
- `beautifulsoup4`
- `lxml`
- `selenium`
- `playwright`

Most platforms will auto-install from `pyproject.toml`.

## 📦 Environment Variables

Optional environment variables:
- `NODE_ENV=production` (automatically set on most platforms)
- `PORT` (automatically set by hosting platforms)

## 🔍 Verification

After deployment, verify:
1. App loads at your deployment URL
2. Property search returns real results
3. Static assets (CSS, images) load correctly
4. API endpoints respond properly