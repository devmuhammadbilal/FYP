import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast'; 

const Login = ({ handleLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Start Loading Toast
    const loadingToast = toast.loading('Signing in...');

    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userName', response.data.userName);
      localStorage.setItem('userId', response.data.userId);
      
      handleLoginSuccess(response.data.userName);
      
      // Success Toast
      toast.success(`Welcome back, ${response.data.userName}!`, { id: loadingToast });
      
      // Delay navigation slightly so user sees the success message
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      // Error Toast
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    // UPDATED: Adjusted padding (py-12 px-4) for mobile centering
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafe] relative overflow-hidden px-4 py-12 sm:pt-20">
      {/* Toast Container */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Blobs - UPDATED: Fixed sizes for mobile visibility */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-indigo-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        // UPDATED: Reduced padding (p-6) on mobile for better fit
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 sm:p-10 relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          {/* UPDATED: text-2xl for mobile, text-3xl for desktop */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Sign in to continue creating</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all"
              required
            />
          </div>

          {/* FORGOT PASSWORD LINK */}
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;