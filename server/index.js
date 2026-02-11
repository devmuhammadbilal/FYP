import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http'; // Required to attach Socket.io to the server
import { Server } from 'socket.io'; // The library for Real-Time communication
import { OpenAI } from 'openai';
import { v2 as cloudinary } from 'cloudinary'; 
import crypto from 'crypto'; // Built-in Node module to generate random IDs

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profile from './routes/profile.js';

// Load environment variables (API keys) from .env file
dotenv.config();

// --- CONFIGURATION ---
// LOGIC: Configure Cloudinary so we can upload generated images to the cloud
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY, 
});

// Initialize Express (The Web Framework)
const app = express();

// EXPLAINER: Socket.io cannot attach directly to an Express app easily, 
// so we create a standard HTTP server and wrap the Express app inside it.
const httpServer = createServer(app);

// LOGIC: Initialize the Socket.io Server
// CORS (Cross-Origin Resource Sharing) is crucial here. 
// It allows the frontend (port 5173) to talk to this backend (port 8080).
const io = new Server(httpServer, {
 cors: {
    origin: ["http://localhost:5173", "https://imagegeniee.vercel.app"], 
    methods: ["GET", "POST"],
  },
});

// Initialize OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// Middleware Setup
app.use(cors()); // Allow requests from other domains
app.use(express.json({ limit: '50mb' })); // Allow large data payloads (images)

// LOGIC: Register API Routes (Endpoints)
// When frontend calls '/api/v1/auth', it goes to authRoutes
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profile);

// Simple Health Check Route
app.get('/', async (req, res) => {
  res.send('Hello From DALL-E!');
});

// --- GLOBAL STATE (IN-MEMORY DATABASE) ---
// EXPLAINER: This object stores all active rooms, users, and chat history.
// We use a variable (RAM) instead of MongoDB for speed because chat needs to be instant.
// TRADE-OFF: If the server restarts, this data is lost (which is fine for temporary chat rooms).
const roomStates = {}; 

// Helper function to generate a random 6-character Room ID (e.g., "A1B2C3")
const generateRoomId = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); 
};

