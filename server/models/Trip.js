const mongoose = require('mongoose');
const { OCCASIONS } = require('../utils/travellerOptions');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
    trim: true,
    maxlength: [100, 'Destination must be 100 characters or fewer'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  activities: {
    type: [{ type: String, maxlength: 40 }],
    default: [],
    validate: [(a) => a.length <= 30, 'Too many activities'],
  },
  tripType: {
    type: String,
    enum: ['leisure', 'business', 'adventure', 'family'],
    default: 'leisure',
  },
  // Optional note about the trip, e.g. "cousin's wedding, then trekking". Read by the AI.
  brief: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  // Wedding, conference, trek... changes the list more than anything else
  occasions: [{ type: String, enum: OCCASIONS }],
  // 'solo' = just me. 'group' = people can join with the invite link,
  // each member gets their own packing list, and the admin can see them all.
  mode: {
    type: String,
    enum: ['solo', 'group'],
    default: 'solo',
  },
  // People who joined. The creator (userId) is always the admin and isn't listed here.
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['admin', 'member'], default: 'member' },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  // Secret code in the invite link. Only group trips have one.
  inviteCode: {
    type: String,
    index: { unique: true, sparse: true },
  },
  weather: {
    temp: Number,
    feelsLike: Number,
    tempMin: Number,
    tempMax: Number,
    humidity: Number,
    windSpeed: Number,
    weatherMain: String,
    description: String,
    icon: String,
    // Where the weather came from: 'forecast' (next 5 days),
    // 'typical' (same dates last year) or 'current' (today's weather)
    source: String,
    note: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Find trips someone owns or has joined
tripSchema.index({ userId: 1 });
tripSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Trip', tripSchema);
