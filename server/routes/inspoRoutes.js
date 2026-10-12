const express = require('express');
const { getInspo, addInspo, updateInspo, deleteInspo } = require('../controllers/inspoController');

// Mounted at /api/trips/:id/inspo (login is already checked by tripRoutes)
const router = express.Router({ mergeParams: true });

router.route('/').get(getInspo).post(addInspo);
router.route('/:itemId').put(updateInspo).delete(deleteInspo);

module.exports = router;
