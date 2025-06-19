const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomBrowserRoutes');
const searchSongRoute = require('./routes/insideRoom/searchSongRoute');
const queueRoutes = require('./routes/insideRoom/queueRoutes');
const currentSongRoutes = require('./routes/insideRoom/CurrentSongRoute');
const chatRoutes = require('./routes/insideRoom/ChatRoute');
const liveViewersRoutes = require('./routes/insideRoom/LiveViewersRoutes');


const app = express();
app.use(cors({
  origin: '*',  // Allow all origins during development
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/youtube', searchSongRoute);
app.use('/api/queue', queueRoutes);
app.use('/api/song', currentSongRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/live-viewers', liveViewersRoutes);

app.get('/api/server-info', (req, res) => {
  res.json({
    apiUrl: req.protocol + '://' + req.get('host'),
    socketUrl: req.protocol + '://' + req.get('host'),
    timestamp: Date.now()
  });
});

const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: '*',  // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible to other files
app.set('socketio', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(`room-${roomId}`);
    console.log(`User ${socket.id} joined room-${roomId}`);
  });

  // Handle leaving a room
  socket.on('leaveRoom', (roomId) => {
    socket.leave(`room-${roomId}`);
    console.log(`User ${socket.id} left room-${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(5000, () => console.log('Server running on port 5000'))) 
  .catch(err => console.error(err));

// to future add: initalize playback service.