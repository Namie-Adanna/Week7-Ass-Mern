// Performance monitoring middleware
const logger = require('../utils/logger');

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.url,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
      });
    }
    
    // Log performance metrics
    logger.info({
      message: 'Request completed',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length') || 0,
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = performanceMonitor;