# Deployment Guide - Fixed Version

## Issue Resolution

The deployment error was caused by the production server looking for static files in `server/public` while the build process outputs them to `dist/public`.

### Fixed Build Process

1. **Use the deployment script**: 
   ```bash
   ./scripts/deploy.sh
   ```

2. **Manual build process**:
   ```bash
   npm run build
   mkdir -p server/public
   cp -r dist/public/* server/public/
   ```

### For Render Deployment

Update your Render build command to:
```bash
npm install && ./scripts/deploy.sh
```

Or use the manual commands:
```bash
npm install && npm run build && mkdir -p server/public && cp -r dist/public/* server/public/
```

### Directory Structure After Build

```
project/
├── dist/
│   ├── public/          # Vite build output
│   └── index.js         # Server bundle
├── server/
│   └── public/          # Static files for production (copied from dist/public)
└── scripts/
    └── deploy.sh        # Deployment script
```

### Production Environment

The application will:
- Serve the Express API on all `/api/*` routes
- Serve static files from `server/public/` for all other routes
- Use the bundled server from `dist/index.js`

### Start Command

Keep the start command as:
```bash
npm run start
```

This will run `tsx server/index.ts` which handles both API and static file serving.