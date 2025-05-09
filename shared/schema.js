import { z } from "zod";

// Define validation schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.number().int().positive(),
  dueDate: z.string().or(z.date()),
});

export const insertDeliverableSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  points: z.number().int().optional(),
});

export const insertTaskSchema = z.object({
  deliverableId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()),
  priority: z.number().int().min(1).max(3).default(1),
  estimatedMinutes: z.number().int().optional(),
});

export const insertAvailabilitySchema = z.object({
  projectId: z.number().int().positive(),
  monday: z.boolean().default(true),
  tuesday: z.boolean().default(true),
  wednesday: z.boolean().default(true),
  thursday: z.boolean().default(true),
  friday: z.boolean().default(true),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
  hoursPerDay: z.number().int().min(1).max(24).default(2),
});

// Table/collection names for reference
export const users = { name: "users" };
export const projects = { name: "projects" };
export const deliverables = { name: "deliverables" };
export const tasks = { name: "tasks" };
export const availability = { name: "availability" };

// Define the structure for the rubric analysis result
export const RubricAnalysisResultSchema = z.object({
  deliverables: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      points: z.number().int().optional(),
    })
  ),
});

// Type definitions are removed as they're TypeScript-specific
// In JavaScript, we can document the expected structure in comments:

/*
User: {
  id: number,
  username: string,
  password: string
}

Project: {
  id: number,
  name: string,
  description: string (optional),
  userId: number,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}

Deliverable: {
  id: number,
  projectId: number,
  name: string,
  description: string (optional),
  points: number (optional),
  createdAt: Date
}

Task: {
  id: number,
  deliverableId: number,
  name: string,
  description: string (optional),
  dueDate: Date,
  completed: boolean,
  priority: number (1=low, 2=medium, 3=high),
  estimatedMinutes: number (optional),
  createdAt: Date
}

Availability: {
  id: number,
  projectId: number,
  monday: boolean,
  tuesday: boolean,
  wednesday: boolean,
  thursday: boolean,
  friday: boolean,
  saturday: boolean,
  sunday: boolean,
  hoursPerDay: number
}

ProjectWithDeliverables: Project with an added deliverables array

DeliverableWithTasks: Deliverable with an added tasks array

ProjectWithDetails: Project with nested deliverables (that have tasks) and availability
*/