#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

async function startForRailway() {
  console.log('🚂 Starting HMO Property Search on Railway...');
  
  try {
    // Check if built files exist
    const distExists = await fs.access('dist').then(() => true).catch(() => false);
    if (!distExists) {
      console.log('📦 No build found, building first...');
      const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
      
      await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });
      });
    }

    // Check Python dependencies
    console.log('🐍 Verifying Python environment...');
    const pythonCheck = spawn('python3', ['-c', 'import requests, bs4, lxml; print("✅ Python dependencies OK")'], { stdio: 'inherit' });
    
    await new Promise((resolve) => {
      pythonCheck.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python environment ready');
        } else {
          console.log('⚠️ Python dependencies may be missing, but continuing...');
        }
        resolve();
      });
    });

    // Start the application
    console.log('🚀 Starting server...');
    console.log(`🌐 PORT: ${process.env.PORT || '5000'}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    
    // Use tsx to run the TypeScript server directly
    const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '5000'
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Server failed to start:', error);
      process.exit(1);
    });

    serverProcess.on('close', (code) => {
      console.log(`🔴 Server exited with code ${code}`);
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

startForRailway();