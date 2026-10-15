const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const { corsMiddleware, sanitizeBody, limiters, securityHeaders } = require('./middleware/security');

// The Express app on its own (no database connection, no port), so tests can use it too.
const app = express();

// Behind a hosting platform's proxy, this makes rate limits see the real visitor IP
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(securityHeaders); // safe browser headers; also hides "X-Powered-By: Express"
app.use(corsMiddleware); // only our own website can call the API from a browser
app.use(express.json({ limit: '20kb' })); // reject huge request bodies
app.use(sanitizeBody);

// quick check that the server is awake (used by the host and the uptime pinger)
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', limiters.api);
app.use(['/api/auth/login', '/api/auth/signup', '/api/auth/forgotpassword', '/api/auth/resetpassword'], limiters.auth);
app.post('/api/trips', limiters.costly);
app.post('/api/trips/join/:code', limiters.costly);
app.use('/api/sort-demo', limiters.demo);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/packing', require('./routes/packingRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/sort-demo', require('./routes/demoRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Bagsy API is running' });
});

// Unknown API routes get a clean 404 instead of an HTML page
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

app.use(errorHandler); // must be last

module.exports = app;
