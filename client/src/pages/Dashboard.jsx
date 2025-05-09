import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight 
} from "lucide-react";
import { Link } from "wouter";
import { calculateProgress } from "@/lib/timeline-generator";
import { useState } from "react";

const Dashboard = () => {
  // For demo purposes, we'll use a fixed user ID
  const userId = 1;
  
  const { data: projects, isLoading } = useQuery({
    queryKey: [`/api/projects?userId=${userId}`]
  });
  
  const [selectedTab, setSelectedTab] = useState('active');
  
  // For each project, fetch its details
  const { data: projectDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/projects/details'],
    enabled: !!projects && projects.length > 0,
    queryFn: async () => {
      if (!projects || projects.length === 0) return [];
      
      const details = await Promise.all(
        projects.map(async (project) => {
          const response = await fetch(`/api/projects/${project.id}/details`);
          if (!response.ok) throw new Error('Failed to fetch project details');
          return response.json();
        })
      );
      
      return details;
    }
  });
  
  // Filter projects based on selected tab
  const filteredProjects = projectDetails?.filter((project) => {
    if (!project.deliverables || project.deliverables.length === 0) return false;
    
    const progress = calculateProgress(project.deliverables);
    return selectedTab === 'active' ? progress.percentage < 100 : progress.percentage === 100;
  }) || [];
  
  // Sort projects by due date (earliest first)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
        <Link href="/new-project">
          <Button className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </Link>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            selectedTab === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('active')}
        >
          Active Projects
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            selectedTab === 'completed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('completed')}
        >
          Completed Projects
        </button>
      </div>
      
      {isLoading || isLoadingDetails ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
            <Calendar className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            No {selectedTab} projects
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedTab === 'active' 
              ? "You don't have any active projects. Start a new one to beat procrastination!" 
              : "You haven't completed any projects yet. Keep working on your active projects!"}
          </p>
          {selectedTab === 'active' && (
            <Link href="/new-project">
              <Button>Create Your First Project</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProjects.map((project) => {
            const progress = calculateProgress(project.deliverables);
            const dueDate = new Date(project.dueDate);
            const today = new Date();
            const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
            const isOverdue = daysRemaining < 0;
            
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                      <div 
                        className={`
                          px-3 py-1 rounded-full text-sm font-medium inline-flex items-center
                          ${isOverdue 
                            ? 'bg-red-100 text-red-800'
                            : isUrgent 
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }
                        `}
                      >
                        {isOverdue 
                          ? <AlertTriangle className="h-4 w-4 mr-1" />
                          : isUrgent
                            ? <Clock className="h-4 w-4 mr-1" />
                            : <CheckCircle2 className="h-4 w-4 mr-1" />
                        }
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysRemaining)} days`
                          : isUrgent
                            ? `Due in ${daysRemaining} days`
                            : `Due in ${daysRemaining} days`
                        }
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {project.description || `${project.deliverables.length} deliverables`}
                    </p>
                    <Progress value={progress.percentage} className="h-2 mb-2" />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {progress.completed} of {progress.total} tasks completed
                      </p>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          View Project
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;