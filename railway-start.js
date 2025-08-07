#!/usr/bin/env node

import { initializeApp } from "./server/index.js";

async function startForRailway() {
  try {
    console.log('🚂 Starting Railway deployment...');

    // Set Railway-specific environment variables
    process.env.NODE_ENV = 'production';
    process.env.RAILWAY = '1';

    // Initialize the app (this exports the Express app, doesn't start server)
    console.log('🚀 Initializing Express app...');
    const app = await initializeApp();

    // Railway provides PORT environment variable
    const port = process.env.PORT || 5000;
    const host = "0.0.0.0";

    // Start the server manually for Railway
    const server = app.listen(port, host, () => {
      console.log(`🚂 Railway deployment running on ${host}:${port}`);
      console.log(`📡 Health check available at http://${host}:${port}/api/ping`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Railway startup failed:', error.message);
    process.exit(1);
  }
}

startForRailway();