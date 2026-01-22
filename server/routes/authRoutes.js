import express from 'express'
import User from '../mongodb/models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; 
import nodemailer from 'nodemailer'; 

dotenv.config();
const router = express.Router();

// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 25, // Using port 465 is often more reliable for SSL
  secure: true, // This must be true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add this timeout setting to prevent hanging
  connectionTimeout: 10000, 
});

// 1. REGISTER (Send Verification OTP)
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

    // Send Verification Email
    await transporter.sendMail({
      from: '"ImageGenie Security" <no-reply@imagegenie.com>',
      to: email,
      subject: 'Verify your Email',
      html: `<b>Welcome to ImageGenie!</b><br>Your verification code is: <h1>${otp}</h1><br>Please enter this code to complete your registration.`
    });

    res.status(200).json({ message: 'Verification code sent to email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing registration' });
  }
});

// 2. VERIFY EMAIL (New Route)
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

// 3. LOGIN (Updated to check Verification)
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

// --- FORGOT PASSWORD ROUTES (Keep these same as before) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 600000; 
    await user.save();

    await transporter.sendMail({
      from: '"ImageGenie Support" <no-reply@imagegenie.com>',
      to: email,
      subject: 'Password Reset OTP',
      html: `<b>Your OTP for password reset is: ${otp}</b><br>It expires in 10 minutes.`
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
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

