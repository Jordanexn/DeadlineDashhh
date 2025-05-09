/ DOM Elements
const projectNameInput = document.getElementById('project-name');
const rubricInput = document.getElementById('rubric-input');
const dueDateInput = document.getElementById('due-date');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const inputContainer = document.getElementById('input-container');
const tasksContainer = document.getElementById('tasks-container');
const projectTitle = document.getElementById('project-title');
const dueDateDisplay = document.getElementById('due-date-display');
const deliverablesList = document.getElementById('deliverables-list');
const subtasksList = document.getElementById('subtasks-list');
const timelineContainer = document.getElementById('timeline-container');
const progressBar = document.querySelector('.progress-bar');
const notification = document.getElementById('notification');

// Storage handling - fallback for sandboxed environments
const storage = {
    data: null,
    
    // Save data
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Fallback to in-memory storage if localStorage is not available
            this.data = value;
            console.log('Using in-memory storage (localStorage not available)');
        }
    },
    
    // Get data
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            // Fallback to in-memory storage if localStorage is not available
            console.log('Using in-memory storage (localStorage not available)');
            return this.data;
        }
    },
    
    // Remove data
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // Clear in-memory storage if localStorage is not available
            this.data = null;
            console.log('Using in-memory storage (localStorage not available)');
        }
    }
};

// Project data
let projectData = {
    name: '',
    dueDate: null,
    deliverables: [],
    tasks: [],
    progress: 0
};

// Initialize the app
function init() {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format date and time for datetime-local input
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    dueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Load data from local storage if available
    loadFromLocalStorage();
    
    // Event listeners
    analyzeBtn.addEventListener('click', analyzeRubric);
    resetBtn.addEventListener('click', resetProject);
    
    // Check if there is an active project
    if (projectData.name && projectData.deliverables.length > 0) {
        showTasksView();
    }
}

// Analyze rubric and create deliverables
function analyzeRubric() {
    const projectName = projectNameInput.value.trim();
    const rubricText = rubricInput.value.trim();
    const dueDate = new Date(dueDateInput.value);
    
    if (!projectName || !rubricText || !dueDateInput.value) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Clear previous data
    projectData = {
        name: projectName,
        dueDate: dueDate,
        deliverables: [],
        tasks: [],
        progress: 0
    };
    
    // Parse rubric text to extract deliverables
    const deliverables = parseRubric(rubricText);
    projectData.deliverables = deliverables;
    
    // Create subtasks from deliverables
    createSubtasks();
    
    // Save to local storage
    saveToLocalStorage();
    
    // Show tasks view
    showTasksView();
}

// Parse rubric text and extract deliverables
function parseRubric(text) {
    const deliverables = [];
    
    // Simple parsing logic - look for keywords and patterns
    // In a real app, this would be more sophisticated with NLP
    
    // Split by lines and look for potential deliverables
    const lines = text.split('\n');
    
    const keywords = ['submit', 'create', 'develop', 'implement', 'design', 'write', 'analyze', 'prepare'];
    const pointsRegex = /(\d+)\s*(?:points|pts|marks|%)/i;
    
    lines.forEach((line, index) => {
        // Skip empty lines
        if (!line.trim()) return;
        
        // Check if line contains a deliverable keyword
        const hasKeyword = keywords.some(keyword => 
            line.toLowerCase().includes(keyword)
        );
        
        // Check if line contains points information
        const pointsMatch = line.match(pointsRegex);
        const points = pointsMatch ? parseInt(pointsMatch[1]) : null;
        
        // If line has keyword or points, or starts with number/bullet, consider it a deliverable
        const isBullet = /^[\d\.\-\*•]/.test(line.trim());
        
        if (hasKeyword || points || isBullet) {
            // Clean up the line
            let deliverableText = line.trim()
                .replace(/^[\d\.\-\*•]+\s*/, '') // Remove bullets
                .replace(/\(\d+\s*(?:points|pts|marks|%)\)/i, ''); // Remove points
            
            deliverables.push({
                id: 'del_' + Date.now() + '_' + index,
                text: deliverableText,
                points: points || 10, // Default points if not specified
                completed: false
            });
        }
    });
    
    // If no deliverables found, create some fallback ones
    if (deliverables.length === 0) {
        deliverables.push({
            id: 'del_' + Date.now() + '_0',
            text: 'Complete the main assignment',
            points: 100,
            completed: false
        });
    }
    
    return deliverables;
}

