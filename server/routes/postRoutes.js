import express from 'express';
import * as dotenv from 'dotenv';
import{v2 as cloudinary} from 'cloudinary';

import Post from '../mongodb/models/post.js'

dotenv.config();

const router = express.Router();
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME ,
    api_key : process.env.CLOUDINARY_API_KEY ,
    api_secret : process.env.CLOUDINARY_SECRET_KEY,
})
// GET ALL POSTS (For Community Feed)
router.route('/').get(async(req , res)=>{
    try {
        // CHANGE: Only fetch posts where isSharedInCommunity is true
        const posts = await Post.find({ isSharedInCommunity: true }); 
        res.status(200).json({success : true , data : posts})
    } catch (error) {
        res.status(500).json({success : false , message : error})
    }
});
// CREATE A POST
router.route('/').post(async (req, res) => {
  try {
    const { name, prompt, photo, userId } = req.body; // Destructure userId from the request body
    const photoUrl = await cloudinary.uploader.upload(photo); // Upload image to Cloudinary

    // Create a new post, including the userId
    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl.url,
      userId, // Save userId from the frontend
      isSharedInCommunity: false, // Initially, the post is not shared
    });

    res.status(200).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Route to share a post in the community (update isSharedInCommunity field)
router.route('/post/share').post(async (req, res) => {
  try {
    const { postId } = req.body; // Get the postId from the request body

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Update the isSharedInCommunity field to true
    post.isSharedInCommunity = true;
    await post.save(); // Save the updated post

    res.status(200).json({
      success: true,
      message: 'Post shared in the community successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



export default router;
