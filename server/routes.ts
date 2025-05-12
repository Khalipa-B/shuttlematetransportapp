import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupWebSocketServer } from "./websocket";
import { z } from "zod";
import {
  insertBusSchema,
  insertRouteSchema,
  insertStopSchema,
  insertStudentSchema,
  insertTripSchema,
  insertIncidentSchema,
  insertBusLocationSchema,
  insertStudentTripSchema,
  insertNotificationSchema,
  insertMessageSchema,
  UserRole,
} from "@shared/schema";

// Role-based authorization middleware
const authorizeRole = (allowedRoles: string[]) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.claims.sub;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }
      
      // Add user object to request for easy access in route handlers
      req.userObject = user;
      next();
    } catch (error) {
      console.error("Error in role authorization:", error);
      res.status(500).json({ message: "Internal server error during authorization" });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // User routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get students for parent
  app.get('/api/parent/students', 
    isAuthenticated, 
    authorizeRole([UserRole.PARENT, UserRole.ADMIN]), 
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const students = await storage.getStudentsByParentId(userId);
        res.json(students);
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Failed to fetch students" });
      }
    }
  );

  // Get bus location for a specific trip
  app.get('/api/trips/:tripId/location', isAuthenticated, async (req, res) => {
    try {
      const { tripId } = req.params;
      const location = await storage.getLatestBusLocationByTrip(parseInt(tripId));
      
      if (!location) {
        return res.status(404).json({ message: "No location data found for this trip" });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error fetching bus location:", error);
      res.status(500).json({ message: "Failed to fetch bus location" });
    }
  });

  // Get all trips for a student
  app.get('/api/students/:studentId/trips', isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.params;
      const trips = await storage.getStudentTrips(parseInt(studentId));
      res.json(trips);
    } catch (error) {
      console.error("Error fetching student trips:", error);
      res.status(500).json({ message: "Failed to fetch student trips" });
    }
  });

  // Get messages between users
  app.get('/api/messages/:recipientId', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { recipientId } = req.params;
      const messages = await storage.getMessagesBetweenUsers(senderId, recipientId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get notifications for user
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:notificationId/read', isAuthenticated, async (req, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(parseInt(notificationId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // DRIVER ROUTES

  // Get assigned trips for driver
  app.get('/api/driver/trips', 
    isAuthenticated, 
    authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), 
    async (req: any, res) => {
      try {
        const driverId = req.user.claims.sub;
        const trips = await storage.getDriverTrips(driverId);
        res.json(trips);
      } catch (error) {
        console.error("Error fetching driver trips:", error);
        res.status(500).json({ message: "Failed to fetch trips" });
      }
    }
  );

  // Get students for a specific trip
  app.get('/api/trips/:tripId/students', 
    isAuthenticated, 
    authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const { tripId } = req.params;
        const students = await storage.getStudentsByTrip(parseInt(tripId));
        res.json(students);
      } catch (error) {
        console.error("Error fetching trip students:", error);
        res.status(500).json({ message: "Failed to fetch students for trip" });
      }
    }
  );

  // Update student status on trip
  app.patch('/api/trips/:tripId/students/:studentId/status', 
    isAuthenticated, 
    authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const { tripId, studentId } = req.params;
        const { status } = req.body;
        
        if (!status) {
          return res.status(400).json({ message: "Status is required" });
        }
        
        await storage.updateStudentTripStatus(
          parseInt(tripId), 
          parseInt(studentId), 
          status
        );
        
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating student status:", error);
        res.status(500).json({ message: "Failed to update student status" });
      }
    }
  );

  // Report an incident
  app.post('/api/incidents', 
    isAuthenticated, 
    authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), 
    async (req: any, res) => {
      try {
        const reportedBy = req.user.claims.sub;
        
        const incidentData = insertIncidentSchema.parse({
          ...req.body,
          reportedBy
        });
        
        const incident = await storage.createIncident(incidentData);
        
        // If students are involved, add them to the incident
        if (req.body.studentIds && Array.isArray(req.body.studentIds)) {
          for (const studentId of req.body.studentIds) {
            await storage.addStudentToIncident(incident.id, parseInt(studentId));
          }
        }
        
        res.status(201).json(incident);
      } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ message: "Failed to create incident" });
      }
    }
  );

  // Update bus location
  app.post('/api/bus-locations', 
    isAuthenticated, 
    authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const locationData = insertBusLocationSchema.parse(req.body);
        const location = await storage.createBusLocation(locationData);
        res.status(201).json(location);
      } catch (error) {
        console.error("Error updating bus location:", error);
        res.status(500).json({ message: "Failed to update bus location" });
      }
    }
  );

  // ADMIN ROUTES

  // Get all buses
  app.get('/api/buses', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const buses = await storage.getAllBuses();
        res.json(buses);
      } catch (error) {
        console.error("Error fetching buses:", error);
        res.status(500).json({ message: "Failed to fetch buses" });
      }
    }
  );

  // Create a new bus
  app.post('/api/buses', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const busData = insertBusSchema.parse(req.body);
        const bus = await storage.createBus(busData);
        res.status(201).json(bus);
      } catch (error) {
        console.error("Error creating bus:", error);
        res.status(500).json({ message: "Failed to create bus" });
      }
    }
  );

  // Get all routes
  app.get('/api/routes', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const routes = await storage.getAllRoutes();
        res.json(routes);
      } catch (error) {
        console.error("Error fetching routes:", error);
        res.status(500).json({ message: "Failed to fetch routes" });
      }
    }
  );

  // Create a new route
  app.post('/api/routes', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const routeData = insertRouteSchema.parse(req.body);
        const route = await storage.createRoute(routeData);
        res.status(201).json(route);
      } catch (error) {
        console.error("Error creating route:", error);
        res.status(500).json({ message: "Failed to create route" });
      }
    }
  );

  // Add a stop to a route
  app.post('/api/routes/:routeId/stops', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const { routeId } = req.params;
        const stopData = insertStopSchema.parse({
          ...req.body,
          routeId: parseInt(routeId)
        });
        
        const stop = await storage.createStop(stopData);
        res.status(201).json(stop);
      } catch (error) {
        console.error("Error adding stop:", error);
        res.status(500).json({ message: "Failed to add stop to route" });
      }
    }
  );

  // Get all drivers
  app.get('/api/drivers', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const drivers = await storage.getUsersByRole(UserRole.DRIVER);
        res.json(drivers);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ message: "Failed to fetch drivers" });
      }
    }
  );

  // Get all students
  app.get('/api/students', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const students = await storage.getAllStudents();
        res.json(students);
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Failed to fetch students" });
      }
    }
  );

  // Create a new student
  app.post('/api/students', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const studentData = insertStudentSchema.parse(req.body);
        const student = await storage.createStudent(studentData);
        res.status(201).json(student);
      } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  );

  // Create a new trip
  app.post('/api/trips', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const tripData = insertTripSchema.parse(req.body);
        const trip = await storage.createTrip(tripData);
        res.status(201).json(trip);
      } catch (error) {
        console.error("Error creating trip:", error);
        res.status(500).json({ message: "Failed to create trip" });
      }
    }
  );

  // Add student to trip
  app.post('/api/trips/:tripId/students', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const { tripId } = req.params;
        const { studentId } = req.body;
        
        if (!studentId) {
          return res.status(400).json({ message: "Student ID is required" });
        }
        
        const studentTripData = insertStudentTripSchema.parse({
          tripId: parseInt(tripId),
          studentId: parseInt(studentId)
        });
        
        const studentTrip = await storage.addStudentToTrip(studentTripData);
        res.status(201).json(studentTrip);
      } catch (error) {
        console.error("Error adding student to trip:", error);
        res.status(500).json({ message: "Failed to add student to trip" });
      }
    }
  );

  // Get all incidents
  app.get('/api/incidents', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN]), 
    async (req, res) => {
      try {
        const incidents = await storage.getAllIncidents();
        res.json(incidents);
      } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).json({ message: "Failed to fetch incidents" });
      }
    }
  );

  // Get incident details
  app.get('/api/incidents/:incidentId', 
    isAuthenticated, 
    async (req: any, res) => {
      try {
        const { incidentId } = req.params;
        const incident = await storage.getIncidentById(parseInt(incidentId));
        
        if (!incident) {
          return res.status(404).json({ message: "Incident not found" });
        }
        
        // Check authorization - only admin, the reporter, or parents of involved students can view
        const user = await storage.getUser(req.user.claims.sub);
        if (user?.role !== UserRole.ADMIN && 
            incident.reportedBy !== req.user.claims.sub) {
          // Check if parent of involved student
          if (user?.role === UserRole.PARENT) {
            const involvedStudents = await storage.getStudentsByIncident(parseInt(incidentId));
            const userStudents = await storage.getStudentsByParentId(req.user.claims.sub);
            
            const isParentOfInvolved = involvedStudents.some(incidentStudent => 
              userStudents.some(userStudent => userStudent.id === incidentStudent.id)
            );
            
            if (!isParentOfInvolved) {
              return res.status(403).json({ message: "You do not have permission to view this incident" });
            }
          } else {
            return res.status(403).json({ message: "You do not have permission to view this incident" });
          }
        }
        
        res.json(incident);
      } catch (error) {
        console.error("Error fetching incident:", error);
        res.status(500).json({ message: "Failed to fetch incident" });
      }
    }
  );

  // Create a notification
  app.post('/api/notifications', 
    isAuthenticated, 
    authorizeRole([UserRole.ADMIN, UserRole.DRIVER]), 
    async (req, res) => {
      try {
        const notificationData = insertNotificationSchema.parse(req.body);
        const notification = await storage.createNotification(notificationData);
        res.status(201).json(notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Failed to create notification" });
      }
    }
  );

  // Create HTTP server and set up WebSocket
  const httpServer = createServer(app);
  setupWebSocketServer(httpServer);

  return httpServer;
}
