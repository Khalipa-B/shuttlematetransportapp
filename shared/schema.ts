import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
  real,
  json,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const UserRole = {
  PARENT: "parent",
  DRIVER: "driver",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  role: varchar("role").default(UserRole.PARENT).notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Buses table
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: varchar("bus_number").unique().notNull(),
  capacity: integer("capacity").notNull(),
  licenseNumber: varchar("license_number").unique(),
  model: varchar("model"),
  year: integer("year"),
  isActive: boolean("is_active").default(true),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bus status types
export const BusStatus = {
  IN_TRANSIT: "in_transit",
  AT_SCHOOL: "at_school",
  COMPLETED: "completed",
  DELAYED: "delayed",
  INACTIVE: "inactive",
} as const;

export type BusStatusType = (typeof BusStatus)[keyof typeof BusStatus];

// Routes table
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  schedule: text("schedule"), // e.g., "Morning", "Afternoon"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stops table
export const stops = pgTable("stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull().references(() => routes.id),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  sequence: integer("sequence").notNull(), // order of stops in route
  estimatedArrival: varchar("estimated_arrival"), // time of day in 24hr format
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: varchar("grade").notNull(),
  studentId: varchar("student_id").unique().notNull(),
  parentId: varchar("parent_id").references(() => users.id),
  routeId: integer("route_id").references(() => routes.id),
  stopId: integer("stop_id").references(() => stops.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trip status types
export const TripStatus = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TripStatusType = (typeof TripStatus)[keyof typeof TripStatus];

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull().references(() => routes.id),
  busId: integer("bus_id").notNull().references(() => buses.id),
  driverId: varchar("driver_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status").default(TripStatus.SCHEDULED).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student status types
export const StudentStatus = {
  SCHEDULED: "scheduled",
  BOARDED: "boarded",
  ABSENT: "absent",
  EXITED: "exited",
} as const;

export type StudentStatusType = (typeof StudentStatus)[keyof typeof StudentStatus];

// Student trip attendance
export const studentTrips = pgTable("student_trips", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  studentId: integer("student_id").notNull().references(() => students.id),
  status: varchar("status").default(StudentStatus.SCHEDULED).notNull(),
  boardingTime: timestamp("boarding_time"),
  exitTime: timestamp("exit_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bus locations (for real-time tracking)
export const busLocations = pgTable("bus_locations", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull().references(() => buses.id),
  tripId: integer("trip_id").references(() => trips.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  speed: real("speed"),
  bearing: real("bearing"),
  status: varchar("status").default(BusStatus.IN_TRANSIT),
});

// Incident types
export const IncidentType = {
  BEHAVIOR: "behavior",
  MEDICAL: "medical",
  VEHICLE: "vehicle",
  ROUTE: "route",
  OTHER: "other",
} as const;

export type IncidentTypeType = (typeof IncidentType)[keyof typeof IncidentType];

// Incident severity
export const IncidentSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type IncidentSeverityType = (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

// Incidents table
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id),
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  incidentType: varchar("incident_type").notNull(),
  severity: varchar("severity").notNull(),
  dateTime: timestamp("date_time").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  actionTaken: text("action_taken"),
  isResolved: boolean("is_resolved").default(false),
  attachments: json("attachments"), // Array of URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student incident relations
export const studentIncidents = pgTable("student_incidents", {
  incidentId: integer("incident_id").notNull().references(() => incidents.id),
  studentId: integer("student_id").notNull().references(() => students.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.incidentId, table.studentId] }),
  };
});

// Notification types
export const NotificationType = {
  BUS_ARRIVAL: "bus_arrival",
  BUS_DEPARTURE: "bus_departure",
  BUS_DELAY: "bus_delay",
  STUDENT_BOARDED: "student_boarded",
  STUDENT_EXITED: "student_exited",
  INCIDENT: "incident",
  ROUTE_CHANGE: "route_change",
  SCHEDULE_CHANGE: "schedule_change",
  MESSAGE: "message",
  OTHER: "other",
} as const;

export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  relatedEntityType: varchar("related_entity_type"), // 'trip', 'student', 'incident', etc.
  relatedEntityId: integer("related_entity_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table for chat functionality
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusSchema = createInsertSchema(buses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStopSchema = createInsertSchema(stops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentTripSchema = createInsertSchema(studentTrips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusLocationSchema = createInsertSchema(busLocations).omit({
  id: true,
  timestamp: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentIncidentSchema = createInsertSchema(studentIncidents);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertBus = typeof buses.$inferInsert;
export type Bus = typeof buses.$inferSelect;

export type InsertRoute = typeof routes.$inferInsert;
export type Route = typeof routes.$inferSelect;

export type InsertStop = typeof stops.$inferInsert;
export type Stop = typeof stops.$inferSelect;

export type InsertStudent = typeof students.$inferInsert;
export type Student = typeof students.$inferSelect;

export type InsertTrip = typeof trips.$inferInsert;
export type Trip = typeof trips.$inferSelect;

export type InsertStudentTrip = typeof studentTrips.$inferInsert;
export type StudentTrip = typeof studentTrips.$inferSelect;

export type InsertBusLocation = typeof busLocations.$inferInsert;
export type BusLocation = typeof busLocations.$inferSelect;

export type InsertIncident = typeof incidents.$inferInsert;
export type Incident = typeof incidents.$inferSelect;

export type InsertStudentIncident = typeof studentIncidents.$inferInsert;
export type StudentIncident = typeof studentIncidents.$inferSelect;

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export type InsertMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;
