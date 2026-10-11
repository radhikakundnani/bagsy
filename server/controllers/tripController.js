const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const { getTripWeather } = require('../services/weatherService');
const { generateList } = require('../services/packingGenerator');

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const { destination, startDate, endDate, activities, tripType } = req.body;

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

    const weather = await getTripWeather(destination, start, end);

    const trip = await Trip.create({
      userId: req.user._id,
      destination,
      startDate: start,
      endDate: end,
      activities: activities || [],
      tripType: tripType || 'leisure',
      weather,
    });

    // Auto-generate packing list
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const items = generateList(weather, activities, durationDays, tripType);

    const packingList = await PackingList.create({
      tripId: trip._id,
      userId: req.user._id,
      items,
    });

    res.status(201).json({
      success: true,
      data: { trip, packingList },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

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
    res.json({ success: true, data: updatedTrip });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    // Delete associated packing list
    await PackingList.deleteOne({ tripId: trip._id });
    await Trip.deleteOne({ _id: trip._id });

    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
