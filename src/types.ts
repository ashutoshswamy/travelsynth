export interface Activity {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  activityTitle: string;
  description: string;
  locationName: string;
  duration: string;
  cost: string;
  iconType: 'sightseeing' | 'dining' | 'transit' | 'lodging' | 'shopping' | 'nature';
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface Accommodation {
  name: string;
  type: string;
  priceRange: string;
  description: string;
}

export interface EssentialTip {
  category: string;
  tip: string;
}

export interface TripOverview {
  title: string;
  destination: string;
  durationDays: number;
  budgetClassification: string;
  estimatedTotalCost: string;
  summary: string;
}

export interface Itinerary {
  tripOverview: TripOverview;
  essentialTips: EssentialTip[];
  itinerary: DayPlan[];
  recommendedAccommodations: Accommodation[];
}

export interface TripPreferences {
  from: string;
  destination: string;
  days: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  travelMode: 'Flight' | 'Train' | 'Car' | 'Bus' | 'Transit' | 'Walking';
  interests: string[];
  otherPreferences: string;
}

export interface SavedTrip {
  id: string;
  dateCreated: string;
  preferences: TripPreferences;
  itinerary: Itinerary;
}
