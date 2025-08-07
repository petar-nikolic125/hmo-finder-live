// API monitoring and connection reliability
class ApiMonitor {
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'connected';
  private lastPingTime = 0;
  private pingInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: typeof this.connectionStatus) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Ping every 30 seconds to check connection
    this.pingInterval = setInterval(() => {
      this.checkConnection();
    }, 30000);

    // Initial ping
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        this.lastPingTime = Date.now();
        this.setConnectionStatus('connected');
        console.log(`🟢 API ping: ${Date.now() - startTime}ms`);
      } else {
        throw new Error(`Ping failed: ${response.status}`);
      }
    } catch (error) {
      console.error('🔴 API ping failed:', error);
      this.setConnectionStatus('disconnected');
    }
  }

  private setConnectionStatus(status: typeof this.connectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log(`📡 Connection status: ${status}`);
      this.listeners.forEach(listener => listener(status));
    }
  }

  public getConnectionStatus() {
    return this.connectionStatus;
  }

  public isConnected() {
    return this.connectionStatus === 'connected';
  }

  public getLastPingTime() {
    return this.lastPingTime;
  }

  public onStatusChange(listener: (status: typeof this.connectionStatus) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async forceReconnect() {
    this.setConnectionStatus('reconnecting');
    await this.checkConnection();
  }

  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.listeners = [];
  }
}

export const apiMonitor = new ApiMonitor();