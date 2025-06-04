/**
 * CORS Configuration
 */
const logger = require('../utils/logger');

const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://localhost:*',
  'http://127.0.0.1:*',
  
  // Zrok tunnels
  'https://*.zrok.io',
  'http://*.zrok.io',
  
  // Ngrok tunnels - specific patterns
  'https://*.ngrok-free.app',  // This is the specific pattern for your ngrok URL
  'http://*.ngrok-free.app',
  'https://*.ngrok.io',
  'http://*.ngrok.io',
  
  // Allow any subdomain of your main domain (if you have one)
  'https://*.yourdomain.com',
  'http://*.yourdomain.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    if (!origin) {
      logger.debug('Request has no origin, allowing access');
      return callback(null, true);
    }

    // Special handling for ngrok-free.app domains
    if (origin.includes('ngrok-free.app')) {
      logger.debug(`Allowing ngrok-free.app origin: ${origin}`);
      return callback(null, true);
    }

    // Check if origin matches any of our allowed patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard domains and ports
        const pattern = allowedOrigin
          .replace(/\./g, '\\.') // Escape dots
          .replace(/\*/g, '.*'); // Convert * to .*
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      logger.debug(`Origin ${origin} is allowed by CORS policy`);
      return callback(null, true);
    } else {
      // For development, log the blocked origin to help debug
      logger.warn(`Origin ${origin} is not allowed by CORS policy`);
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        logger.info('Development mode: allowing origin despite not being in allowed list');
        return callback(null, true);
      }
      return callback(null, false);
    }
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
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight requests for 24 hours
};

module.exports = corsOptions;
