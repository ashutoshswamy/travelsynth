# TravelSynth — AI-Powered Smart Travel Itinerary Planner

TravelSynth is a high-fidelity, personalized travel itinerary generator built with React, TypeScript, and Vite, powered by the Google Gemini API. It leverages the speed and reasoning of `gemini-1.5-flash` to structure comprehensive daily travel schedules, stay recommendations, and practical localized advice based on user budget, interests, origin, and transport modes.

## Key Features

- 🗺️ **Comprehensive Preference Form**: Inputs for departure origin, destination, days (1-10 slider), budget tiers (Budget, Moderate, Luxury), travel modes (Flight, Train, Car, Bus, Transit, Walking), multi-select interest cards, and detailed freeform text inputs.
- 🕒 **Structured Day-by-Day Timelines**: Chronological schedules broken into Morning, Afternoon, and Evening activities with location names, estimated costs, activity durations, and custom categorized indicators.
- 🏡 **Smart Stays & Tips**: Actionable lodging recommendations matching the user's budget and target travel profiles alongside practical cultural, packing, transit, and security tips.
- 📁 **LocalStorage Travel History**: Tracks and preserves generated itineraries locally so users can compare different routes and revisit prior plans.
- 🔑 **Secure Local Key Configuration**: Simple, browser-based Gemini API key panel saving directly to local memory (never exposed to any external servers).
- 🌓 **Dynamic Theme System**: Sleek glassmorphism look supporting dark and light themes with transition animations.
- 🖨️ **Print & PDF Layouts**: Optimised typography styles specifically suited for printing physical copy itineraries or saving to PDF.
- ⚡ **Interactive Quick Templates**: Fast-fill suggestions for quick testing (e.g. Paris Explorer, Tokyo Culinary, Swiss Alps Road Trip).

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install npm dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

### Configuring Gemini API Key

To generate itineraries, you need a Google Gemini API Key. The application loads this key exclusively from environment variables:
1. Go to the [Google AI Studio](https://aistudio.google.com/) to get a free API Key.
2. Create a `.env` file in the project root folder and add:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Production Build

To compile a production build:
```bash
npm run build
```

To preview the build locally:
```bash
npm run preview
```
