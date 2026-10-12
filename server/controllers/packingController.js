const PackingList = require('../models/PackingList');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { findTripForUser } = require('../utils/tripAccess');
const { sortItem } = require('../services/itemSorter');

const CATEGORY_NAMES = ['clothing', 'toiletries', 'electronics', 'documents', 'misc'];

// GET /api/packing/:tripId            -> my list
// GET /api/packing/:tripId?member=<id> -> a group member's list (trip admin only, read-only)
const getPackingList = async (req, res, next) => {
  try {
    const { member } = req.query;
    let ownerId = req.user._id;
    let ownerName = null;

    if (member && member !== String(req.user._id)) {
      const found = await findTripForUser(req.params.tripId, req.user._id);
      if (!found || found.role !== 'admin') {
        res.status(403);
        throw new Error("Only the trip admin can see other people's lists.");
      }
      ownerId = member;
      ownerName = (await User.findById(member).select('name'))?.name || null;
    }

    const packingList = await PackingList.findOne({
      tripId: req.params.tripId,
      userId: ownerId,
    });

    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found');
    }

    const trip = await Trip.findById(req.params.tripId).select('brief');
    res.json({
      success: true,
      data: { ...packingList.toObject(), brief: trip?.brief || '', ownerName, readOnly: Boolean(ownerName) },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/packing/:tripId/item/:itemId
const updateItem = async (req, res, next) => {
  try {
    const { tripId, itemId } = req.params;
    const { isPacked, name } = req.body;

    const packingList = await PackingList.findOne({
      tripId,
      userId: req.user._id,
    });

    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found');
    }

    const item = packingList.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (typeof isPacked === 'boolean') item.isPacked = isPacked;
    if (name) item.name = name;
    packingList.updatedAt = Date.now();

    await packingList.save();
    res.json({ success: true, data: packingList });
  } catch (error) {
    next(error);
  }
};

// POST /api/packing/:tripId/item
const addItem = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Item name is required');
    }

    const packingList = await PackingList.findOne({
      tripId,
      userId: req.user._id,
    });

    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found');
    }

    // No category picked? Let the item sorter model choose, or fall back to misc
    let finalCategory = CATEGORY_NAMES.includes(category) ? category : null;
    if (!finalCategory) finalCategory = (await sortItem(name))?.category || 'misc';

    packingList.items.push({
      name: name.trim(),
      category: finalCategory,
      isPacked: false,
      isCustom: true,
    });
    packingList.updatedAt = Date.now();

    await packingList.save();
    res.status(201).json({ success: true, data: packingList });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/packing/:tripId/item/:itemId
const deleteItem = async (req, res, next) => {
  try {
    const { tripId, itemId } = req.params;

    const packingList = await PackingList.findOne({
      tripId,
      userId: req.user._id,
    });

    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found');
    }

    const item = packingList.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    item.deleteOne();
    packingList.updatedAt = Date.now();

    await packingList.save();
    res.json({ success: true, data: packingList });
  } catch (error) {
    next(error);
  }
};

// PUT /api/packing/:tripId/suggestions   body: { action: 'keep' | 'dismiss', ids: [...] | 'all' }
// Keep moves AI suggestions into the list (marked as suggested); dismiss hides them.
const resolveSuggestions = async (req, res, next) => {
  try {
    const { action, ids } = req.body;
    if (!['keep', 'dismiss'].includes(action)) {
      res.status(400);
      throw new Error("action must be 'keep' or 'dismiss'");
    }

    const packingList = await PackingList.findOne({ tripId: req.params.tripId, userId: req.user._id });
    if (!packingList) {
      res.status(404);
      throw new Error('Packing list not found');
    }

    const wanted = ids === 'all' ? null : new Set((Array.isArray(ids) ? ids : []).map(String));
    const have = new Set(packingList.items.map((i) => i.name.toLowerCase()));

    for (const sug of packingList.suggestions) {
      if (sug.status !== 'new' || (wanted && !wanted.has(String(sug._id)))) continue;
      sug.status = action === 'keep' ? 'kept' : 'dismissed';
      if (action === 'keep' && !have.has(sug.name.toLowerCase())) {
        packingList.items.push({ name: sug.name, category: sug.category, isSuggested: true });
        have.add(sug.name.toLowerCase());
      }
    }

    packingList.updatedAt = Date.now();
    await packingList.save();
    const trip = await Trip.findById(req.params.tripId).select('brief');
    res.json({ success: true, data: { ...packingList.toObject(), brief: trip?.brief || '' } });
  } catch (error) {
    next(error);
  }
};

// GET /api/packing/sort-item?name=type c cable
// The app calls this while you type, to pre-pick a category for a new item
const sortItemCategory = async (req, res, next) => {
  try {
    const result = await sortItem(req.query.name);
    res.json({ success: true, data: result && { category: result.category, confidence: Number(result.confidence.toFixed(2)), confident: result.confident } });
  } catch (error) {
    next(error);
  }
};

module.exports = { sortItemCategory, getPackingList, updateItem, addItem, deleteItem, resolveSuggestions };
