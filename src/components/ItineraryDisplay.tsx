import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Navigation, 
  Clock, 
  Home, 
  Trees, 
  ShoppingBag, 
  Utensils, 
  Camera, 
  Info,
  Bookmark
} from 'lucide-react';
import type { Itinerary } from '../types';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSaveTrip: () => void;
  isSaved: boolean;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  onSaveTrip,
  isSaved,
}) => {
  const { tripOverview, essentialTips, itinerary: days, recommendedAccommodations } = itinerary;
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'dining':
        return <Utensils size={16} />;
      case 'transit':
        return <Navigation size={16} />;
      case 'lodging':
        return <Home size={16} />;
      case 'shopping':
        return <ShoppingBag size={16} />;
      case 'nature':
        return <Trees size={16} />;
      case 'sightseeing':
      default:
        return <Camera size={16} />;
    }
  };

  // Filter days based on tab selection
  const displayedDays = selectedDay === 'all' 
    ? days 
    : days.filter(d => d.dayNumber === selectedDay);

  return (
    <div className="itinerary-container">
      {/* Overview Banner Card */}
      <div className="trip-header-card glass">
        <div className="trip-header-main">
          <div className="trip-title-area">
            <span className="trip-dest-badge">{tripOverview.destination}</span>
            <h1 className="trip-title gradient-text">{tripOverview.title}</h1>
          </div>
          <div className="trip-actions no-print">
            <button 
              className={`action-btn ${isSaved ? 'saved' : ''}`} 
              onClick={onSaveTrip}
              disabled={isSaved}
              title={isSaved ? "Saved to history" : "Save trip to history"}
            >
              <Bookmark size={18} fill={isSaved ? "var(--primary)" : "none"} style={{ color: isSaved ? 'var(--primary)' : 'inherit' }} />
              {isSaved ? 'Saved' : 'Save Trip'}
            </button>
          </div>
        </div>

        <p className="trip-overview-summary">{tripOverview.summary}</p>

        {/* Trip Meta Badges */}
        <div className="trip-meta-row">
          <div className="meta-pill">
            <Calendar className="pill-icon" />
            <span>Duration:</span>
            <span className="pill-val">{tripOverview.durationDays} Days</span>
          </div>
          <div className="meta-pill">
            <DollarSign className="pill-icon" />
            <span>Budget:</span>
            <span className="pill-val">{tripOverview.budgetClassification}</span>
          </div>
          <div className="meta-pill">
            <DollarSign className="pill-icon" />
            <span>Est. Cost:</span>
            <span className="pill-val" style={{ color: 'var(--emerald)' }}>{tripOverview.estimatedTotalCost}</span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="trip-details-grid">
        {/* Timeline Content */}
        <div className="timeline-section">
          {/* Day selection tabs */}
          <div className="day-selector-bar no-print">
            <button 
              className={`day-tab ${selectedDay === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedDay('all')}
            >
              Full Trip
            </button>
            {days.map((day) => (
              <button
                key={day.dayNumber}
                className={`day-tab ${selectedDay === day.dayNumber ? 'active' : ''}`}
                onClick={() => setSelectedDay(day.dayNumber)}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          <div className="itinerary-timeline">
            {displayedDays.map((day) => (
              <div key={day.dayNumber} className="timeline-day-block print-break">
                <div className="day-block-header">
                  <div className="day-block-dot"></div>
                  <h3 className="day-title-text">Day {day.dayNumber}</h3>
                  <span className="day-theme-tag">{day.theme}</span>
                </div>

                {day.activities.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className={`timeline-event-card glass ${activity.iconType || 'sightseeing'}`}
                  >
                    <div className="event-meta">
                      <span className="event-time">
                        <Clock size={14} />
                        {activity.timeSlot}
                      </span>
                      <span className={`event-badge ${activity.iconType || 'sightseeing'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {getActivityIcon(activity.iconType)}
                        {activity.iconType || 'sightseeing'}
                      </span>
                    </div>

                    <h4 className="event-title">{activity.activityTitle}</h4>
                    <p className="event-desc">{activity.description}</p>

                    <div className="event-footer">
                      <div className="event-foot-item">
                        <MapPin className="event-foot-icon" />
                        <span>{activity.locationName}</span>
                      </div>
                      {activity.duration && (
                        <div className="event-foot-item">
                          <Clock className="event-foot-icon" />
                          <span>Duration: {activity.duration}</span>
                        </div>
                      )}
                      {activity.cost && (
                        <div className="event-foot-item">
                          <DollarSign className="event-foot-icon" />
                          <span>Est. Cost: <strong className="event-cost">{activity.cost}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Side Widgets (Tips and Lodging) */}
        <div className="side-widgets">
          {/* Recommended Hotels */}
          {recommendedAccommodations && recommendedAccommodations.length > 0 && (
            <div className="hotel-section">
              <h3 className="card-title-sm">
                <Home size={18} className="pill-icon" /> Stays Recommended
              </h3>
              <div className="hotel-grid">
                {recommendedAccommodations.map((hotel, index) => (
                  <div key={index} className="hotel-card glass">
                    <div className="hotel-card-icon">
                      <Home size={20} />
                    </div>
                    <div className="hotel-info">
                      <span className="hotel-name">{hotel.name}</span>
                      <span className="hotel-desc">{hotel.description}</span>
                      <div className="hotel-footer">
                        <span className="hotel-type">{hotel.type}</span>
                        <span className="hotel-price">{hotel.priceRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expert Travel Tips */}
          {essentialTips && essentialTips.length > 0 && (
            <div className="tips-card glass">
              <h3 className="card-title-sm">
                <Info size={18} className="pill-icon" /> Trip Advisor Tips
              </h3>
              <ul className="tips-list">
                {essentialTips.map((tip, index) => (
                  <li key={index} className="tip-item">
                    <span className="tip-category-badge">{tip.category}</span>
                    <span>{tip.tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
