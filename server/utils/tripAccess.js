const crypto = require('crypto');
const Trip = require('../models/Trip');

// What is this user allowed to do on this trip?
// 'admin' = created it (or was made admin), 'member' = joined it, null = no access.
const roleOf = (trip, userId) => {
  if (trip.userId.equals(userId)) return 'admin';
  const member = (trip.members || []).find((m) => m.user.equals(userId));
  return member ? member.role : null;
};

// Load a trip only if the user belongs to it. Returns { trip, role } or null.
const findTripForUser = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  const role = roleOf(trip, userId);
  return role ? { trip, role } : null;
};

// MongoDB filter for "trips I created or joined"
const myTripsFilter = (userId) => ({ $or: [{ userId }, { 'members.user': userId }] });

// Long random code for invite links, hard to guess
const newInviteCode = () => crypto.randomBytes(9).toString('base64url');

// Hide the invite code from people who aren't admins
const tripForRole = (trip, role) => {
  const obj = trip.toObject ? trip.toObject() : { ...trip };
  if (role !== 'admin') delete obj.inviteCode;
  obj.myRole = role;
  obj.memberCount = (obj.members || []).length + 1;
  return obj;
};

module.exports = { roleOf, findTripForUser, myTripsFilter, newInviteCode, tripForRole };
