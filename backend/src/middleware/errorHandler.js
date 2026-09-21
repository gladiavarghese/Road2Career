const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    const field = err.detail?.match(/\((.+?)\)/)?.[1] || 'field';
    message = `${field} already exists.`;
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Referenced record does not exist.';
  } else if (err.code === '23502') { // Not null violation
    statusCode = 400;
    message = `${err.column} is required.`;
  } else if (err.code === '22P02') { // Invalid UUID
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  // Log error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    body: req.body,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Create custom error
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = errorHandler;
module.exports.AppError = AppError;
