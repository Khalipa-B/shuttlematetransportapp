import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
  time,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
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
  ADMIN: "admin",
  DRIVER: "driver",
  PARENT: "parent",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: Object.values(UserRole) }).default(UserRole.PARENT),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  children: many(students),
  drivers: many(drivers),
  parents: many(parents),
}));

// Drivers table
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  licenseNumber: varchar("license_number").notNull(),
  licenseExpiry: date("license_expiry").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address"),
  status: varchar("status", { enum: ["active", "inactive", "on_leave"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  buses: many(buses),
}));

// Parents table
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  phone: varchar("phone").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  children: many(students),
}));

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: varchar("grade").notNull(),
  school: varchar("school").notNull(),
  parentId: integer("parent_id").notNull().references(() => parents.id),
  routeId: integer("route_id").references(() => routes.id),
  stopId: integer("stop_id").references(() => stops.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  route: one(routes, {
    fields: [students.routeId],
    references: [routes.id],
  }),
  stop: one(stops, {
    fields: [students.stopId],
    references: [stops.id],
  }),
  attendance: many(attendance),
}));

// Buses table
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: varchar("bus_number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  licenseNumber: varchar("license_number").notNull().unique(),
  status: varchar("status", { enum: ["active", "maintenance", "inactive"] }).default("active"),
  driverId: integer("driver_id").references(() => drivers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const busesRelations = relations(buses, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [buses.driverId],
    references: [drivers.id],
  }),
  routes: many(routes),
}));

// Routes table
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  busId: integer("bus_id").references(() => buses.id),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routesRelations = relations(routes, ({ one, many }) => ({
  bus: one(buses, {
    fields: [routes.busId],
    references: [buses.id],
  }),
  stops: many(stops),
  students: many(students),
}));

// Stops table
export const stops = pgTable("stops", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude").notNull(),
  longitude: varchar("longitude").notNull(),
  routeId: integer("route_id").notNull().references(() => routes.id),
  order: integer("order").notNull(),
  estimatedArrival: time("estimated_arrival"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stopsRelations = relations(stops, ({ one, many }) => ({
  route: one(routes, {
    fields: [stops.routeId],
    references: [routes.id],
  }),
  students: many(students),
}));

// Attendance (check-in/check-out) table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  busId: integer("bus_id").notNull().references(() => buses.id),
  routeId: integer("route_id").notNull().references(() => routes.id),
  date: date("date").notNull(),
  boardedAt: timestamp("boarded_at"),
  droppedOffAt: timestamp("dropped_off_at"),
  status: varchar("status", { enum: ["present", "absent", "late"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    studentDateIdx: uniqueIndex("student_date_idx").on(table.studentId, table.date),
  };
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  bus: one(buses, {
    fields: [attendance.busId],
    references: [buses.id],
  }),
  route: one(routes, {
    fields: [attendance.routeId],
    references: [routes.id],
  }),
}));

// Bus locations for real-time tracking
export const busLocations = pgTable("bus_locations", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull().references(() => buses.id),
  latitude: varchar("latitude").notNull(),
  longitude: varchar("longitude").notNull(),
  speed: integer("speed"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const busLocationsRelations = relations(busLocations, ({ one }) => ({
  bus: one(buses, {
    fields: [busLocations.busId],
    references: [buses.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["info", "warning", "success", "error"] }).default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Messages table for in-app chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

// Incidents table for reporting issues
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  busId: integer("bus_id").references(() => buses.id),
  routeId: integer("route_id").references(() => routes.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { enum: ["accident", "breakdown", "delay", "behavior", "other"] }).notNull(),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  status: varchar("status", { enum: ["reported", "investigating", "resolved"] }).default("reported"),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const incidentsRelations = relations(incidents, ({ one }) => ({
  reporter: one(users, {
    fields: [incidents.reportedBy],
    references: [users.id],
  }),
  bus: one(buses, {
    fields: [incidents.busId],
    references: [buses.id],
  }),
  route: one(routes, {
    fields: [incidents.routeId],
    references: [routes.id],
  }),
}));

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Parent = typeof parents.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Bus = typeof buses.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Stop = typeof stops.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type BusLocation = typeof busLocations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Incident = typeof incidents.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertDriverSchema = createInsertSchema(drivers);
export const insertParentSchema = createInsertSchema(parents);
export const insertStudentSchema = createInsertSchema(students);
export const insertBusSchema = createInsertSchema(buses);
export const insertRouteSchema = createInsertSchema(routes);
export const insertStopSchema = createInsertSchema(stops);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertBusLocationSchema = createInsertSchema(busLocations);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertMessageSchema = createInsertSchema(messages);
export const insertIncidentSchema = createInsertSchema(incidents);
