# HMO Property Search - Railway Deployment Guide

## 🚂 Optimized Railway Deployment

Ova aplikacija je kompletno optimizovana za Railway deployment sa sledećim poboljšanjima:

### ✅ Optimizacije koje su napravljene:

1. **Railway Configuration**
   - `railway.toml` - Railway-specific configuration
   - `nixpacks.toml` - Custom build configuration  
   - `Procfile` - Process definition for web dyno

2. **Build Scripts**
   - `scripts/railway-start.js` - Optimized startup script
   - `scripts/build-railway.js` - Railway build process
   - `scripts/setup-railway-env.sh` - Environment setup

3. **Server Optimizations**
   - Enhanced port binding for Railway environment
   - Railway environment detection
   - Improved error handling and logging

4. **Python Dependencies**
   - `runtime.txt` - Python version specification
   - Automatic dependency detection

## 🚀 Deployment Instructions

### Korak 1: Priprema Repository
```bash
git add .
git commit -m "Railway deployment optimization"
git push origin main
```

### Korak 2: Railway Setup
1. Idi na [railway.app](https://railway.app)
2. Kreiraj novi account ili se ulogiraj
3. Klikni "New Project"
4. Izaberi "Deploy from GitHub repo"

### Korak 3: Repository Connection
1. Izaberi svoj GitHub repository
2. Railway će automatski detektovati `railway.toml` konfiguraciju
3. Potvrdi deployment settings

### Korak 4: Environment Variables
U Railway dashboard, dodaj sledeće environment variables:
```
NODE_ENV=production
PORT=5000
```

### Korak 5: Deploy
1. Klikni "Deploy Now"
2. Railway će automatski:
   - Install Node.js i Python dependencies
   - Build frontend i backend
   - Start server na dodeljenom port-u

### Korak 6: Monitoring
- Health check endpoint: `/api/ping`
- Railway će automatski monitorisati aplikaciju
- Auto-restart ako server padne

## 🔧 Railway Features Used

- **Nixpacks Builder** - Automatic detection of Node.js + Python
- **Health Checks** - `/api/ping` endpoint monitoring  
- **Auto Scaling** - Based on traffic
- **SSL Certificates** - Automatic HTTPS
- **Custom Domains** - Available in settings
- **Logging** - Full application logs in dashboard

## 🐍 Python Dependencies

Automatski se instaliraju:
- `beautifulsoup4` - HTML parsing
- `lxml` - XML/HTML parser
- `requests` - HTTP requests
- `selenium` - Web automation
- `webdriver-manager` - Browser drivers

## 🌐 Production URLs

Nakon deployment, dobićeš:
- **Main URL**: `https://your-app-name.railway.app`
- **API Endpoints**:
  - `/api/properties?city=Liverpool&minRooms=4&maxPrice=500000`
  - `/api/cities`
  - `/api/ping`

## 🚨 Troubleshooting

### Ako deployment ne radi:
1. Proveri Railway logs u dashboard
2. Verifikuj da su svi dependency-iji instalirani
3. Proveri da li se server pokretao na ispravnom port-u

### Česti problemi:
- **Port issues**: Railway automatski assignuje PORT environment variable
- **Python modules**: Ako scraper ne radi, dodaj Python dependencies u railway.toml
- **Build failures**: Proveri `scripts/railway-start.js` za error messages

## 💰 Railway Pricing

- **Hobby Plan**: $5/mesec - Dovoljno za development/test
- **Pro Plan**: $20/mesec - Production aplikacije
- **Custom**: Za enterprise aplikacije

Railway naplaćuje based on usage, ne per-application.

## ✨ Benefits of Railway

1. **Automatic SSL** - HTTPS iz kutije
2. **GitHub Integration** - Auto-deploy na git push
3. **Zero Config** - Detektuje tehnologije automatski
4. **Scaling** - Automatsko skaliranje
5. **Monitoring** - Built-in metrics i logs
6. **Custom Domains** - Lako dodavanje custom domain-a

Aplikacija je sada spremna za production deployment na Railway! 🚀