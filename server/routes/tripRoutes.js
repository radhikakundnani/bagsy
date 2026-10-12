const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  joinTrip,
  previewInvite,
  getCrew,
  resetInvite,
  removeMember,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createTrip).get(getTrips);

// Group trips
router.route('/join/:code').get(previewInvite).post(joinTrip);
router.get('/:id/crew', getCrew);
router.post('/:id/invite', resetInvite);
router.delete('/:id/members/:userId', removeMember);

// Optional trip sections
router.use('/:id/itinerary', require('./itineraryRoutes'));
router.use('/:id/inspo', require('./inspoRoutes'));

router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);

module.exports = router;
