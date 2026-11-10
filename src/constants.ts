import type { TripPreferences } from './types';

export interface TripTemplate extends TripPreferences {
  code: string;
  title: string;
  desc: string;
}

export const SUGGESTION_TEMPLATES: TripTemplate[] = [
  {
    code: 'PAR',
    from: 'London',
    destination: 'Paris, France',
    days: 4,
    budget: 'Moderate',
    travelMode: 'Train',
    interests: ['Food & Dining', 'Art & Museums', 'Culture & History'],
    otherPreferences: 'Prefer walking wherever possible and exploring historical cafes.',
    title: 'Paris Explorer',
    desc: 'Art, history and cafes on foot',
  },
  {
    code: 'TYO',
    from: 'San Francisco',
    destination: 'Tokyo, Japan',
    days: 5,
    budget: 'Luxury',
    travelMode: 'Flight',
    interests: ['Food & Dining', 'Shopping', 'Culture & History'],
    otherPreferences: 'High priority on Michelin dining, shopping in Ginza, and traditional tea ceremonies.',
    title: 'Tokyo Luxury Culinary',
    desc: 'Fine dining, Ginza and tea houses',
  },
  {
    code: 'INT',
    from: 'Munich',
    destination: 'Interlaken, Switzerland',
    days: 6,
    budget: 'Moderate',
    travelMode: 'Car',
    interests: ['Nature & Outdoors', 'Adventure & Sports'],
    otherPreferences: 'Keen on hiking routes, panoramic viewing spots, and exploring lake cabins.',
    title: 'Swiss Alps Road Trip',
    desc: 'Alpine hikes, viewpoints and lake cabins',
  },
];

/** Three-letter code for a destination, e.g. "Paris, France" -> "PAR". */
export const cityCode = (destination: string): string =>
  destination
    .split(',')[0]
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || '???';

/** Bump when Terms, Privacy or Cookie policy text changes materially. */
export const LEGAL_VERSION = '2026-11-10';
