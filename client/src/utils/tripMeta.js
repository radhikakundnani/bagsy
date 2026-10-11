import {
  Accessibility as AccessibilityIcon, Baby, Backpack, Building2, Glasses, Heart, House, Leaf, Mountain as MountainIcon,
  Music as MusicIcon, PartyPopper, Pill, Presentation, Sparkles as SparklesIcon, Trophy, Umbrella as UmbrellaIcon, Church as ChurchIcon,
} from 'lucide-react';
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

// ─── Occasions and "about you" options (match server/utils/travellerOptions.js) ───

export const OCCASIONS = [
  { value: 'wedding', label: 'Wedding', icon: Heart },
  { value: 'festival', label: 'Festival or celebration', icon: PartyPopper },
  { value: 'conference', label: 'Work or conference', icon: Presentation },
  { value: 'beach', label: 'Beach holiday', icon: UmbrellaIcon },
  { value: 'citybreak', label: 'City break', icon: Building2 },
  { value: 'outdoors', label: 'Trek or outdoors', icon: MountainIcon },
  { value: 'religious', label: 'Religious visit', icon: ChurchIcon },
  { value: 'family', label: 'Visiting family', icon: House },
  { value: 'backpacking', label: 'Backpacking', icon: Backpack },
  { value: 'concert', label: 'Concert or event', icon: MusicIcon },
  { value: 'sports', label: 'Sports event', icon: Trophy },
  { value: 'romantic', label: 'Romantic getaway', icon: SparklesIcon },
];

export const occasionMeta = (value) => OCCASIONS.find((o) => o.value === value) || { value, label: value, icon: SparklesIcon };

export const ITEMS_FOR = [
  { value: 'women', label: 'Women’s items' },
  { value: 'men', label: 'Men’s items' },
  { value: 'both', label: 'Both' },
  { value: 'skip', label: 'Skip this' },
];

export const NEEDS = [
  { value: 'kids', label: 'Travelling with kids', icon: Baby },
  { value: 'medication', label: 'I take regular medication', icon: Pill },
  { value: 'glasses', label: 'I wear glasses or contacts', icon: Glasses },
  { value: 'diet', label: 'Vegetarian or special diet', icon: Leaf },
  { value: 'accessibility', label: 'Accessibility needs', icon: AccessibilityIcon },
];

// Suggestions for the "travelling from" box; any country can be typed
export const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'Singapore', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Ireland', 'New Zealand', 'Japan', 'South Korea', 'China', 'Hong Kong',
  'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Sri Lanka', 'Nepal', 'Bangladesh', 'Pakistan',
  'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'South Africa', 'Kenya', 'Nigeria', 'Egypt', 'Brazil',
  'Mexico', 'Argentina', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Portugal', 'Greece', 'Turkey', 'Russia',
];
