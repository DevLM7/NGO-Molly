import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
      if (ngoRoles.includes(user.role)) {
        navigate('/ngo/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      // Navigate based on user role
      const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
      if (ngoRoles.includes(user.role)) {
        navigate('/ngo/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await loginWithGoogle();
      toast.success('Login successful!');
      
      // Navigate based on user role
      const ngoRoles = ['ngo_admin', 'ngo', 'organization', 'organization_admin'];
      if (ngoRoles.includes(user.role)) {
        navigate('/ngo/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google');
      toast.error('Google login failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent. Check your inbox!');
      setShowForgotPassword(false);
    } catch (error) {
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      }
      setError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ 
           background: 'linear-gradient(to right, #1E3A8A, #76A1E2, #1E3A8A)',
           position: 'relative',
           overflow: 'hidden'
         }}>
      {/* Decorative circle */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70">
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          <div className="absolute inset-0 rounded-full border-4 border-white/30" 
               style={{ boxShadow: '0 0 40px rgba(132, 206, 235, 0.5)' }}></div>
          <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
          <div className="absolute inset-6 rounded-full border-2 border-white/40" 
               style={{ boxShadow: '0 0 20px rgba(90, 185, 234, 0.3)' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
        </div>
      </div>
      
      {showForgotPassword ? (
        <div className="max-w-md w-full z-10 p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl" 
            style={{ boxShadow: '0 10px 40px rgba(86, 128, 233, 0.3)' }}>
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold text-[#2C5364]">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address to receive a password reset link
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5364] focus:border-[#2C5364] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] transition-all duration-300 shadow hover:shadow-md"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#203A43] to-[#2C5364] hover:from-[#2C5364] hover:to-[#203A43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="max-w-md w-full z-10 p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl" 
            style={{ boxShadow: '0 10px 40px rgba(86, 128, 233, 0.3)' }}>
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold text-[#2C5364]">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to continue to the NGO platform
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5364] focus:border-[#2C5364] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5364] focus:border-[#2C5364] focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-[#2C5364] hover:text-[#203A43] transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#203A43] to-[#2C5364] hover:from-[#2C5364] hover:to-[#203A43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] transition-all duration-300 shadow hover:shadow-md"
              >
                <span className="flex items-center">
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Google
                </span>
              </button>
            </div>
          </form>

          <div className="text-sm text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#2C5364] hover:text-[#203A43] transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 