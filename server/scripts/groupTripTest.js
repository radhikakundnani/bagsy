// End-to-end check of group trips (invite, join, crew, admin view, leave, delete).
// Uses a separate database called "bagsy-test" in your cluster and deletes it afterwards,
// so your real data is never touched.   Run:  npm run test:groups
require('dotenv').config();
require('../config/db'); // applies the public-DNS fix for Atlas
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');

const day = (n) => new Date(Date.now() + n * 864e5).toISOString();

(async () => {
  process.env.WEATHER_API_KEY = ''; // skip real weather calls during the test
  process.env.GEMINI_API_KEY = ''; // and skip AI calls, so the test is fast and free
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'bagsy-test' });
  await mongoose.connection.dropDatabase();

  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/trips', require('../routes/tripRoutes'));
  app.use('/api/packing', require('../routes/packingRoutes'));
  app.use('/api/reminders', require('../routes/reminderRoutes'));
  app.use('/api/profile', require('../routes/profileRoutes'));
  app.use(require('../middleware/errorHandler'));
  const server = app.listen(0);
  const api = axios.create({ baseURL: `http://127.0.0.1:${server.address().port}/api`, validateStatus: () => true });

  let passed = 0;
  let failed = 0;
  const check = (name, condition, detail = '') => {
    condition ? passed++ : failed++;
    console.log(condition ? '  ✓' : '  ✗', name, condition ? '' : detail);
  };
  const as = (user) => ({ headers: { Authorization: `Bearer ${user.token}` } });
  const signup = async (name) =>
    (await api.post('/auth/signup', { name, email: `${name.toLowerCase()}@test.bagsy`, password: 'Passw0rd!' })).data.data;

  try {
    const alice = await signup('Alice');
    const bob = await signup('Bob');
    const cara = await signup('Cara');

    let r = await api.post('/trips', { destination: 'Goa', startDate: day(2), endDate: day(6), tripType: 'family', activities: ['beach'], mode: 'group' }, as(alice));
    const trip = r.data.data?.trip;
    check('Alice creates a group trip with an invite code', r.status === 201 && trip.mode === 'group' && trip.inviteCode, JSON.stringify(r.data));

    r = await api.post('/trips', { destination: 'Pune', startDate: day(10), endDate: day(12) }, as(alice));
    const solo = r.data.data.trip;
    check('Solo trips have no invite code', solo.mode === 'solo' && !solo.inviteCode);

    r = await api.get(`/trips/${trip._id}`, as(bob));
    check("Bob can't see the trip before joining", r.status === 404);

    r = await api.get(`/trips/join/${trip.inviteCode}`, as(bob));
    check('Invite preview says Alice invited him', r.data.data?.invitedBy === 'Alice', JSON.stringify(r.data));

    r = await api.post(`/trips/join/${trip.inviteCode}`, {}, as(bob));
    check('Bob joins with the link', r.status === 200 && r.data.data.alreadyMember === false);

    r = await api.post(`/trips/join/${trip.inviteCode}`, {}, as(bob));
    check('Joining twice does nothing bad', r.data.data?.alreadyMember === true);

    r = await api.post('/trips/join/not-a-real-code', {}, as(cara));
    check('A made-up code is rejected', r.status === 404);

    r = await api.get(`/trips/${trip._id}`, as(bob));
    check("Bob sees the trip as a member, without the invite code", r.data.data?.myRole === 'member' && !r.data.data.inviteCode);

    r = await api.get(`/packing/${trip._id}`, as(bob));
    const bobList = r.data.data;
    check('Bob gets his own packing list', r.status === 200 && bobList.items.length > 0);

    r = await api.put(`/packing/${trip._id}/item/${bobList.items[0]._id}`, { isPacked: true }, as(bob));
    check('Bob ticks an item', r.status === 200);

    r = await api.get('/trips', as(bob));
    check("Trip shows in Bob's trips with his progress (1 packed)", r.data.data?.[0]?.progress?.packed === 1, JSON.stringify(r.data.data?.[0]?.progress));

    r = await api.get(`/trips/${trip._id}/crew`, as(alice));
    const bobInCrew = r.data.data?.find((p) => p.name === 'Bob');
    check("Crew lists 2 people with Bob's progress", r.data.data?.length === 2 && bobInCrew?.progress.packed === 1, JSON.stringify(r.data));

    r = await api.get(`/packing/${trip._id}?member=${bob._id}`, as(alice));
    check("Alice (admin) can read Bob's list, read-only", r.status === 200 && r.data.data.readOnly && r.data.data.ownerName === 'Bob');

    r = await api.get(`/packing/${trip._id}?member=${alice._id}`, as(bob));
    check("Bob (member) can't read Alice's list", r.status === 403);

    r = await api.delete(`/trips/${trip._id}`, as(bob));
    check("Bob can't delete the trip", r.status === 404);

    r = await api.delete(`/trips/${trip._id}/members/${alice._id}`, as(bob));
    check("Bob can't remove Alice", r.status === 403 || r.status === 400);

    const oldCode = trip.inviteCode;
    r = await api.post(`/trips/${trip._id}/invite`, {}, as(alice));
    check('Alice makes a new invite link', r.data.data?.inviteCode && r.data.data.inviteCode !== oldCode);

    r = await api.post(`/trips/join/${oldCode}`, {}, as(cara));
    check('The old link stops working', r.status === 404);

    r = await api.post(`/trips/${solo._id}/invite`, {}, as(alice));
    check('A solo trip can be turned into a group trip', Boolean(r.data.data?.inviteCode));

    r = await api.get('/reminders', as(bob));
    check('Bob gets the "starts soon" reminder', r.data.data?.length === 1, JSON.stringify(r.data));

    r = await api.get('/profile', as(bob));
    check("Trip counts in Bob's profile", r.data.data?.stats.totalTrips === 1);

    r = await api.delete(`/trips/${trip._id}/members/${bob._id}`, as(bob));
    check('Bob leaves the trip', r.status === 200);

    r = await api.get(`/packing/${trip._id}`, as(bob));
    check("Bob's list is gone after leaving", r.status === 404);

    r = await api.delete(`/trips/${trip._id}`, as(alice));
    check('Alice deletes the trip', r.status === 200);
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
