const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cron = require('node-cron');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const useragent = require('express-useragent');
const geoip = require('geoip-lite');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Enhanced Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(mongoSanitize());
app.use(useragent.express());

// Enhanced CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || ["http://localhost:3000", "https://raw-wealthy.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Refresh-Token', 'X-Device-Id']
}));

// Enhanced Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again later.' 
  },
  keyGenerator: (req) => {
    return req.useragent.browser ? req.ip + req.useragent.browser : req.ip;
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const investmentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many investment requests, please slow down.'
  }
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/investments', investmentLimiter);

// Enhanced Compression & Logging
app.use(compression({
  level: 6,
  threshold: 100 * 1024 // Compress responses over 100KB
}));

app.use(morgan('combined', {
  skip: (req, res) => req.url === '/health'
}));

// Enhanced Body Parsing
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 100000
}));

// Static Files with Enhanced Security
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };
    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }
    
    // Security headers for files
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Enhanced Health Check
app.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    status: 'OK',
    message: '🚀 Raw Wealthy Backend v5.0 is running perfectly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '5.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    lastCronRun: global.lastCronRun || 'Never'
  };
  
  res.status(200).json(healthCheck);
});

// Database Connection with Enhanced Error Handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 30000
    });
    
    console.log('✅ MongoDB Connected Successfully to', conn.connection.host);
    
    // Initialize advanced features after DB connection
    require('./utils/cronJobsAdvanced');
    require('./utils/cache').init();
    require('./utils/socketService').init(io);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

// Enhanced Database Event Handlers
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected, attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Enhanced Routes
app.use('/api/auth', require('./routes/authAdvanced'));
app.use('/api/users', require('./routes/usersAdvanced'));
app.use('/api/investments', require('./routes/investmentsAdvanced'));
app.use('/api/plans', require('./routes/plansAdvanced'));
app.use('/api/transactions', require('./routes/transactionsAdvanced'));
app.use('/api/deposits', require('./routes/depositsAdvanced'));
app.use('/api/withdrawals', require('./routes/withdrawalsAdvanced'));
app.use('/api/admin', require('./routes/adminAdvanced'));
app.use('/api/support', require('./routes/supportAdvanced'));
app.use('/api/upload', require('./routes/uploadAdvanced'));
app.use('/api/referrals', require('./routes/referralsAdvanced'));
app.use('/api/notifications', require('./routes/notificationsAdvanced'));
app.use('/api/two-factor', require('./routes/twoFactorAdvanced'));
app.use('/api/analytics', require('./routes/analyticsAdvanced'));
app.use('/api/wallet', require('./routes/walletAdvanced'));

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('authenticate', (token) => {
    // Handle user authentication for real-time features
    require('./utils/socketService').authenticateSocket(socket, token);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Enhanced 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check the API documentation at /api/docs',
    availableEndpoints: [
      '/api/auth',
      '/api/investments',
      '/api/plans',
      '/api/users',
      '/api/admin',
      '/api/analytics'
    ]
  });
});

// Enhanced Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔴 Global Error Stack:', err.stack);
  
  // Log detailed error information
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.useragent.source,
    userId: req.user ? req.user.id : 'anonymous',
    timestamp: new Date().toISOString()
  };
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Error:', errorLog);
  }
  
  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ 
      success: false, 
      message: 'Validation Error', 
      errors: messages 
    });
  }
  
  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      success: false, 
      message: `${field} already exists` 
    });
  }
  
  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid authentication token' 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication token expired' 
    });
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  // Default error response
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, starting graceful shutdown');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, starting graceful shutdown');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎯 Raw Wealthy Server v5.0 running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🕒 Started at: ${new Date().toISOString()}`);
    console.log(`🔌 WebSocket Server: Ready for connections`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
