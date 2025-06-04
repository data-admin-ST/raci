/**
 * CORS Configuration
 */
const logger = require('../utils/logger');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      logger.debug('Request has no origin, allowing access');
      return callback(null, true);
    }

    // Log the origin for debugging
    logger.debug(`Incoming request from origin: ${origin}`);

    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Development mode: allowing origin ${origin}`);
      return callback(null, true);
    }

    // For production, you might want to restrict this
    logger.debug(`Allowing origin: ${origin}`);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Accept',
    'X-Access-Token',
    'X-API-Key',
    'X-HTTP-Method-Override',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'Access-Control-Expose-Headers'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Accept'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight requests for 24 hours
  // Ensure proper handling of credentials
  optionsSuccessStatus: 204,
  // Handle credentials properly
  credentials: true,
  // Ensure proper handling of preflight requests
  preflightContinue: false
};

module.exports = corsOptions;
