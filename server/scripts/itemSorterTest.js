// Checks the item sorter works in Node and gives the same answers as Python.
// Run:  npm run test:sorter     (first run downloads the ~90 MB embedding model)
const { embed, classify, sortItem, close, info } = require('../services/itemSorter');
const { checks } = require('../ml/item_sorter.json');

(async () => {
  let passed = 0;
  let failed = 0;
  const check = (name, ok, detail = '') => {
    ok ? passed++ : failed++;
    console.log(ok ? '  ✓' : '  ✗', name, ok ? '' : detail);
  };

  const started = Date.now();
  const vectors = await embed(checks.map((c) => c.item));
  if (!vectors) {
    console.log('  ✗ The embedding model did not load. Is @huggingface/transformers installed and are you online?');
    process.exit(1);
  }
  console.log(`  Model loaded in ${((Date.now() - started) / 1000).toFixed(1)}s, memory ${Math.round(process.memoryUsage().rss / 1e6)} MB`);
  check('Each item becomes 384 numbers, like in Python', vectors[0].length === 384);

  // Node must match the probabilities Python saved, or something got lost in translation
  checks.forEach((c, i) => {
    const node = Object.values(classify(vectors[i]).probs);
    const biggestGap = Math.max(...node.map((p, k) => Math.abs(p - c.probs[k])));
    check(`"${c.item}" matches Python`, biggestGap < 0.01, `(off by ${biggestGap.toFixed(3)})`);
  });

  const r = await sortItem('  Type C Cable ');
  check('Cleans the text the same way as training', r && r.category === 'electronics');
  check('Empty text is ignored', (await sortItem('')) === null);

  console.log('\n  Try it:');
  for (const item of ['airpods', 'pan card', 'sunnies', 'kajal', 'kurta', 'hair straightener', 'travel pillow']) {
    const s = await sortItem(item);
    console.log(`  ${item.padEnd(18)} → ${s.category.padEnd(12)} ${Math.round(s.confidence * 100)}%${s.confident ? '' : '  (not sure, user picks)'}`);
  }

  console.log(`\nModel classes: ${info.classes.join(', ')} · cross-validated accuracy ${Math.round(info.cvAccuracy * 100)}%`);
  console.log(`${passed} passed, ${failed} failed`);
  await close(); // free the model first, then let Node exit on its own
  process.exitCode = failed ? 1 : 0;
})();
