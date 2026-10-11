// ─── ESSENTIALS (always included) ───────────────────────────────────────────
// Items with `perDay` will have quantities scaled by trip duration.
const essentials = [
  { name: 'Toothbrush', category: 'toiletries' },
  { name: 'Toothpaste', category: 'toiletries' },
  { name: 'Deodorant', category: 'toiletries' },
  { name: 'Shampoo (travel-size)', category: 'toiletries' },
  { name: 'Body wash / Soap', category: 'toiletries' },
  { name: 'Phone charger', category: 'electronics' },
  { name: 'Phone', category: 'electronics' },
  { name: 'Passport / ID', category: 'documents' },
  { name: 'Wallet', category: 'documents' },
  { name: 'Travel insurance documents', category: 'documents' },
  { name: 'Sleepwear', category: 'clothing' },
  { name: 'Comfortable shoes', category: 'clothing' },
];

// Items whose quantity scales with trip duration
const quantityItems = [
  { baseName: 'Underwear', category: 'clothing', perDay: 1, max: 10 },
  { baseName: 'Socks (pairs)', category: 'clothing', perDay: 1, max: 10 },
  { baseName: 'T-shirts / Tops', category: 'clothing', perDay: 1, max: 8 },
  { baseName: 'Pants / Bottoms', category: 'clothing', perDay: 0.33, max: 5 },
];

// ─── TEMPERATURE TIERS ─────────────────────────────────────────────────────
// 5 tiers instead of the old 2-threshold system
const temperatureTiers = {
  freezing: { // < 0°C
    check: (temp) => temp < 0,
    items: [
      { name: 'Heavy winter coat', category: 'clothing' },
      { name: 'Thermal underwear (top & bottom)', category: 'clothing' },
      { name: 'Insulated snow boots', category: 'clothing' },
      { name: 'Thick wool gloves', category: 'clothing' },
      { name: 'Warm scarf', category: 'clothing' },
      { name: 'Beanie / Warm hat', category: 'clothing' },
      { name: 'Wool socks', category: 'clothing' },
      { name: 'Hand warmers', category: 'misc' },
      { name: 'Lip balm (for cold/wind)', category: 'toiletries' },
      { name: 'Moisturizer (cold protection)', category: 'toiletries' },
    ],
  },
  cold: { // 0–10°C
    check: (temp) => temp >= 0 && temp < 10,
    items: [
      { name: 'Winter jacket', category: 'clothing' },
      { name: 'Sweater / Fleece', category: 'clothing' },
      { name: 'Long-sleeve shirts', category: 'clothing' },
      { name: 'Warm gloves', category: 'clothing' },
      { name: 'Scarf', category: 'clothing' },
      { name: 'Beanie / Warm hat', category: 'clothing' },
      { name: 'Closed-toe warm shoes', category: 'clothing' },
      { name: 'Thermal base layer', category: 'clothing' },
      { name: 'Lip balm', category: 'toiletries' },
    ],
  },
  cool: { // 10–18°C
    check: (temp) => temp >= 10 && temp < 18,
    items: [
      { name: 'Light jacket', category: 'clothing' },
      { name: 'Sweater / Hoodie', category: 'clothing' },
      { name: 'Long pants / Jeans', category: 'clothing' },
      { name: 'Closed-toe shoes', category: 'clothing' },
      { name: 'Light scarf (optional)', category: 'clothing' },
    ],
  },
  mild: { // 18–25°C
    check: (temp) => temp >= 18 && temp < 25,
    items: [
      { name: 'Light layers (cardigan / thin hoodie)', category: 'clothing' },
      { name: 'Mix of short and long-sleeve shirts', category: 'clothing' },
      { name: 'Light pants or jeans', category: 'clothing' },
      { name: 'Sneakers / Casual shoes', category: 'clothing' },
      { name: 'Sunglasses', category: 'misc' },
      { name: 'Sunscreen SPF 30+', category: 'toiletries' },
    ],
  },
  hot: { // > 25°C
    check: (temp) => temp >= 25,
    items: [
      { name: 'Shorts', category: 'clothing' },
      { name: 'Light breathable shirts / Tank tops', category: 'clothing' },
      { name: 'Sandals / Flip flops', category: 'clothing' },
      { name: 'Hat / Cap (sun protection)', category: 'clothing' },
      { name: 'Sunglasses', category: 'misc' },
      { name: 'Sunscreen SPF 50+', category: 'toiletries' },
      { name: 'Lightweight dress / Linen clothing', category: 'clothing' },
      { name: 'Reusable water bottle', category: 'misc' },
      { name: 'After-sun / Aloe vera gel', category: 'toiletries' },
    ],
  },
};

