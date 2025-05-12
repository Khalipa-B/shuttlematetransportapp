import {
  users,
  roles,
  students,
  studentParentRelations,
  buses,
  routes,
  stops,
  studentStopAssignments,
  studentCheckIns,
  busLocations,
  incidents,
  incidentStudents,
  notifications,
  messages,
  notificationSettings,
  type User,
  type UpsertUser,
  type Role,
  type InsertRole,
  type Student,
  type InsertStudent,
  type StudentParentRelation,
  type InsertStudentParentRelation,
  type Bus,
  type InsertBus,
  type Route,
  type InsertRoute,
  type Stop,
  type InsertStop,
  type StudentStopAssignment,
  type InsertStudentStopAssignment,
  type StudentCheckIn,
  type InsertStudentCheckIn,
  type BusLocation,
  type InsertBusLocation,
  type Incident,
  type InsertIncident,
  type IncidentStudent,
  type InsertIncidentStudent,
  type Notification,
  type InsertNotification,
  type Message,
  type InsertMessage,
  type NotificationSettings,
  type InsertNotificationSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, like, ilike, asc, isNull, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(roleId: number): Promise<User[]>;
  
  // Role operations
  createRole(role: InsertRole): Promise<Role>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  
  // Student operations
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentsByParentId(parentId: string): Promise<Student[]>;
  getAllStudents(): Promise<Student[]>;
  
  // Student-Parent relation operations
  createStudentParentRelation(relation: InsertStudentParentRelation): Promise<StudentParentRelation>;
  getStudentParentRelations(studentId: number): Promise<StudentParentRelation[]>;
  
  // Bus operations
  createBus(bus: InsertBus): Promise<Bus>;
  getBus(id: number): Promise<Bus | undefined>;
  getBusByNumber(busNumber: string): Promise<Bus | undefined>;
  getAllBuses(): Promise<Bus[]>;
  updateBusStatus(id: number, status: string): Promise<Bus>;
  
  // Route operations
  createRoute(route: InsertRoute): Promise<Route>;
  getRoute(id: number): Promise<Route | undefined>;
  getRoutesByBusId(busId: number): Promise<Route[]>;
  getRoutesByDriverId(driverId: string): Promise<Route[]>;
  getActiveRoutes(): Promise<Route[]>;
  
  // Stop operations
  createStop(stop: InsertStop): Promise<Stop>;
  getStop(id: number): Promise<Stop | undefined>;
  getStopsByRouteId(routeId: number): Promise<Stop[]>;
  
  // Student-Stop assignment operations
  createStudentStopAssignment(assignment: InsertStudentStopAssignment): Promise<StudentStopAssignment>;
  getStudentStopAssignmentsByStudentId(studentId: number): Promise<StudentStopAssignment[]>;
  getStudentStopAssignmentsByStopId(stopId: number): Promise<StudentStopAssignment[]>;
  
  // Student check-in operations
  createStudentCheckIn(checkIn: InsertStudentCheckIn): Promise<StudentCheckIn>;
  updateStudentCheckOut(id: number, checkOutTime: Date, status: string): Promise<StudentCheckIn>;
  getStudentCheckInsByRouteId(routeId: number): Promise<StudentCheckIn[]>;
  getStudentCheckInsByStudentId(studentId: number): Promise<StudentCheckIn[]>;
  getActiveStudentCheckIns(routeId: number): Promise<StudentCheckIn[]>;
  
  // Bus location operations
  createBusLocation(location: InsertBusLocation): Promise<BusLocation>;
  getLatestBusLocation(busId: number): Promise<BusLocation | undefined>;
  getBusLocationsByRouteId(routeId: number): Promise<BusLocation[]>;
  
  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: number): Promise<Incident | undefined>;
  getIncidentsByRouteId(routeId: number): Promise<Incident[]>;
  getIncidentsByBusId(busId: number): Promise<Incident[]>;
  getIncidentsByReporterId(reporterId: string): Promise<Incident[]>;
  
  // Incident-Student relation operations
  addStudentToIncident(incidentStudent: InsertIncidentStudent): Promise<IncidentStudent>;
  getStudentsByIncidentId(incidentId: number): Promise<IncidentStudent[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
  getUnreadMessagesCount(userId: string): Promise<number>;
  markMessageAsRead(id: string): Promise<Message>;
  
  // Notification settings operations
  createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
  getNotificationSettings(userId: string): Promise<NotificationSettings | undefined>;
  updateNotificationSettings(userId: string, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
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

  async getUsersByRole(roleId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.roleId, roleId));
  }

  // Role operations
  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  // Student operations
  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student;
  }

  async getStudentsByParentId(parentId: string): Promise<Student[]> {
    const relations = await db.select()
      .from(studentParentRelations)
      .where(eq(studentParentRelations.parentId, parentId));
    
    if (relations.length === 0) {
      return [];
    }
    
    const studentIds = relations.map(r => r.studentId);
    return await db.select()
      .from(students)
      .where(inArray(students.id, studentIds));
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  // Student-Parent relation operations
  async createStudentParentRelation(relation: InsertStudentParentRelation): Promise<StudentParentRelation> {
    const [newRelation] = await db.insert(studentParentRelations).values(relation).returning();
    return newRelation;
  }

  async getStudentParentRelations(studentId: number): Promise<StudentParentRelation[]> {
    return await db.select()
      .from(studentParentRelations)
      .where(eq(studentParentRelations.studentId, studentId));
  }

  // Bus operations
  async createBus(bus: InsertBus): Promise<Bus> {
    const [newBus] = await db.insert(buses).values(bus).returning();
    return newBus;
  }

  async getBus(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus;
  }

  async getBusByNumber(busNumber: string): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.busNumber, busNumber));
    return bus;
  }

  async getAllBuses(): Promise<Bus[]> {
    return await db.select().from(buses);
  }

  async updateBusStatus(id: number, status: string): Promise<Bus> {
    const [updatedBus] = await db.update(buses)
      .set({ status, updatedAt: new Date() })
      .where(eq(buses.id, id))
      .returning();
    return updatedBus;
  }

  // Route operations
  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async getRoutesByBusId(busId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.busId, busId));
  }

  async getRoutesByDriverId(driverId: string): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.driverId, driverId));
  }

  async getActiveRoutes(): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.active, true));
  }

  // Stop operations
  async createStop(stop: InsertStop): Promise<Stop> {
    const [newStop] = await db.insert(stops).values(stop).returning();
    return newStop;
  }

  async getStop(id: number): Promise<Stop | undefined> {
    const [stop] = await db.select().from(stops).where(eq(stops.id, id));
    return stop;
  }

  async getStopsByRouteId(routeId: number): Promise<Stop[]> {
    return await db.select()
      .from(stops)
      .where(eq(stops.routeId, routeId))
      .orderBy(asc(stops.stopOrder));
  }

  // Student-Stop assignment operations
  async createStudentStopAssignment(assignment: InsertStudentStopAssignment): Promise<StudentStopAssignment> {
    const [newAssignment] = await db.insert(studentStopAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getStudentStopAssignmentsByStudentId(studentId: number): Promise<StudentStopAssignment[]> {
    return await db.select()
      .from(studentStopAssignments)
      .where(eq(studentStopAssignments.studentId, studentId));
  }

  async getStudentStopAssignmentsByStopId(stopId: number): Promise<StudentStopAssignment[]> {
    return await db.select()
      .from(studentStopAssignments)
      .where(eq(studentStopAssignments.stopId, stopId));
  }

  // Student check-in operations
  async createStudentCheckIn(checkIn: InsertStudentCheckIn): Promise<StudentCheckIn> {
    const [newCheckIn] = await db.insert(studentCheckIns).values(checkIn).returning();
    return newCheckIn;
  }

  async updateStudentCheckOut(id: number, checkOutTime: Date, status: string): Promise<StudentCheckIn> {
    const [updatedCheckIn] = await db.update(studentCheckIns)
      .set({ checkOutTime, status })
      .where(eq(studentCheckIns.id, id))
      .returning();
    return updatedCheckIn;
  }

  async getStudentCheckInsByRouteId(routeId: number): Promise<StudentCheckIn[]> {
    return await db.select()
      .from(studentCheckIns)
      .where(eq(studentCheckIns.routeId, routeId))
      .orderBy(desc(studentCheckIns.checkInTime));
  }

  async getStudentCheckInsByStudentId(studentId: number): Promise<StudentCheckIn[]> {
    return await db.select()
      .from(studentCheckIns)
      .where(eq(studentCheckIns.studentId, studentId))
      .orderBy(desc(studentCheckIns.checkInTime));
  }

  async getActiveStudentCheckIns(routeId: number): Promise<StudentCheckIn[]> {
    return await db.select()
      .from(studentCheckIns)
      .where(
        and(
          eq(studentCheckIns.routeId, routeId),
          isNull(studentCheckIns.checkOutTime)
        )
      );
  }

  // Bus location operations
  async createBusLocation(location: InsertBusLocation): Promise<BusLocation> {
    const [newLocation] = await db.insert(busLocations).values(location).returning();
    return newLocation;
  }

  async getLatestBusLocation(busId: number): Promise<BusLocation | undefined> {
    const [location] = await db.select()
      .from(busLocations)
      .where(eq(busLocations.busId, busId))
      .orderBy(desc(busLocations.timestamp))
      .limit(1);
    return location;
  }

  async getBusLocationsByRouteId(routeId: number): Promise<BusLocation[]> {
    return await db.select()
      .from(busLocations)
      .where(eq(busLocations.routeId, routeId))
      .orderBy(desc(busLocations.timestamp));
  }

  // Incident operations
  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async getIncidentsByRouteId(routeId: number): Promise<Incident[]> {
    return await db.select()
      .from(incidents)
      .where(eq(incidents.routeId, routeId))
      .orderBy(desc(incidents.timestamp));
  }

  async getIncidentsByBusId(busId: number): Promise<Incident[]> {
    return await db.select()
      .from(incidents)
      .where(eq(incidents.busId, busId))
      .orderBy(desc(incidents.timestamp));
  }

  async getIncidentsByReporterId(reporterId: string): Promise<Incident[]> {
    return await db.select()
      .from(incidents)
      .where(eq(incidents.reportedBy, reporterId))
      .orderBy(desc(incidents.timestamp));
  }

  // Incident-Student relation operations
  async addStudentToIncident(incidentStudent: InsertIncidentStudent): Promise<IncidentStudent> {
    const [newIncidentStudent] = await db.insert(incidentStudents).values(incidentStudent).returning();
    return newIncidentStudent;
  }

  async getStudentsByIncidentId(incidentId: number): Promise<IncidentStudent[]> {
    return await db.select()
      .from(incidentStudents)
      .where(eq(incidentStudents.incidentId, incidentId));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.timestamp));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(asc(messages.timestamp));
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const unreadMessages = await db.select()
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );
    return unreadMessages.length;
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const [updatedMessage] = await db.update(messages)
      .set({ read: true, readAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Notification settings operations
  async createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings> {
    const [newSettings] = await db.insert(notificationSettings).values(settings).returning();
    return newSettings;
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    const [settings] = await db.select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    return settings;
  }

  async updateNotificationSettings(userId: string, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    const [updatedSettings] = await db.update(notificationSettings)
      .set(settings)
      .where(eq(notificationSettings.userId, userId))
      .returning();
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();
