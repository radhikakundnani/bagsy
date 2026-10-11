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
