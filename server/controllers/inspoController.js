const InspoItem = require('../models/InspoItem');
const ItineraryStop = require('../models/ItineraryStop');
const { httpError, loadSection, text, sameId } = require('../utils/sectionAccess');
const { parseLink } = require('../utils/linkSource');

const MAX_ITEMS = 300;

const shape = (item, userId) => ({
  _id: item._id,
  kind: item.kind,
  url: item.url,
  source: item.source,
  note: item.note,
  visibility: item.visibility,
  done: item.done,
  createdAt: item.createdAt,
  addedBy: { _id: item.addedBy?._id || item.addedBy, name: item.addedBy?.name || 'Former member' },
  isMine: sameId(item.addedBy, userId),
});

// Find one item this user is allowed to see. Someone else's private item counts as "not found".
const findVisible = async (req, trip) => {
  const item = await InspoItem.findOne({ _id: req.params.itemId, tripId: trip._id });
  if (!item || (item.visibility === 'me' && !sameId(item.addedBy, req.user._id))) throw httpError(404, 'Idea not found');
  return item;
};

// GET /api/trips/:id/inspo  -> the group board plus my private items, never anyone else's
const getInspo = async (req, res, next) => {
  try {
    const { trip } = await loadSection(req, 'inspo');
    const items = await InspoItem.find({
      tripId: trip._id,
      $or: [{ visibility: 'group' }, { addedBy: req.user._id }],
    })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items.map((i) => shape(i, req.user._id)) });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/inspo  { kind: 'link'|'note', url?, note?, visibility? }
const addInspo = async (req, res, next) => {
  try {
    const { trip } = await loadSection(req, 'inspo');
    if ((await InspoItem.countDocuments({ tripId: trip._id })) >= MAX_ITEMS) {
      throw httpError(400, `A trip can have up to ${MAX_ITEMS} ideas.`);
    }
    const kind = req.body.kind === 'note' ? 'note' : 'link';
    const note = text(req.body.note);
    const fields = { tripId: trip._id, addedBy: req.user._id, kind, note, visibility: req.body.visibility === 'me' ? 'me' : 'group' };

    if (kind === 'link') {
      const link = parseLink(req.body.url);
      if (!link) throw httpError(400, 'Paste a full link, starting with https://');
      Object.assign(fields, link);
    } else if (!note) {
      throw httpError(400, 'Write your idea first.');
    }

    const item = await InspoItem.create(fields);
    await item.populate('addedBy', 'name');
    res.status(201).json({ success: true, data: shape(item, req.user._id) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id/inspo/:itemId  { done?, visibility?, note? }
// Anyone can tick a group idea as shot. Only the person who added it can edit or move it.
const updateInspo = async (req, res, next) => {
  try {
    const { trip } = await loadSection(req, 'inspo');
    const item = await findVisible(req, trip);
    const mine = sameId(item.addedBy, req.user._id);
    const { done, visibility, note } = req.body;

    if ((visibility !== undefined || note !== undefined) && !mine) {
      throw httpError(403, 'Only the person who added this idea can edit it.');
    }
    if (done !== undefined) item.done = Boolean(done);
    if (note !== undefined) item.note = text(note);
    if (visibility === 'group' || visibility === 'me') {
      if (visibility === 'me' && (await ItineraryStop.exists({ inspoId: item._id }))) {
        throw httpError(400, "This idea is on the itinerary, so it has to stay on the group board.");
      }
      item.visibility = visibility;
    }
    await item.save();
    await item.populate('addedBy', 'name');
    res.json({ success: true, data: shape(item, req.user._id) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id/inspo/:itemId  (whoever added it; the admin can also tidy the group board)
const deleteInspo = async (req, res, next) => {
  try {
    const { trip, role } = await loadSection(req, 'inspo');
    const item = await findVisible(req, trip);
    const mine = sameId(item.addedBy, req.user._id);
    if (!mine && !(role === 'admin' && item.visibility === 'group')) {
      throw httpError(403, 'Only the person who added this idea can remove it.');
    }
    await item.deleteOne();
    // Stops that pointed at it keep their text, they just lose the link
    await ItineraryStop.updateMany({ inspoId: item._id }, { $unset: { inspoId: 1 } });
    res.json({ success: true, message: 'Idea removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInspo, addInspo, updateInspo, deleteInspo };
