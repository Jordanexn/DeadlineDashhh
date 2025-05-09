import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Zap, 
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clipboard,
  ListTodo
} from "lucide-react";
import { useState } from "react";
import { groupTasksByDate, calculateProgress } from "@/lib/timeline-generator";
import { apiRequest } from "@/lib/queryClient";

const ProjectDetail = () => {
  const { id } = useParams();
  const projectId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks');
  
  // Fetch project details
  const { data: projectDetails, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/details`],
    enabled: !!projectId,
  });
  
  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest('PATCH', `/api/tasks/${taskId}/toggle`, null);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/details`] });
    }
  });
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!projectDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const project = projectDetails;
  const tasksGroupedByDate = groupTasksByDate(project.deliverables);
  const progress = calculateProgress(project.deliverables);
  
  // Calculate days remaining
  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine project status
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
  const statusColor = isOverdue 
    ? 'text-red-600 bg-red-50 border-red-200' 
    : isUrgent 
      ? 'text-amber-600 bg-amber-50 border-amber-200' 
      : 'text-green-600 bg-green-50 border-green-200';
  const statusIcon = isOverdue 
    ? <AlertTriangle className="h-4 w-4 mr-1" /> 
    : isUrgent 
      ? <Clock className="h-4 w-4 mr-1" /> 
      : <CheckCircle2 className="h-4 w-4 mr-1" />;
  const statusText = isOverdue 
    ? `Overdue by ${Math.abs(daysRemaining)} days` 
    : `${daysRemaining} days remaining`;
  
  // Handle toggling a task
  const handleToggleTask = (taskId: number) => {
    toggleTaskMutation.mutate(taskId);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-2 -ml-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center ${statusColor}`}>
            {statusIcon}
            {statusText}
          </div>
        </div>
        
        {project.description && (
          <p className="text-gray-600 mb-4">{project.description}</p>
        )}
      </div>
      
      {/* Project Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <p className="text-gray-700">
                Due: {new Date(project.dueDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <p className="text-right text-sm text-gray-500">
              {progress.completed} of {progress.total} tasks completed
            </p>
          </div>
          <Progress value={progress.percentage} className="h-2.5 mb-1" />
        </CardContent>
      </Card>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${
            activeTab === 'tasks'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodo className="h-4 w-4 mr-2" />
          Tasks
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${
            activeTab === 'analytics'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </button>
      </div>
      
      {activeTab === 'tasks' ? (
        /* Tasks Tab */
        <div className="space-y-6">
          {/* Deliverables Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clipboard className="h-5 w-5 mr-2 text-primary" />
                Project Deliverables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.deliverables.map((deliverable) => {
                  const deliverableProgress = deliverable.tasks.length > 0
                    ? Math.round((deliverable.tasks.filter(t => t.completed).length / deliverable.tasks.length) * 100)
                    : 0;
                    
                  return (
                    <div key={deliverable.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">{deliverable.name}</h3>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600 mb-3">{deliverable.description}</p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{deliverable.tasks.filter(t => t.completed).length} of {deliverable.tasks.length} tasks</span>
                        <span>{deliverableProgress}%</span>
                      </div>
                      <Progress value={deliverableProgress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Tasks by Due Date */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <ListTodo className="h-5 w-5 mr-2 text-primary" />
              Task Schedule
            </h2>
            
            {tasksGroupedByDate.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No tasks have been created for this project yet.</p>
              </div>
            ) : (
              tasksGroupedByDate.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      {day.isToday && <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>}
                      {day.formattedDate}
                    </h4>
                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      {day.tasks.length} tasks
                    </span>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {day.tasks.map((task) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <Checkbox 
                            className="mt-1" 
                            checked={task.completed} 
                            onCheckedChange={() => handleToggleTask(task.id)}
                            disabled={toggleTaskMutation.isPending}
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex flex-wrap justify-between">
                              <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {task.name}
                              </p>
                              <span 
                                className={`ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.priority === 3 
                                      ? 'bg-red-100 text-red-800' 
                                      : task.priority === 2 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {task.completed 
                                  ? 'Completed' 
                                  : task.priority === 3 
                                    ? 'High Priority' 
                                    : task.priority === 2 
                                      ? 'Medium Priority' 
                                      : 'Low Priority'
                                }
                              </span>
                            </div>
                            <p className={`mt-1 text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                              Part of: {task.deliverableName}
                            </p>
                            <div className={`mt-2 flex items-center text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              Estimated time: {formatTime(task.estimatedMinutes || 30)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Project Progress Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{progress.percentage}%</div>
                  <div className="text-sm text-gray-600">Overall completion</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">{progress.completed}</div>
                  <div className="text-sm text-gray-600">Tasks completed</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600 mb-1">{progress.total - progress.completed}</div>
                  <div className="text-sm text-gray-600">Tasks remaining</div>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-3">Deliverables Progress</h3>
              <div className="space-y-4">
                {project.deliverables.map((deliverable) => {
                  const deliverableProgress = deliverable.tasks.length > 0
                    ? Math.round((deliverable.tasks.filter(t => t.completed).length / deliverable.tasks.length) * 100)
                    : 0;
                    
                  return (
                    <div key={deliverable.id} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{deliverable.name}</span>
                        <span className="text-sm text-gray-600">{deliverableProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${deliverableProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Time Management</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    Based on your work pattern, you're {
                      progress.percentage > 50 
                        ? 'ahead of schedule' 
                        : progress.percentage > 25 
                          ? 'on track' 
                          : 'behind schedule'
                    }
                  </p>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-amber-500 mr-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {progress.percentage > 50 
                        ? 'Great work! Keep up the momentum to finish early.' 
                        : progress.percentage > 25 
                          ? 'You\'re making good progress. Stay consistent with daily tasks.' 
                          : 'Try to complete more high-priority tasks soon to get back on track.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Format minutes to "X hours Y minutes" or "X minutes"
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
}

// Loading state component
function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <div className="flex justify-between mb-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-md mb-6" />
      </div>
      
      <Skeleton className="w-full h-24 mb-6 rounded-lg" />
      
      <div className="flex border-b border-gray-200 mb-6">
        <Skeleton className="h-10 w-24 mx-2" />
        <Skeleton className="h-10 w-24 mx-2" />
      </div>
      
      <div className="space-y-6">
        <Skeleton className="w-full h-64 rounded-lg mb-6" />
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="divide-y divide-gray-200">
              {[1, 2].map((j) => (
                <div key={j} className="p-4">
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 rounded mt-1" />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-64 mb-2" />
                        <Skeleton className="h-5 w-28 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectDetail;
