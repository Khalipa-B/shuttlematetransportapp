/**
 * WebSocket client for real-time communication
 */

// Message types that can be sent and received via WebSocket
export type WebSocketMessageType = 
  | 'welcome'
  | 'bus_location_update'
  | 'bus_location'
  | 'student_check_in'
  | 'student_check_out'
  | 'incident_report'
  | 'emergency_alert'
  | 'chat_message'
  | 'error';

// Structure for a WebSocket message
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
}

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

// WebSocket client configuration
interface WebSocketClientConfig {
  onOpen?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * WebSocket client for real-time updates
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private config: WebSocketClientConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  
  constructor(config: WebSocketClientConfig = {}) {
    // Set default configuration
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config
    };
    
    // Determine the WebSocket URL based on the current protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    try {
      this.connectionState = ConnectionState.CONNECTING;
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = (event) => {
        this.connectionState = ConnectionState.CONNECTED;
        this.reconnectAttempts = 0;
        if (this.config.onOpen) this.config.onOpen(event);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          if (this.config.onMessage) this.config.onMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      this.socket.onclose = (event) => {
        this.connectionState = ConnectionState.DISCONNECTED;
        if (this.config.onClose) this.config.onClose(event);
        
        if (this.config.autoReconnect && this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
          this.scheduleReconnect();
        }
      };
      
      this.socket.onerror = (event) => {
        if (this.config.onError) this.config.onError(event);
      };
    } catch (err) {
      console.error('Failed to connect to WebSocket server:', err);
      this.connectionState = ConnectionState.DISCONNECTED;
      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }
  
  /**
   * Send a message to the WebSocket server
   */
  public send<T = any>(type: WebSocketMessageType, payload: T): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }
    
    try {
      const message: WebSocketMessage<T> = { type, payload };
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      return false;
    }
  }
  
  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionState = ConnectionState.DISCONNECTED;
  }
  
  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Check if connected to the WebSocket server
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Set event handlers
   */
  public on(event: 'open' | 'message' | 'close' | 'error', callback: (...args: any[]) => void): void {
    switch (event) {
      case 'open':
        this.config.onOpen = callback as (event: Event) => void;
        break;
      case 'message':
        this.config.onMessage = callback as (message: WebSocketMessage) => void;
        break;
      case 'close':
        this.config.onClose = callback as (event: CloseEvent) => void;
        break;
      case 'error':
        this.config.onError = callback as (event: Event) => void;
        break;
    }
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }
    
    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }
}

/**
 * Create a singleton WebSocket client
 */
let webSocketClient: WebSocketClient | null = null;

export function getWebSocketClient(config?: WebSocketClientConfig): WebSocketClient {
  if (!webSocketClient) {
    webSocketClient = new WebSocketClient(config);
  }
  
  return webSocketClient;
}
