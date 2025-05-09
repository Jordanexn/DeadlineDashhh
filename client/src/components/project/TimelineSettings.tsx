import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

type TimelineSettingsProps = {
  project: {
    name: string;
    description: string;
    dueDate: string;
  };
  updateProject: (data: Partial<{ dueDate: string }>) => void;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    hoursPerDay: number;
  };
  updateAvailability: (data: Partial<typeof availability>) => void;
  deliverables: Array<{
    name: string;
    description?: string;
  }>;
  onBack: () => void;
  onNext: () => void;
};

const TimelineSettings = ({
  project,
  updateProject,
  availability,
  updateAvailability,
  deliverables,
  onBack,
  onNext
}: TimelineSettingsProps) => {
  const [newDeliverable, setNewDeliverable] = useState("");
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [checkedDeliverables, setCheckedDeliverables] = useState<Record<number, boolean>>(
    deliverables.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<number, boolean>)
  );

  const handleAvailabilityChange = (day: keyof Omit<typeof availability, 'hoursPerDay'>) => {
    updateAvailability({ [day]: !availability[day] });
  };

  const handleHoursChange = (value: number[]) => {
    updateAvailability({ hoursPerDay: value[0] });
  };

  const handleDeliverableCheck = (index: number, checked: boolean) => {
    setCheckedDeliverables(prev => ({
      ...prev,
      [index]: checked
    }));
  };

  const handleAddDeliverable = () => {
    if (newDeliverable) {
      deliverables.push({ name: newDeliverable });
      setNewDeliverable("");
      setShowAddDeliverable(false);
    }
  };

  // Calculate the minimum due date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Set Your Timeline</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Project Deadline
            </Label>
            <Input 
              type="date" 
              min={minDueDate}
              value={project.dueDate}
              onChange={(e) => updateProject({ dueDate: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Your Availability
            </Label>
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="text-xs font-medium text-gray-500">Mon</div>
              <div className="text-xs font-medium text-gray-500">Tue</div>
              <div className="text-xs font-medium text-gray-500">Wed</div>
              <div className="text-xs font-medium text-gray-500">Thu</div>
              <div className="text-xs font-medium text-gray-500">Fri</div>
              <div className="text-xs font-medium text-gray-500">Sat</div>
              <div className="text-xs font-medium text-gray-500">Sun</div>
              
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.monday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('monday')}
              >
                {availability.monday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.tuesday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('tuesday')}
              >
                {availability.tuesday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.wednesday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('wednesday')}
              >
                {availability.wednesday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.thursday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('thursday')}
              >
                {availability.thursday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.friday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('friday')}
              >
                {availability.friday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.saturday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('saturday')}
              >
                {availability.saturday ? '✓' : ''}
              </div>
              <div 
                className={`p-2 border rounded hover:bg-primary-200 cursor-pointer ${
                  availability.sunday ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleAvailabilityChange('sunday')}
              >
                {availability.sunday ? '✓' : ''}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Time Commitment
            </Label>
            <div className="flex items-center">
              <div className="flex-1">
                <Slider 
                  defaultValue={[availability.hoursPerDay]} 
                  max={6} 
                  min={1} 
                  step={1}
                  onValueChange={handleHoursChange}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {availability.hoursPerDay} {availability.hoursPerDay === 1 ? 'hour' : 'hours'}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Extracted Deliverables</h4>
            <ul className="space-y-3">
              {deliverables.map((deliverable, index) => (
                <li key={index} className="flex items-start">
                  <Checkbox 
                    id={`deliverable-${index}`}
                    checked={checkedDeliverables[index]}
                    onCheckedChange={(checked) => handleDeliverableCheck(index, checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor={`deliverable-${index}`} className="ml-2 text-gray-800">
                    {deliverable.name}
                  </label>
                </li>
              ))}
            </ul>
            
            {showAddDeliverable ? (
              <div className="mt-4 flex">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Enter new deliverable"
                  className="flex-1 mr-2"
                />
                <Button size="sm" onClick={handleAddDeliverable}>
                  Add
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 text-primary hover:text-primary-700 p-0 h-auto font-medium"
                onClick={() => setShowAddDeliverable(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Missing Deliverable
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          className="flex items-center" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <Button 
          className="flex items-center" 
          onClick={onNext}
        >
          Generate Timeline
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TimelineSettings;
