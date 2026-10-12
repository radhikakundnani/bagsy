const express = require('express');
const { getItinerary, addStop, updateStop, deleteStop } = require('../controllers/itineraryController');

// Mounted at /api/trips/:id/itinerary (login is already checked by tripRoutes)
const router = express.Router({ mergeParams: true });

router.route('/').get(getItinerary).post(addStop);
router.route('/:stopId').put(updateStop).delete(deleteStop);

module.exports = router;
