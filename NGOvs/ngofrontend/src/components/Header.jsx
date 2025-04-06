import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/auth';
    
    // Check if user is an NGO (any type)
    const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
    if (ngoRoles.includes(user.role)) {
      return '/ngo/dashboard';
    }
    
    // Default to volunteer dashboard
    return '/volunteer/dashboard';
  };

  const getProfilePath = () => {
    if (!user) return '/auth';
    
    // Check if user is an NGO (any type)
    const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
    if (ngoRoles.includes(user.role)) {
      return '/ngo/profile';
    }
    
    // Default to volunteer profile
    return '/volunteer/profile';
  };

  const ngoLinks = [
    { path: '/ngo/events', label: 'Events' },
    { path: '/ngo/applications', label: 'Applications' },
    { path: '/ngo/resources', label: 'Resources' },
    { path: '/ngo/reports', label: 'Reports' },
    { path: '/gallery', label: 'Gallery' }
  ];

  const volunteerLinks = [
    { path: '/volunteer/events', label: 'Events' },
    { path: '/volunteer/badges', label: 'Badges' },
    { path: '/volunteer/ngos', label: 'NGOs' },
    { path: '/gallery', label: 'Gallery' }
  ];

  const getNavLinks = () => {
    if (!user) return [];
    return user.role === 'ngo_admin' ? ngoLinks : volunteerLinks;
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            NGO Platform
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-gray-600 hover:text-primary"
                >
                  Dashboard
                </Link>
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-600 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={getProfilePath()}
                  className="text-gray-600 hover:text-primary"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-gray-600 hover:text-primary"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="block text-gray-600 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-gray-600 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={getProfilePath()}
                  className="block text-gray-600 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block text-gray-600 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
