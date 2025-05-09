import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RubricUploadProps = {
  project: {
    name: string;
    description: string;
  };
  updateProject: (data: Partial<{ name: string; description: string }>) => void;
  rubricText: string;
  setRubricText: (text: string) => void;
  onAnalyze: () => void;
};

const RubricUpload = ({
  project,
  updateProject,
  rubricText,
  setRubricText,
  onAnalyze
}: RubricUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // For PDF, DOC, and DOCX, we'd normally use a server-side endpoint to extract text
      // For simplicity, we'll just read the text content for TXT files
      if (file.type === 'text/plain') {
        const text = await file.text();
        setRubricText(text);
      } else {
        // In a real implementation, we'd send the file to a server endpoint
        // that would extract text from PDFs and DOCs
        toast({
          title: "File type support limited",
          description: "In this demo, only TXT files can be fully processed. Please paste your rubric text instead.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "There was a problem reading your file. Please try again or paste the rubric text.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Assignment Rubric</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <Label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={project.name}
              onChange={(e) => updateProject({ name: e.target.value })}
              placeholder="CS 101 Final Project"
              className="w-full"
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description (Optional)
            </Label>
            <Textarea
              id="project-description"
              value={project.description}
              onChange={(e) => updateProject({ description: e.target.value })}
              placeholder="Brief description of the assignment..."
              rows={3}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Rubric
            </Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label 
                    htmlFor="file-upload" 
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <Input 
                      id="file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={handleFileUpload}
                      accept=".txt,.pdf,.doc,.docx"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-6">
            <Label htmlFor="rubric-text" className="block text-sm font-medium text-gray-700 mb-1">
              Or Paste Rubric Text
            </Label>
            <Textarea
              id="rubric-text"
              value={rubricText}
              onChange={(e) => setRubricText(e.target.value)}
              placeholder="Paste your assignment instructions here..."
              rows={12}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button 
          onClick={onAnalyze} 
          className="flex items-center space-x-2"
          disabled={isUploading}
        >
          <span>Analyze Rubric</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default RubricUpload;
