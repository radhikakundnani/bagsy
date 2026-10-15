const express = require('express');
const { sortItem } = require('../services/itemSorter');

// GET /api/sort-demo?name=kajal
// Lets the landing page show the real item sorter to people who haven't signed up.
// No login, so it has its own rate limit (see app.js) and only accepts short text.
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name.slice(0, 60) : '';
    const result = await sortItem(name);
    res.json({
      success: true,
      data: result && {
        category: result.category,
        confidence: Number(result.confidence.toFixed(2)),
        confident: result.confident,
        probs: Object.fromEntries(Object.entries(result.probs).map(([k, v]) => [k, Number(v.toFixed(3))])),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
