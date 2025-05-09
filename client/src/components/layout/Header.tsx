import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-primary">DeadlineDash</span>
              </a>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard">
              <a className={`px-3 py-2 text-sm font-medium ${location === '/dashboard' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/new-project">
              <a className={`px-3 py-2 text-sm font-medium ${location === '/new-project' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                New Project
              </a>
            </Link>
            <a href="#" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">
              Analytics
            </a>
            <a href="#" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">
              Help
            </a>
          </nav>
          
          <div className="flex items-center">
            <Link href="/new-project">
              <Button>
                New Project
              </Button>
            </Link>
            <button 
              type="button" 
              className="md:hidden ml-4"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-4 space-y-1">
              <Link href="/dashboard">
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === '/dashboard' 
                      ? 'bg-primary-50 text-primary' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/new-project">
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === '/new-project' 
                      ? 'bg-primary-50 text-primary' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  New Project
                </a>
              </Link>
              <a 
                href="#" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              >
                Analytics
              </a>
              <a 
                href="#" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
              >
                Help
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
