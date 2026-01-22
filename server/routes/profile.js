import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../mongodb/models/user.js';
import Post from '../mongodb/models/post.js';
import dotenv from 'dotenv';

const router = express.Router();

// Load environment variables from .env file
dotenv.config();

// Verify Token and Fetch User Profile
router.get('/', async (req, res) => {
  try {
    console.log('Profile route accessed'); // Log when the route is accessed
    
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Get the token part after "Bearer"
    
    if (!token) {
      return res.status(401).json({ message: 'No token found, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key to verify the token
    console.log('Decoded Token:', decoded);  // Log the decoded token

    // Fetch the user data using the decoded userId from the token (not decoded.id)
    const user = await User.findById(decoded.userId);  // Corrected this line to use decoded.userId
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's posts
    const posts = await Post.find({ userId: decoded.userId });  // Corrected this line to use decoded.userId

    // Return the user data and posts
    res.json({
      user: {
        username: user.username,
        email: user.email,
      },
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
