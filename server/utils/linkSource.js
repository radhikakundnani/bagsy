// Check a pasted link and work out which app it's from.
// We only store links; the server never visits them.
const SOURCES = [
  ['instagram', /(^|\.)instagram\.com$/],
  ['tiktok', /(^|\.)tiktok\.com$/],
  ['youtube', /(^|\.)(youtube\.com|youtu\.be)$/],
  ['pinterest', /(^|\.)(pinterest\.[a-z.]+|pin\.it)$/],
];

// Returns { url, source } or null if it isn't a normal http(s) link
const parseLink = (raw) => {
  if (typeof raw !== 'string' || raw.trim().length > 500) return null;
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
  const host = url.hostname.toLowerCase();
  const match = SOURCES.find(([, pattern]) => pattern.test(host));
  return { url: url.href, source: match ? match[0] : 'web' };
};

module.exports = { parseLink };
