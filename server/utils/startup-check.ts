import { pythonSetup } from './python-setup.js';

/**
 * Startup health check that runs when server starts
 * This ensures all critical dependencies are available
 */
export async function performStartupCheck(): Promise<void> {
  console.log('🚀 Running startup health check...');
  
  try {
    // Check Python dependencies first
    console.log('🐍 Checking Python environment...');
    const pythonResult = await pythonSetup.ensurePythonReady();
    
    if (pythonResult.success) {
      console.log('✅ Python dependencies verified and ready');
    } else {
      console.log('⚠️ Python dependencies had issues but will auto-fix when needed');
      console.log(`   Details: ${pythonResult.message}`);
    }
    
    // Could add other checks here (database, external APIs, etc.)
    
    console.log('✅ Startup check completed');
    
  } catch (error) {
    console.log('⚠️ Startup check encountered non-critical errors:', error);
    console.log('   Application will still start but some features may require manual intervention');
  }
}