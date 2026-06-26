import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  Compass, 
  History, 
  Sun, 
  Moon, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Navigation, 
  FolderOpen, 
  Trash2, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Trees, 
  Landmark, 
  Utensils, 
  Flame, 
  ShoppingBag, 
  Palette, 
  Wine, 
  Users,
  Plane,
  Train,
  Car,
  Bus,
  TrainFront,
  Footprints,
  Wallet,
  Coins,
  Crown,
  Map,
  AlertCircle,
} from 'lucide-react';
import type { SavedTrip, Itinerary, TripPreferences } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LandingPage } from './components/LandingPage';
import { generateItinerary } from './utils/gemini';
import './App.css';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Interests options
const INTERESTS_OPTIONS = [
  { label: 'Nature & Outdoors', icon: Trees },
  { label: 'Culture & History', icon: Landmark },
  { label: 'Food & Dining', icon: Utensils },
  { label: 'Adventure & Sports', icon: Flame },
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Art & Museums', icon: Palette },
  { label: 'Relaxation & Wellness', icon: Sparkles },
  { label: 'Nightlife & Drinks', icon: Wine },
  { label: 'Family Friendly', icon: Users },
];

const TRAVEL_MODES = [
  { label: 'Flight', icon: Plane },
  { label: 'Train', icon: Train },
  { label: 'Car', icon: Car },
  { label: 'Bus', icon: Bus },
  { label: 'Transit', icon: TrainFront },
  { label: 'Walking', icon: Footprints },
];

const BUDGET_TIERS = [
  { label: 'Budget', icon: Wallet, desc: 'Hostels & free spots' },
  { label: 'Moderate', icon: Coins, desc: 'Standard hotels & dining' },
  { label: 'Luxury', icon: Crown, desc: 'High-end stays & tours' },
];

const SUGGESTION_TEMPLATES = [
  {
    from: 'London',
    destination: 'Paris, France',
    days: 4,
    budget: 'Moderate' as const,
    travelMode: 'Train' as const,
    interests: ['Food & Dining', 'Art & Museums', 'Culture & History'],
    otherPreferences: 'Prefer walking wherever possible and exploring historical cafes.',
    title: 'Paris Explorer',
    desc: '4 days of art, history, and cafes'
  },
  {
    from: 'San Francisco',
    destination: 'Tokyo, Japan',
    days: 5,
    budget: 'Luxury' as const,
    travelMode: 'Flight' as const,
    interests: ['Food & Dining', 'Shopping', 'Culture & History'],
    otherPreferences: 'High priority on Michelin dining, shopping in Ginza, and traditional tea ceremonies.',
    title: 'Tokyo Luxury Culinary',
    desc: '5 days of fine dining and style'
  },
  {
    from: 'Munich',
    destination: 'Interlaken, Switzerland',
    days: 6,
    budget: 'Moderate' as const,
    travelMode: 'Car' as const,
    interests: ['Nature & Outdoors', 'Adventure & Sports'],
    otherPreferences: 'Keen on hiking routes, panoramic viewing spots, and exploring lake cabins.',
    title: 'Swiss Alps Road Trip',
    desc: '6 days of alpine scenic hiking'
  }
];