// ─── WEATHER CONDITION RULES ────────────────────────────────────────────────
// Based on weatherMain and humidity/wind — the old system completely ignored these
const weatherConditionRules = [
  {
    name: 'rain',
    check: (weather) => {
      const main = (weather.weatherMain || '').toLowerCase();
      const desc = (weather.description || '').toLowerCase();
      return main === 'rain' || main === 'drizzle' || desc.includes('rain');
    },
    items: [
      { name: 'Compact umbrella', category: 'misc' },
      { name: 'Waterproof rain jacket', category: 'clothing' },
      { name: 'Waterproof shoe covers / Rain boots', category: 'clothing' },
      { name: 'Quick-dry clothing', category: 'clothing' },
      { name: 'Zip-lock bags (for electronics)', category: 'misc' },
      { name: 'Waterproof bag / Dry bag', category: 'misc' },
    ],
  },
  {
    name: 'snow',
    check: (weather) => {
      const main = (weather.weatherMain || '').toLowerCase();
      return main === 'snow';
    },
    items: [
      { name: 'Snow boots / Waterproof boots', category: 'clothing' },
      { name: 'Waterproof pants / Snow pants', category: 'clothing' },
      { name: 'Hand warmers', category: 'misc' },
      { name: 'Neck gaiter / Balaclava', category: 'clothing' },
      { name: 'Waterproof gloves', category: 'clothing' },
      { name: 'Anti-fog spray (for glasses)', category: 'misc' },
    ],
  },
  {
    name: 'thunderstorm',
    check: (weather) => {
      const main = (weather.weatherMain || '').toLowerCase();
      return main === 'thunderstorm';
    },
    items: [
      { name: 'Sturdy umbrella', category: 'misc' },
      { name: 'Rain poncho', category: 'clothing' },
      { name: 'Waterproof bag for electronics', category: 'misc' },
      { name: 'Waterproof jacket with hood', category: 'clothing' },
    ],
  },
  {
    name: 'highHumidity',
    check: (weather) => weather.humidity != null && weather.humidity > 70,
    items: [
      { name: 'Moisture-wicking clothing', category: 'clothing' },
      { name: 'Anti-chafing balm / Powder', category: 'toiletries' },
      { name: 'Extra deodorant', category: 'toiletries' },
      { name: 'Quick-dry towel', category: 'misc' },
      { name: 'Anti-frizz hair product', category: 'toiletries' },
    ],
  },
  {
    name: 'highWind',
    check: (weather) => weather.windSpeed > 10,
    items: [
      { name: 'Windbreaker jacket', category: 'clothing' },
      { name: 'Hair ties / Clips', category: 'toiletries' },
      { name: 'Secure hat with chin strap', category: 'clothing' },
    ],
  },
  {
    name: 'veryDry',
    check: (weather) => weather.humidity != null && weather.humidity < 30,
    items: [
      { name: 'Heavy-duty moisturizer', category: 'toiletries' },
      { name: 'Lip balm with SPF', category: 'toiletries' },
      { name: 'Nasal saline spray', category: 'toiletries' },
      { name: 'Extra water bottle', category: 'misc' },
      { name: 'Eye drops', category: 'toiletries' },
    ],
  },
];

