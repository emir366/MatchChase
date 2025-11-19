const { validationResult } = require('express-validator');

/**
 * Wrap async route handlers to forward errors to express error middleware
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation middleware for express-validator result checking
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Map common Prisma error codes to HTTP statuses/messages.
 * This is used by the global error handler in server.js.
 */
function mapPrismaError(err) {
  if (!err || !err.code) return null;

  switch (err.code) {
    case 'P2002': // Unique constraint failed
      return { 
        status: 409, 
        body: { error: 'Unique constraint failed', meta: err.meta || null } 
      };
    case 'P2025': // Record to update/delete does not exist
      return { 
        status: 404, 
        body: { error: 'Record not found' } 
      };
    case 'P2003': // Foreign key constraint failed
      return { 
        status: 400, 
        body: { error: 'Foreign key constraint failed' } 
      };
    default:
      // Fallback for other Prisma errors
      return { 
        status: 400, 
        body: { error: 'Database error', code: err.code, message: err.message } 
      };
  }
}

module.exports = { asyncHandler, handleValidationErrors, mapPrismaError };