import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketClient, WebSocketMessage, ConnectionState } from '@/lib/webSocket';
import { useAuth } from './useAuth';

/**
 * Hook for managing WebSocket connections and messages
 */
export function useSocket() {
  const { isAuthenticated, user } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messagesRef = useRef<WebSocketMessage[]>([]);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  
  // Initialize WebSocket client
  const socketClient = useRef(getWebSocketClient({
    onOpen: () => setConnectionState(ConnectionState.CONNECTED),
    onMessage: (message) => {
      setLastMessage(message);
      messagesRef.current = [...messagesRef.current, message];
      setMessages(messagesRef.current);
    },
    onClose: () => setConnectionState(ConnectionState.DISCONNECTED),
    onError: () => setConnectionState(ConnectionState.DISCONNECTED),
    autoReconnect: true,
  })).current;
  
  // Connect/disconnect based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();
    } else {
      socketClient.disconnect();
      messagesRef.current = [];
      setMessages([]);
      setLastMessage(null);
    }
    
    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, socketClient]);
  
  // Update connection state when the client's state changes
  useEffect(() => {
    const checkState = () => {
      const state = socketClient.getConnectionState();
      setConnectionState(state);
    };
    
    // Check immediately and then set up an interval
    checkState();
    const interval = setInterval(checkState, 1000);
    
    return () => clearInterval(interval);
  }, [socketClient]);
  
  // Send a message via the WebSocket
  const sendMessage = useCallback(<T = any>(type: string, payload: T) => {
    if (!isAuthenticated) {
      console.warn('Cannot send message: Not authenticated');
      return false;
    }
    
    return socketClient.send(type as any, payload);
  }, [isAuthenticated, socketClient]);
  
  // Clear messages history
  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setLastMessage(null);
  }, []);
  
  // Filter messages by type
  const getMessagesByType = useCallback((type: string) => {
    return messages.filter(message => message.type === type);
  }, [messages]);
  
  return {
    connectionState,
    isConnected: connectionState === ConnectionState.CONNECTED,
    isConnecting: connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING,
    messages,
    lastMessage,
    sendMessage,
    clearMessages,
    getMessagesByType,
  };
}

/**
 * Hook for subscribing to specific message types
 */
export function useSocketMessages<T = any>(messageType: string) {
  const { messages } = useSocket();
  const [typeMessages, setTypeMessages] = useState<WebSocketMessage<T>[]>([]);
  
  useEffect(() => {
    const filtered = messages
      .filter(message => message.type === messageType)
      .map(message => message as WebSocketMessage<T>);
    
    setTypeMessages(filtered);
  }, [messages, messageType]);
  
  return typeMessages;
}

/**
 * Hook for bus location updates
 */
export function useBusLocationUpdates(busId?: number) {
  const busMessages = useSocketMessages<{
    busId: number;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    status?: string;
    timestamp: string;
  }>('bus_location');
  
  // Filter for specific bus if busId is provided
  const filteredMessages = busId 
    ? busMessages.filter(msg => msg.payload.busId === busId)
    : busMessages;
  
  // Get the latest location update
  const latestUpdate = filteredMessages.length > 0 
    ? filteredMessages[filteredMessages.length - 1].payload
    : null;
  
  return {
    updates: filteredMessages.map(msg => msg.payload),
    latestUpdate,
  };
}

/**
 * Hook for student check-in/out updates
 */
export function useStudentUpdates(routeId?: number) {
  const checkInMessages = useSocketMessages('student_check_in');
  const checkOutMessages = useSocketMessages('student_check_out');
  
  // Filter for specific route if routeId is provided
  const filteredCheckIns = routeId
    ? checkInMessages.filter(msg => msg.payload.routeId === routeId)
    : checkInMessages;
    
  const filteredCheckOuts = routeId
    ? checkOutMessages.filter(msg => msg.payload.routeId === routeId)
    : checkOutMessages;
  
  return {
    checkIns: filteredCheckIns.map(msg => msg.payload),
    checkOuts: filteredCheckOuts.map(msg => msg.payload),
  };
}

/**
 * Hook for emergency alerts
 */
export function useEmergencyAlerts() {
  const emergencyMessages = useSocketMessages('emergency_alert');
  
  const latestAlert = emergencyMessages.length > 0
    ? emergencyMessages[emergencyMessages.length - 1].payload
    : null;
  
  return {
    alerts: emergencyMessages.map(msg => msg.payload),
    latestAlert,
    hasActiveAlert: !!latestAlert,
  };
}

/**
 * Hook for chat messages
 */
export function useChatMessages(otherUserId?: string) {
  const { user } = useAuth();
  const chatMessages = useSocketMessages<{
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
  }>('chat_message');
  
  // Filter for conversations with specific user
  const filteredMessages = otherUserId && user
    ? chatMessages.filter(msg => 
        (msg.payload.senderId === user.id && msg.payload.receiverId === otherUserId) ||
        (msg.payload.senderId === otherUserId && msg.payload.receiverId === user.id)
      )
    : chatMessages;
  
  return {
    messages: filteredMessages.map(msg => msg.payload),
  };
}
