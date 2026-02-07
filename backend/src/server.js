const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/message');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase();

// Security middleware - disable CSP for static files
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - allow same origin in production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same domain or direct access)
    if (!origin) return callback(null, true);
    
    // In production, allow same domain
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // In development, check allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100 to 200
  message: 'Juda ko\'p so\'rov yuborildi, keyinroq qayta urinib ko\'ring'
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased from 10 to 50
  message: 'Juda ko\'p autentifikatsiya urinishi, 15 daqiqadan keyin qayta urinib ko\'ring'
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  console.log('📁 Serving static files from:', frontendPath);
  
  // Serve static files BEFORE API routes
  app.use(express.static(frontendPath));
}

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle React Router - send index.html for all non-API routes
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler - only for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint topilmadi'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Don't send JSON error for static file requests
  if (req.path.includes('/assets/') || req.path.endsWith('.js') || req.path.endsWith('.css')) {
    return res.status(404).send('Not found');
  }
  
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ichki server xatoligi'
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'localhost'}`);
});

// Initialize WebSocket
initializeSocket(io);

module.exports = app;