// ─── CLIMATE TYPE DETECTION ─────────────────────────────────────────────────
// Combines temperature + humidity + conditions for destination-type intelligence
const climateTypeRules = [
  {
    name: 'tropical',
    check: (weather) => weather.temp > 25 && weather.humidity != null && weather.humidity > 65,
    items: [
      { name: 'Insect repellent (DEET / Picaridin)', category: 'toiletries' },
      { name: 'Aloe vera gel', category: 'toiletries' },
      { name: 'Light rain cover / Packable poncho', category: 'clothing' },
      { name: 'Anti-itch cream (for bug bites)', category: 'toiletries' },
      { name: 'Breathable linen clothing', category: 'clothing' },
    ],
  },
  {
    name: 'arid',
    check: (weather) => weather.temp > 28 && weather.humidity != null && weather.humidity < 30,
    items: [
      { name: 'Wide-brim sun hat', category: 'clothing' },
      { name: 'Dust mask / Bandana', category: 'misc' },
      { name: 'Heavy-duty sunscreen SPF 50+', category: 'toiletries' },
      { name: 'Electrolyte packets', category: 'misc' },
      { name: 'UV-protective clothing', category: 'clothing' },
    ],
  },
  {
    name: 'winterResort',
    check: (weather) => {
      const main = (weather.weatherMain || '').toLowerCase();
      return weather.temp < 5 && (main === 'snow' || main === 'clouds');
    },
    items: [
      { name: 'Hand and toe warmers', category: 'misc' },
      { name: 'Thermos / Insulated bottle', category: 'misc' },
      { name: 'Chapstick (multiple)', category: 'toiletries' },
    ],
  },
];

