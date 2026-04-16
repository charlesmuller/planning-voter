/**
 * Middleware to set security headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const setSecurityHeaders = (req, res, next) => {
  res.set({
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  });
  next();
};

module.exports = setSecurityHeaders;
