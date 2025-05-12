import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { 
  insertAttendanceSchema, 
  insertBusSchema, 
  insertRouteSchema, 
  insertBusLocationSchema, 
  insertStudentSchema, 
  insertIncidentSchema, 
  insertNotificationSchema,
  insertMessageSchema,
  UserRole
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients by user ID
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    // Authenticate connection
    const userId = req.url?.split('=')[1];
    if (!userId) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Store client connection
    clients.set(userId, ws);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different types of WebSocket messages
        if (data.type === 'message' && data.receiverId && data.content) {
          // Store message in database
          const newMessage = await storage.createMessage({
            senderId: userId,
            receiverId: data.receiverId,
            message: data.content,
            isRead: false
          });

          // Send to recipient if online
          const recipientWs = clients.get(data.receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              data: newMessage
            }));
          }
        } 
        else if (data.type === 'bus-location' && data.busId) {
          // Create bus location record
          const location = await storage.createBusLocation({
            busId: data.busId,
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed || 0,
            timestamp: new Date(),
            isActive: true
          });

          // Broadcast to all relevant clients (those tracking this bus)
          for (const [clientId, clientWs] of clients.entries()) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'bus-location-update',
                data: {
                  busId: data.busId,
                  location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: new Date(),
                    speed: data.speed
                  }
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Parent routes
  app.get('/api/parent/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.PARENT) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const parent = await storage.getParentByUserId(userId);
      res.json({ user, parent });
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/parent/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.PARENT) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const parent = await storage.getParentByUserId(userId);
      if (!parent) {
        return res.status(404).json({ message: "Parent record not found" });
      }
      
      const children = await storage.getStudentsByParentId(parent.id);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.get('/api/parent/bus-location/:routeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.PARENT) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const routeId = parseInt(req.params.routeId);
      const route = await storage.getRouteById(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      if (!route.busId) {
        return res.status(404).json({ message: "No bus assigned to this route" });
      }
      
      const location = await storage.getLatestBusLocation(route.busId);
      res.json(location);
    } catch (error) {
      console.error("Error fetching bus location:", error);
      res.status(500).json({ message: "Failed to fetch bus location" });
    }
  });

  app.get('/api/parent/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/parent/mark-notification-read/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Driver routes
  app.get('/api/driver/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      res.json({ user, driver });
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/driver/bus', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      
      const buses = await storage.getAllBuses();
      const assignedBus = buses.find(bus => bus.driverId === driver.id);
      
      if (!assignedBus) {
        return res.status(404).json({ message: "No bus assigned" });
      }
      
      res.json(assignedBus);
    } catch (error) {
      console.error("Error fetching assigned bus:", error);
      res.status(500).json({ message: "Failed to fetch bus" });
    }
  });

  app.get('/api/driver/routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }
      
      const buses = await storage.getAllBuses();
      const assignedBus = buses.find(bus => bus.driverId === driver.id);
      
      if (!assignedBus) {
        return res.status(404).json({ message: "No bus assigned" });
      }
      
      const routes = await storage.getRoutesByBusId(assignedBus.id);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get('/api/driver/route/:routeId/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const routeId = parseInt(req.params.routeId);
      const students = await storage.getStudentsByRouteId(routeId);
      
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/driver/route/:routeId/stops', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const routeId = parseInt(req.params.routeId);
      const stops = await storage.getStopsByRouteId(routeId);
      
      res.json(stops);
    } catch (error) {
      console.error("Error fetching stops:", error);
      res.status(500).json({ message: "Failed to fetch stops" });
    }
  });

  app.post('/api/driver/check-in', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const attendanceData = attendanceSchema.parse(req.body);
      
      // Check if student exists
      const student = await storage.getStudentById(attendanceData.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Check if already checked in
      const existing = await storage.getAttendanceByStudentAndDate(
        attendanceData.studentId, 
        new Date()
      );
      
      if (existing) {
        // Update existing record
        const updated = await storage.updateAttendance(existing.id, {
          boardedAt: new Date(),
          status: 'present'
        });
        
        // Send notification to parent
        const parent = await storage.getParentById(student.parentId);
        if (parent) {
          await storage.createNotification({
            userId: parent.userId,
            title: "Check-in Notification",
            message: `${student.firstName} ${student.lastName} has boarded the bus.`,
            type: "success",
            isRead: false
          });
        }
        
        return res.json(updated);
      }
      
      // Create new attendance record
      const created = await storage.createAttendance({
        studentId: attendanceData.studentId,
        busId: attendanceData.busId,
        routeId: attendanceData.routeId,
        date: new Date(),
        boardedAt: new Date(),
        status: 'present'
      });
      
      // Send notification to parent
      const parent = await storage.getParentById(student.parentId);
      if (parent) {
        await storage.createNotification({
          userId: parent.userId,
          title: "Check-in Notification",
          message: `${student.firstName} ${student.lastName} has boarded the bus.`,
          type: "success",
          isRead: false
        });
      }
      
      res.json(created);
    } catch (error) {
      console.error("Error checking in student:", error);
      res.status(500).json({ message: "Failed to check in student" });
    }
  });

  app.post('/api/driver/check-out', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const { studentId } = req.body;
      
      // Validate the request
      if (!studentId) {
        return res.status(400).json({ message: "Student ID is required" });
      }
      
      // Check if student exists
      const student = await storage.getStudentById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Check if student has been checked in today
      const today = new Date();
      const attendance = await storage.getAttendanceByStudentAndDate(studentId, today);
      
      if (!attendance) {
        return res.status(400).json({ message: "Student has not been checked in today" });
      }
      
      // Update attendance with drop-off time
      const updated = await storage.updateAttendance(attendance.id, {
        droppedOffAt: new Date()
      });
      
      // Send notification to parent
      const parent = await storage.getParentById(student.parentId);
      if (parent) {
        await storage.createNotification({
          userId: parent.userId,
          title: "Drop-off Notification",
          message: `${student.firstName} ${student.lastName} has been dropped off.`,
          type: "success",
          isRead: false
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error checking out student:", error);
      res.status(500).json({ message: "Failed to check out student" });
    }
  });

  app.post('/api/driver/update-location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const locationData = locationSchema.parse(req.body);
      
      // Create new location record
      const location = await storage.createBusLocation({
        busId: locationData.busId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed || 0,
        timestamp: new Date(),
        isActive: true
      });
      
      res.json(location);
    } catch (error) {
      console.error("Error updating bus location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.post('/api/driver/report-incident', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const incidentData = incidentSchema.parse(req.body);
      
      // Create incident
      const incident = await storage.createIncident({
        ...incidentData,
        reportedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Notify admin users
      const admins = await storage.getUsersByRole(UserRole.ADMIN);
      
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          title: `Incident Report: ${incidentData.type}`,
          message: incidentData.title,
          type: "error",
          isRead: false
        });
      }
      
      res.json(incident);
    } catch (error) {
      console.error("Error reporting incident:", error);
      res.status(500).json({ message: "Failed to report incident" });
    }
  });

  app.post('/api/driver/report-delay', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.DRIVER) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const { routeId, delayMinutes, reason } = req.body;
      
      // Validate inputs
      if (!routeId || !delayMinutes || !reason) {
        return res.status(400).json({ message: "Route ID, delay minutes, and reason are required" });
      }
      
      // Get route details
      const route = await storage.getRouteById(routeId);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      // Get students on this route
      const students = await storage.getStudentsByRouteId(routeId);
      
      // Create incident record
      const incident = await storage.createIncident({
        reportedBy: userId,
        routeId,
        busId: route.busId,
        title: `Delay: ${delayMinutes} minutes`,
        description: reason,
        type: "delay",
        severity: delayMinutes > 15 ? "medium" : "low",
        status: "reported"
      });
      
      // Notify admin users
      const admins = await storage.getUsersByRole(UserRole.ADMIN);
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          title: `Route Delay Reported`,
          message: `Route ${route.name} is delayed by ${delayMinutes} minutes: ${reason}`,
          type: "warning",
          isRead: false
        });
      }
      
      // Notify parents of students on this route
      for (const student of students) {
        const parent = await storage.getParentById(student.parentId);
        if (parent) {
          await storage.createNotification({
            userId: parent.userId,
            title: "Bus Delay Notification",
            message: `Bus for route ${route.name} is delayed by ${delayMinutes} minutes. Reason: ${reason}`,
            type: "warning",
            isRead: false
          });
        }
      }
      
      res.json({ success: true, incident });
    } catch (error) {
      console.error("Error reporting delay:", error);
      res.status(500).json({ message: "Failed to report delay" });
    }
  });

  // Admin routes
  app.get('/api/admin/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      // Get counts of various entities
      const buses = await storage.getAllBuses();
      const totalBuses = buses.length;
      const activeBuses = buses.filter(bus => bus.status === 'active').length;
      const inMaintenanceBuses = buses.filter(bus => bus.status === 'maintenance').length;
      
      const drivers = await storage.getAllDrivers();
      const totalDrivers = drivers.length;
      const activeDrivers = drivers.filter(driver => driver.status === 'active').length;
      const onLeaveDrivers = drivers.filter(driver => driver.status === 'on_leave').length;
      
      const students = await storage.getAllStudents();
      const totalStudents = students.length;
      const activeStudents = students.filter(student => student.isActive).length;
      
      const routes = await storage.getAllRoutes();
      const totalRoutes = routes.length;
      const activeRoutes = routes.filter(route => route.isActive).length;
      
      // Get today's attendance for absence count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const absentStudentsCount = totalStudents - activeStudents;
      
      res.json({
        buses: {
          total: totalBuses,
          active: activeBuses,
          maintenance: inMaintenanceBuses
        },
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          onLeave: onLeaveDrivers
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          absent: absentStudentsCount
        },
        routes: {
          total: totalRoutes,
          active: activeRoutes
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get('/api/admin/buses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const buses = await storage.getAllBuses();
      res.json(buses);
    } catch (error) {
      console.error("Error fetching buses:", error);
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.post('/api/admin/buses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const busData = busSchema.parse(req.body);
      const bus = await storage.createBus(busData);
      
      res.json(bus);
    } catch (error) {
      console.error("Error creating bus:", error);
      res.status(500).json({ message: "Failed to create bus" });
    }
  });

  app.put('/api/admin/buses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const busId = parseInt(req.params.id);
      const busData = req.body;
      
      const bus = await storage.updateBus(busId, busData);
      res.json(bus);
    } catch (error) {
      console.error("Error updating bus:", error);
      res.status(500).json({ message: "Failed to update bus" });
    }
  });

  app.get('/api/admin/drivers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get('/api/admin/parents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const parents = await storage.getAllParents();
      res.json(parents);
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Failed to fetch parents" });
    }
  });

  app.get('/api/admin/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/admin/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const studentData = studentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.get('/api/admin/routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post('/api/admin/routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const routeData = routeSchema.parse(req.body);
      const route = await storage.createRoute(routeData);
      
      res.json(route);
    } catch (error) {
      console.error("Error creating route:", error);
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  app.get('/api/admin/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      // Get all incidents
      // Could filter by status, bus, route, etc. with query params
      
      const incidents = [];
      const buses = await storage.getAllBuses();
      
      for (const bus of buses) {
        const busIncidents = await storage.getIncidentsByBus(bus.id);
        incidents.push(...busIncidents);
      }
      
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.put('/api/admin/incidents/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const { status } = req.body;
      const incidentId = parseInt(req.params.id);
      
      if (!status || !['reported', 'investigating', 'resolved'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const incident = await storage.updateIncidentStatus(incidentId, status);
      res.json(incident);
    } catch (error) {
      console.error("Error updating incident status:", error);
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Shared routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/unread-notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUnreadNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationId = parseInt(req.params.id);
      
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get('/api/messages/:receiverId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const receiverId = req.params.receiverId;
      
      const messages = await storage.getMessagesBetweenUsers(userId, receiverId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Zod schemas for validation
  const attendanceSchema = z.object({
    studentId: z.number(),
    busId: z.number(),
    routeId: z.number()
  });

  const locationSchema = z.object({
    busId: z.number(),
    latitude: z.string(),
    longitude: z.string(),
    speed: z.number().optional()
  });

  const incidentSchema = z.object({
    busId: z.number().optional(),
    routeId: z.number().optional(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['accident', 'breakdown', 'delay', 'behavior', 'other']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    latitude: z.string().optional(),
    longitude: z.string().optional()
  });

  const busSchema = insertBusSchema.extend({});
  const routeSchema = insertRouteSchema.extend({});
  const studentSchema = insertStudentSchema.extend({});

  return httpServer;
}
