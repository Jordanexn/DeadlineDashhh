/**
 * Generates typical tasks for a deliverable based on its type and description
 */
export function generateTasksForDeliverable(deliverableName: string, description?: string): string[] {
  // Extract key words from the deliverable name and description
  const nameWords = deliverableName.toLowerCase().split(' ');
  const descWords = description ? description.toLowerCase().split(' ') : [];
  const allWords = [...nameWords, ...descWords];
  
  // Check for technology or domain-specific keywords to tailor tasks
  const isUI = containsAny(allWords, ['ui', 'interface', 'design', 'frontend', 'layout', 'component']);
  const isBackend = containsAny(allWords, ['api', 'server', 'database', 'backend', 'storage', 'data']);
  const isAlgorithm = containsAny(allWords, ['algorithm', 'calculate', 'compute', 'analysis', 'logic']);
  const isResearch = containsAny(allWords, ['research', 'analyze', 'investigate', 'study', 'explore']);
  
  // Base tasks that apply to most deliverables
  const baseTasks = [
    `Research requirements for ${shortName(deliverableName)}`,
    `Create initial design for ${shortName(deliverableName)}`,
    `Implement core functionality for ${shortName(deliverableName)}`,
    `Test and debug ${shortName(deliverableName)}`,
    `Document ${shortName(deliverableName)}`
  ];
  
  // Additional specific tasks based on the type
  const specificTasks: string[] = [];
  
  if (isUI) {
    specificTasks.push(
      `Create wireframes for ${shortName(deliverableName)}`,
      `Implement responsive design for ${shortName(deliverableName)}`,
      `Add styles and animations to ${shortName(deliverableName)}`
    );
  }
  
  if (isBackend) {
    specificTasks.push(
      `Design data model for ${shortName(deliverableName)}`,
      `Implement API endpoints for ${shortName(deliverableName)}`,
      `Add data validation to ${shortName(deliverableName)}`
    );
  }
  
  if (isAlgorithm) {
    specificTasks.push(
      `Research algorithm options for ${shortName(deliverableName)}`,
      `Create algorithm pseudocode for ${shortName(deliverableName)}`,
      `Optimize algorithm performance for ${shortName(deliverableName)}`
    );
  }
  
  if (isResearch) {
    specificTasks.push(
      `Collect research materials for ${shortName(deliverableName)}`,
      `Analyze findings for ${shortName(deliverableName)}`,
      `Prepare presentation of ${shortName(deliverableName)} research`
    );
  }
  
  // Combine base tasks with specific tasks, take a maximum of 7 tasks
  return [...baseTasks, ...specificTasks].slice(0, 7);
}

/**
 * Check if any of the terms appear in the words array
 */
function containsAny(words: string[], terms: string[]): boolean {
  return terms.some(term => words.some(word => word.includes(term)));
}

/**
 * Returns a shortened version of the deliverable name for better readability in tasks
 */
function shortName(name: string): string {
  // If name is short enough, return as is
  if (name.length <= 40) return name;
  
  // Otherwise, take the first few words
  const words = name.split(' ');
  return words.slice(0, 5).join(' ') + '...';
}

/**
 * Estimates the time required for a task in minutes
 */
export function estimateTaskTime(taskName: string): number {
  // Base time is 60 minutes (1 hour)
  let baseTime = 60;
  
  // Adjust based on task type
  if (taskName.toLowerCase().includes('research')) {
    baseTime = 90; // Research takes longer
  } else if (taskName.toLowerCase().includes('design')) {
    baseTime = 75; // Design is somewhat time consuming
  } else if (taskName.toLowerCase().includes('test')) {
    baseTime = 45; // Testing might be shorter
  } else if (taskName.toLowerCase().includes('document')) {
    baseTime = 30; // Documentation is usually quick
  } else if (taskName.toLowerCase().includes('implement')) {
    baseTime = 120; // Implementation takes the longest
  }
  
  // Add some randomness (±15 minutes)
  const randomFactor = Math.floor(Math.random() * 30) - 15;
  
  return Math.max(15, baseTime + randomFactor);
}

/**
 * Determines the priority of a task (1 = low, 2 = medium, 3 = high)
 */
export function determineTaskPriority(taskName: string, position: number): number {
  // Implementation tasks and first tasks are usually high priority
  if (taskName.toLowerCase().includes('implement') || position === 0) {
    return 3;
  }
  
  // Research and design are medium priority
  if (taskName.toLowerCase().includes('research') || 
      taskName.toLowerCase().includes('design') ||
      taskName.toLowerCase().includes('create')) {
    return 2;
  }
  
  // Documentation and testing are lower priority
  if (taskName.toLowerCase().includes('document') || 
      taskName.toLowerCase().includes('test')) {
    return 1;
  }
  
  // Default is medium priority
  return 2;
}
