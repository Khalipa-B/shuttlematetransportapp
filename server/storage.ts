import {
  users,
  drivers,
  parents,
  students,
  buses,
  routes,
  stops,
  attendance,
  busLocations,
  notifications,
  messages,
  incidents,
  type User,
  type UpsertUser,
  type Driver,
  type Parent,
  type Student,
  type Bus,
  type Route,
  type Stop,
  type Attendance,
  type BusLocation,
  type Notification,
  type Message,
  type Incident,
  insertDriverSchema,
  insertParentSchema,
  insertStudentSchema,
  insertBusSchema,
  insertRouteSchema,
  insertStopSchema,
  insertAttendanceSchema,
  insertBusLocationSchema,
  insertNotificationSchema,
  insertMessageSchema,
  insertIncidentSchema,
} from "@shared/schema";

import { db } from "./db";
import { eq, and, gte, lte, desc, sql, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Driver operations
  getDriverById(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  createDriver(driver: typeof insertDriverSchema._type): Promise<Driver>;
  updateDriver(id: number, data: Partial<typeof insertDriverSchema._type>): Promise<Driver>;
  getAllDrivers(): Promise<Driver[]>;
  
  // Parent operations
  getParentById(id: number): Promise<Parent | undefined>;
  getParentByUserId(userId: string): Promise<Parent | undefined>;
  createParent(parent: typeof insertParentSchema._type): Promise<Parent>;
  updateParent(id: number, data: Partial<typeof insertParentSchema._type>): Promise<Parent>;
  getAllParents(): Promise<Parent[]>;
  
  // Student operations
  getStudentById(id: number): Promise<Student | undefined>;
  getStudentsByParentId(parentId: number): Promise<Student[]>;
  getStudentsByRouteId(routeId: number): Promise<Student[]>;
  createStudent(student: typeof insertStudentSchema._type): Promise<Student>;
  updateStudent(id: number, data: Partial<typeof insertStudentSchema._type>): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  
  // Bus operations
  getBusById(id: number): Promise<Bus | undefined>;
  getBusByNumber(busNumber: string): Promise<Bus | undefined>;
  createBus(bus: typeof insertBusSchema._type): Promise<Bus>;
  updateBus(id: number, data: Partial<typeof insertBusSchema._type>): Promise<Bus>;
  getAllBuses(): Promise<Bus[]>;
  
  // Route operations
  getRouteById(id: number): Promise<Route | undefined>;
  getRoutesByBusId(busId: number): Promise<Route[]>;
  createRoute(route: typeof insertRouteSchema._type): Promise<Route>;
  updateRoute(id: number, data: Partial<typeof insertRouteSchema._type>): Promise<Route>;
  getAllRoutes(): Promise<Route[]>;
  
  // Stop operations
  getStopById(id: number): Promise<Stop | undefined>;
  getStopsByRouteId(routeId: number): Promise<Stop[]>;
  createStop(stop: typeof insertStopSchema._type): Promise<Stop>;
  updateStop(id: number, data: Partial<typeof insertStopSchema._type>): Promise<Stop>;
  
  // Attendance operations
  getAttendanceById(id: number): Promise<Attendance | undefined>;
  getAttendanceByStudentAndDate(studentId: number, date: Date): Promise<Attendance | undefined>;
  getAttendanceByBusAndDate(busId: number, date: Date): Promise<Attendance[]>;
  createAttendance(attendance: typeof insertAttendanceSchema._type): Promise<Attendance>;
  updateAttendance(id: number, data: Partial<typeof insertAttendanceSchema._type>): Promise<Attendance>;
  
  // Bus Location operations
  getLatestBusLocation(busId: number): Promise<BusLocation | undefined>;
  createBusLocation(location: typeof insertBusLocationSchema._type): Promise<BusLocation>;
  
  // Notification operations
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  getUnreadNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: typeof insertNotificationSchema._type): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Message operations
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: typeof insertMessageSchema._type): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Incident operations
  getIncidentById(id: number): Promise<Incident | undefined>;
  getIncidentsByReporter(userId: string): Promise<Incident[]>;
  getIncidentsByBus(busId: number): Promise<Incident[]>;
  getIncidentsByRoute(routeId: number): Promise<Incident[]>;
  createIncident(incident: typeof insertIncidentSchema._type): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Driver operations
  async getDriverById(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async createDriver(driver: typeof insertDriverSchema._type): Promise<Driver> {
    const [createdDriver] = await db.insert(drivers).values(driver).returning();
    return createdDriver;
  }

  async updateDriver(id: number, data: Partial<typeof insertDriverSchema._type>): Promise<Driver> {
    const [updatedDriver] = await db
      .update(drivers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return updatedDriver;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers);
  }

  // Parent operations
  async getParentById(id: number): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }

  async getParentByUserId(userId: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.userId, userId));
    return parent;
  }

  async createParent(parent: typeof insertParentSchema._type): Promise<Parent> {
    const [createdParent] = await db.insert(parents).values(parent).returning();
    return createdParent;
  }

  async updateParent(id: number, data: Partial<typeof insertParentSchema._type>): Promise<Parent> {
    const [updatedParent] = await db
      .update(parents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parents.id, id))
      .returning();
    return updatedParent;
  }

  async getAllParents(): Promise<Parent[]> {
    return await db.select().from(parents);
  }

  // Student operations
  async getStudentById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  async getStudentsByRouteId(routeId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.routeId, routeId));
  }

  async createStudent(student: typeof insertStudentSchema._type): Promise<Student> {
    const [createdStudent] = await db.insert(students).values(student).returning();
    return createdStudent;
  }

  async updateStudent(id: number, data: Partial<typeof insertStudentSchema._type>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  // Bus operations
  async getBusById(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus;
  }

  async getBusByNumber(busNumber: string): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.busNumber, busNumber));
    return bus;
  }

  async createBus(bus: typeof insertBusSchema._type): Promise<Bus> {
    const [createdBus] = await db.insert(buses).values(bus).returning();
    return createdBus;
  }

  async updateBus(id: number, data: Partial<typeof insertBusSchema._type>): Promise<Bus> {
    const [updatedBus] = await db
      .update(buses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(buses.id, id))
      .returning();
    return updatedBus;
  }

  async getAllBuses(): Promise<Bus[]> {
    return await db.select().from(buses);
  }

  // Route operations
  async getRouteById(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async getRoutesByBusId(busId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.busId, busId));
  }

  async createRoute(route: typeof insertRouteSchema._type): Promise<Route> {
    const [createdRoute] = await db.insert(routes).values(route).returning();
    return createdRoute;
  }

  async updateRoute(id: number, data: Partial<typeof insertRouteSchema._type>): Promise<Route> {
    const [updatedRoute] = await db
      .update(routes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning();
    return updatedRoute;
  }

  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  // Stop operations
  async getStopById(id: number): Promise<Stop | undefined> {
    const [stop] = await db.select().from(stops).where(eq(stops.id, id));
    return stop;
  }

  async getStopsByRouteId(routeId: number): Promise<Stop[]> {
    return await db
      .select()
      .from(stops)
      .where(eq(stops.routeId, routeId))
      .orderBy(stops.order);
  }

  async createStop(stop: typeof insertStopSchema._type): Promise<Stop> {
    const [createdStop] = await db.insert(stops).values(stop).returning();
    return createdStop;
  }

  async updateStop(id: number, data: Partial<typeof insertStopSchema._type>): Promise<Stop> {
    const [updatedStop] = await db
      .update(stops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stops.id, id))
      .returning();
    return updatedStop;
  }

  // Attendance operations
  async getAttendanceById(id: number): Promise<Attendance | undefined> {
    const [attendance_record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendance_record;
  }

  async getAttendanceByStudentAndDate(studentId: number, date: Date): Promise<Attendance | undefined> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    
    const [attendance_record] = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, studentId),
          eq(attendance.date, formattedDate)
        )
      );
    
    return attendance_record;
  }

  async getAttendanceByBusAndDate(busId: number, date: Date): Promise<Attendance[]> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.busId, busId),
          eq(attendance.date, formattedDate)
        )
      );
  }

  async createAttendance(attendanceData: typeof insertAttendanceSchema._type): Promise<Attendance> {
    const [createdAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return createdAttendance;
  }

  async updateAttendance(id: number, data: Partial<typeof insertAttendanceSchema._type>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  // Bus Location operations
  async getLatestBusLocation(busId: number): Promise<BusLocation | undefined> {
    const [location] = await db
      .select()
      .from(busLocations)
      .where(eq(busLocations.busId, busId))
      .orderBy(desc(busLocations.timestamp))
      .limit(1);
    
    return location;
  }

  async createBusLocation(location: typeof insertBusLocationSchema._type): Promise<BusLocation> {
    const [createdLocation] = await db.insert(busLocations).values(location).returning();
    return createdLocation;
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: typeof insertNotificationSchema._type): Promise<Notification> {
    const [createdNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return createdNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Message operations
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        sql`(${messages.senderId} = ${userId1} AND ${messages.receiverId} = ${userId2}) OR
            (${messages.senderId} = ${userId2} AND ${messages.receiverId} = ${userId1})`
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(message: typeof insertMessageSchema._type): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    return createdMessage;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  // Incident operations
  async getIncidentById(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async getIncidentsByReporter(userId: string): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.reportedBy, userId))
      .orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByBus(busId: number): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.busId, busId))
      .orderBy(desc(incidents.createdAt));
  }

  async getIncidentsByRoute(routeId: number): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.routeId, routeId))
      .orderBy(desc(incidents.createdAt));
  }

  async createIncident(incident: typeof insertIncidentSchema._type): Promise<Incident> {
    const [createdIncident] = await db.insert(incidents).values(incident).returning();
    return createdIncident;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident> {
    const [updatedIncident] = await db
      .update(incidents)
      .set({ status, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    
    return updatedIncident;
  }
}

export const storage = new DatabaseStorage();
