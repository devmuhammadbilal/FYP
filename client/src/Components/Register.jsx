import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast'; 
import config from '../config';

const Register = () => {
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Verification
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP 1: Register and Send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Creating account...');

    try {
      await axios.post(`${config.backendUrl}/api/v1/auth/register`, formData);
      toast.success('Verification code sent to email!', { id: loadingToast });
      setStep(2); // Move to next step
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error registering user';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Verifying email...');

    try {
      await axios.post(`${config.backendUrl}/api/v1/auth/verify-email`, { 
        email: formData.email, 
        otp 
      });
      
      toast.success('Email Verified! Login now.', { id: loadingToast });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      toast.error('Invalid Verification Code', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    // UPDATED: Adjusted padding (pt-24 px-4) for better mobile centering
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafe] relative overflow-hidden px-4 pt-24 pb-10 sm:pt-28">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Blobs - UPDATED: Fixed sizes for mobile visibility */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-fuchsia-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // UPDATED: Reduced padding (p-6) on mobile for better fit
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 sm:p-10 relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          {/* UPDATED: text-2xl for mobile to prevent wrapping */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {step === 1 ? "Join the creative community" : `Enter the code sent to ${formData.email}`}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {/* --- STEP 1: REGISTRATION FORM --- */}
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              onSubmit={handleRegister} 
              className="space-y-4 sm:space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all"
                  required
                />
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? 'Sending Code...' : 'Next'}
              </button>
            </motion.form>
          )}

          {/* --- STEP 2: OTP VERIFICATION FORM --- */}
          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleVerify} 
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                {/* UPDATED: Adjusted tracking and text size for mobile vs desktop */}
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all text-center text-xl sm:text-2xl tracking-widest sm:tracking-[0.5em] font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-indigo-600"
              >
                Incorrect email? Go back
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};


export default Register;
