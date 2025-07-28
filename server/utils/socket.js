// Socket.IO event handlers and utilities
const jwt = require('jsonwebtoken');

const initializeSocket = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify Clerk JWT token here if needed
      // For now, we'll accept any token for demo purposes
      socket.userId = socket.handshake.auth.userId;
      socket.userRole = socket.handshake.auth.userRole;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their role-based room
    socket.join(socket.userRole);
    socket.join(`user_${socket.userId}`);

    // Handle location updates from drivers
    socket.on('updateLocation', (data) => {
      if (socket.userRole === 'driver') {
        // Broadcast location to all parents and admins
        socket.broadcast.to('parent').emit('locationUpdate', {
          tripId: data.tripId,
          busNumber: data.busNumber,
          location: data.location,
          timestamp: new Date()
        });
        
        socket.broadcast.to('admin').emit('locationUpdate', {
          tripId: data.tripId,
          busNumber: data.busNumber,
          location: data.location,
          timestamp: new Date()
        });
      }
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
      const { recipientId, message, tripId } = data;
      
      // Send message to specific recipient
      socket.to(`user_${recipientId}`).emit('newMessage', {
        senderId: socket.userId,
        senderRole: socket.userRole,
        message,
        tripId,
        timestamp: new Date()
      });

      // Also send to admins for monitoring
      if (socket.userRole !== 'admin') {
        socket.to('admin').emit('newMessage', {
          senderId: socket.userId,
          senderRole: socket.userRole,
          recipientId,
          message,
          tripId,
          timestamp: new Date()
        });
      }
    });

    // Handle trip status updates
    socket.on('tripStatusUpdate', (data) => {
      if (socket.userRole === 'driver' || socket.userRole === 'admin') {
        // Broadcast to all relevant users
        io.emit('tripStatusChanged', {
          tripId: data.tripId,
          status: data.status,
          timestamp: new Date(),
          updatedBy: socket.userId
        });
      }
    });

    // Handle student check-in/out
    socket.on('studentCheckIn', (data) => {
      if (socket.userRole === 'driver') {
        // Notify parents and admins
        socket.broadcast.to('parent').emit('studentCheckedIn', {
          studentId: data.studentId,
          studentName: data.studentName,
          tripId: data.tripId,
          timestamp: new Date()
        });
        
        socket.broadcast.to('admin').emit('studentCheckedIn', {
          studentId: data.studentId,
          studentName: data.studentName,
          tripId: data.tripId,
          driverId: socket.userId,
          timestamp: new Date()
        });
      }
    });

    socket.on('studentCheckOut', (data) => {
      if (socket.userRole === 'driver') {
        // Notify parents and admins
        socket.broadcast.to('parent').emit('studentCheckedOut', {
          studentId: data.studentId,
          studentName: data.studentName,
          tripId: data.tripId,
          timestamp: new Date()
        });
        
        socket.broadcast.to('admin').emit('studentCheckedOut', {
          studentId: data.studentId,
          studentName: data.studentName,
          tripId: data.tripId,
          driverId: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Handle emergency alerts
    socket.on('emergencyAlert', (data) => {
      // Broadcast emergency to all admins immediately
      socket.broadcast.to('admin').emit('emergencyAlert', {
        alertId: data.alertId,
        type: data.type,
        message: data.message,
        location: data.location,
        reportedBy: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date()
      });

      // Also notify relevant parents if it's trip-related
      if (data.tripId) {
        socket.broadcast.to('parent').emit('emergencyAlert', {
          alertId: data.alertId,
          type: data.type,
          message: data.message,
          tripId: data.tripId,
          timestamp: new Date()
        });
      }
    });

    // Handle typing indicators for chat
    socket.on('typing', (data) => {
      socket.to(`user_${data.recipientId}`).emit('userTyping', {
        userId: socket.userId,
        userName: data.userName,
        isTyping: data.isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Utility functions for emitting events from controllers
const emitToRole = (io, role, event, data) => {
  io.to(role).emit(event, data);
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = {
  initializeSocket,
  emitToRole,
  emitToUser,
  emitToAll
};