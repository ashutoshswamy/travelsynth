import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripPreferences, Itinerary } from '../types';

export const generateItinerary = async (
  preferences: TripPreferences,
  apiKey: string
): Promise<Itinerary> => {
  if (!apiKey) {
    throw new Error('API Key is missing. Please add your Gemini API Key in the settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-1.5-flash since it is extremely fast and robust for JSON generation
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const { from, destination, days, budget, travelMode, interests, otherPreferences } = preferences;

  const prompt = `You are a professional travel planner and local tour expert.
Create a highly detailed, personalized travel itinerary based on the following preferences:
- Departure Origin (From): ${from}
- Destination: ${destination}
- Duration of stay: ${days} days
- Budget tier: ${budget} (Budget, Moderate, or Luxury)
- Selected travel mode for transit: ${travelMode}
- Interests & Activities: ${interests.join(', ')}
- Custom preferences or notes: ${otherPreferences || 'None'}

Return ONLY a JSON object that strictly matches the following TypeScript structure:

interface Activity {
  timeSlot: "Morning" | "Afternoon" | "Evening";
  activityTitle: string;
  description: string; // Detail exactly what the traveler will do, see, or eat
  locationName: string; // The specific name of the restaurant, museum, park, train station, etc.
  duration: string;     // Estimated duration of the activity (e.g., "2 hours", "1.5 hours")
  cost: string;         // Local currency estimate (e.g., "Free", "$15", "¥2000") or "Included in travel mode"
  iconType: "sightseeing" | "dining" | "transit" | "lodging" | "shopping" | "nature";
}

interface DayPlan {
  dayNumber: number;
  theme: string; // The thematic focus of the day (e.g., "Exploring Historic Temple Sites")
  activities: Activity[];
}

interface Accommodation {
  name: string;
  type: string;        // E.g., "Boutique Hotel", "Budget Hostel", "Luxury Resort"
  priceRange: string;  // Price estimate (e.g., "$80 - $120/night")
  description: string; // Why this fits the traveler's profile and budget
}

interface EssentialTip {
  category: string;    // E.g., "Packing", "Culture", "Transit", "Currency", "Safety"
  tip: string;         // Concise practical advice for this trip
}

interface TripOverview {
  title: string;                 // A catchy title for this trip
  destination: string;           // Canonical destination name
  durationDays: number;
  budgetClassification: string;  // Budget tier description
  estimatedTotalCost: string;    // Estimated total expenditure range (e.g., "$450 - $600")
  summary: string;               // A brief 2-3 sentence overview of what the traveler will experience
}

interface ItineraryResponse {
  tripOverview: TripOverview;
  essentialTips: EssentialTip[];
  itinerary: DayPlan[];
  recommendedAccommodations: Accommodation[];
}

Strict requirements:
1. Generate detailed activities for all ${days} days. Ensure there are exactly 3 activities (Morning, Afternoon, and Evening) for each day.
2. The style must reflect the budget:
   - "Budget": Focus on free spots, walking routes, hostels, street food, and affordable local transport.
   - "Moderate": Standard hotels, a mix of dining options, paid entry tickets, and standard local transport.
   - "Luxury": Fine dining, private transport/cabs, private tours, luxury stays.
3. Incorporate the travel mode in the transportation-related logs (e.g., if travelMode is "Car", discuss road trips, parking tips, highway scenic points; if "Train", include main stations, train transfers, platform sights).
4. The list of interests must dictate the activity categories and descriptions. E.g. "Food & Dining" means dining stops should have local details, local dishes, and descriptions of the local cuisine. "Nature & Outdoors" should emphasize parks, trails, and scenic viewpoints.
5. Do NOT include any emojis or visual icons in the output text strings (such as the summary, title, custom notes, or activity details). Return plain text only.
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Clean any markdown wrapper if returned by accident
    let cleanedText = textResponse.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();
    }
    
    const parsedItinerary: Itinerary = JSON.parse(cleanedText);
    return parsedItinerary;
  } catch (error: any) {
    console.error('Error generating itinerary from Gemini API:', error);
    if (error.message && error.message.includes('API key not valid')) {
      throw new Error('The API key provided is invalid. Please check your key settings.');
    }
    throw new Error(error.message || 'Failed to generate itinerary. Please check your internet connection or try again.');
  }
};
