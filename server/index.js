import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { OpenAI } from 'openai';
import crypto from 'crypto'; // Native Node module for random IDs

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profile from './routes/profile.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profile);

app.get('/', async (req, res) => {
  res.send('Hello From DALL-E!');
});

// --- GLOBAL STATE MEMORY ---
const roomStates = {}; 

// Helper to generate 6-char unique ID
const generateRoomId = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., "A1B2C3"
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. CREATE ROOM (New Secure Method)
  socket.on("create_room", (data) => {
      const userName = data.user;
      let roomId = generateRoomId();

      // Ensure uniqueness (extremely rare collision check)
      while (roomStates[roomId]) {
          roomId = generateRoomId();
      }

      // Initialize State
      roomStates[roomId] = { users: [], prompt: "", photo: "" };
      
      // Send the ID back to client so they can auto-join
      socket.emit("room_created", roomId);
  });

  // 2. JOIN ROOM (Updated with Security Check)
  socket.on("join_room", (data) => {
    const room = typeof data === 'object' ? data.room : data;
    const userName = typeof data === 'object' ? data.user : "Guest";

    // --- SECURITY CHECK: Does room exist? ---
    if (!roomStates[room]) {
        socket.emit("error_join", "Room not found! Please check the ID or create a new room.");
        return;
    }

    // --- LIMIT CHECK ---
    const existingRoom = io.sockets.adapter.rooms.get(room);
    const roomSize = existingRoom ? existingRoom.size : 0;

    if (roomSize >= 4) {
      socket.emit("error_join", "Room is full! Max 4 users allowed.");
      return; 
    }

    socket.join(room);
    socket.currentRoom = room; 
    console.log(`User ${socket.id} (${userName}) joined room: ${room}`);

    // Add User to Memory
    roomStates[room].users.push({ id: socket.id, name: userName });

    // Broadcast Updated User List
    io.in(room).emit("update_user_list", roomStates[room].users);

    // Sync Existing Data
    if (roomStates[room].prompt) {
      socket.emit("receive_prompt_sync", roomStates[room].prompt);
    }
    if (roomStates[room].photo) {
      socket.emit("receive_shared_image", { 
         photo: roomStates[room].photo, 
         prompt: roomStates[room].prompt,
         user: "System (History)"
      });
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  // 3. Sync Prompt
  socket.on("sync_prompt", (data) => {
    if (roomStates[data.room]) {
        roomStates[data.room].prompt = data.text;
        socket.to(data.room).emit("receive_prompt_sync", data.text);
    }
  });

  // 4. Generate Image
  socket.on("collaborative_generate", async (data) => {
    const { prompt, room, user } = data;
    
    // Security check
    if (!roomStates[room]) return;

    try {
      io.in(room).emit("generation_status", { status: "loading", user: user });

      const aiResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });

      const image = aiResponse.data[0].b64_json;
      const photoUrl = `data:image/jpeg;base64,${image}`;
      
      roomStates[room].photo = photoUrl;
      roomStates[room].prompt = prompt; 

      io.in(room).emit("receive_shared_image", {
        photo: photoUrl,
        prompt: prompt,
        user: user
      });

      io.in(room).emit("generation_status", { status: "success", user: user });

    } catch (error) {
      console.error(error);
      io.in(room).emit("generation_status", { status: "error", message: "Generation Failed" });
    }
  });

  // 5. CLEANUP
  socket.on("disconnect", () => {
    const room = socket.currentRoom;

    if (room && roomStates[room]) {
      roomStates[room].users = roomStates[room].users.filter(u => u.id !== socket.id);
      
      io.in(room).emit("update_user_list", roomStates[room].users);

      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      if (roomSize === 0) {
        delete roomStates[room];
        console.log(`Room ${room} cleaned up.`);
      }
    }
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    httpServer.listen(process.env.PORT || 8080, () => console.log('Server has Started on port http://localhost:8080'));
  } catch (error) {
    console.log(error);
  }
}


startServer();