// ─── ACTIVITY ITEMS ─────────────────────────────────────────────────────────
// 20+ activities (up from 7), each with specific gear recommendations
const activityItems = {
  hiking: [
    { name: 'Hiking boots / Trail shoes', category: 'clothing' },
    { name: 'Daypack / Hiking backpack', category: 'misc' },
    { name: 'Reusable water bottle', category: 'misc' },
    { name: 'Trail snacks / Energy bars', category: 'misc' },
    { name: 'Blister plasters', category: 'toiletries' },
    { name: 'Hiking socks (moisture-wicking)', category: 'clothing' },
    { name: 'Trekking poles (if needed)', category: 'misc' },
  ],
  swimming: [
    { name: 'Swimsuit', category: 'clothing' },
    { name: 'Swim goggles', category: 'misc' },
    { name: 'Waterproof phone pouch', category: 'electronics' },
    { name: 'Swim towel (microfiber)', category: 'misc' },
    { name: 'Ear plugs (for swimming)', category: 'misc' },
  ],
  sightseeing: [
    { name: 'Comfortable walking shoes', category: 'clothing' },
    { name: 'Camera', category: 'electronics' },
    { name: 'Portable power bank', category: 'electronics' },
    { name: 'City map / Offline maps downloaded', category: 'documents' },
    { name: 'Small crossbody bag', category: 'misc' },
    { name: 'Blister plasters', category: 'toiletries' },
  ],
  dining: [
    { name: 'Formal / Smart-casual outfit', category: 'clothing' },
    { name: 'Dress shoes', category: 'clothing' },
    { name: 'Evening clutch / Small bag', category: 'misc' },
  ],
  camping: [
    { name: 'Sleeping bag', category: 'misc' },
    { name: 'Flashlight / Headlamp', category: 'electronics' },
    { name: 'Insect repellent', category: 'toiletries' },
    { name: 'First aid kit', category: 'misc' },
    { name: 'Multi-tool / Swiss knife', category: 'misc' },
    { name: 'Matches / Lighter (waterproof)', category: 'misc' },
    { name: 'Camping pillow', category: 'misc' },
    { name: 'Biodegradable soap', category: 'toiletries' },
  ],
  skiing: [
    { name: 'Ski jacket (insulated)', category: 'clothing' },
    { name: 'Ski pants (waterproof)', category: 'clothing' },
    { name: 'Ski goggles', category: 'misc' },
    { name: 'Thermal base layers', category: 'clothing' },
    { name: 'Ski gloves (insulated)', category: 'clothing' },
    { name: 'Helmet (or rent at resort)', category: 'misc' },
    { name: 'Neck warmer / Balaclava', category: 'clothing' },
    { name: 'High SPF sunscreen (snow reflects UV)', category: 'toiletries' },
  ],
  beach: [
    { name: 'Swimsuit', category: 'clothing' },
    { name: 'Beach towel', category: 'misc' },
    { name: 'Flip flops', category: 'clothing' },
    { name: 'Sunscreen SPF 50+', category: 'toiletries' },
    { name: 'Beach cover-up / Sarong', category: 'clothing' },
    { name: 'Waterproof phone pouch', category: 'electronics' },
    { name: 'After-sun lotion', category: 'toiletries' },
    { name: 'Beach bag', category: 'misc' },
  ],
  photography: [
    { name: 'Camera + Spare batteries', category: 'electronics' },
    { name: 'Memory cards (extra)', category: 'electronics' },
    { name: 'Camera cleaning kit', category: 'electronics' },
    { name: 'Tripod (compact / travel)', category: 'electronics' },
    { name: 'Camera bag (padded)', category: 'misc' },
  ],
  shopping: [
    { name: 'Foldable shopping bag / Tote', category: 'misc' },
    { name: 'Comfortable walking shoes', category: 'clothing' },
    { name: 'Extra luggage space / Packing cubes', category: 'misc' },
    { name: 'Credit card / Travel card', category: 'documents' },
  ],
  snorkeling: [
    { name: 'Snorkel mask (or rent)', category: 'misc' },
    { name: 'Reef-safe sunscreen', category: 'toiletries' },
    { name: 'Rash guard / UV swim shirt', category: 'clothing' },
    { name: 'Waterproof camera / GoPro', category: 'electronics' },
    { name: 'Water shoes', category: 'clothing' },
    { name: 'Dry bag', category: 'misc' },
  ],
  surfing: [
    { name: 'Rash guard', category: 'clothing' },
    { name: 'Reef-safe sunscreen', category: 'toiletries' },
    { name: 'Board shorts', category: 'clothing' },
    { name: 'Surf wax', category: 'misc' },
    { name: 'Waterproof watch', category: 'misc' },
  ],
  cycling: [
    { name: 'Cycling shorts / Padded shorts', category: 'clothing' },
    { name: 'Helmet (or rent)', category: 'misc' },
    { name: 'Water bottle (cycling)', category: 'misc' },
    { name: 'Cycling gloves', category: 'clothing' },
    { name: 'Reflective vest (for road cycling)', category: 'clothing' },
    { name: 'Mini bike repair kit', category: 'misc' },
  ],
  yoga: [
    { name: 'Yoga mat (travel)', category: 'misc' },
    { name: 'Stretchy / Flexible clothing', category: 'clothing' },
    { name: 'Resistance bands', category: 'misc' },
    { name: 'Reusable water bottle', category: 'misc' },
  ],
  nightlife: [
    { name: 'Going-out outfit', category: 'clothing' },
    { name: 'Dress shoes / Heels', category: 'clothing' },
    { name: 'Small clutch / Going-out bag', category: 'misc' },
    { name: 'Earplugs (for concerts/clubs)', category: 'misc' },
  ],
  museum: [
    { name: 'Comfortable walking shoes', category: 'clothing' },
    { name: 'Light jacket (museums can be cold)', category: 'clothing' },
    { name: 'Notebook / Journal', category: 'misc' },
    { name: 'Portable charger (for audio guides)', category: 'electronics' },
  ],
  temple: [
    { name: 'Modest clothing (covers shoulders & knees)', category: 'clothing' },
    { name: 'Scarf / Shawl (for head covering)', category: 'clothing' },
    { name: 'Slip-on shoes (easy to remove)', category: 'clothing' },
    { name: 'Socks (for walking barefoot in temples)', category: 'clothing' },
  ],
  roadtrip: [
    { name: 'Car phone mount', category: 'electronics' },
    { name: 'Car charger (USB)', category: 'electronics' },
    { name: 'Snacks for the road', category: 'misc' },
    { name: 'Neck pillow', category: 'misc' },
    { name: 'Sunglasses (for driving)', category: 'misc' },
    { name: 'Paper maps (backup)', category: 'documents' },
    { name: 'First aid kit', category: 'misc' },
  ],
  watersports: [
    { name: 'Quick-dry shorts', category: 'clothing' },
    { name: 'Water shoes', category: 'clothing' },
    { name: 'Waterproof phone pouch', category: 'electronics' },
    { name: 'Dry bag', category: 'misc' },
    { name: 'Reef-safe sunscreen', category: 'toiletries' },
  ],
  fishing: [
    { name: 'Fishing hat (wide brim)', category: 'clothing' },
    { name: 'Polarized sunglasses', category: 'misc' },
    { name: 'Waterproof boots', category: 'clothing' },
    { name: 'Insect repellent', category: 'toiletries' },
    { name: 'Small cooler bag', category: 'misc' },
  ],
  golf: [
    { name: 'Golf polo shirts', category: 'clothing' },
    { name: 'Golf shoes', category: 'clothing' },
    { name: 'Golf glove', category: 'clothing' },
    { name: 'Cap / Visor', category: 'clothing' },
    { name: 'Sunscreen', category: 'toiletries' },
  ],
  rockclimbing: [
    { name: 'Climbing shoes (or rent)', category: 'clothing' },
    { name: 'Chalk bag', category: 'misc' },
    { name: 'Athletic tape', category: 'misc' },
    { name: 'Moisture-wicking clothing', category: 'clothing' },
    { name: 'First aid kit', category: 'misc' },
  ],
  running: [
    { name: 'Running shoes', category: 'clothing' },
    { name: 'Running shorts / Leggings', category: 'clothing' },
    { name: 'Sports bra / Athletic top', category: 'clothing' },
    { name: 'Reflective gear (for night runs)', category: 'clothing' },
    { name: 'Armband phone holder', category: 'electronics' },
  ],
};

