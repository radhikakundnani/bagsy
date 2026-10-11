const {
  essentials,
  quantityItems,
  temperatureTiers,
  weatherConditionRules,
  climateTypeRules,
  activityItems,
  activityAliases,
  weatherActivityCrossRefs,
  tripTypeItems,
  getDurationItems,
  occasionItems,
} = require('../utils/packingRules');

/**
 * Resolve an activity name to its canonical key using aliases.
 * "trekking" → "hiking", "scuba diving" → "snorkeling", etc.
 */
const resolveActivity = (activity) => {
  const key = activity.toLowerCase().trim();
  return activityAliases[key] || key;
};

/**
 * Generate a comprehensive, context-aware packing list.
 *
 * @param {Object|null} weather  - Weather snapshot { temp, humidity, windSpeed, weatherMain, description, ... }
 * @param {string[]}    activities - User-selected activities
 * @param {number}      duration   - Trip length in days
 * @param {string}      tripType   - "leisure" | "business" | "adventure" | "family"
 * @param {string[]}    occasions  - wedding, conference, beach... (see utils/travellerOptions.js)
 * @returns {Array} Packing list items [{ name, category, isPacked, isCustom }]
 */
const generateList = (weather, activities = [], duration = 3, tripType = 'leisure', occasions = []) => {
  const itemMap = new Map();

  const addItem = (item) => {
    const key = item.name.toLowerCase();
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        name: item.name,
        category: item.category || 'misc',
        isPacked: false,
        isCustom: false,
      });
    }
  };

  // ── 1. Quantity-scaled essentials (underwear ×N, socks ×N, etc.) ──────
  const safeDuration = Math.max(1, Math.min(duration, 30));
  quantityItems.forEach((qi) => {
    const qty = Math.min(Math.ceil(safeDuration * qi.perDay), qi.max);
    addItem({ name: `${qi.baseName} (×${qty})`, category: qi.category });
  });

  // ── 2. Fixed essentials (toothbrush, passport, etc.) ──────────────────
  essentials.forEach(addItem);

  // ── 3. Temperature-tier items ─────────────────────────────────────────
  if (weather && weather.temp != null) {
    const temp = weather.temp;

    // Find and apply matching temperature tier
    for (const tierName of Object.keys(temperatureTiers)) {
      const tier = temperatureTiers[tierName];
      if (tier.check(temp)) {
        tier.items.forEach(addItem);
        break; // Only one tier applies
      }
    }
  } else {
    // No weather data — add sensible defaults for unknown conditions
    addItem({ name: 'Light jacket', category: 'clothing' });
    addItem({ name: 'Sweater / Hoodie', category: 'clothing' });
    addItem({ name: 'Sunscreen', category: 'toiletries' });
    addItem({ name: 'Sunglasses', category: 'misc' });
    addItem({ name: 'Compact umbrella', category: 'misc' });
  }

  // ── 4. Weather condition items (rain, snow, wind, humidity) ───────────
  if (weather) {
    weatherConditionRules.forEach((rule) => {
      if (rule.check(weather)) {
        rule.items.forEach(addItem);
      }
    });
  }

  // ── 5. Climate-type items (tropical, arid, winter resort) ─────────────
  if (weather) {
    climateTypeRules.forEach((rule) => {
      if (rule.check(weather)) {
        rule.items.forEach(addItem);
      }
    });
  }

  // ── 6. Activity items (with alias resolution) ─────────────────────────
  const resolvedActivities = new Set();
  activities.forEach((activity) => {
    const resolved = resolveActivity(activity);
    resolvedActivities.add(resolved);
    if (activityItems[resolved]) {
      activityItems[resolved].forEach(addItem);
    }
  });

  // ── 7. Weather × activity cross-references ────────────────────────────
  if (weather) {
    weatherActivityCrossRefs.forEach((crossRef) => {
      if (
        resolvedActivities.has(crossRef.activity) &&
        crossRef.weatherCheck(weather)
      ) {
        crossRef.items.forEach(addItem);
      }
    });
  }

  // ── 8. Trip-type items ────────────────────────────────────────────────
  const typeKey = (tripType || 'leisure').toLowerCase().trim();
  if (tripTypeItems[typeKey]) {
    tripTypeItems[typeKey].forEach(addItem);
  }

  // ── 8b. Occasion items (wedding, conference, trek...) ────────────────
  (occasions || []).forEach((occasion) => {
    (occasionItems[occasion] || []).forEach(addItem);
  });

  // ── 9. Duration-based extras ──────────────────────────────────────────
  getDurationItems(safeDuration).forEach(addItem);

  return Array.from(itemMap.values());
};

module.exports = { generateList };
