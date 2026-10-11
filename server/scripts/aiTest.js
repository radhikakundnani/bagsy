// Quick check that your Gemini key works and the AI gives sensible suggestions.
// Run:  npm run test:ai
require('dotenv').config();
const { suggestItems, isConfigured, MODEL } = require('../services/aiService');

(async () => {
  if (!isConfigured()) {
    console.log('No GEMINI_API_KEY in server/.env yet.');
    process.exit(1);
  }
  console.log(`Asking ${MODEL} for suggestions…\n`);
  const suggestions = await suggestItems({
    userId: 'ai-test',
    trip: {
      destination: 'Jaipur, India',
      startDate: '2026-11-20',
      endDate: '2026-11-25',
      tripType: 'family',
      activities: ['dining', 'hiking'],
      occasions: ['wedding', 'outdoors'],
      weather: { temp: 24, description: 'clear sky' },
      brief: "Cousin's wedding (sangeet + pheras), then 2 days trekking near Rishikesh",
    },
    traveller: { itemsFor: 'women', homeCountry: 'India', needs: ['glasses'] },
    existingItems: ['Toothbrush', 'Phone charger', 'Hiking boots / Trail shoes', 'Sunscreen SPF 30+'],
  });

  if (suggestions.length === 0) {
    console.log('No suggestions came back. Look for an "AI suggestions failed" line above for the reason.');
    process.exit(1);
  }
  suggestions.forEach((s, i) => console.log(`${i + 1}. ${s.name}  [${s.category}]\n   ${s.reason}`));
  console.log(`\n✓ AI is working (${suggestions.length} suggestions)`);
})();
