// Checks Bagsy's security settings against the real app.
// Uses a throwaway database "bagsy-test" and deletes it afterwards.   Run:  npm run test:security
require('dotenv').config();
process.env.GEMINI_API_KEY = '';
process.env.WEATHER_API_KEY = '';
require('../config/db'); // applies the public-DNS fix for Atlas on your laptop
const mongoose = require('mongoose');
const axios = require('axios');
const app = require('../app');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'bagsy-test' });
  await mongoose.connection.dropDatabase();
  const server = app.listen(0);
  const api = axios.create({ baseURL: `http://127.0.0.1:${server.address().port}`, validateStatus: () => true });

  let passed = 0;
  let failed = 0;
  const check = (name, condition, detail = '') => {
    condition ? passed++ : failed++;
    console.log(condition ? '  ✓' : '  ✗', name, condition ? '' : detail);
  };

  try {
    let r = await api.post('/api/auth/signup', { name: 'Weak', email: 'weak@test.bagsy', password: 'password' });
    check('Server rejects a weak password (not just the website)', r.status === 400, JSON.stringify(r.data));

    r = await api.post('/api/auth/signup', { name: 'Asha', email: 'asha@test.bagsy', password: 'Str0ng!pass' });
    check('Strong password signup works', r.status === 201);

    r = await api.post('/api/auth/login', { email: { $ne: null }, password: 'anything' });
    check('Database-operator trick in login is blocked', r.status === 400 || r.status === 401, `${r.status} ${JSON.stringify(r.data)}`);

    r = await api.post('/api/auth/login', { email: 'asha@test.bagsy', password: 'Wrong!pass1' });
    check('Wrong password gives a generic message', r.status === 401 && r.data.message === 'Invalid email or password');

    r = await api.post('/api/auth/forgotpassword', { email: 'nobody@test.bagsy' });
    check("Forgot-password doesn't reveal whether an account exists", r.status === 200 && /If that email/.test(r.data.data));

    r = await api.get('/');
    check('Hides "X-Powered-By: Express"', !r.headers['x-powered-by']);
    check('Sends safe browser headers (helmet)', r.headers['x-content-type-options'] === 'nosniff' && Boolean(r.headers['content-security-policy']));

    r = await api.get('/api/trips', { headers: { Origin: 'https://evil.example' } });
    check('Other websites are not allowed by CORS', !r.headers['access-control-allow-origin']);
    r = await api.get('/api/trips', { headers: { Origin: 'http://localhost:3000' } });
    check('Our own website is allowed by CORS', r.headers['access-control-allow-origin'] === 'http://localhost:3000');

    r = await api.post('/api/auth/login', { email: 'x'.repeat(50000), password: 'x' });
    check('Very large requests are rejected', r.status === 413, String(r.status));

    r = await api.get('/api/does-not-exist');
    check('Unknown routes return a clean 404', r.status === 404 && r.data.success === false);

    r = await api.get('/api/trips/not-an-id', { headers: { Authorization: 'Bearer bad.token.here' } });
    check('Errors never include stack traces', r.status === 401 && !('stack' in r.data), JSON.stringify(r.data));

    // Leave this last: it uses up the login attempts for this run
    let last;
    for (let i = 0; i < 25; i++) last = await api.post('/api/auth/login', { email: 'asha@test.bagsy', password: 'Guess!ing1' });
    check('Password guessing gets blocked after too many tries', last.status === 429, String(last.status));
  } catch (err) {
    failed++;
    console.error('Test crashed:', err.message);
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
})();
