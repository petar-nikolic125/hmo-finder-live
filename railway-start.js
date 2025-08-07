#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

async function startForRailway() {
  try {
    console.log('🚂 Starting Railway deployment...');
    
    // Set Railway-specific environment variables
    process.env.NODE_ENV = 'production';
    process.env.RAILWAY = '1';
    
    // Check if dist exists
    const distExists = await fs.access('dist').then(() => true).catch(() => false);
    if (!distExists) {
      console.log('🏗️ Building application for Railway...');
      const buildProcess = spawn('node', ['build.js'], { stdio: 'inherit' });
      
      await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });
      });
    }
    
    console.log('🚀 Starting server...');
    
    // Start the main application
    const serverProcess = spawn('node', ['dist/index.js'], { 
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: process.env.PORT || 5000,
        HOST: '0.0.0.0'
      }
    });
    
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('❌ Railway startup failed:', error.message);
    process.exit(1);
  }
}

startForRailway();