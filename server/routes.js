import { createServer } from "http";
import express from "express";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertDeliverableSchema, 
  insertTaskSchema, 
  insertAvailabilitySchema,
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import fs from "fs";

// Simple NLP functions for rubric analysis
function analyzeRubric(text) {
  // Basic splitting by lines and looking for numbered items
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const deliverables = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for lines that start with numbers followed by colon or dot
    // or those that have clear deliverable indicators
    if (/^(\d+[\.:])/.test(line) || 
        /deliverable|feature|requirement|task|implement|create|develop/i.test(line)) {
      
      // Extract the name (remove any leading numbers and symbols)
      const name = line.replace(/^(\d+[\.:]\s*)/, '').trim();
      
      // Try to get description from next line if it exists
      const description = i + 1 < lines.length ? lines[i + 1].trim() : undefined;
      
      // Try to extract points if mentioned
      const pointsMatch = line.match(/(\d+)\s*points?/i);
      const points = pointsMatch ? parseInt(pointsMatch[1]) : undefined;
      
      deliverables.push({
        name,
        description: description && !description.startsWith('- ') ? description : undefined,
        points
      });
    }
  }
  
  return { deliverables };
}

function breakdownDeliverableIntoTasks(deliverableName) {
  // Create a basic set of tasks for a deliverable
  const standardTasks = [
    `Research ${deliverableName.split(' ').slice(0, 3).join(' ')}`,
    `Plan implementation approach for ${deliverableName.split(' ').slice(0, 3).join(' ')}`,
    `Implement core functionality for ${deliverableName.split(' ').slice(0, 3).join(' ')}`,
    `Test and debug ${deliverableName.split(' ').slice(0, 3).join(' ')}`,
    `Finalize and document ${deliverableName.split(' ').slice(0, 3).join(' ')}`
  ];
  
  return standardTasks;
}

export async function registerRoutes(app) {
  // Error handler middleware for Zod validation errors
  const handleZodError = (err, res) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        error: "Validation Error", 
        details: validationError.message 
      });
    }
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  };

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Rubric analysis endpoint
  app.post('/api/analyze-rubric', (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1)
      });
      
      const { text } = schema.parse(req.body);
      const analysisResult = analyzeRubric(text);
      
      res.json(analysisResult);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Project Routes
  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const userIdSchema = z.object({
        userId: z.string().transform(val => parseInt(val))
      });
      
      const { userId } = userIdSchema.parse(req.query);
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/projects/:id/details', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const projectDetails = await storage.getProjectWithDetails(id);
      
      if (!projectDetails) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(projectDetails);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Deliverable Routes
  app.post('/api/deliverables', async (req, res) => {
    try {
      const deliverableData = insertDeliverableSchema.parse(req.body);
      const deliverable = await storage.createDeliverable(deliverableData);
      res.status(201).json(deliverable);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/projects/:id/deliverables', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const deliverables = await storage.getDeliverablesByProjectId(id);
      res.json(deliverables);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Task Routes
  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch('/api/tasks/:id/toggle', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const updatedTask = await storage.toggleTaskCompletion(id);
      
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/deliverables/:id/tasks', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const tasks = await storage.getTasksByDeliverableId(id);
      res.json(tasks);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Availability Routes
  app.post('/api/availability', async (req, res) => {
    try {
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const availability = await storage.createAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get('/api/projects/:id/availability', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const availability = await storage.getAvailabilityByProjectId(id);
      
      if (!availability) {
        // Return default availability if none is set
        return res.json({
          id: 0,
          projectId: id,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
          hoursPerDay: 2
        });
      }
      
      res.json(availability);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Generate timeline for a project
  app.post('/api/projects/:id/generate-timeline', async (req, res) => {
    try {
      const idSchema = z.object({
        id: z.string().transform(val => parseInt(val))
      });
      
      const { id } = idSchema.parse(req.params);
      const project = await storage.getProjectWithDeliverables(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const availabilityData = await storage.getAvailabilityByProjectId(id);
      
      // Get project due date and today's date
      const dueDate = new Date(project.dueDate);
      const today = new Date();
      
      // Calculate number of days until due date
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 0) {
        return res.status(400).json({ error: "Project due date must be in the future" });
      }
      
      // Get availability weekdays
      const availability = availabilityData || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        hoursPerDay: 2
      };
      
      const availableDays = [
        availability.monday, 
        availability.tuesday, 
        availability.wednesday, 
        availability.thursday, 
        availability.friday, 
        availability.saturday, 
        availability.sunday
      ];
      
      // Count available days
      const availableDayCount = availableDays.filter(Boolean).length;
      
      if (availableDayCount === 0) {
        return res.status(400).json({ error: "At least one day must be selected as available" });
      }
      
      // Create tasks for each deliverable
      for (const deliverable of project.deliverables) {
        // Break down the deliverable into smaller tasks
        const taskNames = breakdownDeliverableIntoTasks(deliverable.name);
        
        // Determine task priorities based on position in the list
        const priorities = [3, 3, 2, 2, 1]; // High, High, Medium, Medium, Low
        
        // Distribute tasks across available days
        let currentDay = new Date(today);
        let tasksCreated = 0;
        
        for (let i = 0; i < taskNames.length; i++) {
          // Skip to next available day
          while (!availableDays[currentDay.getDay()]) {
            currentDay.setDate(currentDay.getDate() + 1);
          }
          
          // Ensure we don't exceed the due date
          if (currentDay > dueDate) {
            currentDay = new Date(dueDate);
          }
          
          // Create the task
          await storage.createTask({
            deliverableId: deliverable.id,
            name: taskNames[i],
            description: `Part of the "${deliverable.name}" deliverable`,
            dueDate: new Date(currentDay),
            priority: priorities[i] || 1,
            estimatedMinutes: 30 + Math.floor(Math.random() * 60)  // Random estimate between 30-90 minutes
          });
          
          tasksCreated++;
          
          // Move to next day for next task
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }
      
      // Return the updated project with tasks
      const projectWithDetails = await storage.getProjectWithDetails(id);
      res.json(projectWithDetails);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // HTML page routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/index.html'));
  });
  
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/dashboard.html'));
  });
  
  app.get('/new-project', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/new-project.html'));
  });
  
  // Serve static files
  app.use('/js', express.static(path.join(process.cwd(), 'client/js')));
  app.use('/styles.css', express.static(path.join(process.cwd(), 'client/styles.css')));
  
  // Handle project detail page
  app.get('/projects/:id', (req, res) => {
    // In a real app, you'd validate if the project exists first
    // For simplicity, we'll just serve the project detail page template
    res.sendFile(path.join(process.cwd(), 'client/project-detail.html'));
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).send('Page not found');
  });

  const httpServer = createServer(app);
  return httpServer;
}