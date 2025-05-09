const Features = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        How Deadline Dash Helps You Beat Procrastination
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1506097425191-7ad538b29cef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
            alt="NLP text analysis visualization" 
            className="w-full h-40 object-cover rounded-lg mb-4" 
          />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Rubric Analysis</h3>
          <p className="text-gray-600">
            Our NLP engine extracts key deliverables, requirements, and grading criteria from your assignment documents automatically.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
            alt="Project timeline visualization" 
            className="w-full h-40 object-cover rounded-lg mb-4" 
          />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Dynamic Timeline Generation</h3>
          <p className="text-gray-600">
            Get a personalized day-by-day task schedule that adapts based on your working style, availability, and the project deadline.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
            alt="Progress tracking visualization" 
            className="w-full h-40 object-cover rounded-lg mb-4" 
          />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Priority System</h3>
          <p className="text-gray-600">
            Our algorithm identifies which tasks are most crucial based on dependencies, complexity, and point value in your grading rubric.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
