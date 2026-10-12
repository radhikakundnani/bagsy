const { findTripForUser } = require('./tripAccess');

// An error that already knows its HTTP status (the error handler reads err.status)
const httpError = (status, message) => Object.assign(new Error(message), { status });

// Load the trip for this user and make sure the section (itinerary / inspo) is switched on
const loadSection = async (req, key) => {
  const found = await findTripForUser(req.params.id, req.user._id);
  if (!found) throw httpError(404, 'Trip not found');
  if (found.trip.sections?.[key] === false) throw httpError(403, 'This section is switched off for this trip.');
  return found;
};

// How many days the trip covers, counting both the first and last day
const dayCount = (trip) => {
  const ms = new Date(trip.endDate) - new Date(trip.startDate);
  return Math.max(1, Math.round(ms / 864e5) + 1);
};

// Strings only, trimmed. Anything else (objects, numbers) becomes ''.
const text = (value) => (typeof value === 'string' ? value.trim() : '');

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

module.exports = { httpError, loadSection, dayCount, text, sameId };
