const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');
const { runSeeders } = require('./utils/dbSeeders');
const prisma = require('./lib/prisma');
const corsOptions = require('./config/corsConfig');

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Global CORS middleware - Handle all origins properly
app.use((req, res, next) => {
  // Set response type to JSON for all routes
  res.setHeader('Content-Type', 'application/json');
  
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    logger.debug(`Setting CORS for origin: ${origin}`);
  }

  // Set all necessary CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Access-Token, X-API-Key, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials, Access-Control-Expose-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Type, Authorization, X-Requested-With, Origin, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  next();
});

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup request logger
app.use(requestLogger);

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON Parse Error:', err);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid JSON payload' 
    });
  }
  next();
});

// Set static folder for uploads with CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Type, Authorization');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Mount routers with CORS and error handling
const mountRouter = (path, router) => {
  app.use(path, (req, res, next) => {
    // Set response type to JSON for all API routes
    res.setHeader('Content-Type', 'application/json');
    
    // Add error handling for this route
    const originalJson = res.json;
    res.json = function(data) {
      if (typeof data !== 'object') {
        logger.error(`Invalid JSON response for ${path}:`, data);
        return originalJson.call(this, { success: false, error: 'Invalid response format' });
      }
      return originalJson.call(this, data);
    };
    
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Access-Token, X-API-Key');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Type, Authorization');
    next();
  }, router);
};

// Mount all routers
mountRouter('/api/auth', require('./routes/auth'));
mountRouter('/api/users', require('./routes/users'));
mountRouter('/api/companies', require('./routes/companies'));
mountRouter('/api/companies/:companyId/departments', require('./routes/departments').companyDepartmentsRouter);
mountRouter('/api/departments', require('./routes/departments').departmentRouter);
mountRouter('/api/events', require('./routes/events'));
mountRouter('/api/raci-matrices', require('./routes/raci'));
mountRouter('/api/meetings', require('./routes/meetings'));
mountRouter('/api/dashboard', require('./routes/dashboard'));
mountRouter('/api/website-admins', require('./routes/websiteAdmins'));
mountRouter('/api/user-raci', require('./routes/userRaci'));
mountRouter('/api/hod', require('./routes/hod'));

// Basic route with CORS
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  res.json({
    success: true,
    message: 'RACI SaaS Platform API is running'
  });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  logger.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    path: req.originalUrl
  });
});

// Initialize database and run seeders before starting the server
const startServer = async () => {
  try {
    // Connect to database and validate connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
    
    // Run seeders
    await runSeeders();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error('Failed to start server:', error);
    process.exit(1);
  } finally {
    // Add a graceful shutdown to disconnect Prisma
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      logger.info('Disconnected from database');
      process.exit(0);
    });
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  logger.error(err.stack);
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
