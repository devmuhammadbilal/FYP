import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- API HANDLERS ---
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Sending OTP...');
    
    try {
      await axios.post('http://localhost:8080/api/v1/auth/forgot-password', { email });
      setStep(2);
      toast.success('OTP sent to your email!', { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending OTP', { id: loadingToast });
    } finally { 
      setLoading(false); 
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Verifying code...');

    try {
      await axios.post('http://localhost:8080/api/v1/auth/verify-otp', { email, otp });
      setStep(3);
      toast.success('OTP Verified', { id: loadingToast });
    } catch (error) {
      toast.error('Invalid or expired OTP', { id: loadingToast });
    } finally { 
      setLoading(false); 
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Updating password...');

    try {
      await axios.post('http://localhost:8080/api/v1/auth/reset-password', { email, newPassword });
      toast.success('Password reset successful! Redirecting...', { id: loadingToast });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Error resetting password', { id: loadingToast });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    // UPDATED: Changed pt-20 to py-12 sm:pt-20 for better vertical centering on mobile
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafe] relative overflow-hidden px-4 py-12 sm:pt-20">
      
      <Toaster position="top-center" reverseOrder={false} />

      {/* UPDATED: Fixed sizes (w-[300px]) for mobile so blobs remain visible */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-indigo-400/20 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        // UPDATED: p-6 for mobile, p-10 for desktop
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 sm:p-10 relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Recover Account</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <motion.form key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={sendOtp} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </motion.form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <motion.form key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={verifyOtp} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">One-Time Password</label>
                {/* UPDATED: tracking-widest for mobile, tracking-[0.5em] for desktop to prevent overflow */}
                <input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="123456" 
                    className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all text-center tracking-widest sm:tracking-[0.5em] font-bold text-xl" 
                    maxLength={6} 
                    required 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </motion.form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <motion.form key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={resetPassword} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 outline-none transition-all" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-bold text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;