import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, Clock, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProjectWithDetails, DeliverableWithTasks, Task } from "@shared/schema";
import { calculateProgress, groupTasksByDate } from "@/lib/timeline-generator";
import { Skeleton } from "@/components/ui/skeleton";

type TaskReviewProps = {
  projectId: number;
  onBack: () => void;
  onSave: () => void;
};

const TaskReview = ({
  projectId,
  onBack,
  onSave
}: TaskReviewProps) => {
  const queryClient = useQueryClient();
  
  const { data: projectDetails, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/details`],
    retry: 1
  });
  
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
    return <div>Error loading project details</div>;
  }
  
  const project = projectDetails as ProjectWithDetails;
  const tasksGroupedByDate = groupTasksByDate(project.deliverables);
  const progress = calculateProgress(project.deliverables);
  
  // Calculate days remaining
  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const handleToggleTask = (taskId: number) => {
    toggleTaskMutation.mutate(taskId);
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Task Breakdown</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">Project: {project.name}</h4>
            <p className="text-sm text-gray-600">
              Due: {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
              ({daysRemaining} days remaining)
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-primary border border-primary-200 inline-flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              {daysRemaining <= 3 ? 'Urgent' : 'On Track'}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-secondary-500 h-2.5 rounded-full" 
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-right">
          {progress.completed} tasks completed, {progress.total - progress.completed} remaining
        </p>
      </div>
      
      {/* Tasks by day */}
      <div className="space-y-6">
        {tasksGroupedByDate.map((day, dayIndex) => (
          <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
              <h4 className="font-medium text-gray-900">{day.formattedDate}</h4>
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
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between flex-wrap">
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
        ))}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          className="flex items-center" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Adjust Timeline
        </Button>
        <Button 
          className="flex items-center" 
          onClick={onSave}
        >
          Save Project
          <Check className="h-5 w-5 ml-2" />
        </Button>
      </div>
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
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="mt-2 md:mt-0">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        
        <Skeleton className="w-full h-2.5 mb-2 rounded-full" />
        <div className="flex justify-end">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {[1, 2].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((j) => (
              <div key={j} className="p-4">
                <div className="flex items-start">
                  <Skeleton className="h-4 w-4 rounded-sm mt-1" />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-36 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-between mt-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default TaskReview;
