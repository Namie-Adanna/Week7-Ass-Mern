// Request logging middleware
const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => {
    // Use the 'info' log level so the output will be picked up by both transports
    logger.info(message.trim());
  },
};

// Skip logging during tests
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Build the morgan middleware
const requestLogger = morgan(
  // Define message format string (this is the default one)
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  { stream, skip }
);

module.exports = requestLogger;