// server/mongodb/models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  name: { type: String, required: true }, // The username of the post creator
  prompt: { type: String, required: true }, // The prompt used for generating the image
  photo: { type: String, required: true }, // The URL of the generated image
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the User model
    required: true 
  },
  isSharedInCommunity: {
    type: Boolean,
    default: false, // Set to false by default, can be updated when shared
  },
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
