import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });
    
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
    });
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [isAuthenticated, user]);
  
  return socket;
}
