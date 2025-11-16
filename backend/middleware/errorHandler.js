const mongoose = require('mongoose');

function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;
  const env = process.env.NODE_ENV || 'development';

  // Log detailed error in development
  if (env === 'development') {
    console.error('Error stack:', err.stack);
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  // Handle Mongoose CastError for invalid ObjectId
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
