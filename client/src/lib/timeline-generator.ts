import { Availability, DeliverableWithTasks, InsertTask } from "@shared/schema";
import { determineTaskPriority, estimateTaskTime, generateTasksForDeliverable } from "./task-generator";

export type TimelineDay = {
  date: Date;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  isAvailable: boolean;
  tasks: InsertTask[];
};

export type Timeline = {
  days: TimelineDay[];
  daysUntilDue: number;
  totalTasks: number;
};

/**
 * Generates a timeline of tasks based on project details
 */
export function generateTimeline(
  deliverables: {name: string; description?: string; id: number}[],
  dueDate: Date,
  availability: Availability
): Timeline {
  // Calculate days until due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  const daysUntilDue = Math.max(1, Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Get availability as array of booleans [sun, mon, tue, wed, thu, fri, sat]
  const availableDays = [
    availability.sunday,
    availability.monday,
    availability.tuesday,
    availability.wednesday,
    availability.thursday,
    availability.friday,
    availability.saturday,
  ];
  
  // Count how many days per week are available
  const availableDaysPerWeek = availableDays.filter(Boolean).length;
  if (availableDaysPerWeek === 0) {
    // Fallback if no days were selected
    availableDays[1] = true; // Monday
    availableDays[2] = true; // Tuesday
    availableDays[3] = true; // Wednesday
    availableDays[4] = true; // Thursday
    availableDays[5] = true; // Friday
  }
  
  // Create all tasks for all deliverables
  const allTasks: InsertTask[] = [];
  
  deliverables.forEach(deliverable => {
    const tasks = generateTasksForDeliverable(deliverable.name, deliverable.description);
    
    tasks.forEach((taskName, index) => {
      allTasks.push({
        deliverableId: deliverable.id,
        name: taskName,
        description: `Part of: ${deliverable.name}`,
        dueDate: new Date(), // Temporary, will be set later
        priority: determineTaskPriority(taskName, index),
        estimatedMinutes: estimateTaskTime(taskName)
      });
    });
  });
  
  // Sort tasks by priority (highest first)
  allTasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // Generate the days timeline
  const timeline: Timeline = {
    days: [],
    daysUntilDue,
    totalTasks: allTasks.length
  };
  
  // Create timeline days up to the due date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let currentDate = new Date(today);
  let taskIndex = 0;
  
  while (currentDate <= dueDateObj) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const isAvailable = availableDays[dayOfWeek];
    
    const day: TimelineDay = {
      date: new Date(currentDate),
      formattedDate: formatDate(currentDate),
      isToday: isSameDay(currentDate, today),
      isTomorrow: isSameDay(currentDate, tomorrow),
      isAvailable,
      tasks: []
    };
    
    // If day is available, assign tasks
    if (isAvailable) {
      // Determine how many tasks to assign to this day
      // Distribute tasks evenly across available days
      const tasksPerDay = Math.ceil(allTasks.length / (daysUntilDue * (availableDaysPerWeek / 7)));
      const maxTasksForDay = Math.min(tasksPerDay, allTasks.length - taskIndex);
      
      for (let i = 0; i < maxTasksForDay && taskIndex < allTasks.length; i++) {
        const task = { ...allTasks[taskIndex], dueDate: new Date(currentDate) };
        day.tasks.push(task);
        taskIndex++;
      }
    }
    
    timeline.days.push(day);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // If we have remaining tasks that weren't assigned, distribute them evenly
  // starting from the earliest date
  if (taskIndex < allTasks.length) {
    let dayIndex = 0;
    while (taskIndex < allTasks.length) {
      if (timeline.days[dayIndex].isAvailable) {
        const task = { ...allTasks[taskIndex], dueDate: new Date(timeline.days[dayIndex].date) };
        timeline.days[dayIndex].tasks.push(task);
        taskIndex++;
      }
      dayIndex = (dayIndex + 1) % timeline.days.length;
    }
  }
  
  return timeline;
}

/**
 * Checks if two dates represent the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Formats date as "Month Day" or "Today" or "Tomorrow"
 */
function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, tomorrow)) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }
}

/**
 * Calculates project progress based on tasks
 * Returns the number of completed tasks and the completion percentage
 */
export function calculateProgress(tasks: DeliverableWithTasks[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  let totalTasks = 0;
  let completedTasks = 0;
  
  tasks.forEach(deliverable => {
    totalTasks += deliverable.tasks.length;
    completedTasks += deliverable.tasks.filter(task => task.completed).length;
  });
  
  return {
    completed: completedTasks,
    total: totalTasks,
    percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}

/**
 * Groups tasks by due date for a project
 */
export function groupTasksByDate(deliverableWithTasks: DeliverableWithTasks[]): {
  date: Date;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  tasks: Array<DeliverableWithTasks["tasks"][0] & { deliverableName: string }>;
}[] {
  const groupedTasks: Record<string, {
    date: Date;
    formattedDate: string;
    isToday: boolean;
    isTomorrow: boolean;
    tasks: Array<DeliverableWithTasks["tasks"][0] & { deliverableName: string }>;
  }> = {};
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Collect all tasks with their deliverable name
  deliverableWithTasks.forEach(deliverable => {
    deliverable.tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      const dateKey = taskDate.toISOString().split('T')[0];
      
      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = {
          date: taskDate,
          formattedDate: formatDate(taskDate),
          isToday: isSameDay(taskDate, today),
          isTomorrow: isSameDay(taskDate, tomorrow),
          tasks: []
        };
      }
      
      groupedTasks[dateKey].tasks.push({
        ...task,
        deliverableName: deliverable.name
      });
    });
  });
  
  // Convert to array and sort by date
  return Object.values(groupedTasks).sort((a, b) => a.date.getTime() - b.date.getTime());
}