// ─── ACTIVITY ALIASES ───────────────────────────────────────────────────────
// Maps common synonyms to the canonical activity key above
const activityAliases = {
  trekking: 'hiking',
  hike: 'hiking',
  trek: 'hiking',
  trail: 'hiking',
  mountaineering: 'hiking',
  swim: 'swimming',
  pool: 'swimming',
  dive: 'snorkeling',
  diving: 'snorkeling',
  scuba: 'snorkeling',
  'scuba diving': 'snorkeling',
  tour: 'sightseeing',
  touring: 'sightseeing',
  exploring: 'sightseeing',
  'city tour': 'sightseeing',
  walking: 'sightseeing',
  restaurant: 'dining',
  'fine dining': 'dining',
  eating: 'dining',
  'food tour': 'dining',
  ski: 'skiing',
  snowboard: 'skiing',
  snowboarding: 'skiing',
  surf: 'surfing',
  biking: 'cycling',
  'mountain biking': 'cycling',
  bike: 'cycling',
  clubbing: 'nightlife',
  'going out': 'nightlife',
  bars: 'nightlife',
  party: 'nightlife',
  'art gallery': 'museum',
  gallery: 'museum',
  exhibition: 'museum',
  religious: 'temple',
  church: 'temple',
  mosque: 'temple',
  shrine: 'temple',
  'water sports': 'watersports',
  kayak: 'watersports',
  kayaking: 'watersports',
  rafting: 'watersports',
  paddleboarding: 'watersports',
  canoeing: 'watersports',
  'jet ski': 'watersports',
  jogging: 'running',
  jog: 'running',
  marathon: 'running',
  climbing: 'rockclimbing',
  bouldering: 'rockclimbing',
  'rock climbing': 'rockclimbing',
  'road trip': 'roadtrip',
  driving: 'roadtrip',
  photo: 'photography',
  photos: 'photography',
  fish: 'fishing',
  angling: 'fishing',
};

