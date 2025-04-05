import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-header font-bold text-primary">
              NGO<span className="text-secondary">Connect</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                Login
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 py-3 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="text-gray-700 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
