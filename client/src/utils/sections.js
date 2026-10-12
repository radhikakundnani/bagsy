// Shared bits for the optional trip sections (itinerary + inspo board)
import { Clapperboard, Link2, Music2, Pin, Play } from 'lucide-react';

// Where a saved link is from (matches server/utils/linkSource.js)
export const SOURCES = {
  instagram: { label: 'Instagram', icon: Clapperboard, tint: 'bg-peach' },
  tiktok: { label: 'TikTok', icon: Music2, tint: 'bg-sky' },
  youtube: { label: 'YouTube', icon: Play, tint: 'bg-sun' },
  pinterest: { label: 'Pinterest', icon: Pin, tint: 'bg-lilac' },
  web: { label: 'Link', icon: Link2, tint: 'bg-lime' },
};
export const sourceMeta = (source) => SOURCES[source] || SOURCES.web;

// Same check the server does, so we can say which app a link is from as you type
export const detectSource = (raw) => {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  if (/(^|\.)instagram\.com$/.test(host)) return 'instagram';
  if (/(^|\.)tiktok\.com$/.test(host)) return 'tiktok';
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return 'youtube';
  if (/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/.test(host)) return 'pinterest';
  return 'web';
};

// "instagram.com/reel/abc…" for showing a link without the noise
export const shortUrl = (raw) => {
  try {
    const url = new URL(raw);
    const text = url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/$/, '');
    return text.length > 40 ? `${text.slice(0, 39)}…` : text;
  } catch {
    return raw;
  }
};

// What to call an idea in lists, e.g. on the itinerary
export const ideaTitle = (item) => item.note || (item.kind === 'link' ? `${sourceMeta(item.source).label}: ${shortUrl(item.url)}` : 'Idea');

// Short "2 h", "3 d" age
export const timeAgo = (date) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h`;
  return `${Math.round(mins / 1440)} d`;
};

// The date of day N of the trip, e.g. "Tue 20 Oct". Uses UTC because trip dates are stored as UTC midnight.
export const dayLabel = (startDate, index) =>
  new Date(new Date(startDate).getTime() + index * 864e5).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

// A steady colour per person, so the same face looks the same everywhere
const TINTS = ['bg-sun', 'bg-lilac', 'bg-lime', 'bg-sky', 'bg-peach'];
export const tintFor = (id = '') => TINTS[[...String(id)].reduce((sum, c) => sum + c.charCodeAt(0), 0) % TINTS.length];
