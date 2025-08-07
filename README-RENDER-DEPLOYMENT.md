# Render Deployment Instructions

## Critical Fix for Build Path Issue

**Problem:** Render deployment fails with "Could not find the build directory" error.

**Solution:** The vite config builds to `dist/public/` but the server expects `server/public/`. This has been fixed with a post-build script.

## Deployment Steps

### 1. Using render.yaml (Recommended)
The repository includes a `render.yaml` file with the correct configuration. Render will automatically detect and use this file.

### 2. Manual Configuration
If you prefer manual setup:

**Build Command:**
```
npm install && npm run build && ./scripts/fix-build.sh
```

**Start Command:**
```
npm start
```

**Environment Variables:**
- `NODE_ENV`: `production`

### 3. Verify the Fix
After deployment, check that:
- Build completes without errors
- Static files are copied to `server/public/`
- Server starts successfully on Render

## Files Modified for Deployment
- ✅ `render.yaml` - Render service configuration
- ✅ `scripts/fix-build.sh` - Post-build script to fix paths
- ✅ `DEPLOYMENT-FIX.md` - Technical documentation
- ✅ `README-RENDER-DEPLOYMENT.md` - User-friendly instructions

## Troubleshooting
If deployment still fails:
1. Check that `scripts/fix-build.sh` is executable
2. Verify the build command includes the fix script
3. Check Render logs for any permission issues

The fix ensures static assets are in the correct location (`server/public/`) that the production server expects.