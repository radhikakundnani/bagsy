const mongoose = require('mongoose');

const packingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['clothing', 'toiletries', 'electronics', 'documents', 'misc'],
    default: 'misc',
  },
  isPacked: {
    type: Boolean,
    default: false,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  // Came from an AI suggestion the person chose to keep
  isSuggested: {
    type: Boolean,
    default: false,
  },
});

// An AI suggestion waiting for the person to keep or dismiss it
const suggestionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['clothing', 'toiletries', 'electronics', 'documents', 'misc'],
    default: 'misc',
  },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['new', 'kept', 'dismissed'], default: 'new' },
});

const packingListSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [packingItemSchema],
  suggestions: [suggestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

packingListSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// One list per person per trip
packingListSchema.index({ tripId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PackingList', packingListSchema);
