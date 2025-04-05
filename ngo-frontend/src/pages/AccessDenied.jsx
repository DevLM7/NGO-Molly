import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const AccessDenied = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the required roles from the location state
  const requiredRoles = location.state?.requiredRoles || [];
  
  // Get the dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    // Check if user is an NGO (any type)
    const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
    if (ngoRoles.includes(user.role)) {
      return '/ngo/dashboard';
    }
    
    // Default to volunteer dashboard
    return '/volunteer/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Unauthorized Access
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {user ? (
                      <>
                        You are logged in as <span className="font-medium">{user.name}</span> with role <span className="font-medium">{user.role}</span>.
                        {requiredRoles.length > 0 && (
                          <> This page requires one of the following roles: <span className="font-medium">{requiredRoles.join(', ')}</span>.</>
                        )}
                      </>
                    ) : (
                      'You need to be logged in to access this page.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Go Back
            </button>
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiHome className="mr-2 -ml-1 h-5 w-5" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 