# HMO Property Search - Production Deployment Guide

## Python Dependencies Issue - SOLVED ✅

This application uses Python for web scraping. The recurring issue where Python modules got "corrupted" every time the environment restarted has been **completely fixed** with an automatic solution.

### ⚡ One-Command Production Setup

**Simply run the production deployment script:**
```bash
./deploy-production.sh
```

This script will:
- ✅ Install uv package manager
- ✅ Install all Python dependencies (requests, beautifulsoup4, lxml)
- ✅ Verify the installation works
- ✅ Build the Node.js application
- ✅ Test the scraper functionality

### 🛡️ Automatic Fix Implemented

The application now **automatically detects and fixes** Python dependency issues:

1. **Server Startup Check** - Verifies dependencies when server starts
2. **Before Each Scrape** - Checks dependencies before running Python scraper
3. **Auto-Recovery** - Automatically reinstalls dependencies if ModuleNotFoundError detected
4. **Cache Fallback** - Uses cached data if Python setup temporarily fails

### Alternative Manual Setup

If you prefer manual setup:

```bash
# Install uv package manager if not available
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync

# Verify installation
python3 -c "import requests, bs4, lxml; print('✅ All packages installed!')"
```

### Key Files for Deployment

- `pyproject.toml` - Python dependency definitions
- `uv.lock` - Locked dependency versions (ensures consistent installations)
- `server/scraper/prime_scraper.py` - Main scraping script
- `scripts/setup-python.sh` - Production setup script

### Production Environment Variables

Make sure these are set in your production environment:
- `NODE_ENV=production`
- `PORT=5000` (or your preferred port)

### Testing the Scraper

After setup, test that scraping works:
```bash
curl "http://localhost:5000/api/properties?city=Liverpool&count=5&minRooms=4&maxPrice=500000&keywords=HMO"
```

Should return JSON with property listings.

### Common Issues

1. **"ModuleNotFoundError: No module named 'requests'"**
   - Solution: Run `./scripts/setup-python.sh` or `uv sync`

2. **Scraper returns empty results**
   - Check if Python dependencies are properly installed
   - Verify network access to property websites (Zoopla, PrimeLocation)

3. **Git not including Python files**
   - Check `.gitignore` - it should exclude `.pythonlibs/` but include `pyproject.toml` and `uv.lock`
   - The scraper Python files in `server/scraper/` should be committed to git