import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const { user, login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Failed to login.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
        toast.error('Register user first!');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
        toast.error('Invalid credentials!');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
        toast.error('Invalid credentials!');
      } else {
        toast.error('Login failed!');
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to login with Google.');
      toast.error('Google login failed!');
    } finally {
      setIsLoading(false);
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
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#203A43] to-[#2C5364] hover:from-[#2C5364] hover:to-[#203A43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
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
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5364] transition-all duration-300 shadow hover:shadow-md"
              >
                <span className="flex items-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                  Google
                </span>
              </button>
            </div>
          </form>

          <div className="text-sm text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-[#2C5364] hover:text-[#203A43] transition-colors">
                Register here
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
