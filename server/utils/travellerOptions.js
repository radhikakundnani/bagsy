// The fixed choices for trip occasions and a traveller's packing preferences.
// Shared by the models (validation) and the AI prompt.

const OCCASIONS = [
  'wedding',
  'festival',
  'conference',
  'beach',
  'citybreak',
  'outdoors',
  'religious',
  'family',
  'backpacking',
  'concert',
  'sports',
  'romantic',
];

// "Which items should we include?" — practical, not an identity question
const ITEMS_FOR = ['women', 'men', 'both', 'skip'];

const NEEDS = ['kids', 'medication', 'glasses', 'diet', 'accessibility'];

module.exports = { OCCASIONS, ITEMS_FOR, NEEDS };
