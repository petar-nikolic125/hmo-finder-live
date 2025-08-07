#!/usr/bin/env node

import { build } from 'vite';
import { build as esbuild } from 'esbuild';
import fs from 'fs';
import path from 'path';

async function buildForProduction() {
  console.log('🏗️ Building frontend...');
  
  // Build frontend with Vite
  await build();
  
  console.log('🏗️ Building backend...');
  
  // Build backend with esbuild
  await esbuild({
    entryPoints: ['server/index.ts', 'server/vercel.ts'],
    platform: 'node',
    packages: 'external',
    bundle: true,
    format: 'esm',
    outdir: 'dist',
    external: [
      'tsx', 
      '@replit/vite-plugin-cartographer',
      '@replit/vite-plugin-runtime-error-modal',
      'node:*'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  // Copy Python files and dependencies
  console.log('🐍 Copying Python scraper files...');
  
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(src)) return;
    
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(item => {
        copyRecursive(path.join(src, item), path.join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  // Copy scraper directory
  if (fs.existsSync('server/scraper')) {
    copyRecursive('server/scraper', 'dist/scraper');
  }

  // Copy Python environment files
  if (fs.existsSync('pyproject.toml')) {
    fs.copyFileSync('pyproject.toml', 'dist/pyproject.toml');
  }
  if (fs.existsSync('uv.lock')) {
    fs.copyFileSync('uv.lock', 'dist/uv.lock');
  }

  console.log('✅ Build completed successfully!');
}

buildForProduction().catch(console.error);