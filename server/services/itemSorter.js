// Sorts a custom packing item ("type c cable", "aadhaar card") into a category,
// using the small model trained in ml/train_item_sorter.ipynb.
//
// How it works:
//   1. Turn the text into 384 numbers with the same embedding model used in training
//      (all-MiniLM-L6-v2, run in Node by Transformers.js).
//   2. Multiply by the weights learned in Python (server/ml/item_sorter.json)
//      and turn the scores into probabilities (softmax).
//
// It never throws. If the model can't load, it returns null and the app
// simply keeps the category the person picked.
const weights = require('../ml/item_sorter.json');

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2'; // the same MiniLM model, converted for JavaScript
const CONFIDENT = 0.5; // below this, we suggest a category but let the person decide
const RETRY_AFTER_MS = 5 * 60 * 1000;

const isEnabled = () => process.env.ITEM_SORTER !== 'off';

let extractorPromise = null;
let lastFailure = 0;

// Load the embedding model once and reuse it (loading takes a few seconds)
const loadExtractor = () => {
  if (extractorPromise) return extractorPromise;
  if (Date.now() - lastFailure < RETRY_AFTER_MS) return Promise.resolve(null);
  extractorPromise = import('@huggingface/transformers')
    .then(({ pipeline }) => pipeline('feature-extraction', MODEL_ID, { dtype: 'fp32' }))
    .catch((err) => {
      console.warn('Item sorter unavailable:', err.message);
      lastFailure = Date.now();
      extractorPromise = null;
      return null;
    });
  return extractorPromise;
};

// Turn raw scores into probabilities that add up to 1
const softmax = (scores) => {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
};

// The logistic regression part: one score per category = weights · embedding + intercept
const classify = (embedding) => {
  const scores = weights.coef.map((row, k) => row.reduce((sum, w, i) => sum + w * embedding[i], weights.intercept[k]));
  const probs = softmax(scores);
  const best = probs.indexOf(Math.max(...probs));
  return {
    category: weights.classes[best],
    confidence: probs[best],
    confident: probs[best] >= CONFIDENT,
    probs: Object.fromEntries(weights.classes.map((c, i) => [c, probs[i]])),
  };
};

const embed = async (texts) => {
  const extractor = await loadExtractor();
  if (!extractor) return null;
  // Mean pooling + normalising matches what sentence-transformers did in Python
  const output = await extractor(texts, { pooling: 'mean', normalize: true });
  return output.tolist();
};

// Remember recent answers so the same text isn't worked out twice
const cache = new Map();
const MAX_CACHE = 500;

// "Type C cable " -> { category: 'electronics', confidence: 0.7, confident: true, probs: {...} } or null
const sortItem = async (name) => {
  const text = typeof name === 'string' ? name.trim().toLowerCase() : ''; // same cleaning as training
  if (!isEnabled() || text.length < 2 || text.length > 100) return null;
  if (cache.has(text)) return cache.get(text);
  try {
    const vectors = await embed([text]);
    if (!vectors) return null;
    const result = classify(vectors[0]);
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
    cache.set(text, result);
    return result;
  } catch (err) {
    console.warn('Item sorter failed:', err.message);
    return null;
  }
};

// Free the model before the process ends. Exiting while it is still loaded
// can crash on macOS ("mutex lock failed"), so tests and shutdown call this first.
const close = async () => {
  const extractor = extractorPromise && (await extractorPromise);
  extractorPromise = null;
  if (extractor) await extractor.dispose();
};

// Start loading in the background when the server starts, so the first person doesn't wait
const warmUp = () => {
  if (isEnabled()) loadExtractor();
};

module.exports = { sortItem, classify, softmax, embed, warmUp, close, CONFIDENT, info: { classes: weights.classes, cvAccuracy: weights.cv_accuracy } };
