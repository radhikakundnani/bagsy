const Trip = require('../models/Trip');
const User = require('../models/User');
const PackingList = require('../models/PackingList');
const { getTripWeather } = require('../services/weatherService');
const { generateList } = require('../services/packingGenerator');
const { findTripForUser, myTripsFilter, newInviteCode, tripForRole } = require('../utils/tripAccess');

const DAY_MS = 1000 * 60 * 60 * 24;
const MAX_MEMBERS = 20;

// Build a fresh packing list for one person on a trip
const createListFor = (trip, userId) => {
  const durationDays = Math.ceil((trip.endDate - trip.startDate) / DAY_MS);
  const items = generateList(trip.weather, trip.activities, durationDays, trip.tripType);
  return PackingList.create({ tripId: trip._id, userId, items });
};

// Packed / total for a list
const progressOf = (list) => ({
  packed: list ? list.items.filter((i) => i.isPacked).length : 0,
  total: list ? list.items.length : 0,
});

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const { destination, startDate, endDate, activities, tripType, mode } = req.body;

    if (!destination || !startDate || !endDate) {
      res.status(400);
      throw new Error('Please provide destination, startDate, and endDate');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      res.status(400);
      throw new Error('endDate must be after startDate');
    }

    const isGroup = mode === 'group';
    const weather = await getTripWeather(destination, start, end);

    const trip = await Trip.create({
      userId: req.user._id,
      destination,
      startDate: start,
      endDate: end,
      activities: activities || [],
      tripType: tripType || 'leisure',
      mode: isGroup ? 'group' : 'solo',
      inviteCode: isGroup ? newInviteCode() : undefined,
      weather,
    });

    const packingList = await createListFor(trip, req.user._id);

    res.status(201).json({
      success: true,
      data: { trip: tripForRole(trip, 'admin'), packingList },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips  (trips I created or joined, with my packing progress)
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find(myTripsFilter(req.user._id)).sort({ startDate: 1 });

    const lists = await PackingList.find({
      tripId: { $in: trips.map((t) => t._id) },
      userId: req.user._id,
    }).select('tripId items.isPacked');
    const listByTrip = new Map(lists.map((l) => [String(l.tripId), l]));

    const data = trips.map((trip) => {
      const role = trip.userId.equals(req.user._id) ? 'admin' : 'member';
      return { ...tripForRole(trip, role), progress: progressOf(listByTrip.get(String(trip._id))) };
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found) {
      res.status(404);
      throw new Error('Trip not found');
    }

    const myList = await PackingList.findOne({ tripId: found.trip._id, userId: req.user._id }).select('items.isPacked');
    res.json({ success: true, data: { ...tripForRole(found.trip, found.role), progress: progressOf(myList) } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id  (admin only)
const updateTrip = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found || found.role !== 'admin') {
      res.status(404);
      throw new Error('Trip not found');
    }
    const { trip } = found;
    const { destination, startDate, endDate, activities, tripType } = req.body;

    const sameDay = (a, b) => new Date(a).getTime() === new Date(b).getTime();
    const weatherInputsChanged =
      (destination && destination !== trip.destination) ||
      (startDate && !sameDay(startDate, trip.startDate)) ||
      (endDate && !sameDay(endDate, trip.endDate));

    if (destination) trip.destination = destination;
    if (startDate) trip.startDate = new Date(startDate);
    if (endDate) trip.endDate = new Date(endDate);
    if (activities) trip.activities = activities;
    if (tripType) trip.tripType = tripType;

    // Weather depends on where and when, so re-fetch if either changed
    if (weatherInputsChanged) {
      trip.weather = await getTripWeather(trip.destination, trip.startDate, trip.endDate);
    }

    const updatedTrip = await trip.save();
    res.json({ success: true, data: tripForRole(updatedTrip, 'admin') });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id  (admin only; removes everyone's lists)
const deleteTrip = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found || found.role !== 'admin') {
      res.status(404);
      throw new Error('Trip not found');
    }

    await PackingList.deleteMany({ tripId: found.trip._id });
    await Trip.deleteOne({ _id: found.trip._id });

    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/join/:code  (join a group trip from an invite link)
const joinTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ inviteCode: req.params.code, mode: 'group' });
    if (!trip) {
      res.status(404);
      throw new Error('This invite link is invalid or has been turned off.');
    }

    const alreadyIn = trip.userId.equals(req.user._id) || trip.members.some((m) => m.user.equals(req.user._id));
    if (!alreadyIn) {
      if (trip.members.length + 1 >= MAX_MEMBERS) {
        res.status(400);
        throw new Error(`This trip is full (${MAX_MEMBERS} people max).`);
      }
      trip.members.push({ user: req.user._id, role: 'member' });
      await trip.save();
      await createListFor(trip, req.user._id);
    }

    res.json({ success: true, data: { tripId: trip._id, alreadyMember: alreadyIn } });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/join/:code  (preview who's inviting you before joining)
const previewInvite = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ inviteCode: req.params.code, mode: 'group' }).select(
      'destination startDate endDate tripType userId members'
    );
    if (!trip) {
      res.status(404);
      throw new Error('This invite link is invalid or has been turned off.');
    }
    const owner = await User.findById(trip.userId).select('name');
    res.json({
      success: true,
      data: {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        tripType: trip.tripType,
        invitedBy: owner?.name || 'Someone',
        memberCount: trip.members.length + 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id/crew  (everyone on the trip and how packed they are)
const getCrew = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found) {
      res.status(404);
      throw new Error('Trip not found');
    }
    const { trip } = found;

    const people = [{ user: trip.userId, role: 'admin', joinedAt: trip.createdAt }, ...trip.members];
    const ids = people.map((p) => p.user);
    const [users, lists] = await Promise.all([
      User.find({ _id: { $in: ids } }).select('name'),
      PackingList.find({ tripId: trip._id, userId: { $in: ids } }).select('userId items.isPacked'),
    ]);
    const nameOf = new Map(users.map((u) => [String(u._id), u.name]));
    const listOf = new Map(lists.map((l) => [String(l.userId), l]));

    const crew = people.map((p) => ({
      _id: p.user,
      name: nameOf.get(String(p.user)) || 'Former member',
      role: p.role,
      isMe: p.user.equals(req.user._id),
      progress: progressOf(listOf.get(String(p.user))),
    }));

    res.json({ success: true, data: crew });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/invite  (admin: make a new invite link; the old one stops working)
const resetInvite = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found || found.role !== 'admin') {
      res.status(404);
      throw new Error('Trip not found');
    }
    found.trip.mode = 'group';
    found.trip.inviteCode = newInviteCode();
    await found.trip.save();
    res.json({ success: true, data: { inviteCode: found.trip.inviteCode } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id/members/:userId  (admin removes someone, or a member leaves)
const removeMember = async (req, res, next) => {
  try {
    const found = await findTripForUser(req.params.id, req.user._id);
    if (!found) {
      res.status(404);
      throw new Error('Trip not found');
    }
    const { trip, role } = found;
    const leavingSelf = req.params.userId === String(req.user._id);

    if (!leavingSelf && role !== 'admin') {
      res.status(403);
      throw new Error('Only the trip admin can remove people.');
    }
    if (trip.userId.equals(req.params.userId)) {
      res.status(400);
      throw new Error("The trip creator can't be removed. Delete the trip instead.");
    }

    trip.members = trip.members.filter((m) => String(m.user) !== req.params.userId);
    await trip.save();
    await PackingList.deleteOne({ tripId: trip._id, userId: req.params.userId });

    res.json({ success: true, message: leavingSelf ? 'You left the trip' : 'Member removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  joinTrip,
  previewInvite,
  getCrew,
  resetInvite,
  removeMember,
};
