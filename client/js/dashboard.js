// Dashboard functionality with calendar view
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard initialized');
  
  // Initialize dashboard tabs
  initDashboardTabs();
  
  // Initialize calendar
  initCalendar();
  
  // Fetch projects
  fetchProjects()
    .then(projects => {
      console.log('Projects loaded:', projects?.length || 0);
      renderProjects(projects || []);
      
      // Get all tasks for the calendar
      fetchAllTasks(projects || [])
        .then(tasks => {
          updateCalendarWithTasks(tasks);
        })
        .catch(error => {
          console.error('Error fetching tasks:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
      showErrorMessage('Failed to load projects. Please try again later.');
    });
});

// Initialize dashboard tabs
function initDashboardTabs() {
  const tabs = document.querySelectorAll('.dashboard-tabs .tab');
  const views = document.querySelectorAll('.dashboard-view');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show active view
      views.forEach(v => {
        if (v.classList.contains(`${view}-view`)) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });
    });
  });
  
  // Initialize projects tabs
  const projectsTabs = document.querySelectorAll('.projects-tabs .tab');
  const projectCards = document.querySelectorAll('.project-card');
  
  projectsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const status = tab.dataset.status;
      
      // Update active tab
      projectsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Filter projects
      projectCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Calendar functionality
function initCalendar() {
  // Get calendar elements
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentMonthEl = document.getElementById('current-month');
  const calendarDays = document.getElementById('calendar-days');
  const dayDetail = document.getElementById('day-detail');
  const closeDayDetailBtn = document.getElementById('close-day-detail');
  const selectedDateEl = document.getElementById('selected-date');
  const dayTasksEl = document.getElementById('day-tasks');
  
  // Current date tracking
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = today;
  
  // Previous month button
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  // Next month button
  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  // Close day detail
  closeDayDetailBtn.addEventListener('click', () => {
    dayDetail.classList.remove('active');
  });
  
  // Initial calendar render
  renderCalendar(currentYear, currentMonth);
  
  // Render calendar for given month and year
  function renderCalendar(year, month) {
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous calendar
    calendarDays.innerHTML = '';
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday)
    const firstDayIndex = firstDay.getDay();
    
    // Get total days in month
    const totalDays = lastDay.getDate();
    
    // Get days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Current date for highlighting today
    const currentDate = new Date();
    const isCurrentMonth = currentDate.getMonth() === month && currentDate.getFullYear() === year;
    const currentDay = currentDate.getDate();
    
    // Total calendar cells (maximum 6 weeks * 7 days)
    const totalCells = 42;
    
    // Add days from previous month
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevMonthLastDay - i + 1;
      const dayEl = createDayElement(dayNum, 'other-month', new Date(year, month - 1, dayNum));
      calendarDays.appendChild(dayEl);
    }
    
    // Add days from current month
    for (let i = 1; i <= totalDays; i++) {
      let classes = '';
      if (isCurrentMonth && i === currentDay) {
        classes = 'today';
      }
      const dayEl = createDayElement(i, classes, new Date(year, month, i));
      calendarDays.appendChild(dayEl);
    }
    
    // Add days from next month
    const remainingCells = totalCells - (firstDayIndex + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      const dayEl = createDayElement(i, 'other-month', new Date(year, month + 1, i));
      calendarDays.appendChild(dayEl);
    }
  }
  
  // Create day element
  function createDayElement(dayNum, classes, date) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${classes || ''}`;
    dayEl.dataset.date = date.toISOString().split('T')[0];
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = dayNum;
    
    dayEl.appendChild(dayNumber);
    
    // Task indicators will be added later
    const indicators = document.createElement('div');
    indicators.className = 'day-indicators';
    dayEl.appendChild(indicators);
    
    // Click event to show tasks for this day
    dayEl.addEventListener('click', () => {
      // Remove selected class from all days
      document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
      });
      
      // Add selected class to clicked day
      dayEl.classList.add('selected');
      
      // Update selected date
      selectedDate = date;
      
      // Format date for display
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
      
      selectedDateEl.textContent = `Tasks for ${formattedDate}`;
      
      // Show tasks for this day
      showTasksForDay(date);
      
      // Show day detail
      dayDetail.classList.add('active');
    });
    
    return dayEl;
  }
  
  // Show tasks for a specific day
  function showTasksForDay(date) {
    // Clear previous tasks
    dayTasksEl.innerHTML = '';
    
    // Format date for comparison
    const dateStr = date.toISOString().split('T')[0];
    
    // Find tasks for this day
    let tasksForDay = window.allTasks?.filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    }) || [];
    
    // Sort tasks by priority (high to low)
    tasksForDay.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    if (tasksForDay.length === 0) {
      dayTasksEl.innerHTML = `
        <div class="no-tasks-message">
          <p>No tasks scheduled for this day.</p>
        </div>
      `;
      return;
    }
    
    // Render tasks
    tasksForDay.forEach(task => {
      const taskElement = createTaskElement(task);
      dayTasksEl.appendChild(taskElement);
    });
  }
  
  // Create task element
  function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'day-task';
    
    // Check if task is overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today && !task.completed) {
      taskEl.classList.add('overdue');
    }
    
    // Format time (minutes to hours and minutes)
    const formatTaskTime = (minutes) => {
      if (!minutes) return '';
      
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      } else {
        return `${mins}m`;
      }
    };
    
    // Create task content
    taskEl.innerHTML = `
      <div class="day-task-title">${task.name}</div>
      <div class="day-task-project">From: ${task.projectName || 'Unknown Project'}</div>
      <div class="day-task-meta">
        <span>${formatTaskTime(task.estimatedMinutes)}</span>
        <span>Priority: ${'★'.repeat(task.priority || 1)}</span>
      </div>
    `;
    
    return taskEl;
  }
}

// Update calendar with tasks
function updateCalendarWithTasks(tasks) {
  // Store tasks globally for day detail view
  window.allTasks = tasks;
  
  // Group tasks by date
  const tasksByDate = {};
  tasks.forEach(task => {
    const date = new Date(task.dueDate).toISOString().split('T')[0];
    if (!tasksByDate[date]) {
      tasksByDate[date] = [];
    }
    tasksByDate[date].push(task);
  });
  
  // Add task indicators to calendar days
  document.querySelectorAll('.calendar-day').forEach(dayEl => {
    const dateStr = dayEl.dataset.date;
    const dayTasks = tasksByDate[dateStr] || [];
    
    if (dayTasks.length > 0) {
      const indicators = dayEl.querySelector('.day-indicators');
      
      // Add task marker
      const taskMarker = document.createElement('div');
      taskMarker.className = 'day-marker task';
      indicators.appendChild(taskMarker);
      
      // Add count
      const count = document.createElement('span');
      count.className = 'task-count';
      count.textContent = dayTasks.length;
      indicators.appendChild(count);
    }
  });
}

// Fetch projects from API
async function fetchProjects() {
  try {
    const userId = 1; // Demo user ID
    const response = await fetch(`/api/projects?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Fetch all tasks for all projects
