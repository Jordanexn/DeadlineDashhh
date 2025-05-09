import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beat Procrastination With Smart Planning
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Upload your assignment rubric, set a deadline, and we'll break it down into manageable daily tasks designed for your success.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/new-project">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Project
              </Button>
            </Link>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary-50">
              How It Works
            </Button>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
            alt="Student working on laptop with deadline" 
            className="rounded-xl shadow-lg w-full h-auto" 
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