// ─── WEATHER × ACTIVITY CROSS-REFERENCES ────────────────────────────────────
// Special items that only apply when BOTH a weather condition and activity are present
const weatherActivityCrossRefs = [
  {
    activity: 'hiking',
    weatherCheck: (w) => {
      const main = (w.weatherMain || '').toLowerCase();
      return main === 'rain' || main === 'drizzle' || (w.description || '').includes('rain');
    },
    items: [
      { name: 'Waterproof hiking boots', category: 'clothing' },
      { name: 'Rain cover for backpack', category: 'misc' },
      { name: 'Gaiters (waterproof)', category: 'clothing' },
    ],
  },
  {
    activity: 'sightseeing',
    weatherCheck: (w) => w.temp > 28,
    items: [
      { name: 'Cooling towel', category: 'misc' },
      { name: 'Electrolyte packets', category: 'misc' },
      { name: 'Portable fan (battery)', category: 'electronics' },
    ],
  },
  {
    activity: 'beach',
    weatherCheck: (w) => w.temp > 30,
    items: [
      { name: 'Reef-safe sunscreen SPF 50+', category: 'toiletries' },
      { name: 'UV-protective rash guard', category: 'clothing' },
      { name: 'Cooling spray bottle', category: 'misc' },
    ],
  },
  {
    activity: 'cycling',
    weatherCheck: (w) => {
      const main = (w.weatherMain || '').toLowerCase();
      return main === 'rain' || main === 'drizzle';
    },
    items: [
      { name: 'Waterproof cycling jacket', category: 'clothing' },
      { name: 'Mudguard / Fender (if renting)', category: 'misc' },
    ],
  },
  {
    activity: 'photography',
    weatherCheck: (w) => {
      const main = (w.weatherMain || '').toLowerCase();
      return main === 'rain' || main === 'snow';
    },
    items: [
      { name: 'Rain cover for camera', category: 'electronics' },
      { name: 'Silica gel packets (anti-moisture)', category: 'misc' },
    ],
  },
  {
    activity: 'hiking',
    weatherCheck: (w) => w.temp < 5,
    items: [
      { name: 'Insulated hiking boots', category: 'clothing' },
      { name: 'Thermos with hot drink', category: 'misc' },
      { name: 'Emergency blanket', category: 'misc' },
    ],
  },
];

// ─── TRIP TYPE ITEMS ────────────────────────────────────────────────────────
const tripTypeItems = {
  business: [
    { name: 'Laptop', category: 'electronics' },
    { name: 'Laptop charger', category: 'electronics' },
    { name: 'Formal shoes', category: 'clothing' },
    { name: 'Business suits / Formal attire', category: 'clothing' },
    { name: 'Tie / Accessories', category: 'clothing' },
    { name: 'Notebook / Planner', category: 'misc' },
    { name: 'Business cards', category: 'documents' },
    { name: 'Portable WiFi hotspot', category: 'electronics' },
  ],
  adventure: [
    { name: 'First aid kit', category: 'misc' },
    { name: 'Multi-tool / Swiss knife', category: 'misc' },
    { name: 'Headlamp', category: 'electronics' },
    { name: 'Dry bags (assorted sizes)', category: 'misc' },
    { name: 'Emergency whistle', category: 'misc' },
    { name: 'Paracord / Rope', category: 'misc' },
  ],
  family: [
    { name: 'Snacks (for kids & adults)', category: 'misc' },
    { name: 'Entertainment (books / games / tablet)', category: 'misc' },
    { name: 'First aid kit (family-size)', category: 'misc' },
    { name: 'Wet wipes / Hand sanitizer', category: 'toiletries' },
    { name: 'Portable charger (for devices)', category: 'electronics' },
    { name: 'Travel games / Coloring books', category: 'misc' },
  ],
  leisure: [
    { name: 'Book / Kindle / E-reader', category: 'misc' },
    { name: 'Comfortable loungewear', category: 'clothing' },
    { name: 'Journal / Notebook', category: 'misc' },
    { name: 'Headphones / Earbuds', category: 'electronics' },
  ],
};

// ─── DURATION-BASED ITEMS ───────────────────────────────────────────────────
const getDurationItems = (days) => {
  const items = [];
  if (days > 2) {
    items.push({ name: 'Packing cubes', category: 'misc' });
  }
  if (days > 3) {
    items.push({ name: 'Laundry bag', category: 'misc' });
  }
  if (days > 5) {
    items.push({ name: 'Travel-size laundry detergent', category: 'toiletries' });
    items.push({ name: 'Wrinkle-release spray', category: 'misc' });
  }
  if (days > 7) {
    items.push({ name: 'Extra bag for souvenirs', category: 'misc' });
    items.push({ name: 'Stain remover pen', category: 'misc' });
  }
  if (days > 10) {
    items.push({ name: 'Universal sink stopper (for hand-washing clothes)', category: 'misc' });
  }
  return items;
};

module.exports = {
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
};
