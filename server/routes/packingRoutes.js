const express = require('express');
const router = express.Router();
const { getPackingList, updateItem, addItem, deleteItem, resolveSuggestions } = require('../controllers/packingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:tripId', getPackingList);
router.put('/:tripId/item/:itemId', updateItem);
router.post('/:tripId/item', addItem);
router.put('/:tripId/suggestions', resolveSuggestions);
router.delete('/:tripId/item/:itemId', deleteItem);

module.exports = router;
