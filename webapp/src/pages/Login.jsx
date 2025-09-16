import { Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import hospitalBackground from '../assets/images/ug-image.png';
import ugLogo from '../assets/images/ug_logo.png'; // ✅ Import UG logo
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        const userRole = result.user.role;
        navigate(`/${userRole}`);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${hospitalBackground})`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      {/* Header Banner */}
      <div className="relative z-10 bg-blue-900 text-white py-3 px-6 shadow-lg">
        <div className="flex justify-center items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold tracking-wide">
            UNIVERSITY OF GHANA HOSPITAL MANAGEMENT SYSTEM
          </h1>
        </div>
      </div>
      
      {/* Yellow Separator Line */}
      <div className="relative z-10 h-1 bg-yellow-400" />
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Login Panel */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            
            {/* UG Logo on top */}
            <div className="flex justify-center mt-6 mb-4">
              <img 
                src={ugLogo} 
                alt="UG Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* Login Form */}
            <div className="px-6 pb-6">
              {/* Login Panel Header */}
              <div className="bg-blue-900 text-white py-3 px-4 -mx-6 mb-6">
                <h4 className="text-lg font-semibold">Login Panel</h4>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-6 text-center space-y-2">
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                  Forgot your password?
                </a>
                <div className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    Contact administrator
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-center py-4">
        <div className="h-px bg-green-500 mx-auto w-32 mb-4"></div>
        <p className="text-white text-sm">
          © 2025 University Of Ghana Hospital Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
