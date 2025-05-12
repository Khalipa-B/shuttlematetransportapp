import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function useChat(receiverId?: string) {
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch message history
  const { data: messageHistory, isLoading } = useQuery({
    queryKey: ['/api/messages', receiverId],
    enabled: !!receiverId && !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!receiverId || !user) return null;

      // Send via WebSocket for real-time
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'message',
          receiverId,
          content: message
        }));
      }

      // Also send via API to ensure delivery
      return await apiRequest('POST', '/api/messages', {
        receiverId,
        message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', receiverId] });
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('POST', `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', receiverId] });
    }
  });

  // Update messages when history is loaded
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  // Handle incoming messages from WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Add the new message to the list
          if (
            (data.data.senderId === user?.id && data.data.receiverId === receiverId) ||
            (data.data.senderId === receiverId && data.data.receiverId === user?.id)
          ) {
            setMessages(prevMessages => [...prevMessages, data.data]);
            
            // Mark as read if we're the receiver
            if (data.data.receiverId === user?.id) {
              markAsReadMutation.mutate(data.data.id);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('open', () => setIsConnected(true));
    socket.addEventListener('close', () => setIsConnected(false));

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('open', () => setIsConnected(true));
      socket.removeEventListener('close', () => setIsConnected(false));
    };
  }, [socket, user, receiverId, markAsReadMutation]);

  // Send message function
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    sendMessageMutation.mutate(content);
  }, [sendMessageMutation]);

  // Mark message as read
  const markAsRead = useCallback((messageId: number) => {
    markAsReadMutation.mutate(messageId);
  }, [markAsReadMutation]);

  return {
    messages,
    sendMessage,
    markAsRead,
    isLoading,
    isConnected,
    isSending: sendMessageMutation.isPending
  };
}
