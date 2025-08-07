# HMO Property Search - Production Deployment Guide

## Python Dependencies Issue Fix

This application uses Python for web scraping. The main issue in production was that Python modules weren't being installed correctly.

### Quick Setup for Production

1. **Run the Python setup script:**
   ```bash
   ./scripts/setup-python.sh
   ```

2. **Or manually install dependencies:**
   ```bash
   # Install uv package manager if not available
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Install Python dependencies
   uv sync
   ```

3. **Verify installation:**
   ```bash
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