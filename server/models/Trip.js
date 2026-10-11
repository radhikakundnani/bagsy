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

module.exports = mongoose.model('Trip', tripSchema);
