import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h1 className="text-9xl font-bold text-blue-100">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page not found</h2>
      <p className="text-gray-500 mt-2 mb-8 max-w-md">Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
      
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        <Home className="w-5 h-5" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
