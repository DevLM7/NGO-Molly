import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-9xl font-header font-bold text-primary">404</h1>
        <h2 className="text-2xl font-header font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="mt-4 text-gray-600">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link 
            to="/" 
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
