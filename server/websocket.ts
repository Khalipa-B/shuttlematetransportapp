import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { db } from './db';
import { insertBusLocation, busLocations, messages, insertMessageSchema, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Message types
type MessageType = 'location_update' | 'chat_message' | 'notification' | 'student_status' | 'emergency';

interface WSMessage {
  type: MessageType;
  data: any;
}

// Client tracking with role information
interface Client {
  ws: WebSocket;
  userId: string;
  role: string;
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Store active client connections
  const clients: Map<string, Client> = new Map();

  wss.on('connection', (ws: WebSocket, request) => {
    console.log('WebSocket connection established');
    
    // Initialize client without authentication
    let currentClient: Client | null = null;

    ws.on('message', async (message: string) => {
      try {
        const parsed = JSON.parse(message) as WSMessage;
        
        // Handle authentication first
        if (parsed.type === 'auth') {
          const userId = parsed.data.userId;
          if (!userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed: User ID required' }));
            return;
          }
          
          // Get user from database to verify and get role
          const [user] = await db.select().from(users).where(eq(users.id, userId));
          if (!user) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed: User not found' }));
            return;
          }
          
          // Setup client
          currentClient = {
            ws,
            userId,
            role: user.role || 'parent'
          };
          
          clients.set(userId, currentClient);
          ws.send(JSON.stringify({ type: 'auth_success' }));
          return;
        }
        
        // Ensure client is authenticated for all other message types
        if (!currentClient) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }
        
        // Handle different message types
        switch (parsed.type) {
          case 'location_update':
            await handleLocationUpdate(parsed.data, currentClient);
            break;
            
          case 'chat_message':
            await handleChatMessage(parsed.data, currentClient);
            break;
            
          case 'student_status':
            await handleStudentStatusUpdate(parsed.data, currentClient);
            break;
            
          case 'emergency':
            await handleEmergency(parsed.data, currentClient);
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
      }
    });

    ws.on('close', () => {
      if (currentClient) {
        clients.delete(currentClient.userId);
      }
      console.log('WebSocket connection closed');
    });
  });

  // Handle bus location updates
  async function handleLocationUpdate(data: any, client: Client) {
    // Only drivers and admin can update bus locations
    if (client.role !== 'driver' && client.role !== 'admin') {
      client.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Permission denied: Only drivers can update location' 
      }));
      return;
    }

    try {
      // Validate the location data
      if (!data.busId || !data.latitude || !data.longitude) {
        client.ws.send(JSON.stringify({ type: 'error', message: 'Invalid location data' }));
        return;
      }

      // Insert location into database
      const [location] = await db.insert(busLocations).values({
        busId: data.busId,
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        bearing: data.bearing,
        status: data.status,
      }).returning();

      // Broadcast location update to relevant clients (parents with students on this route)
      // This is a simplified broadcast - in a real app, you would filter to relevant parents
      for (const [, connectedClient] of clients) {
        if (connectedClient.role === 'parent' || connectedClient.role === 'admin') {
          if (connectedClient.ws.readyState === WebSocket.OPEN) {
            connectedClient.ws.send(JSON.stringify({
              type: 'location_update',
              data: {
                busId: data.busId,
                tripId: data.tripId,
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: new Date().toISOString(),
                status: data.status,
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error handling location update:', error);
      client.ws.send(JSON.stringify({ type: 'error', message: 'Failed to process location update' }));
    }
  }

  // Handle chat messages
  async function handleChatMessage(data: any, client: Client) {
    try {
      // Validate message data
      const validatedMessage = insertMessageSchema.parse({
        senderId: client.userId,
        recipientId: data.recipientId,
        content: data.content,
        isRead: false
      });

      // Store message in database
      const [message] = await db.insert(messages).values(validatedMessage).returning();

      // Send to recipient if online
      const recipient = clients.get(data.recipientId);
      if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
        recipient.ws.send(JSON.stringify({
          type: 'chat_message',
          data: {
            id: message.id,
            senderId: client.userId,
            content: message.content,
            timestamp: message.createdAt,
          }
        }));
      }

      // Confirm to sender
      client.ws.send(JSON.stringify({
        type: 'message_sent',
        data: {
          id: message.id,
          recipientId: data.recipientId,
          timestamp: message.createdAt,
        }
      }));
    } catch (error) {
      console.error('Error handling chat message:', error);
      client.ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
    }
  }

  // Handle student status updates
  async function handleStudentStatusUpdate(data: any, client: Client) {
    // Only drivers can update student status
    if (client.role !== 'driver' && client.role !== 'admin') {
      client.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Permission denied: Only drivers can update student status' 
      }));
      return;
    }

    try {
      // Here you would update the student trip status in the database
      // This is a simplified implementation
      
      // Broadcast to relevant parents
      // In a real app, you would look up the parent for this student
      for (const [, connectedClient] of clients) {
        if (connectedClient.role === 'parent') {
          // Check if this is the parent of the student
          if (connectedClient.ws.readyState === WebSocket.OPEN) {
            connectedClient.ws.send(JSON.stringify({
              type: 'student_status',
              data: {
                studentId: data.studentId,
                status: data.status,
                timestamp: new Date().toISOString(),
                message: data.message || `Student status updated to ${data.status}`
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error handling student status update:', error);
      client.ws.send(JSON.stringify({ type: 'error', message: 'Failed to update student status' }));
    }
  }

  // Handle emergency alerts
  async function handleEmergency(data: any, client: Client) {
    // Primarily for drivers, but allow any role to report emergencies
    try {
      // Broadcast emergency to all admin users and relevant parents
      for (const [, connectedClient] of clients) {
        if (connectedClient.role === 'admin' || 
           (connectedClient.role === 'parent' && data.affectedStudentIds?.includes(connectedClient.userId))) {
          if (connectedClient.ws.readyState === WebSocket.OPEN) {
            connectedClient.ws.send(JSON.stringify({
              type: 'emergency',
              data: {
                reportedBy: client.userId,
                busId: data.busId,
                tripId: data.tripId,
                type: data.emergencyType,
                description: data.description,
                location: data.location,
                timestamp: new Date().toISOString(),
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error handling emergency alert:', error);
      client.ws.send(JSON.stringify({ type: 'error', message: 'Failed to send emergency alert' }));
    }
  }

  return wss;
}
