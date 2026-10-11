const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
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
    type: [String],
    default: [],
  },
  tripType: {
    type: String,
    enum: ['leisure', 'business', 'adventure', 'family'],
    default: 'leisure',
  },
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