// ==========================================
//    REAL-TIME COLLABORATION ENGINE
// ==========================================
io.on("connection", (socket) => {
  // 'socket' represents the specific user who just connected
  console.log(`🟢 [Socket] User Connected: ${socket.id}`);

  // --- 1. CREATE ROOM LOGIC ---
  socket.on("create_room", (data) => {
      const userName = data.user;
      
      // Generate a unique ID (ensure it doesn't already exist)
      let roomId = generateRoomId();
      while (roomStates[roomId]) { roomId = generateRoomId(); }

      // Initialize the Room State Object
      roomStates[roomId] = { 
          users: [],           // List of users in room
          gallery: [],         // History of generated images
          currentWriter: null  // Who is currently typing? (Locking mechanism)
      };
      
      console.log(`🏠 [Room Created] ID: ${roomId} | Creator: ${userName}`);
      // Send the new Room ID back to the creator so they can join it
      socket.emit("room_created", roomId);
  });

  // --- 2. JOIN ROOM LOGIC ---
  socket.on("join_room", (data) => {
    const room = typeof data === 'object' ? data.room : data;
    const userName = typeof data === 'object' ? data.user : "Guest";

    // Validation: Does room exist?
    if (!roomStates[room]) {
        console.warn(`⚠️ [Join Failed] Room ${room} not found.`);
        socket.emit("error_join", "Room not found!");
        return;
    }

    // Validation: Is room full? (Max 4 users)
    const existingRoom = io.sockets.adapter.rooms.get(room);
    const roomSize = existingRoom ? existingRoom.size : 0;

    if (roomSize >= 4) {
      console.warn(`⚠️ [Join Failed] Room ${room} is full.`);
      socket.emit("error_join", "Room is full!");
      return; 
    }

    // LOGIC: Actually join the socket channel
    socket.join(room);
    
    // Tag the socket with info so we can handle disconnects later
    socket.currentRoom = room; 
    socket.userName = userName;

    // Add user to our Global State
    roomStates[room].users.push({ id: socket.id, name: userName });
    
    // Broadcast: Tell everyone in the room "Update your user list"
    io.in(room).emit("update_user_list", roomStates[room].users);

    console.log(`👤 [Join Success] ${userName} joined Room ${room}. Total Users: ${roomStates[room].users.length}`);

    // LOGIC: SYNC HISTORY
    // If the room already has images, send them to the NEW user only
    if (roomStates[room].gallery.length > 0) {
        console.log(`📚 [History] Sending ${roomStates[room].gallery.length} images to ${userName}`);
        socket.emit("update_gallery", roomStates[room].gallery);
        
        // Show the latest image on the main canvas
        const latest = roomStates[room].gallery[0];
        socket.emit("receive_shared_image", { 
            photo: latest.url, 
            prompt: latest.prompt,
            user: "History"
        });
    }

    // If someone is currently typing (locked), tell the new user
    if (roomStates[room].currentWriter) {
       socket.emit("prompt_lock_status", { locker: roomStates[room].currentWriter });
    }
  });

  // --- 3. LOCKING LOGIC (MUTEX) ---
  // EXPLAINER: This prevents two users from typing over each other.
  // Only one user ('currentWriter') can edit the prompt at a time.
  
  socket.on("start_prompt_edit", ({ room, user }) => {
     if (roomStates[room]) {
         // Lock if no one is writing OR if the requester is already the writer
         if (!roomStates[room].currentWriter || roomStates[room].currentWriter === user) {
             roomStates[room].currentWriter = user;
             // Tell everyone else: "User X is typing, disable your input box"
             socket.to(room).emit("prompt_lock_status", { locker: user });
             console.log(`🔒 [Locked] Prompt locked by ${user} in Room ${room}`);
         }
     }
  });

  socket.on("stop_prompt_edit", ({ room }) => {
     if (roomStates[room]) {
         roomStates[room].currentWriter = null;
         // Tell everyone: "Input is free now"
         socket.to(room).emit("prompt_lock_status", { locker: null });
         console.log(`🔓 [Unlocked] Prompt released in Room ${room}`);
     }
  });

  // --- CHAT LOGIC ---
  socket.on("send_message", (data) => {
    // 'socket.to(room)' sends to everyone EXCEPT the sender
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  // REAL-TIME TEXT SYNC
  socket.on("sync_prompt", (data) => {
    if (roomStates[data.room]) {
        // Updates the text box for everyone else while I type
        socket.to(data.room).emit("receive_prompt_sync", data.text);
    }
  });

  // --- 4. GENERATE IMAGE (The Core Feature) ---
  socket.on("collaborative_generate", async (data) => {
    const { prompt, room, user } = data;
    if (!roomStates[room]) return;

    console.log(`🎨 [Generate Start] Room: ${room} | User: ${user} | Prompt: "${prompt}"`);

    try {
      // Step A: Tell everyone "Loading..."
      io.in(room).emit("generation_status", { status: "loading", user: user });

      // Step B: Call OpenAI API (The AI Brain)
      const aiResponse = await openai.images.generate({
        model: "dall-e-2", 
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });
      console.log(`✅ [OpenAI] Image Generated. Uploading to Cloudinary...`);

      const base64Image = aiResponse.data[0].b64_json;
      const photoStr = `data:image/jpeg;base64,${base64Image}`;

      // Step C: Upload to Cloudinary (The Storage)
      // We do this so we have a valid URL to share with everyone
      const uploadResponse = await cloudinary.uploader.upload(photoStr, {
          folder: "fyp_collab_temp" // Stored in a temp folder
      });
      console.log(`☁️ [Cloudinary] Upload Success: ${uploadResponse.secure_url}`);

      const photoUrl = uploadResponse.secure_url;
      const publicId = uploadResponse.public_id; 

      // Step D: Update Server Memory (Gallery State)
      const newImageObj = {
          id: Date.now(),
          url: photoUrl,
          publicId: publicId,
          prompt: prompt,
          user: user
      };

      // Add to front of array, remove oldest if > 20 (Circular Buffer)
      roomStates[room].gallery.unshift(newImageObj);
      if (roomStates[room].gallery.length > 20) roomStates[room].gallery.pop();

      // Step E: Broadcast Success to EVERYONE in the room
      io.in(room).emit("receive_shared_image", { photo: photoUrl, prompt: prompt, user: user });
      io.in(room).emit("update_gallery", roomStates[room].gallery);
      io.in(room).emit("generation_status", { status: "success", user: user });
      console.log(`🚀 [Broadcast] Image sent to room ${room}`);

    } catch (error) {
      console.error(`❌ [Generation Error]`, error);
      io.in(room).emit("generation_status", { status: "error", message: "Generation Failed" });
    }
  });

  // --- 5. CLEANUP (Garbage Collection) ---
  // EXPLAINER: When a user closes the tab, this runs.
  socket.on("disconnect", () => {
    const room = socket.currentRoom;
    console.log(`🔴 [Disconnect] User ${socket.id} left.`);

    if (room && roomStates[room]) {
      // Logic: If the person who left was "holding the lock", release it
      if (roomStates[room].currentWriter === socket.userName) {
          roomStates[room].currentWriter = null;
          socket.to(room).emit("prompt_lock_status", { locker: null });
      }

      // Remove user from the list
      roomStates[room].users = roomStates[room].users.filter(u => u.id !== socket.id);
      io.in(room).emit("update_user_list", roomStates[room].users);

      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      
      // LOGIC: EMPTY ROOM CLEANUP
      // If the room is empty (size 0), we delete the images from Cloudinary to save money/space.
      if (roomSize === 0) {
        console.log(`🧹 [Cleanup] Room ${room} is empty. Starting cleanup...`);

        const imagesToDelete = roomStates[room].gallery.map(img => img.publicId);

        if (imagesToDelete.length > 0) {
            // Bulk delete images from cloud
            cloudinary.api.delete_resources(imagesToDelete, (error, result) => {
                if (error) console.error("❌ [Cloudinary Cleanup Error]", error);
                else console.log(`✨ [Cloudinary Cleanup] Deleted ${imagesToDelete.length} images. Result:`, result);
            });
        }

        // Delete the room from server memory
        delete roomStates[room];
        console.log(`🗑️ [Room Deleted] Room ${room} removed from memory.`);
      }
    }
  });
});

// Start the HTTP Server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    connectDB(process.env.MONGODB_URL);
    // Then start listening for requests
    httpServer.listen(8080, () => console.log('🚀 Server started on port http://localhost:8080'));
  } catch (error) {
    console.log(error);
  }
}

startServer();

