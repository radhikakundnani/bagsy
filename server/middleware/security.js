const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

// Stop the server starting with missing or placeholder secrets
const checkConfig = () => {
  const problems = [];
  if (!process.env.MONGO_URI) problems.push('MONGO_URI is missing');
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.startsWith('your_') || secret.length < 32) {
    problems.push('JWT_SECRET must be a long random string (run: openssl rand -hex 32)');
  }
  if (isProd && !process.env.CLIENT_URL) problems.push('CLIENT_URL must be set in production');
  if (problems.length) {
    console.error(`\nServer config problems:\n - ${problems.join('\n - ')}\n`);
    process.exit(1);
  }
};

// Only our own website may call the API from a browser.
// CLIENT_URL can list several, comma-separated, e.g. "https://bagsy.app,https://www.bagsy.app"
const allowedOrigins = () => {
  const list = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  if (!isProd) list.push('http://localhost:3000', 'http://127.0.0.1:3000');
  return list;
};

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // No origin = not a browser (curl, mobile app, server-to-server): allowed, they still need a login token
    if (!origin || allowedOrigins().includes(origin)) return callback(null, true);
    return callback(null, false);
  },
});

// Remove keys starting with "$" or containing "." from request bodies (blocks MongoDB operator injection)
const sanitizeBody = (req, res, next) => {
  const clean = (value) => {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
          .map(([key, v]) => [key, clean(v)])
      );
    }
    return value;
  };
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  next();
};

const limiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message },
  });

const limiters = {
  // Every API call: generous, just stops floods
  api: limiter(15, 600, 'Too many requests. Please slow down and try again in a few minutes.'),
  // Log in, sign up, password reset: stops password guessing
  auth: limiter(15, 20, 'Too many attempts. Please wait 15 minutes and try again.'),
  // Creating or joining trips calls the weather and AI APIs, which have quotas
  costly: limiter(60, 30, "You've made a lot of trips in the last hour. Please try again later."),
};

const securityHeaders = helmet();

module.exports = { checkConfig, corsMiddleware, sanitizeBody, limiters, securityHeaders };
