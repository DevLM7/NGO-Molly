import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const AccessDenied = () => {
  const { user } = useAuth();

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
                      <>You are logged in as <span className="font-medium">{user.name}</span> with role <span className="font-medium">{user.role}</span>. You need a different role to access this page.</>
                    ) : (
                      'You need to be logged in to access this page.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Go back home
              </Link>
            </div>
            <div className="text-sm">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Login with a different account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 