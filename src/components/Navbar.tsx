import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Betting Tracker
            </Link>
          </div>
          
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              to="/tracker"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tracker')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Tracker
            </Link>
            
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Historial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 