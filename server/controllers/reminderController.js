const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const { findTripForUser, myTripsFilter } = require('../utils/tripAccess');

// GET /api/reminders/:tripId
const getReminders = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const found = await findTripForUser(tripId, req.user._id);
    const trip = found?.trip;
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    const packingList = await PackingList.findOne({
      tripId,
      userId: req.user._id,
    });

    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found for this trip');
    }

    const unpackedItems = packingList.items.filter((item) => !item.isPacked);

    // Check if trip is upcoming (within 3 days)
    const now = new Date();
    const tripStart = new Date(trip.startDate);
    const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
    const isUpcoming = daysUntilTrip >= 0 && daysUntilTrip <= 3;

    res.json({
      success: true,
      data: {
        trip: {
          _id: trip._id,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
        },
        daysUntilTrip,
        isUpcoming,
        totalItems: packingList.items.length,
        packedItems: packingList.items.length - unpackedItems.length,
        unpackedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reminders  (all upcoming trips with unpacked items)
const getAllReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find upcoming trips (start date within next 3 days and not yet ended)
    const upcomingTrips = await Trip.find({
      ...myTripsFilter(req.user._id),
      startDate: { $gte: now, $lte: threeDaysFromNow },
    });

    const reminders = [];

    for (const trip of upcomingTrips) {
      const packingList = await PackingList.findOne({
        tripId: trip._id,
        userId: req.user._id,
      });

      if (packingList) {
        const unpackedItems = packingList.items.filter((item) => !item.isPacked);
        if (unpackedItems.length > 0) {
          const daysUntilTrip = Math.ceil(
            (new Date(trip.startDate) - now) / (1000 * 60 * 60 * 24)
          );
          reminders.push({
            trip: {
              _id: trip._id,
              destination: trip.destination,
              startDate: trip.startDate,
            },
            daysUntilTrip,
            totalItems: packingList.items.length,
            packedItems: packingList.items.length - unpackedItems.length,
            unpackedCount: unpackedItems.length,
          });
        }
      }
    }

    res.json({ success: true, data: reminders });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReminders, getAllReminders };
