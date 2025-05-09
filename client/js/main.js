// Main JavaScript file for Deadline Dash application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Deadline Dash application initialized');
  
  // Initialize navigation highlighting
  initNavigation();
  
  // Check which page we're on and initialize appropriate functionality
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/index.html') {
    initHomePage();
  } else if (currentPath.includes('/dashboard')) {
    initDashboard();
  } else if (currentPath.includes('/new-project')) {
    initNewProject();
  } else if (currentPath.includes('/projects/')) {
    initProjectDetail();
  }
});

// Initialize active navigation links
function initNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Home page initialization
function initHomePage() {
  console.log('Home page initialized');
}

// Dashboard initialization
function initDashboard() {
  console.log('Dashboard initialized');
  // Get projects from API
  fetchProjects()
    .then(projects => {
      renderProjects(projects);
      initProjectTabs();
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
      showErrorMessage('Failed to load projects. Please try again later.');
    });
}

// Project tabs functionality
function initProjectTabs() {
  const tabs = document.querySelectorAll('.tab');
  const projectCards = document.querySelectorAll('.project-card');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const status = tab.dataset.status;
      
      // Show/hide appropriate projects
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

// Fetch projects from API
async function fetchProjects() {
  const userId = 1; // Demo user ID
  const response = await fetch(`/api/projects?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return response.json();
}

// Render projects in the dashboard
function renderProjects(projects) {
  const projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;
  
  if (!projects || projects.length === 0) {
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
  
  const projectCards = projects.map(project => {
    // Calculate days remaining
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
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
    const progress = Math.floor(Math.random() * 100);
    
    return `
      <div class="project-card" data-status="${progress === 100 ? 'completed' : 'active'}">
        <div class="project-header">
          <h3 class="project-title">${project.name}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p>${project.description || 'No description provided'}</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
        <div class="project-footer">
          <span>${progress}% complete</span>
          <a href="/projects/${project.id}" class="btn-outline">View Project</a>
        </div>
      </div>
    `;
  }).join('');
  
  projectsContainer.innerHTML = projectCards;
}

// New Project form initialization
function initNewProject() {
  console.log('New Project form initialized');
  initMultiStepForm();
  initRubricAnalysis();
}

// Handle multi-step form functionality
function initMultiStepForm() {
  const formSteps = document.querySelectorAll('.form-step');
  const stepIndicators = document.querySelectorAll('.step');
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  
  if (!formSteps.length) return;
  
  let currentStep = 0;
  
  // Show current step
  function showStep(stepIndex) {
    formSteps.forEach(step => step.classList.remove('active'));
    formSteps[stepIndex].classList.add('active');
    
    // Update step indicators
    stepIndicators.forEach((step, index) => {
      if (index < stepIndex) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (index === stepIndex) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }
  
  // Next button event listeners
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Validate current step
      if (validateStep(currentStep)) {
        currentStep++;
        if (currentStep < formSteps.length) {
          showStep(currentStep);
        }
      }
    });
  });
  
  // Prev button event listeners
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentStep--;
      if (currentStep >= 0) {
        showStep(currentStep);
      }
    });
  });
  
  // Initialize first step
  showStep(currentStep);
}

// Validate form step
function validateStep(stepIndex) {
  // Implement form validation for each step
  const formStep = document.querySelectorAll('.form-step')[stepIndex];
  const requiredFields = formStep.querySelectorAll('[required]');
  
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      
      // Add error message if not already present
      let errorMessage = field.nextElementSibling;
      if (!errorMessage || !errorMessage.classList.contains('error-message')) {
        errorMessage = document.createElement('span');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'This field is required';
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
      }
    } else {
      field.classList.remove('error');
      
      // Remove error message if present
      const errorMessage = field.nextElementSibling;
      if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.remove();
      }
    }
  });
  
  return isValid;
}

// Rubric analysis functionality
function initRubricAnalysis() {
  const analyzeButton = document.querySelector('#analyze-rubric');
  if (!analyzeButton) return;
  
  analyzeButton.addEventListener('click', async () => {
    const rubricText = document.querySelector('#rubric-text').value;
    if (!rubricText.trim()) {
      showErrorMessage('Please enter your rubric text');
      return;
    }
    
    try {
      analyzeButton.textContent = 'Analyzing...';
      analyzeButton.disabled = true;
      
      const response = await fetch('/api/analyze-rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rubricText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze rubric');
      }
      
      const result = await response.json();
      renderDeliverables(result.deliverables);
      
      // Move to next step
      const nextButton = document.querySelector('.btn-next');
      if (nextButton) nextButton.click();
    } catch (error) {
      console.error('Error analyzing rubric:', error);
      showErrorMessage('Failed to analyze rubric. Please try again.');
    } finally {
      analyzeButton.textContent = 'Analyze Rubric';
      analyzeButton.disabled = false;
    }
  });
}

// Render deliverables after rubric analysis
function renderDeliverables(deliverables) {
  const deliverablesContainer = document.querySelector('#deliverables-container');
  if (!deliverablesContainer) return;
  
  if (!deliverables || deliverables.length === 0) {
    deliverablesContainer.innerHTML = `
      <div class="empty-state">
        <p>No deliverables were found in the rubric. Please try again with more detailed text.</p>
      </div>
    `;
    return;
  }
  
  const deliverablesHTML = deliverables.map((deliverable, index) => `
    <div class="deliverable-item">
      <div class="deliverable-header">
        <h4>${deliverable.name}</h4>
        ${deliverable.points ? `<span class="points-badge">${deliverable.points} points</span>` : ''}
      </div>
      ${deliverable.description ? `<p>${deliverable.description}</p>` : ''}
      <input type="hidden" name="deliverables[${index}][name]" value="${deliverable.name}">
      ${deliverable.description ? `<input type="hidden" name="deliverables[${index}][description]" value="${deliverable.description}">` : ''}
      ${deliverable.points ? `<input type="hidden" name="deliverables[${index}][points]" value="${deliverable.points}">` : ''}
    </div>
  `).join('');
  
  deliverablesContainer.innerHTML = deliverablesHTML;
}

// Project detail page initialization
function initProjectDetail() {
  console.log('Project detail page initialized');
  
  // Extract project ID from URL
  const projectId = window.location.pathname.split('/').pop();
  
  fetchProjectDetails(projectId)
    .then(project => {
      renderProjectDetails(project);
      initTaskToggle();
    })
    .catch(error => {
      console.error('Error fetching project details:', error);
      showErrorMessage('Failed to load project details. Please try again later.');
    });
}

// Fetch project details from API
async function fetchProjectDetails(projectId) {
  const response = await fetch(`/api/projects/${projectId}/details`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch project details');
  }
  
  return response.json();
}

// Render project details
function renderProjectDetails(project) {
  const detailsContainer = document.querySelector('.project-details');
  if (!detailsContainer) return;
  
  // Calculate days remaining
  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  // Format due date
  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  detailsContainer.innerHTML = `
    <div class="project-header">
      <h1>${project.name}</h1>
      <div class="due-date">Due: ${formattedDueDate} (${daysRemaining} days remaining)</div>
    </div>
    <p class="project-description">${project.description || 'No description provided'}</p>
    
    <div class="deliverables-section">
      <h2>Deliverables</h2>
      <div class="deliverables-list">
        ${renderDeliverablesList(project.deliverables)}
      </div>
    </div>
  `;
}

// Render deliverables list with tasks
function renderDeliverablesList(deliverables) {
  if (!deliverables || deliverables.length === 0) {
    return `<p>No deliverables found for this project.</p>`;
  }
  
  return deliverables.map(deliverable => `
    <div class="deliverable-card">
      <h3>${deliverable.name}</h3>
      ${deliverable.description ? `<p>${deliverable.description}</p>` : ''}
      
      <div class="tasks-list">
        <h4>Tasks</h4>
        ${renderTasksList(deliverable.tasks)}
      </div>
    </div>
  `).join('');
}

// Render tasks list
function renderTasksList(tasks) {
  if (!tasks || tasks.length === 0) {
    return `<p>No tasks yet.</p>`;
  }
  
  return `<ul class="tasks">
    ${tasks.map(task => `
      <li class="task-item ${task.completed ? 'completed' : ''}">
        <label class="task-label">
          <input type="checkbox" class="task-checkbox" 
            data-task-id="${task.id}" 
            ${task.completed ? 'checked' : ''}>
          <span class="task-name">${task.name}</span>
        </label>
        <div class="task-details">
          <span class="task-due">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
          <span class="task-time">${formatTime(task.estimatedMinutes)}</span>
        </div>
      </li>
    `).join('')}
  </ul>`;
}

// Format time (minutes to hours and minutes)
function formatTime(minutes) {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}

// Handle task checkbox toggle
function initTaskToggle() {
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  
  taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const taskId = checkbox.dataset.taskId;
      
      try {
        const response = await fetch(`/api/tasks/${taskId}/toggle`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        
        // Update task display
        const taskItem = checkbox.closest('.task-item');
        if (checkbox.checked) {
          taskItem.classList.add('completed');
        } else {
          taskItem.classList.remove('completed');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        // Revert checkbox state
        checkbox.checked = !checkbox.checked;
        showErrorMessage('Failed to update task. Please try again.');
      }
    });
  });
}

// Show error message
function showErrorMessage(message) {
  // Create error element if it doesn't exist
  let errorElement = document.querySelector('.error-alert');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.classList.add('error-alert');
    document.body.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.remove('show');
  }, 5000);
}