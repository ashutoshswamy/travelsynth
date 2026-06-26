import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const LOADING_PHRASES = [
  'Packing your digital bags...',
  'Consulting local tour guides...',
  'Curating hidden local dining spots...',
  'Optimizing transit routes and walking steps...',
  'Finding top-rated boutique accommodations...',
  'Structuring your daily sightseeing schedule...',
  'Double-checking local tips and weather guidelines...',
  'Polishing your personalized adventure itinerary...',
];

export const LoadingScreen: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="compass-container">
        <div className="compass-outer"></div>
        <div className="compass-inner">
          <Compass className="compass-needle" size={36} />
        </div>
      </div>
      <h2 className="loading-title">Synthesizing Your Trip</h2>
      <p className="loading-subtitle">{LOADING_PHRASES[phraseIndex]}</p>
      <div className="progress-track">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
};
