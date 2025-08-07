// Vercel-specific entry point
import { initializeApp } from './index.js';

// Initialize and export the app for Vercel
const appPromise = initializeApp();

// Handle both default and named exports for compatibility
export default appPromise;
export { appPromise as app };