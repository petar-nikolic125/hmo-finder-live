#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function buildForRailway() {
  console.log('🚂 Building for Railway deployment...');

  try {
    // Run the main build
    console.log('📦 Running production build...');
    const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });

    // Verify build output
    const distPublicExists = await fs.access('dist/public').then(() => true).catch(() => false);
    if (!distPublicExists) {
      throw new Error('Build failed - dist/public directory not created');
    }

    // Verify critical files
    const indexExists = await fs.access('dist/public/index.html').then(() => true).catch(() => false);
    const assetsExist = await fs.access('dist/public/assets').then(() => true).catch(() => false);
    
    if (!indexExists || !assetsExist) {
      throw new Error('Build incomplete - missing critical files');
    }

    console.log('✅ Railway build completed successfully!');
    console.log('📊 Build output:');
    console.log('  - Frontend: dist/public/');
    console.log('  - Backend: dist/index.js');
    
  } catch (error) {
    console.error('❌ Railway build failed:', error.message);
    process.exit(1);
  }
}

buildForRailway();