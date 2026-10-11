const User = require('../models/User');
const Trip = require('../models/Trip');
const { myTripsFilter } = require('../utils/tripAccess');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const now = new Date();

    // Get trip statistics
    const totalTrips = await Trip.countDocuments(myTripsFilter(req.user._id));
    const upcomingTrips = await Trip.countDocuments({
      ...myTripsFilter(req.user._id),
      startDate: { $gte: now },
    });
    const pastTrips = await Trip.find({
      ...myTripsFilter(req.user._id),
      endDate: { $lt: now },
    })
      .sort({ endDate: -1 })
      .select('destination startDate endDate tripType');

    const completedTrips = pastTrips.length;

    // Get all trips for history (most recent first)
    const allTrips = await Trip.find(myTripsFilter(req.user._id))
      .sort({ createdAt: -1 })
      .select('destination startDate endDate tripType weather createdAt mode');

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        stats: {
          totalTrips,
          upcomingTrips,
          completedTrips,
        },
        tripHistory: allTrips,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = name.trim();
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
