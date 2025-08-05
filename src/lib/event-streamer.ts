// EventStreamer client for real-time token data
export interface StreamTokenData {
  mint: string;
  ticker: string;
  mcap: number;
  chain: string;
  alphaCall: number;
  newCall: number;
  score: string;
  socials?: any;
}

export interface ProcessedTokenData extends Omit<StreamTokenData, 'newCall'> {
  callCount: number; // Total number of calls for this token
  isFirstCall: boolean; // Whether this was the first call
  lastCallTime: number; // Timestamp of last call
}

export interface StreamerConnection {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: number | null;
}

export class EventStreamerClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Set<(data: ProcessedTokenData) => void> = new Set();
  private statusListeners: Set<(status: StreamerConnection) => void> = new Set();
  private streamUrl: string;

  constructor(streamUrl = 'https://7cd3f5ec-7473-4d78-a097-9bdefac0148a.us-east-1.cloud.genez.io/stream') {
    this.streamUrl = streamUrl;
  }

  private getConnectionStatus(): StreamerConnection {
    return {
      isConnected: this.eventSource?.readyState === EventSource.OPEN,
      isConnecting: this.eventSource?.readyState === EventSource.CONNECTING,
      error: null,
      lastUpdate: Date.now(),
    };
  }

  private notifyStatusListeners(status: Partial<StreamerConnection> = {}) {
    const fullStatus = { ...this.getConnectionStatus(), ...status };
    this.statusListeners.forEach((listener) => listener(fullStatus));
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log('🔌 Connecting to event stream:', this.streamUrl);
    this.notifyStatusListeners({ isConnecting: true, error: null });

    try {
      this.eventSource = new EventSource(this.streamUrl);

      this.eventSource.onopen = () => {
        console.log('✅ Connected to the event stream.');
        this.reconnectAttempts = 0;
        this.notifyStatusListeners({ isConnected: true, isConnecting: false, error: null });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);

          const rawTokenData: StreamTokenData = {
            mint: parsedData.mint,
            ticker: parsedData.ticker,
            mcap: parsedData.mcap,
            chain: parsedData.chain,
            alphaCall: parsedData.alphaCall,
            newCall: parsedData.newCall,
            score: parsedData.score,
            socials: parsedData.socials,
          };

          // Process the token data to handle call counting
          const processedData: ProcessedTokenData = {
            mint: rawTokenData.mint,
            ticker: rawTokenData.ticker,
            mcap: rawTokenData.mcap,
            chain: rawTokenData.chain,
            alphaCall: rawTokenData.alphaCall,
            score: rawTokenData.score,
            socials: rawTokenData.socials,
            callCount: rawTokenData.newCall === 1 ? 1 : 0, // Will be updated by the hook
            isFirstCall: rawTokenData.newCall === 1,
            lastCallTime: Date.now(),
          };

          console.log('🔍 Received token data:', {
            ...processedData,
            rawNewCall: rawTokenData.newCall,
            isFirstCall: processedData.isFirstCall,
          });

          // Notify all listeners
          this.listeners.forEach((listener) => listener(processedData));
          this.notifyStatusListeners({ lastUpdate: Date.now() });
        } catch (err) {
          console.error('❌ Failed to parse message data:', err);
          this.notifyStatusListeners({ error: 'Failed to parse stream data' });
        }
      };

      this.eventSource.onerror = (err) => {
        console.error('💥 EventSource error:', err);
        this.notifyStatusListeners({
          isConnected: false,
          isConnecting: false,
          error: 'Connection error',
        });

        // Attempt to reconnect
        this.handleReconnect();
      };
    } catch (err) {
      console.error('❌ Failed to create EventSource:', err);
      this.notifyStatusListeners({
        isConnected: false,
        isConnecting: false,
        error: 'Failed to create connection',
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.notifyStatusListeners({ error: 'Max reconnection attempts reached' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from event stream');
      this.eventSource.close();
      this.eventSource = null;
      this.notifyStatusListeners({ isConnected: false, isConnecting: false });
    }
  }

  // Subscribe to token data updates
  onTokenData(callback: (data: ProcessedTokenData) => void) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Subscribe to connection status updates
  onStatusChange(callback: (status: StreamerConnection) => void) {
    this.statusListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  // Get current connection status
  getStatus(): StreamerConnection {
    return this.getConnectionStatus();
  }

  // Check if currently connected
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Singleton instance
export const eventStreamer = new EventStreamerClient();
