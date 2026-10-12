// End-to-end check of the optional trip sections: itinerary and inspo board
// (including private ideas). Uses the throwaway "bagsy-test" database.   Run:  npm run test:sections
require('dotenv').config();
require('../config/db'); // applies the public-DNS fix for Atlas
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');

const day = (n) => new Date(Date.now() + n * 864e5).toISOString();

(async () => {
  process.env.WEATHER_API_KEY = '';
  process.env.GEMINI_API_KEY = '';
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'bagsy-test' });
  await mongoose.connection.dropDatabase();

  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/trips', require('../routes/tripRoutes'));
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
    const eve = await signup('Eve');

    let r = await api.post('/trips', { destination: 'Goa', startDate: day(2), endDate: day(7), mode: 'group' }, as(alice));
    const trip = r.data.data.trip;
    await api.post(`/trips/join/${trip.inviteCode}`, {}, as(bob));
    const base = `/trips/${trip._id}`;

    check('New trips have both sections on', trip.sections?.itinerary === true && trip.sections?.inspo === true, JSON.stringify(trip.sections));

    // ---- Itinerary ----
    r = await api.get(`${base}/itinerary`, as(alice));
    check('Itinerary knows the trip is 6 days', r.data.data?.days === 6, JSON.stringify(r.data));

    r = await api.post(`${base}/itinerary`, { day: 0, time: '18:15', title: 'Sunset at Vagator', where: 'Vagator' }, as(alice));
    const sunset = r.data.data;
    check('Alice adds a stop', r.status === 201 && sunset.title === 'Sunset at Vagator');

    r = await api.post(`${base}/itinerary`, { day: 1, title: 'Flea market' }, as(bob));
    const market = r.data.data;
    check('Bob (member) adds a stop with no time', r.status === 201 && market.time === '');

    r = await api.post(`${base}/itinerary`, { day: 6, title: 'Too late' }, as(alice));
    check('A day outside the trip is refused', r.status === 400);

    r = await api.post(`${base}/itinerary`, { day: 0, time: '25:00', title: 'Bad time' }, as(alice));
    check('A bad time is refused', r.status === 400);

    r = await api.post(`${base}/itinerary`, { day: 0, title: '   ' }, as(alice));
    check('An empty plan is refused', r.status === 400);

    r = await api.put(`${base}/itinerary/${sunset._id}`, { title: 'Hijacked' }, as(bob));
    check("Bob can't edit Alice's stop", r.status === 403);

    r = await api.delete(`${base}/itinerary/${market._id}`, as(alice));
    check("Alice (admin) can remove Bob's stop", r.status === 200);

    r = await api.get(`${base}/itinerary`, as(eve));
    check("Eve (not on the trip) can't see the itinerary", r.status === 404);

    // ---- Inspo board ----
    r = await api.post(`${base}/inspo`, { kind: 'link', url: 'https://www.instagram.com/reel/abc123/', note: 'Slow-mo walk' }, as(alice));
    const reel = r.data.data;
    check('Alice saves a reel and it is detected as Instagram', r.status === 201 && reel.source === 'instagram' && reel.visibility === 'group');

    r = await api.post(`${base}/inspo`, { kind: 'link', url: 'javascript:alert(1)' }, as(alice));
    check('A javascript: link is refused', r.status === 400);

    r = await api.post(`${base}/inspo`, { kind: 'note', note: '6am solo run', visibility: 'me' }, as(bob));
    const secret = r.data.data;
    check('Bob saves a private idea', r.status === 201 && secret.visibility === 'me');

    r = await api.get(`${base}/inspo`, as(alice));
    check("Alice sees the group board but not Bob's private idea", r.data.data.length === 1 && r.data.data[0]._id === reel._id, JSON.stringify(r.data.data));

    r = await api.get(`${base}/inspo`, as(bob));
    check('Bob sees the group board and his private idea', r.data.data.length === 2);

    r = await api.put(`${base}/inspo/${secret._id}`, { done: true }, as(alice));
    check("Alice can't touch Bob's private idea (looks not found)", r.status === 404);

    r = await api.delete(`${base}/inspo/${secret._id}`, as(alice));
    check("Not even the admin can delete Bob's private idea", r.status === 404);

    r = await api.put(`${base}/inspo/${reel._id}`, { done: true }, as(bob));
    check('Bob ticks the group reel as shot', r.status === 200 && r.data.data.done === true);

    r = await api.put(`${base}/inspo/${reel._id}`, { note: 'changed' }, as(bob));
    check("Bob can't edit Alice's note", r.status === 403);

    r = await api.post(`${base}/itinerary`, { day: 2, title: 'Run', inspoId: secret._id }, as(alice));
    check("Alice can't link Bob's private idea to a stop", r.status === 404);

    r = await api.post(`${base}/itinerary`, { day: 2, title: 'Morning run', inspoId: secret._id }, as(bob));
    check('Bob puts his private idea on a day', r.status === 201);

    r = await api.get(`${base}/inspo`, as(alice));
    check('...which shares it with the group', r.data.data.length === 2);

    r = await api.put(`${base}/inspo/${secret._id}`, { visibility: 'me' }, as(bob));
    check("An idea on the itinerary can't go back to private", r.status === 400);

    r = await api.post(`${base}/itinerary`, { day: 0, title: 'Sunset reel', inspoId: reel._id }, as(alice));
    r = await api.delete(`${base}/inspo/${reel._id}`, as(alice));
    r = await api.get(`${base}/itinerary`, as(alice));
    const orphan = r.data.data.stops.find((s) => s.title === 'Sunset reel');
    check('Deleting an idea keeps the stop but drops the link', orphan && orphan.inspoId === null);

    // ---- Switching sections ----
    r = await api.put(base, { sections: { inspo: false } }, as(bob));
    check("Bob (member) can't switch sections", r.status === 404);

    r = await api.put(base, { sections: { inspo: false } }, as(alice));
    check('Alice switches the inspo board off', r.status === 200 && r.data.data.sections.inspo === false && r.data.data.sections.itinerary === true);

    r = await api.get(`${base}/inspo`, as(bob));
    check('A switched-off section is closed', r.status === 403);

    r = await api.put(base, { sections: { inspo: true } }, as(alice));
    r = await api.get(`${base}/inspo`, as(bob));
    check('Switching it back on keeps everything', r.status === 200 && r.data.data.length === 1);

    // ---- Leaving + deleting ----
    await api.post(`${base}/inspo`, { kind: 'note', note: 'just mine', visibility: 'me' }, as(bob));
    await api.delete(`${base}/members/${bob._id}`, as(bob));
    const InspoItem = require('../models/InspoItem');
    const left = await InspoItem.find({ tripId: trip._id, addedBy: bob._id });
    check("When Bob leaves, his private ideas go and shared ones stay", left.length === 1 && left[0].visibility === 'group');

    await api.delete(base, as(alice));
    const ItineraryStop = require('../models/ItineraryStop');
    const leftovers = (await ItineraryStop.countDocuments({ tripId: trip._id })) + (await InspoItem.countDocuments({ tripId: trip._id }));
    check('Deleting the trip deletes its itinerary and ideas', leftovers === 0);
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
