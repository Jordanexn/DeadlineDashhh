import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CTASection = () => {
  return (
    <section className="bg-primary-600 text-white rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Ready to End Procrastination?</h2>
      <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
        Don't wait until the last minute. Turn your assignments into manageable daily tasks and stay ahead of deadlines.
      </p>
      <Link href="/new-project">
        <Button variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
          Get Started For Free
        </Button>
      </Link>
    </section>
  );
};

export default CTASection;
