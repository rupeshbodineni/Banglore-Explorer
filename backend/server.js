const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // For dev, allow all. In production, restrict to frontend URL
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/places', require('./routes/places'));
app.use('/api/reviews', require('./routes/reviews'));

// Map to keep track of viewers per place
const placeViewers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific place room to get live updates for that place
  socket.on('join_place', (placeId) => {
    socket.join(placeId);
    
    // Increment viewer count
    if (!placeViewers.has(placeId)) {
      placeViewers.set(placeId, new Set());
    }
    placeViewers.get(placeId).add(socket.id);
    
    // Broadcast updated viewer count to everyone in the room
    io.to(placeId).emit('viewers_update', placeViewers.get(placeId).size);
    
    // Store current room in socket for cleanup on disconnect
    socket.currentRoom = placeId;
  });

  // Handle a new review being added
  socket.on('new_review', (data) => {
    // data should contain { placeId, review }
    io.to(data.placeId).emit('review_added', data.review);
  });

  // Handle leaving a place or disconnecting
  const handleLeave = () => {
    if (socket.currentRoom && placeViewers.has(socket.currentRoom)) {
      const viewers = placeViewers.get(socket.currentRoom);
      viewers.delete(socket.id);
      
      io.to(socket.currentRoom).emit('viewers_update', viewers.size);
      
      if (viewers.size === 0) {
        placeViewers.delete(socket.currentRoom);
      }
      
      socket.leave(socket.currentRoom);
      socket.currentRoom = null;
    }
  };

  socket.on('leave_place', handleLeave);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleLeave();
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
