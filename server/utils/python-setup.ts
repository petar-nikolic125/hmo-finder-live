import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PythonSetupResult {
  success: boolean;
  message: string;
  details?: string;
}

export class PythonSetupManager {
  private isSetupRunning = false;
  private setupPromise: Promise<PythonSetupResult> | null = null;

  /**
   * Check if Python dependencies are available
   */
  async checkPythonDependencies(): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(`python3 -c "
import sys
try:
    import requests
    import bs4
    import lxml
    print('SUCCESS: All packages imported')
except ImportError as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"`);
      
      console.log('🐍 Python dependency check:', stdout.trim());
      return stdout.includes('SUCCESS');
    } catch (error) {
      console.log('🐍 Python dependency check failed:', error);
      return false;
    }
  }

  /**
   * Install Python dependencies using uv
   */
  async setupPythonDependencies(): Promise<PythonSetupResult> {
    if (this.isSetupRunning) {
      console.log('🐍 Python setup already running, waiting...');
      return this.setupPromise!;
    }

    this.isSetupRunning = true;
    this.setupPromise = this._performSetup();
    
    try {
      const result = await this.setupPromise;
      return result;
    } finally {
      this.isSetupRunning = false;
      this.setupPromise = null;
    }
  }

  private async _performSetup(): Promise<PythonSetupResult> {
    console.log('🐍 Starting Python dependency setup...');
    
    try {
      // First install uv if needed
      console.log('📦 Checking uv package manager...');
      const uvInstallResult = await this.ensureUvInstalled();
      if (!uvInstallResult.success) {
        return uvInstallResult;
      }

      // Install dependencies with uv sync
      console.log('📦 Installing Python dependencies with uv sync...');
      const { stdout, stderr } = await execAsync('uv sync', {
        timeout: 120000, // 2 minute timeout
        cwd: process.cwd()
      });

      console.log('📦 uv sync output:', stdout);
      if (stderr && !stderr.includes('warning')) {
        console.log('📦 uv sync stderr:', stderr);
      }

      // Verify installation
      const isWorking = await this.checkPythonDependencies();
      if (isWorking) {
        console.log('✅ Python dependencies successfully installed and verified!');
        return {
          success: true,
          message: 'Python dependencies installed successfully',
          details: stdout
        };
      } else {
        return {
          success: false,
          message: 'Python dependencies installed but verification failed',
          details: `stdout: ${stdout}, stderr: ${stderr}`
        };
      }

    } catch (error) {
      console.error('❌ Failed to setup Python dependencies:', error);
      return {
        success: false,
        message: `Python setup failed: ${error}`,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async ensureUvInstalled(): Promise<PythonSetupResult> {
    try {
      // Check if uv is already installed
      await execAsync('uv --version');
      console.log('✅ uv package manager is already installed');
      return { success: true, message: 'uv already installed' };
    } catch (error) {
      // Install uv
      console.log('📦 Installing uv package manager...');
      try {
        const { stdout, stderr } = await execAsync('curl -LsSf https://astral.sh/uv/install.sh | sh', {
          timeout: 60000 // 1 minute timeout
        });
        
        // Update PATH for current process
        process.env.PATH = `${process.env.HOME}/.local/bin:${process.env.PATH}`;
        
        console.log('📦 uv installation output:', stdout);
        return { success: true, message: 'uv installed successfully' };
      } catch (installError) {
        console.error('❌ Failed to install uv:', installError);
        return {
          success: false,
          message: 'Failed to install uv package manager',
          details: installError instanceof Error ? installError.message : String(installError)
        };
      }
    }
  }

  /**
   * Ensure Python dependencies are ready before running scraper
   */
  async ensurePythonReady(): Promise<PythonSetupResult> {
    const isReady = await this.checkPythonDependencies();
    
    if (isReady) {
      return { success: true, message: 'Python dependencies are ready' };
    }

    console.log('🔧 Python dependencies missing, installing automatically...');
    return await this.setupPythonDependencies();
  }
}

// Export singleton instance
export const pythonSetup = new PythonSetupManager();