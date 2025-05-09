import ProjectForm from "@/components/project/ProjectForm";

const NewProject = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
      <ProjectForm />
    </div>
  );
};

export default NewProject;
