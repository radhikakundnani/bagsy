const ItineraryStop = require('../models/ItineraryStop');
const InspoItem = require('../models/InspoItem');
const { httpError, loadSection, dayCount, text, sameId } = require('../utils/sectionAccess');

const MAX_STOPS = 200;

// What the app gets back for each stop
const shape = (stop, userId, role) => ({
  _id: stop._id,
  day: stop.day,
  time: stop.time,
  title: stop.title,
  where: stop.where,
  note: stop.note,
  inspoId: stop.inspoId || null,
  addedBy: { _id: stop.addedBy?._id || stop.addedBy, name: stop.addedBy?.name || 'Former member' },
  isMine: sameId(stop.addedBy, userId),
  canEdit: sameId(stop.addedBy, userId) || role === 'admin',
});

// Check the day number fits inside the trip
const checkDay = (value, trip) => {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 0 || day >= dayCount(trip)) throw httpError(400, 'Pick a day inside the trip dates.');
  return day;
};

// Linking a stop to an inspo idea. A private idea becomes a group one,
// because everyone can see the itinerary.
const linkInspo = async (inspoId, trip, userId) => {
  if (!inspoId) return undefined;
  const item = await InspoItem.findOne({ _id: inspoId, tripId: trip._id });
  if (!item || (item.visibility === 'me' && !sameId(item.addedBy, userId))) throw httpError(404, 'That inspo idea was not found.');
  if (item.visibility === 'me') {
    item.visibility = 'group';
    await item.save();
  }
  return item._id;
};

// GET /api/trips/:id/itinerary
const getItinerary = async (req, res, next) => {
  try {
    const { trip, role } = await loadSection(req, 'itinerary');
    const stops = await ItineraryStop.find({ tripId: trip._id }).populate('addedBy', 'name').sort({ day: 1, time: 1, createdAt: 1 });
    res.json({ success: true, data: { days: dayCount(trip), stops: stops.map((s) => shape(s, req.user._id, role)) } });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/itinerary  (anyone on the trip)
const addStop = async (req, res, next) => {
  try {
    const { trip, role } = await loadSection(req, 'itinerary');
    if ((await ItineraryStop.countDocuments({ tripId: trip._id })) >= MAX_STOPS) {
      throw httpError(400, `A trip can have up to ${MAX_STOPS} stops.`);
    }
    const stop = await ItineraryStop.create({
      tripId: trip._id,
      addedBy: req.user._id,
      day: checkDay(req.body.day, trip),
      time: text(req.body.time),
      title: text(req.body.title),
      where: text(req.body.where),
      note: text(req.body.note),
      inspoId: await linkInspo(req.body.inspoId, trip, req.user._id),
    });
    await stop.populate('addedBy', 'name');
    res.status(201).json({ success: true, data: shape(stop, req.user._id, role) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id/itinerary/:stopId  (whoever added it, or the trip admin)
const updateStop = async (req, res, next) => {
  try {
    const { trip, role } = await loadSection(req, 'itinerary');
    const stop = await ItineraryStop.findOne({ _id: req.params.stopId, tripId: trip._id });
    if (!stop) throw httpError(404, 'Stop not found');
    if (!sameId(stop.addedBy, req.user._id) && role !== 'admin') throw httpError(403, 'Only the person who added this, or the trip admin, can change it.');

    const { day, time, title, where, note, inspoId } = req.body;
    if (day !== undefined) stop.day = checkDay(day, trip);
    if (time !== undefined) stop.time = text(time);
    if (title !== undefined) stop.title = text(title);
    if (where !== undefined) stop.where = text(where);
    if (note !== undefined) stop.note = text(note);
    if (inspoId !== undefined) stop.inspoId = inspoId ? await linkInspo(inspoId, trip, req.user._id) : undefined;

    await stop.save();
    await stop.populate('addedBy', 'name');
    res.json({ success: true, data: shape(stop, req.user._id, role) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id/itinerary/:stopId
const deleteStop = async (req, res, next) => {
  try {
    const { trip, role } = await loadSection(req, 'itinerary');
    const stop = await ItineraryStop.findOne({ _id: req.params.stopId, tripId: trip._id });
    if (!stop) throw httpError(404, 'Stop not found');
    if (!sameId(stop.addedBy, req.user._id) && role !== 'admin') throw httpError(403, 'Only the person who added this, or the trip admin, can remove it.');
    await stop.deleteOne();
    res.json({ success: true, message: 'Stop removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItinerary, addStop, updateStop, deleteStop };
