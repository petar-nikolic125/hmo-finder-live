# Deployment Fix for Render

## Issue
The Render deployment was failing with the error:
```
Error: Could not find the build directory: /opt/render/project/src/server/public, make sure to build the client first
```

## Root Cause
- Vite configuration builds frontend assets to `dist/public/`
- Server code expects static files in `server/public/`
- This mismatch causes deployment failures on Render

## Solution
A post-build script has been created at `scripts/fix-build.sh` that:

1. Checks if `dist/public/` exists (vite build output)
2. Creates `server/public/` directory
3. Copies all files from `dist/public/` to `server/public/`

## Updated Build Process for Render

### Option 1: Use render.yaml (Recommended)
A `render.yaml` file has been created with the correct build command:
```yaml
services:
  - type: web
    name: hmo-property-search
    env: node
    plan: starter
    buildCommand: npm install && npm run build && ./scripts/fix-build.sh
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Option 2: Manual Render service configuration
In your Render service settings:

**Build Command:**
```
npm install && npm run build && ./scripts/fix-build.sh
```

**Start Command:**
```
npm start
```

### Option 3: Local testing
```bash
npm run build
./scripts/fix-build.sh
npm start
```

## Verification
After running the fix script, you should see:
- Files copied to `server/public/`
- Server starts without the "Could not find build directory" error
- Static assets serve correctly in production

## Files Changed
- ✅ Created: `scripts/fix-build.sh` - Post-build script to fix file paths
- ✅ Created: `DEPLOYMENT-FIX.md` - This documentation

## Notes
- The vite.ts and vite.config.ts files are protected and cannot be modified
- This solution works around the path mismatch without touching core configuration
- The script is safe to run multiple times and will overwrite existing files in server/public/