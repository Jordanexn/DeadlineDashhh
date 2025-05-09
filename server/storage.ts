import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject, 
  deliverables, type Deliverable, type InsertDeliverable,
  tasks, type Task, type InsertTask,
  availability, type Availability, type InsertAvailability,
  type ProjectWithDeliverables,
  type DeliverableWithTasks,
  type ProjectWithDetails
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectWithDeliverables(id: number): Promise<ProjectWithDeliverables | undefined>;
  getProjectWithDetails(id: number): Promise<ProjectWithDetails | undefined>;
  
  // Deliverable operations
  getDeliverable(id: number): Promise<Deliverable | undefined>;
  getDeliverablesByProjectId(projectId: number): Promise<Deliverable[]>;
  createDeliverable(deliverable: InsertDeliverable): Promise<Deliverable>;
  deleteDeliverable(id: number): Promise<boolean>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByDeliverableId(deliverableId: number): Promise<Task[]>;
  getTasksByProjectId(projectId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  toggleTaskCompletion(id: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Availability operations
  getAvailabilityByProjectId(projectId: number): Promise<Availability | undefined>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, availability: Partial<InsertAvailability>): Promise<Availability | undefined>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private projectsMap: Map<number, Project>;
  private deliverablesMap: Map<number, Deliverable>;
  private tasksMap: Map<number, Task>;
  private availabilityMap: Map<number, Availability>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentDeliverableId: number;
  private currentTaskId: number;
  private currentAvailabilityId: number;

  constructor() {
    this.usersMap = new Map();
    this.projectsMap = new Map();
    this.deliverablesMap = new Map();
    this.tasksMap = new Map();
    this.availabilityMap = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentDeliverableId = 1;
    this.currentTaskId = 1;
    this.currentAvailabilityId = 1;
    
    // Initialize with demo user
    this.createUser({ username: "demo", password: "password" });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projectsMap.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projectsMap.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.projectsMap.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = await this.getProject(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...projectUpdate,
      updatedAt: new Date()
    };
    
    this.projectsMap.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete associated deliverables, tasks, and availability first
    const deliverables = await this.getDeliverablesByProjectId(id);
    for (const deliverable of deliverables) {
      await this.deleteDeliverable(deliverable.id);
    }
    
    // Delete availability
    const availability = await this.getAvailabilityByProjectId(id);
    if (availability) {
      this.availabilityMap.delete(availability.id);
    }
    
    return this.projectsMap.delete(id);
  }

  async getProjectWithDeliverables(id: number): Promise<ProjectWithDeliverables | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;
    
    const deliverables = await this.getDeliverablesByProjectId(id);
    
    return {
      ...project,
      deliverables
    };
  }

  async getProjectWithDetails(id: number): Promise<ProjectWithDetails | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;
    
    const deliverables = await this.getDeliverablesByProjectId(id);
    const availability = await this.getAvailabilityByProjectId(id);
    
    // Get tasks for each deliverable
    const deliverablesWithTasks: DeliverableWithTasks[] = await Promise.all(
      deliverables.map(async (deliverable) => {
        const tasks = await this.getTasksByDeliverableId(deliverable.id);
        return {
          ...deliverable,
          tasks
        };
      })
    );
    
    return {
      ...project,
      deliverables: deliverablesWithTasks,
      availability: availability || {
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
      }
    };
  }

  // Deliverable operations
  async getDeliverable(id: number): Promise<Deliverable | undefined> {
    return this.deliverablesMap.get(id);
  }

  async getDeliverablesByProjectId(projectId: number): Promise<Deliverable[]> {
    return Array.from(this.deliverablesMap.values()).filter(
      (deliverable) => deliverable.projectId === projectId,
    );
  }

  async createDeliverable(insertDeliverable: InsertDeliverable): Promise<Deliverable> {
    const id = this.currentDeliverableId++;
    const now = new Date();
    const deliverable: Deliverable = { 
      ...insertDeliverable, 
      id, 
      createdAt: now 
    };
    this.deliverablesMap.set(id, deliverable);
    return deliverable;
  }

  async deleteDeliverable(id: number): Promise<boolean> {
    // Delete associated tasks first
    const tasks = await this.getTasksByDeliverableId(id);
    for (const task of tasks) {
      this.tasksMap.delete(task.id);
    }
    
    return this.deliverablesMap.delete(id);
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksMap.get(id);
  }

  async getTasksByDeliverableId(deliverableId: number): Promise<Task[]> {
    return Array.from(this.tasksMap.values()).filter(
      (task) => task.deliverableId === deliverableId,
    );
  }

  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    const deliverables = await this.getDeliverablesByProjectId(projectId);
    const tasks: Task[] = [];
    
    for (const deliverable of deliverables) {
      const deliverableTasks = await this.getTasksByDeliverableId(deliverable.id);
      tasks.push(...deliverableTasks);
    }
    
    return tasks;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      completed: false,
      createdAt: now 
    };
    this.tasksMap.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = await this.getTask(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = {
      ...existingTask,
      ...taskUpdate
    };
    
    this.tasksMap.set(id, updatedTask);
    return updatedTask;
  }

  async toggleTaskCompletion(id: number): Promise<Task | undefined> {
    const existingTask = await this.getTask(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = {
      ...existingTask,
      completed: !existingTask.completed
    };
    
    this.tasksMap.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasksMap.delete(id);
  }

  // Availability operations
  async getAvailabilityByProjectId(projectId: number): Promise<Availability | undefined> {
    return Array.from(this.availabilityMap.values()).find(
      (avail) => avail.projectId === projectId,
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    // Check if availability already exists for this project and update it instead
    const existingAvailability = await this.getAvailabilityByProjectId(insertAvailability.projectId);
    if (existingAvailability) {
      return this.updateAvailability(existingAvailability.id, insertAvailability) as Promise<Availability>;
    }
    
    const id = this.currentAvailabilityId++;
    const availability: Availability = { 
      ...insertAvailability, 
      id
    };
    this.availabilityMap.set(id, availability);
    return availability;
  }

  async updateAvailability(id: number, availabilityUpdate: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const existingAvailability = this.availabilityMap.get(id);
    if (!existingAvailability) return undefined;
    
    const updatedAvailability: Availability = {
      ...existingAvailability,
      ...availabilityUpdate
    };
    
    this.availabilityMap.set(id, updatedAvailability);
    return updatedAvailability;
  }
}

export const storage = new MemStorage();