function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Landing Page toggle state
  const [isLanding, setIsLanding] = useState(true);

  // Layout Tab State: 'form' | 'itinerary' | 'saved'
  const [activeTab, setActiveTab] = useState<'form' | 'itinerary' | 'saved'>('form');

  // Saved trips state
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => {
    const saved = localStorage.getItem('saved_trips');
    return saved ? JSON.parse(saved) : [];
  });

  // Form State
  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [travelMode, setTravelMode] = useState<'Flight' | 'Train' | 'Car' | 'Bus' | 'Transit' | 'Walking'>('Flight');
  const [interests, setInterests] = useState<string[]>(['Nature & Outdoors']);
  const [otherPreferences, setOtherPreferences] = useState('');

  // Generation status state
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  // Read API Key from environment variable
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  // GSAP references
  const containerRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync saved trips with localStorage
  useEffect(() => {
    localStorage.setItem('saved_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  // GSAP Animation orchestration
  useGSAP(() => {
    if (isLanding) {
      // 1. Landing page initial fade-in triggers
      gsap.fromTo('.hero-title', 
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
      gsap.fromTo('.hero-subtitle', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      );
      gsap.fromTo('.landing-cta', 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.3)', delay: 0.3 }
      );
      gsap.fromTo('.landing-preview', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.4 }
      );

      // 2. Parallax background elements scroll binder
      gsap.to('.parallax-bg-1', {
        y: -140,
        scrollTrigger: {
          trigger: '.landing-content',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8
        }
      });
      
      gsap.to('.parallax-bg-2', {
        y: 100,
        rotation: 30,
        scrollTrigger: {
          trigger: '.landing-content',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8
        }
      });

      gsap.to('.parallax-bg-3', {
        y: -80,
        scrollTrigger: {
          trigger: '.landing-content',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8
        }
      });

      // 3. Staggered reveal of Step cards on scroll
      gsap.fromTo('.step-card', 
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.15, 
          duration: 0.6, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.how-it-works-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // 4. Staggered reveal of Bespoke Feature cards on scroll
      gsap.fromTo('.feature-card', 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.5, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.landing-features-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // 5. Testimonials scroll reveal
      gsap.fromTo('.quote-card', 
        { opacity: 0, scale: 0.95 },
        { 
          opacity: 1, 
          scale: 1, 
          stagger: 0.12, 
          duration: 0.6, 
          ease: 'power1.out',
          scrollTrigger: {
            trigger: '.quotes-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // 6. Final CTA scale pop on scroll
      gsap.fromTo('.final-cta-card', 
        { scale: 0.96, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.6, 
          ease: 'back.out(1.1)',
          scrollTrigger: {
            trigger: '.final-cta-section',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    } else {
      // Workspace tab animations
      if (activeTab === 'form') {
        gsap.fromTo('.form-panel-centered', 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
        gsap.fromTo('.suggestion-card', 
          { y: 15, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.15 }
        );
      } else if (activeTab === 'itinerary') {
        if (itinerary && !isLoading) {
          gsap.fromTo('.trip-header-card', 
            { y: 25, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
          gsap.fromTo('.timeline-day-block', 
            { y: 35, opacity: 0 }, 
            { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'power2.out', delay: 0.1 }
          );
          gsap.fromTo('.timeline-event-card', 
            { x: -15, opacity: 0 }, 
            { x: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power1.out', delay: 0.25 }
          );
          gsap.fromTo('.side-widgets > *', 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.3 }
          );
        }
      } else if (activeTab === 'saved') {
        if (savedTrips.length > 0) {
          gsap.fromTo('.passport-card', 
            { scale: 0.92, opacity: 0 }, 
            { scale: 1, opacity: 1, stagger: 0.06, duration: 0.5, ease: 'back.out(1.1)' }
          );
        }
      }
    }
  }, { dependencies: [isLanding, activeTab, itinerary, isLoading, savedTrips.length], scope: containerRef });

  // 3D Parallax Mouse Move effect on the ticket card
  const handleTicketMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ticket = ticketRef.current;
    if (!ticket) return;

    const rect = ticket.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / (rect.height / 2)) * -3;
    const tiltY = (x / (rect.width / 2)) * 3;

    gsap.to(ticket, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1000,
      ease: 'power1.out',
      duration: 0.25
    });
  };

  const handleTicketMouseLeave = () => {
    const ticket = ticketRef.current;
    if (!ticket) return;

    gsap.to(ticket, {
      rotateX: 0,
      rotateY: 0,
      ease: 'power2.out',
      duration: 0.4
    });
  };

  const handleInterestToggle = (interestLabel: string) => {
    setInterests(prev => 
      prev.includes(interestLabel)
        ? prev.filter(item => item !== interestLabel)
        : [...prev, interestLabel]
    );
  };

  const handleApplyTemplate = (template: typeof SUGGESTION_TEMPLATES[0]) => {
    setFrom(template.from);
    setDestination(template.destination);
    setDays(template.days);
    setBudget(template.budget);
    setTravelMode(template.travelMode);
    setInterests(template.interests);
    setOtherPreferences(template.otherPreferences);
    
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !from.trim()) return;

    if (!apiKey) {
      setError('Google Gemini API Key is missing. Please define VITE_GEMINI_API_KEY in a .env file in the project root.');
      setActiveTab('itinerary');
      return;
    }

    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setActiveTripId(null);
    setActiveTab('itinerary');

    const preferences: TripPreferences = {
      from: from.trim(),
      destination: destination.trim(),
      days,
      budget,
      travelMode,
      interests,
      otherPreferences: otherPreferences.trim()
    };

    try {
      const generated = await generateItinerary(preferences, apiKey);
      setItinerary(generated);
      
      const newSavedTrip: SavedTrip = {
        id: Date.now().toString(),
        dateCreated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        preferences,
        itinerary: generated
      };
      setSavedTrips(prev => [newSavedTrip, ...prev]);
      setActiveTripId(newSavedTrip.id);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentTrip = () => {
    if (!itinerary) return;
    
    const exists = savedTrips.some(t => t.itinerary.tripOverview.title === itinerary.tripOverview.title);
    if (exists) return;

    const newSavedTrip: SavedTrip = {
      id: Date.now().toString(),
      dateCreated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      preferences: { from, destination, days, budget, travelMode, interests, otherPreferences },
      itinerary
    };
    setSavedTrips(prev => [newSavedTrip, ...prev]);
    setActiveTripId(newSavedTrip.id);
  };

  const handleLoadSavedTrip = (trip: SavedTrip) => {
    setItinerary(trip.itinerary);
    setFrom(trip.preferences.from);
    setDestination(trip.preferences.destination);
    setDays(trip.preferences.days);
    setBudget(trip.preferences.budget);
    setTravelMode(trip.preferences.travelMode);
    setInterests(trip.preferences.interests);
    setOtherPreferences(trip.preferences.otherPreferences);
    setActiveTripId(trip.id);
    setError(null);
    setActiveTab('itinerary');
  };

  const handleDeleteSavedTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTrips(prev => prev.filter(trip => trip.id !== id));
    if (activeTripId === id) {
      setActiveTripId(null);
      setItinerary(null);
    }
  };

  const isCurrentTripSaved = itinerary 
    ? savedTrips.some(trip => trip.itinerary.tripOverview.title === itinerary.tripOverview.title)
    : false;

  // LANDING PAGE WORKSPACE VIEW
  if (isLanding) {
    return (
      <LandingPage
        onEnter={() => setIsLanding(false)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
    );
  }

  // STANDARD WORKSPACE VIEW
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-group" onClick={() => setIsLanding(true)} style={{ cursor: 'pointer' }}>
          <Compass className="logo-icon floating" />
          <span className="app-title gradient-text">TravelSynth</span>
        </div>
        <div className="header-actions">
          {/* Tab Navigation */}
          <div className="layout-tabs no-print">
            <button 
              className={`layout-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              <Compass size={16} />
              <span>1. Plan Trip</span>
            </button>
            <button 
              className={`layout-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              <BookOpen size={16} />
              <span>2. Itinerary</span>
            </button>
            <button 
              className={`layout-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <History size={16} />
              <span>3. Saved Binder ({savedTrips.length})</span>
            </button>
          </div>

          <button 
            className="theme-toggle" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle Theme"
            aria-label="Toggle dark/light mode"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="dashboard-layout">
        <div className="main-content" ref={containerRef}>
          
          {/* TAB 1: Plan Trip Form */}
          {activeTab === 'form' && (
            <div className="tab-pane-container">
              <section 
                className="form-panel-centered glass"
                ref={ticketRef}
                onMouseMove={handleTicketMouseMove}
                onMouseLeave={handleTicketMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="ticket-header" style={{ transform: 'translateZ(20px)' }}>
                  <div>
                    <h2 className="panel-section-title">
                      <Sparkles size={20} style={{ color: 'var(--primary)', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> 
                      Create Travel Ticket
                    </h2>
                    <p className="panel-section-desc">Fill in details to print your personalized AI travel itinerary.</p>
                  </div>
                  <div className="ticket-barcode"></div>
                </div>

                <form onSubmit={handleGenerate} className="ticket-form-body" style={{ transform: 'translateZ(10px)' }}>
                  {/* Grid */}
                  <div className="ticket-form-grid">
                    
                    {/* Left Column */}
                    <div className="form-column-left">
                      {/* Origin & Destination */}
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">
                            <MapPin size={14} /> DEP (Origin)
                          </label>
                          <div className="input-with-icon">
                            <MapPin className="input-icon" />
                            <input 
                              type="text" 
                              placeholder="e.g. London" 
                              value={from} 
                              onChange={(e) => setFrom(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <MapPin size={14} /> ARR (Destination)
                          </label>
                          <div className="input-with-icon">
                            <MapPin className="input-icon" />
                            <input 
                              type="text" 
                              placeholder="e.g. Paris" 
                              value={destination} 
                              onChange={(e) => setDestination(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="form-group">
                        <div className="form-label" style={{ justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Trip Duration
                          </span>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{days} Days</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={days} 
                          onChange={(e) => setDays(parseInt(e.target.value))}
                          className="duration-slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <span>01 Day</span>
                          <span>05 Days</span>
                          <span>10 Days</span>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="form-group">
                        <label className="form-label">
                          <DollarSign size={14} /> Select Budget Tier
                        </label>
                        <div className="radio-card-grid">
                          {BUDGET_TIERS.map((tier) => {
                            const IconComponent = tier.icon;
                            return (
                              <div 
                                key={tier.label}
                                className={`radio-card ${budget === tier.label ? 'selected' : ''}`}
                                onClick={() => setBudget(tier.label as any)}
                              >
                                <IconComponent size={20} className="radio-card-emoji" />
                                <span className="radio-card-label">{tier.label}</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                  {tier.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Travel Mode */}
                      <div className="form-group">
                        <label className="form-label">
                          <Navigation size={14} /> Travel Mode
                        </label>
                        <div className="radio-card-grid travel-mode-grid">
                          {TRAVEL_MODES.map((mode) => {
                            const IconComponent = mode.icon;
                            return (
                              <div 
                                key={mode.label}
                                className={`radio-card ${travelMode === mode.label ? 'selected' : ''}`}
                                onClick={() => setTravelMode(mode.label as any)}
                              >
                                <IconComponent size={20} className="radio-card-emoji" />
                                <span className="radio-card-label">{mode.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="form-column-right">
                      {/* Interests */}
                      <div className="form-group">
                        <label className="form-label">
                          <Sparkles size={14} /> Select Interests
                        </label>
                        <div className="interests-grid">
                          {INTERESTS_OPTIONS.map((option) => {
                            const isSelected = interests.includes(option.label);
                            const IconComponent = option.icon;
                            return (
                              <div 
                                key={option.label}
                                className={`interest-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleInterestToggle(option.label)}
                              >
                                <div className="interest-checkbox">
                                  {isSelected && '✓'}
                                </div>
                                <IconComponent className="interest-icon" size={16} />
                                <span className="interest-label">{option.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom preferences */}
                      <div className="form-group">
                        <label className="form-label">
                          Other Details & Notes
                        </label>
                        <textarea 
                          placeholder="e.g. Vegetarian cuisine preference, traveling with parents, wheel-chair accessible routes, slow-paced travel..."
                          className="custom-textarea"
                          value={otherPreferences}
                          onChange={(e) => setOtherPreferences(e.target.value)}
                          style={{ minHeight: '120px' }}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="ticket-footer-perforation"></div>

                  <button 
                    type="submit" 
                    className="generate-btn" 
                    disabled={isLoading}
                  >
                    <Compass className={isLoading ? 'spin' : ''} size={18} />
                    {isLoading ? 'Printing Itinerary...' : 'Stamp & Print Itinerary'}
                  </button>
                </form>
              </section>

              {/* Suggestions */}
              <section className="templates-section">
                <h4 className="templates-title">Quick Starter Templates</h4>
                <div className="suggestion-cards-grid">
                  {SUGGESTION_TEMPLATES.map((tpl, i) => (
                    <div 
                      key={i} 
                      className="suggestion-card glass"
                      onClick={() => handleApplyTemplate(tpl)}
                    >
                      <div className="suggestion-card-title">{tpl.title}</div>
                      <div className="suggestion-card-desc">{tpl.desc}</div>
                      <div className="suggestion-card-meta">
                        <span>{tpl.from} <ArrowRight size={10} style={{ display: 'inline', margin: '0 2px' }} /> {tpl.destination}</span>
                        <span>•</span>
                        <span>{tpl.days} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: Itinerary Results */}
          {activeTab === 'itinerary' && (
            <main className="results-panel">
              {isLoading ? (
                <LoadingScreen />
              ) : error ? (
                <div className="empty-state">
                  <AlertCircle className="empty-illustration" size={48} style={{ color: 'var(--primary)' }} />
                  <h3 className="empty-title">Plan Synthesizer Error</h3>
                  <p className="empty-desc" style={{ color: 'var(--primary)' }}>{error}</p>
                  <button 
                    className="action-btn primary" 
                    onClick={() => setActiveTab('form')}
                  >
                    Return to Ticket Setup
                  </button>
                </div>
              ) : itinerary ? (
                <ItineraryDisplay 
                  itinerary={itinerary} 
                  onSaveTrip={handleSaveCurrentTrip}
                  isSaved={isCurrentTripSaved}
                />
              ) : (
                <div className="empty-state">
                  <Map className="empty-illustration" size={48} style={{ color: 'var(--primary)' }} />
                  <h2 className="empty-title">No Active Journey</h2>
                  <p className="empty-desc">
                    You have not compiled a travel itinerary yet. Go to the "Plan Trip" tab and stamp your ticket.
                  </p>
                  <button 
                    className="action-btn primary" 
                    onClick={() => setActiveTab('form')}
                  >
                    Setup Trip Parameters
                  </button>
                </div>
              )}
            </main>
          )}

          {/* TAB 3: Saved Binder */}
          {activeTab === 'saved' && (
            <div className="tab-pane-container">
              <section className="saved-binder-section">
                <div className="binder-header">
                  <h2 className="panel-section-title">Passport Itinerary Binder</h2>
                  <p className="panel-section-desc">Revisit past planned destinations and travel logs.</p>
                </div>

                {savedTrips.length === 0 ? (
                  <div className="empty-state" style={{ margin: '40px auto' }}>
                    <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h3 className="empty-title">Binder is Empty</h3>
                    <p className="empty-desc">No journeys have been saved to local memory yet.</p>
                    <button 
                      className="action-btn primary" 
                      onClick={() => setActiveTab('form')}
                    >
                      Plan Your First Trip
                    </button>
                  </div>
                ) : (
                  <div className="saved-binder-grid">
                    {savedTrips.map((trip) => (
                      <div 
                        key={trip.id}
                        className="passport-card glass"
                        onClick={() => handleLoadSavedTrip(trip)}
                      >
                        <div className="passport-stamp-decoration">PASSPORT</div>
                        <div className="passport-card-body">
                          <h3 className="passport-dest">{trip.itinerary.tripOverview.destination}</h3>
                          <div className="passport-title-sub">{trip.itinerary.tripOverview.title}</div>
                          
                          <div className="passport-details-row">
                            <div className="passport-meta-item">
                              <Calendar size={12} />
                              <span>{trip.itinerary.tripOverview.durationDays} Days</span>
                            </div>
                            <div className="passport-meta-item">
                              <DollarSign size={12} />
                              <span>{trip.preferences.budget}</span>
                            </div>
                            <div className="passport-meta-item">
                              <Navigation size={12} />
                              <span>{trip.preferences.travelMode}</span>
                            </div>
                          </div>
                          
                          <div className="passport-card-footer">
                            <span className="passport-date">Issued: {trip.dateCreated}</span>
                            <button 
                              className="passport-delete-btn" 
                              onClick={(e) => handleDeleteSavedTrip(trip.id, e)}
                              title="Delete Journey log"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
