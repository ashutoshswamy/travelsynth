import React, { useState } from 'react';
import {
  Calendar,
  Wallet,
  MapPin,
  Navigation,
  Clock,
  Home,
  Trees,
  ShoppingBag,
  Utensils,
  Camera,
  Info,
  Bookmark,
  Printer,
  Banknote,
  Sunrise,
  Sun,
  Moon,
} from 'lucide-react';
import type { Activity, Itinerary } from '../types';

const ACTIVITY_ICONS = {
  dining: Utensils,
  transit: Navigation,
  lodging: Home,
  shopping: ShoppingBag,
  nature: Trees,
  sightseeing: Camera,
} as const;

const SLOT_ICONS = { Morning: Sunrise, Afternoon: Sun, Evening: Moon } as const;

/** One stop on a day. Shared by the live itinerary and the landing-page sample. */
export const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const kind = activity.iconType || 'sightseeing';
  const Icon = ACTIVITY_ICONS[kind] ?? Camera;
  const SlotIcon = SLOT_ICONS[activity.timeSlot] ?? Clock;

  return (
    <article className={`stop cat-${kind}`}>
      <div className="stop-rail">
        <span className="stop-slot">
          <SlotIcon size={16} aria-hidden /> {activity.timeSlot}
        </span>
        <span className="stop-dot" aria-hidden />
      </div>
      <div className="stop-body">
        <span className="stop-cat">
          <Icon size={14} aria-hidden /> {kind}
        </span>
        <h4 className="stop-title">{activity.activityTitle}</h4>
        <p className="stop-desc">{activity.description}</p>
        <div className="stop-meta">
          <span>
            <MapPin size={15} aria-hidden /> {activity.locationName}
          </span>
          {activity.duration && (
            <span>
              <Clock size={15} aria-hidden /> {activity.duration}
            </span>
          )}
          {activity.cost && (
            <span>
              <Banknote size={15} aria-hidden /> <strong>{activity.cost}</strong>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSaveTrip: () => void;
  isSaved: boolean;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onSaveTrip, isSaved }) => {
  const { tripOverview, essentialTips, itinerary: days, recommendedAccommodations } = itinerary;
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');

  const displayedDays = selectedDay === 'all' ? days : days.filter((d) => d.dayNumber === selectedDay);

  return (
    <div className="itin">
      <header className="itin-hero rise">
        <div className="itin-hero-top">
          <span className="sticker">
            <MapPin size={15} aria-hidden /> {tripOverview.destination}
          </span>
          <div className="itin-actions no-print">
            <button className="btn btn-sun itin-btn" onClick={onSaveTrip} disabled={isSaved}>
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} aria-hidden />
              {isSaved ? 'Saved' : 'Save trip'}
            </button>
            <button className="btn itin-btn itin-btn-ghost" onClick={() => window.print()}>
              <Printer size={18} aria-hidden /> Print or PDF
            </button>
          </div>
        </div>

        <h1 className="itin-title">{tripOverview.title}</h1>
        <p className="itin-summary">{tripOverview.summary}</p>

        <dl className="itin-facts">
          <div>
            <dt>
              <Calendar size={15} aria-hidden /> Length
            </dt>
            <dd>{tripOverview.durationDays} days</dd>
          </div>
          <div>
            <dt>
              <Wallet size={15} aria-hidden /> Budget
            </dt>
            <dd>{tripOverview.budgetClassification}</dd>
          </div>
          <div>
            <dt>
              <Banknote size={15} aria-hidden /> Estimated cost
            </dt>
            <dd>{tripOverview.estimatedTotalCost}</dd>
          </div>
        </dl>
      </header>

      <div className="itin-grid">
        <section className="itin-days" aria-label="Day by day plan">
          <div className="day-tabs no-print" role="group" aria-label="Choose a day">
            <button className="chip" aria-pressed={selectedDay === 'all'} onClick={() => setSelectedDay('all')}>
              Full trip
            </button>
            {days.map((day) => (
              <button
                key={day.dayNumber}
                className="chip"
                aria-pressed={selectedDay === day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {displayedDays.map((day) => (
            <section key={day.dayNumber} className="day print-break rise">
              <header className="day-head">
                <span className="day-num">{String(day.dayNumber).padStart(2, '0')}</span>
                <div>
                  <h3 className="day-title">Day {day.dayNumber}</h3>
                  <p className="day-theme">{day.theme}</p>
                </div>
              </header>
              {day.activities.map((activity, idx) => (
                <ActivityCard key={idx} activity={activity} />
              ))}
            </section>
          ))}
        </section>

        <aside className="itin-side">
          {recommendedAccommodations && recommendedAccommodations.length > 0 && (
            <section className="side-block">
              <h3 className="side-title">
                <Home size={20} aria-hidden /> Where to stay
              </h3>
              <ul className="stay-list">
                {recommendedAccommodations.map((hotel, i) => (
                  <li key={i} className="stay">
                    <strong className="stay-name">{hotel.name}</strong>
                    <p>{hotel.description}</p>
                    <div className="stay-foot">
                      <span className="sticker mint">{hotel.type}</span>
                      <span className="stay-price">{hotel.priceRange}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {essentialTips && essentialTips.length > 0 && (
            <section className="side-block side-tips">
              <h3 className="side-title">
                <Info size={20} aria-hidden /> Good to know
              </h3>
              <ul className="tip-list">
                {essentialTips.map((tip, i) => (
                  <li key={i}>
                    <span className="tip-cat">{tip.category}</span>
                    <span>{tip.tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};
