type StepIndicatorProps = {
  currentStep: number;
};

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center`}>
            1
          </div>
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-gray-500'} mt-2`}>
            Upload Rubric
          </span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-4">
          <div className="h-1 bg-primary" style={{ width: currentStep >= 2 ? '100%' : '0%' }}></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center`}>
            2
          </div>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-gray-500'} mt-2`}>
            Set Timeline
          </span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-4">
          <div className="h-1 bg-primary" style={{ width: currentStep >= 3 ? '100%' : '0%' }}></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center`}>
            3
          </div>
          <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-primary' : 'text-gray-500'} mt-2`}>
            Review Tasks
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
