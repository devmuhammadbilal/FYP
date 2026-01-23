import express from 'express';
import User from '../mongodb/models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; 
import axios from 'axios'; // CHANGED: We use Axios instead of Nodemailer

dotenv.config();
const router = express.Router();

// 1. REGISTER (Send Verification OTP via EmailJS)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    // If user exists AND is verified, stop them
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate Verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // --- EMERGENCY BACKUP: Log OTP to Console (For Thesis Demo) ---
    console.log("#############################################");
    console.log("### EMERGENCY REGISTRATION OTP: ", otp, " ###");
    console.log("#############################################");

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.username = username;
      existingUser.password = password;
      existingUser.verificationToken = otp;
      existingUser.verificationTokenExpires = expiry;
      await existingUser.save();
    } else {
      // Create new user
      const user = new User({ 
        username, 
        email, 
        password,
        verificationToken: otp,
        verificationTokenExpires: expiry,
        isVerified: false // Explicitly false
      });
      await user.save();
    }

    // --- SEND EMAIL VIA EMAILJS (HTTP Request) ---
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        to_name: username,
        otp: otp,
        message: "Welcome to ImageGenie! Please verify your account."
      }
    };

    try {
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
      console.log('Email sent successfully via EmailJS');
    } catch (emailError) {
      console.error('EmailJS Failed (Check Console for Emergency OTP):', emailError.message);
      // We do NOT stop the request here. We let it succeed so you can use the Console OTP.
    }

    res.status(200).json({ message: 'Verification code sent (Check logs if email failed)' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing registration' });
  }
});

// 2. VERIFY EMAIL (Standard Route)
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationToken: otp,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Activate User
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// 3. LOGIN (Standard Route)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email address' }); 
  }

  // --- CHECK IF VERIFIED ---
  if (!user.isVerified) {
    return res.status(400).json({ message: 'Please verify your email before logging in' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });

  res.json({ 
    token,
    userName: user.username, 
    userId : user._id
  });
});

// --- FORGOT PASSWORD ROUTES (Updated to use EmailJS) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 600000; 
    await user.save();

    // --- EMERGENCY LOG ---
    console.log("#############################################");
    console.log("### EMERGENCY RESET OTP: ", otp, " ###");
    console.log("#############################################");

    // --- SEND EMAIL VIA EMAILJS ---
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        to_name: user.username,
        otp: otp,
        message: "Here is your Password Reset Code. It expires in 10 minutes."
      }
    };

    try {
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
    } catch (emailError) {
      console.error('EmailJS Failed (Check Console for OTP):', emailError.message);
    }

    res.json({ message: "OTP sent (Check logs if email failed)" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request" });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
    res.json({ message: "OTP Verified" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});


export default router;
