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

### Option 1: Run the fix script after build
```bash
npm run build
./scripts/fix-build.sh
npm start
```

### Option 2: Update Render build command
In your Render service settings, change the build command from:
```
npm install; npm run build
```

To:
```
npm install; npm run build; ./scripts/fix-build.sh
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