// Pulls every item + category out of the packing rules into a CSV.
// These are our first labelled examples for training the item sorter.
// Run from the repo root:  node ml/scripts/export_rule_items.js
const fs = require('fs');
const path = require('path');
const rules = require('../../server/utils/packingRules');

const items = new Map(); // name -> category (Map drops duplicates)

// The rules are nested objects and arrays, so walk through all of them
const walk = (value) => {
  if (Array.isArray(value)) return value.forEach(walk);
  if (value && typeof value === 'object') {
    const name = value.name || value.baseName;
    if (name && value.category) items.set(name.trim(), value.category);
    Object.values(value).forEach(walk);
  }
};
walk(rules);

const csvCell = (text) => `"${String(text).replace(/"/g, '""')}"`;
const rows = [...items].map(([name, category]) => [csvCell(name), category, 'rules'].join(','));
const out = path.join(__dirname, '..', 'data', 'rule_items.csv');
fs.writeFileSync(out, ['item,category,source', ...rows].join('\n') + '\n');

const counts = {};
for (const category of items.values()) counts[category] = (counts[category] || 0) + 1;
console.log(`Wrote ${items.size} items to ml/data/rule_items.csv`, counts);
