import React, { useState, useEffect } from 'react';

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
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-tag-wrap" aria-hidden>
        <div className="loading-string" />
        <div className="tag tag-shadow loading-tag">
          <span className="loading-tag-line" />
          <span className="loading-tag-line short" />
          <span className="loading-tag-line" />
        </div>
      </div>
      <h2 className="loading-title">Building your trip</h2>
      <p className="loading-phrase">{LOADING_PHRASES[phraseIndex]}</p>
      <div className="loading-bar" aria-hidden>
        <span />
      </div>
    </div>
  );
};
