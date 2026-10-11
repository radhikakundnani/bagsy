const errorHandler = (err, req, res, next) => {
  // Errors from Express itself (too-large or malformed requests) carry their own status code
  let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  if (err.type === 'entity.too.large') message = 'That request is too large.';
  if (err.type === 'entity.parse.failed') message = 'That request was not valid JSON.';

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
  }

  // MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Unexpected server errors: log the details, but don't show them to users (they can reveal how the app works)
  const isDev = process.env.NODE_ENV === 'development';
  if (statusCode >= 500) {
    console.error(err);
    if (!isDev) message = 'Something went wrong on our side. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
