/**
 * CSRF Protection Utilities
 * Provides centralized functions for CSRF token generation and validation
 */
const crypto = require('crypto');

// Generate a cryptographically secure token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate a token against the session token
function validateToken(req) {
  const sessionToken = req.session.csrfToken;
  const bodyToken = req.body?._csrf;
  const headerToken = req.headers['x-csrf-token'];
  
  // Routes to skip CSRF validation (add routes here for testing)
  const skipRoutes = ['/hotelsdb', '/login', '/signup'];
  
  // Skip validation for specific routes
  if (skipRoutes.includes(req.path)) {
    console.log(`Skipping CSRF validation for exempt route: ${req.path}`);
    return true;
  }
  
  // No session token is a configuration issue
  if (!sessionToken) {
    console.error('CSRF validation failed: No session token found');
    return false;
  }
  
  // Compare tokens
  const providedToken = bodyToken || headerToken;
  const isValid = sessionToken === providedToken;
  
  if (!isValid) {
    console.error('CSRF token mismatch:', {
      sessionToken: sessionToken,
      providedToken: providedToken,
      path: req.path,
      method: req.method
    });
  }
  
  return isValid;
}

// Middleware for CSRF protection
function csrfMiddleware(req, res, next) {
  // For GET requests, generate a new token
  if (req.method === 'GET') {
    const token = generateToken();
    req.session.csrfToken = token;
    res.locals.csrfToken = token;
    console.log(`Generated CSRF token for ${req.path}`);
  }
  
  // For non-GET requests, validate the token
  if (req.method !== 'GET') {
    if (!validateToken(req)) {
      if (req.xhr) {
        return res.status(403).json({ error: 'Invalid CSRF token. Please refresh the page.' });
      }
      
      req.flash('error', 'Form session expired. Please try again.');
      return res.redirect(req.get("Referrer") || "/");
    }
  }
  
  next();
}

module.exports = {
  generateToken,
  validateToken,
  csrfMiddleware
};
