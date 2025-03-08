/**
 * CSRF Protection Utilities
 * Provide centralized functions for CSRF token generation and validation.
 */
const crypto = require('crypto');

// Generează un token criptografic
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Validează token-ul CSRF din cerere comparând token-ul din sesiune cu cel oferit
const validateToken = req => {
  const sessionToken = req.session.csrfToken;
  const providedToken = req.body?._csrf || req.headers['x-csrf-token'];
  const skipRoutes = ['/hotelsdb', '/login', '/signup'];
  if (skipRoutes.includes(req.path)) return true;
  return sessionToken ? sessionToken === providedToken : false;
};

// Middleware pentru protecție CSRF pentru toate cererile
const csrfMiddleware = (req, res, next) => {
  if (req.method === 'GET') {
    // Pentru GET se generează un token nou și se atașează la sesiune
    const token = generateToken();
    req.session.csrfToken = token;
    res.locals.csrfToken = token;
  } else {
    // Pentru restul metodelor se validează token-ul
    if (!validateToken(req)) {
      if (req.xhr) return res.status(403).json({ error: 'Invalid CSRF token. Please refresh the page.' });
      req.flash('error', 'Form session expired. Please try again.');
      return res.redirect(req.get("Referrer") || "/");
    }
  }
  next();
};

module.exports = { generateToken, validateToken, csrfMiddleware };
