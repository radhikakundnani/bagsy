const PackingList = require('../models/PackingList');
const User = require('../models/User');
const { findTripForUser } = require('../utils/tripAccess');

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

    res.json({
      success: true,
      data: { ...packingList.toObject(), ownerName, readOnly: Boolean(ownerName) },
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

    packingList.items.push({
      name: name.trim(),
      category: category || 'misc',
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

module.exports = { getPackingList, updateItem, addItem, deleteItem };
