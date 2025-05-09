import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  dueDate: date("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
  dueDate: true,
});

// Deliverable schema
export const deliverables = pgTable("deliverables", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  points: integer("points"),  // If points are associated with a deliverable in the rubric
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliverableSchema = createInsertSchema(deliverables).pick({
  projectId: true,
  name: true,
  description: true,
  points: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  deliverableId: integer("deliverable_id").references(() => deliverables.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  priority: integer("priority").default(1), // 1 = low, 2 = medium, 3 = high
  estimatedMinutes: integer("estimated_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  deliverableId: true,
  name: true,
  description: true,
  dueDate: true,
  priority: true,
  estimatedMinutes: true,
});

// Availability schema to store user's available days
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  monday: boolean("monday").default(true),
  tuesday: boolean("tuesday").default(true),
  wednesday: boolean("wednesday").default(true),
  thursday: boolean("thursday").default(true),
  friday: boolean("friday").default(true),
  saturday: boolean("saturday").default(false),
  sunday: boolean("sunday").default(false),
  hoursPerDay: integer("hours_per_day").default(2),
});

export const insertAvailabilitySchema = createInsertSchema(availability).pick({
  projectId: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
  hoursPerDay: true,
});

// Types for the frontend
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = z.infer<typeof insertDeliverableSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

// Extended types for API responses
export type ProjectWithDeliverables = Project & {
  deliverables: Deliverable[];
};

export type DeliverableWithTasks = Deliverable & {
  tasks: Task[];
};

export type ProjectWithDetails = Project & {
  deliverables: DeliverableWithTasks[];
  availability: Availability;
};

// For the rubric analysis
export type RubricAnalysisResult = {
  deliverables: {
    name: string;
    description?: string;
    points?: number;
  }[];
};
