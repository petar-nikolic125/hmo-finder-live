#!/usr/bin/env node

/**
 * Post-build script to ensure production deployment works across platforms
 * Fixes the build path mismatch between vite output and server expectations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔧 Running post-build production fixes...');

// Ensure server/public directory exists and has the built files
const distPublicPath = path.join(rootDir, 'dist', 'public');
const serverPublicPath = path.join(rootDir, 'server', 'public');

if (fs.existsSync(distPublicPath)) {
  console.log('✅ Found vite build output in dist/public');
  
  // Remove existing server/public and recreate
  if (fs.existsSync(serverPublicPath)) {
    fs.rmSync(serverPublicPath, { recursive: true, force: true });
  }
  
  fs.mkdirSync(serverPublicPath, { recursive: true });
  
  // Copy all files from dist/public to server/public
  copyRecursive(distPublicPath, serverPublicPath);
  
  console.log('✅ Copied build files to server/public for production');
  
  // Verify critical files exist
  const indexPath = path.join(serverPublicPath, 'index.html');
  const assetsPath = path.join(serverPublicPath, 'assets');
  
  if (fs.existsSync(indexPath) && fs.existsSync(assetsPath)) {
    console.log('✅ Production build verification passed');
  } else {
    console.error('❌ Production build verification failed');
    process.exit(1);
  }
} else {
  console.error('❌ dist/public not found - build failed');
  process.exit(1);
}

// Create production-ready package.json for serverless deployment
const prodPackageJson = {
  name: "hmo-property-search",
  version: "1.0.0",
  type: "module",
  main: "dist/index.js",
  scripts: {
    start: "node dist/index.js"
  },
  engines: {
    node: ">=18.0.0"
  }
};

fs.writeFileSync(
  path.join(rootDir, 'dist', 'package.json'),
  JSON.stringify(prodPackageJson, null, 2)
);

console.log('✅ Created production package.json');
console.log('🎉 Post-build production fixes completed successfully!');

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}