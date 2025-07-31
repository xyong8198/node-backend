const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import middlewares
const { 
  securityHeaders, 
  generalRateLimit, 
  sanitizeRequest 
} = require('./middlewares/security.middleware');
const { 
  errorHandler, 
  notFound 
} = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const demoRoutes = require('./routes/demo.routes');

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(generalRateLimit);
app.use(sanitizeRequest);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/demo', demoRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Restaurant Backend API',
    data: {
      version: '1.0.0',
      documentation: '/docs',
      health: '/health',
      endpoints: {
        authentication: '/auth',
        demo: '/demo'
      }
    }
  });
});

// Handle 404 errors
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
