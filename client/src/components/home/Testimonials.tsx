import { Star } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="mb-12 bg-primary-50 py-10 px-4 rounded-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        From Procrastinators to Productive Students
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              JD
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">Jamie D.</h3>
              <p className="text-sm text-gray-500">Computer Science Major</p>
            </div>
          </div>
          <p className="text-gray-600">
            "I used to start every assignment the night before it was due. With Deadline Dash, I completed my senior project two days early and got an A+!"
          </p>
          <div className="mt-4 flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              MT
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">Michael T.</h3>
              <p className="text-sm text-gray-500">Business Administration</p>
            </div>
          </div>
          <p className="text-gray-600">
            "The way it breaks down complex group projects into daily tasks has been a game-changer for our team. Everyone knows exactly what to work on each day."
          </p>
          <div className="mt-4 flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              SJ
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">Sarah J.</h3>
              <p className="text-sm text-gray-500">Psychology Student</p>
            </div>
          </div>
          <p className="text-gray-600">
            "As someone with ADHD, traditional planning tools never worked for me. Deadline Dash's small, manageable tasks and visual progress tracking has been life-changing."
          </p>
          <div className="mt-4 flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
