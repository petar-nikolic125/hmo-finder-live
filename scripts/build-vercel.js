#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function buildForVercel() {
  console.log('🏗️ Building for Vercel deployment...');

  try {
    // Run the main build script
    console.log('Running main build...');
    const buildProcess = spawn('node', ['build.js'], { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });

    // Ensure dist directory structure is correct
    const distPublicExists = await fs.access('dist/public').then(() => true).catch(() => false);
    if (!distPublicExists) {
      console.log('⚠️ dist/public not found, creating fallback...');
      await fs.mkdir('dist/public', { recursive: true });
      await fs.writeFile('dist/public/index.html', `
        <!DOCTYPE html>
        <html>
        <head><title>HMO Property Search</title></head>
        <body><div id="root">Loading...</div></body>
        </html>
      `);
    }

    console.log('✅ Vercel build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildForVercel();