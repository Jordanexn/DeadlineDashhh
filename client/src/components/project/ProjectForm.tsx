import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepIndicator from "./StepIndicator";
import RubricUpload from "./RubricUpload";
import TimelineSettings from "./TimelineSettings";
import TaskReview from "./TaskReview";
import { RubricAnalysisResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type ProjectFormProps = {
  defaultStep?: number;
};

const ProjectForm = ({ defaultStep = 1 }: ProjectFormProps) => {
  const [currentStep, setCurrentStep] = useState(defaultStep);
  const [project, setProject] = useState({
    name: "",
    description: "",
    dueDate: "",
    userId: 1  // Using default user for now
  });
  const [rubricText, setRubricText] = useState("");
  const [analyzedRubric, setAnalyzedRubric] = useState<RubricAnalysisResult>({ deliverables: [] });
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    hoursPerDay: 2
  });
  const [projectId, setProjectId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleAnalyzeRubric = async () => {
    if (!project.name) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive"
      });
      return;
    }
    
    if (!rubricText) {
      toast({
        title: "Rubric text required",
        description: "Please enter or upload a rubric.",
        variant: "destructive"
      });
      return;
    }
    
    try {
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
      
      const data = await response.json();
      
      if (data.deliverables && data.deliverables.length > 0) {
        setAnalyzedRubric(data);
        setCurrentStep(2);
      } else {
        toast({
          title: "No deliverables found",
          description: "We couldn't extract any deliverables from your rubric. Please try with more detailed text.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error analyzing rubric",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTimeline = async () => {
    if (!project.dueDate) {
      toast({
        title: "Due date required",
        description: "Please select a due date for your project.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First create the project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }
      
      const projectData = await projectResponse.json();
      setProjectId(projectData.id);
      
      // Create availability for the project
      await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectData.id,
          ...availability
        }),
      });
      
      // Create deliverables
      for (const deliverable of analyzedRubric.deliverables) {
        await fetch('/api/deliverables', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: projectData.id,
            name: deliverable.name,
            description: deliverable.description,
            points: deliverable.points
          }),
        });
      }
      
      // Generate timeline
      const timelineResponse = await fetch(`/api/projects/${projectData.id}/generate-timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!timelineResponse.ok) {
        throw new Error('Failed to generate timeline');
      }
      
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error creating project",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSaveProject = () => {
    toast({
      title: "Project saved successfully!",
      description: "You can now access it from your dashboard.",
    });
    setLocation('/dashboard');
  };

  const handleGoBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  const updateProject = (data: Partial<typeof project>) => {
    setProject(prev => ({ ...prev, ...data }));
  };
  
  const updateAvailability = (data: Partial<typeof availability>) => {
    setAvailability(prev => ({ ...prev, ...data }));
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
        
        <StepIndicator currentStep={currentStep} />
        
        {currentStep === 1 && (
          <RubricUpload 
            project={project}
            updateProject={updateProject}
            rubricText={rubricText}
            setRubricText={setRubricText}
            onAnalyze={handleAnalyzeRubric}
          />
        )}
        
        {currentStep === 2 && (
          <TimelineSettings 
            project={project}
            updateProject={updateProject}
            availability={availability}
            updateAvailability={updateAvailability}
            deliverables={analyzedRubric.deliverables}
            onBack={handleGoBack}
            onNext={handleGenerateTimeline}
          />
        )}
        
        {currentStep === 3 && projectId && (
          <TaskReview 
            projectId={projectId}
            onBack={handleGoBack}
            onSave={handleSaveProject}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