async function fetchAllTasks(projects) {
  if (!projects || projects.length === 0) {
    return [];
  }
  
  try {
    // Fetch details for each project to get tasks
    const projectsWithDetails = await Promise.all(
      projects.map(async project => {
        try {
          const response = await fetch(`/api/projects/${project.id}/details`);
          if (!response.ok) {
            throw new Error(`Failed to fetch details for project ${project.id}`);
          }
          return await response.json();
        } catch (err) {
          console.error(`Error fetching project ${project.id} details:`, err);
          return null;
        }
      })
    );
    
    // Extract all tasks and add project name to each task
    const allTasks = [];
    projectsWithDetails
      .filter(Boolean)
      .forEach(project => {
        project.deliverables?.forEach(deliverable => {
          deliverable.tasks?.forEach(task => {
            allTasks.push({
              ...task,
              projectName: project.name,
              deliverableName: deliverable.name
            });
          });
        });
      });
    
    return allTasks;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return [];
  }
}

// Render projects in projects view
function renderProjects(projects) {
  const projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;
  
  // Clear loading indicator
  projectsContainer.innerHTML = '';
  
  if (projects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h2>No projects yet</h2>
        <p>Start a new project to begin tracking your deadlines.</p>
        <a href="/new-project" class="btn-primary">Create Project</a>
      </div>
    `;
    return;
  }
  
  // Create project cards
  projects.forEach(project => {
    // Calculate days remaining
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine project status
    let statusClass = 'badge-success';
    let statusText = `Due in ${daysRemaining} days`;
    
    if (daysRemaining < 0) {
      statusClass = 'badge-error';
      statusText = `Overdue by ${Math.abs(daysRemaining)} days`;
    } else if (daysRemaining <= 3) {
      statusClass = 'badge-warning';
      statusText = `Due in ${daysRemaining} days`;
    }
    
    // Calculate progress (dummy for now)
    // In a real app, you'd fetch the actual progress
    const progress = Math.floor(Math.random() * 100);
    
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.dataset.status = progress === 100 ? 'completed' : 'active';
    
    projectCard.innerHTML = `
      <div class="project-header">
        <h3 class="project-title">${project.name}</h3>
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      <p>${project.description || 'No description provided'}</p>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%;"></div>
      </div>
      <div class="project-footer">
        <span>${progress}% complete</span>
        <a href="/projects/${project.id}" class="btn-outline">View Project</a>
      </div>
    `;
    
    projectsContainer.appendChild(projectCard);
  });
}

// Show error message
function showErrorMessage(message) {
  // Create error element if it doesn't exist
  let errorElement = document.querySelector('.error-alert');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'error-alert';
    document.body.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.remove('show');
  }, 5000);
}