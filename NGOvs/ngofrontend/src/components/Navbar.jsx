import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiCalendar, FiUsers, FiBox, FiBarChart2, FiSettings, FiAward } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  const getProfilePath = () => {
    if (!user) return '/login';
    return '/profile';
  };

  const ngoLinks = [
    { path: '/ngo/events', label: 'Events', icon: <FiCalendar className="inline-block mr-1" /> },
    { path: '/ngo/applications', label: 'Applications', icon: <FiUsers className="inline-block mr-1" /> },
    { path: '/ngo/resources', label: 'Resources', icon: <FiBox className="inline-block mr-1" /> },
    { path: '/ngo/reports', label: 'Reports', icon: <FiBarChart2 className="inline-block mr-1" /> },
    { path: '/gallery', label: 'Gallery', icon: null },
    { path: '/ngo/settings', label: 'Settings', icon: <FiSettings className="inline-block mr-1" /> }
  ];

  const volunteerLinks = [
    { path: '/volunteer/events', label: 'Events', icon: <FiCalendar className="inline-block mr-1" /> },
    { path: '/volunteer/badges', label: 'Badges', icon: <FiAward className="inline-block mr-1" /> },
    { path: '/gallery', label: 'Gallery', icon: null }
  ];

  const getNavLinks = () => {
    if (!user) return [];
    
    // Check if user is an NGO (any type)
    const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
    if (ngoRoles.includes(user.role)) {
      return ngoLinks;
    }
    
    // Default to volunteer links
    return volunteerLinks;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                NGO Platform
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardPath()}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FiHome className="inline-block mr-1" />
                  Dashboard
                </Link>
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={getProfilePath()}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FiUser className="inline-block mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FiLogOut className="inline-block mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiHome className="inline-block mr-1" />
                  Dashboard
                </Link>
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={getProfilePath()}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUser className="inline-block mr-1" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                >
                  <FiLogOut className="inline-block mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 