// Create subtasks from deliverables
function createSubtasks() {
    const tasks = [];
    const daysUntilDue = getDaysUntilDue();
    
    // Distribute tasks evenly across available days
    projectData.deliverables.forEach((deliverable, index) => {
        // Every deliverable gets 3 tasks: Research, Development, and Review
        const startOffset = Math.max(1, Math.floor(index * daysUntilDue / projectData.deliverables.length));
        
        tasks.push({
            id: 'task_' + Date.now() + '_' + (tasks.length + 1),
            deliverableId: deliverable.id,
            text: `Research for "${deliverable.text.substring(0, 30)}${deliverable.text.length > 30 ? '...' : ''}"`,
            dueDate: getTaskDate(startOffset),
            priority: 'medium',
            completed: false
        });
        
        tasks.push({
            id: 'task_' + Date.now() + '_' + (tasks.length + 1),
            deliverableId: deliverable.id,
            text: `Develop/create "${deliverable.text.substring(0, 30)}${deliverable.text.length > 30 ? '...' : ''}"`,
            dueDate: getTaskDate(startOffset + Math.ceil(daysUntilDue / (projectData.deliverables.length * 2))),
            priority: 'high',
            completed: false
        });
        
        tasks.push({
            id: 'task_' + Date.now() + '_' + (tasks.length + 1),
            deliverableId: deliverable.id,
            text: `Review and finalize "${deliverable.text.substring(0, 30)}${deliverable.text.length > 30 ? '...' : ''}"`,
            dueDate: getTaskDate(daysUntilDue - 1),
            priority: 'low',
            completed: false
        });
    });
    
    // Sort tasks by due date
    tasks.sort((a, b) => a.dueDate - b.dueDate);
    
    projectData.tasks = tasks;
}

// Helper function to get date for a task
function getTaskDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
}

// Helper function to calculate days until due
function getDaysUntilDue() {
    const now = new Date();
    const dueDate = new Date(projectData.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1); // At least 1 day
}

// Show tasks view
function showTasksView() {
    // Update project info
    projectTitle.textContent = projectData.name;
    dueDateDisplay.textContent = formatDate(projectData.dueDate);
    
    // Render deliverables
    renderDeliverables();
    
    // Render tasks
    renderTasks();
    
    // Render timeline
    renderTimeline();
    
    // Update progress
    updateProgress();
    
    // Switch view
    inputContainer.style.display = 'none';
    tasksContainer.style.display = 'block';
}

// Render deliverables
function renderDeliverables() {
    deliverablesList.innerHTML = '';
    
    projectData.deliverables.forEach(deliverable => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        listItem.dataset.id = deliverable.id;
        
        const isCompleted = deliverable.completed;
        
        listItem.innerHTML = `
            <div class="task-details">
                <h4>${deliverable.text}</h4>
                <div class="task-date">Points: ${deliverable.points}</div>
            </div>
            <div class="task-actions">
                <button class="deliverable-toggle" data-id="${deliverable.id}">
                    ${isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
        `;
        
        if (isCompleted) {
            listItem.style.borderLeft = '4px solid var(--success)';
            listItem.style.textDecoration = 'line-through';
            listItem.style.opacity = '0.7';
        }
        
        deliverablesList.appendChild(listItem);
    });
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.deliverable-toggle').forEach(button => {
        button.addEventListener('click', toggleDeliverable);
    });
}

// Render tasks
function renderTasks() {
    subtasksList.innerHTML = '';
    
    projectData.tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        listItem.dataset.id = task.id;
        
        const isCompleted = task.completed;
        const isPastDue = new Date() > new Date(task.dueDate) && !isCompleted;
        
        listItem.innerHTML = `
            <div class="task-details">
                <h4>${task.text}</h4>
                <div class="task-date">Due: ${formatDate(task.dueDate)}</div>
            </div>
            <div>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
                <button class="task-toggle" data-id="${task.id}">
                    ${isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
        `;
        
        if (isCompleted) {
            listItem.style.borderLeft = '4px solid var(--success)';
            listItem.style.textDecoration = 'line-through';
            listItem.style.opacity = '0.7';
        } else if (isPastDue) {
            listItem.style.borderLeft = '4px solid var(--danger)';
        }
        
        subtasksList.appendChild(listItem);
    });
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.task-toggle').forEach(button => {
        button.addEventListener('click', toggleTask);
    });
}

