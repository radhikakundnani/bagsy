const mongoose = require('mongoose');

// Something saved for inspiration: a reel/pin/video link, or a written idea.
// 'group' items are on the trip's shared board; 'me' items are only seen by the person who added them.
const inspoItemSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['link', 'note'], required: true },
  // Links are only stored and shown, never fetched by the server
  url: { type: String, maxlength: 500 },
  source: { type: String, enum: ['instagram', 'tiktok', 'youtube', 'pinterest', 'web'] },
  note: { type: String, trim: true, maxlength: [200, 'Keep the note under 200 characters'], default: '' },
  visibility: { type: String, enum: ['group', 'me'], default: 'group' },
  // Ticked once the reel/photo has actually been shot
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

inspoItemSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('InspoItem', inspoItemSchema);
