const mongoose = require('mongoose');

// One plan on one day of a trip, e.g. "Day 2, 08:30, walk through Fontainhas".
// Everyone on the trip sees the same itinerary.
const itineraryStopSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 0 = the first day of the trip. Stored as a number so moving the trip dates moves the plan too.
  day: { type: Number, required: true, min: 0, max: 365 },
  // "HH:MM" in the trip's local time, or empty for "any time"
  time: { type: String, default: '', match: [/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Time must look like 09:30'] },
  title: { type: String, required: [true, "Add a short plan, e.g. 'Lunch in Panjim'"], trim: true, maxlength: [80, 'Keep the plan under 80 characters'] },
  where: { type: String, trim: true, maxlength: [80, 'Keep the place under 80 characters'], default: '' },
  note: { type: String, trim: true, maxlength: [200, 'Keep the note under 200 characters'], default: '' },
  // Optional link to an idea on the Inspo board
  inspoId: { type: mongoose.Schema.Types.ObjectId, ref: 'InspoItem' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ItineraryStop', itineraryStopSchema);