// Render timeline
function renderTimeline() {
    timelineContainer.innerHTML = '';
    
    const sortedTasks = [...projectData.tasks].sort((a, b) => 
        new Date(a.dueDate) - new Date(b.dueDate)
    );
    
    sortedTasks.forEach((task, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
        
        timelineItem.innerHTML = `
            <div class="timeline-date">${formatDate(task.dueDate)}</div>
            <h4>${task.text}</h4>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            ${task.completed ? '<div>✓ Completed</div>' : ''}
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Toggle deliverable completed status
function toggleDeliverable(e) {
    const id = e.target.dataset.id;
    const deliverable = projectData.deliverables.find(d => d.id === id);
    
    if (deliverable) {
        deliverable.completed = !deliverable.completed;
        
        // If deliverable is completed, complete all associated tasks
        if (deliverable.completed) {
            projectData.tasks
                .filter(task => task.deliverableId === id)
                .forEach(task => { task.completed = true; });
        }
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update UI
        renderDeliverables();
        renderTasks();
        updateProgress();
        showNotification('Deliverable updated!');
    }
}

// Toggle task completed status
function toggleTask(e) {
    const id = e.target.dataset.id;
    const task = projectData.tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        
        // Check if all tasks for a deliverable are completed
        const deliverableId = task.deliverableId;
        const tasksForDeliverable = projectData.tasks.filter(t => t.deliverableId === deliverableId);
        const allTasksCompleted = tasksForDeliverable.every(t => t.completed);
        
        // If all tasks are completed, mark the deliverable as completed
        if (allTasksCompleted) {
            const deliverable = projectData.deliverables.find(d => d.id === deliverableId);
            if (deliverable) {
                deliverable.completed = true;
            }
        }
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update UI
        renderDeliverables();
        renderTasks();
        renderTimeline();
        updateProgress();
        showNotification('Task updated!');
    }
}

// Update progress bar
function updateProgress() {
    const totalTasks = projectData.tasks.length;
    const completedTasks = projectData.tasks.filter(task => task.completed).length;
    
    const progressPercent = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
    
    projectData.progress = progressPercent;
    progressBar.style.width = `${progressPercent}%`;
    progressBar.textContent = `${progressPercent}%`;
    
    // Change color based on progress
    if (progressPercent < 33) {
        progressBar.style.backgroundColor = 'var(--danger)';
    } else if (progressPercent < 66) {
        progressBar.style.backgroundColor = 'var(--warning)';
    } else {
        progressBar.style.backgroundColor = 'var(--success)';
    }
}

// Reset project
function resetProject() {
    // Clear data
    projectData = {
        name: '',
        dueDate: null,
        deliverables: [],
        tasks: [],
        progress: 0
    };
    
    // Clear inputs
    projectNameInput.value = '';
    rubricInput.value = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format date and time for datetime-local input
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    dueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Clear local storage
    storage.removeItem('deadlineDashData');
    
    // Switch view
    inputContainer.style.display = 'block';
    tasksContainer.style.display = 'none';
    
    showNotification('Project reset. Start a new one!');
}

// Save data to storage
function saveToLocalStorage() {
    storage.setItem('deadlineDashData', JSON.stringify(projectData));
}

// Load data from storage
function loadFromLocalStorage() {
    const savedData = storage.getItem('deadlineDashData');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            
            // Convert string dates back to Date objects
            parsedData.dueDate = new Date(parsedData.dueDate);
            parsedData.tasks.forEach(task => {
                task.dueDate = new Date(task.dueDate);
            });
            
            projectData = parsedData;
            
            // Pre-fill form if no active project
            if (inputContainer.style.display !== 'none') {
                projectNameInput.value = projectData.name;
                // Format date for datetime-local input
                if (projectData.dueDate) {
                    const d = new Date(projectData.dueDate);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    dueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }
        } catch (error) {
            console.error('Error loading saved data', error);
        }
    }
}

// Format date for display
function formatDate(date) {
    if (!date) return 'No date';
    
    const d = new Date(date);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return d.toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.display = 'block';
    
    if (type === 'error') {
        notification.style.backgroundColor = 'var(--danger)';
    } else {
        notification.style.backgroundColor = 'var(--success)';
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize the app
init();