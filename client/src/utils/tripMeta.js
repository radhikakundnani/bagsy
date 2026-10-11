// Display info for trip types, packing categories and activities.
// Tailwind needs to see full class names in the source, so colours are written out here.
import {
  Activity, Bike, Briefcase, Camera, Car, Fish, Flag, Flower2, Footprints, IdCard, Image, Landmark,
  Mountain, MountainSnow, Music, Package, Plug, Sailboat, Shirt, ShoppingBag, Snowflake, Tent, TreePalm,
  Droplets, Umbrella, UsersRound, Utensils, Waves, Shell, Church,
} from 'lucide-react';

export const TRIP_TYPES = {
  leisure: { label: 'Leisure', icon: TreePalm, accent: 'bg-sun-deep', tint: 'bg-sun', blurb: 'Slow mornings, long lunches' },
  business: { label: 'Business', icon: Briefcase, accent: 'bg-sky-deep', tint: 'bg-sky', blurb: 'Meetings, laptops, one nice outfit' },
  adventure: { label: 'Adventure', icon: Mountain, accent: 'bg-lime-deep', tint: 'bg-lime', blurb: 'Trails, gear and early starts' },
  family: { label: 'Family', icon: UsersRound, accent: 'bg-lilac-deep', tint: 'bg-lilac', blurb: 'Snacks for everyone, always' },
};

export const tripTypeMeta = (type) => TRIP_TYPES[type] || TRIP_TYPES.leisure;

export const CATEGORIES = {
  clothing: { label: 'Clothing', icon: Shirt, tint: 'bg-sky' },
  toiletries: { label: 'Toiletries', icon: Droplets, tint: 'bg-lilac' },
  electronics: { label: 'Electronics', icon: Plug, tint: 'bg-sun' },
  documents: { label: 'Documents', icon: IdCard, tint: 'bg-lime' },
  misc: { label: 'Everything else', icon: Package, tint: 'bg-peach' },
};

export const CATEGORY_ORDER = ['clothing', 'toiletries', 'electronics', 'documents', 'misc'];

// Every activity the packing engine knows about (server/utils/packingRules.js)
export const ACTIVITIES = [
  { value: 'sightseeing', label: 'Sightseeing', icon: Landmark },
  { value: 'beach', label: 'Beach', icon: Umbrella },
  { value: 'dining', label: 'Dining out', icon: Utensils },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'nightlife', label: 'Nightlife', icon: Music },
  { value: 'museum', label: 'Museums', icon: Image },
  { value: 'temple', label: 'Temples & religious sites', icon: Church },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'hiking', label: 'Hiking', icon: Footprints },
  { value: 'camping', label: 'Camping', icon: Tent },
  { value: 'rockclimbing', label: 'Rock climbing', icon: MountainSnow },
  { value: 'cycling', label: 'Cycling', icon: Bike },
  { value: 'running', label: 'Running', icon: Activity },
  { value: 'yoga', label: 'Yoga', icon: Flower2 },
  { value: 'golf', label: 'Golf', icon: Flag },
  { value: 'swimming', label: 'Swimming', icon: Waves },
  { value: 'snorkeling', label: 'Snorkeling & diving', icon: Shell },
  { value: 'surfing', label: 'Surfing', icon: Waves },
  { value: 'watersports', label: 'Kayaking & water sports', icon: Sailboat },
  { value: 'fishing', label: 'Fishing', icon: Fish },
  { value: 'skiing', label: 'Skiing & snowboarding', icon: Snowflake },
  { value: 'roadtrip', label: 'Road trip', icon: Car },
];

export const activityMeta = (value) => ACTIVITIES.find((a) => a.value === value) || { value, label: value, icon: Landmark };

export const formatDate = (dateStr, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(dateStr).toLocaleDateString('en-GB', opts);

export const tripLength = (start, end) => Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
