import { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  History,
  MapPin,
  Calendar,
  Wallet as WalletIcon,
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
  Coins,
  Crown,
  Map,
  AlertCircle,
  Check,
  LogOut,
} from 'lucide-react';
import type { SavedTrip, Itinerary, TripPreferences } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { LandingPage, type Prefill } from './components/LandingPage';
import { AuthPage, AUTH_ROUTES, type AuthKind } from './components/AuthPages';
import { ThemeMenu, type ThemePref } from './components/ThemeMenu';
import { CookieBanner } from './components/CookieBanner';
import { LegalPage, type LegalKind } from './components/LegalPage';
import { useAuth } from './auth';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { generateItinerary } from './utils/gemini';
import { SUGGESTION_TEMPLATES, cityCode } from './constants';
import './App.css';
import './components/Overlays.css';

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
] as const;

const BUDGET_TIERS = [
  { label: 'Budget', icon: WalletIcon, desc: 'Hostels and free spots' },
  { label: 'Moderate', icon: Coins, desc: 'Standard hotels and dining' },
  { label: 'Luxury', icon: Crown, desc: 'High-end stays and tours' },
] as const;

type Tab = 'form' | 'itinerary' | 'saved';

function App() {
  const [themePref, setThemePref] = useState<ThemePref>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const theme: 'light' | 'dark' = themePref === 'system' ? (systemDark ? 'dark' : 'light') : themePref;

  const [isLanding, setIsLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('form');

  const { user, loading: authLoading, needsConsent, signOut } = useAuth();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Hash routes: legal (#/terms, #/privacy, #/cookies) and auth (#/signin, #/signup, #/forgot, #/consent)
  const readRoute = () => window.location.hash.match(/^#\/(\w+)$/)?.[1] ?? '';
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (r: string) => {
    window.location.hash = r ? `#/${r}` : '';
  };
  const legal = (['terms', 'privacy', 'cookies'].includes(route) ? route : null) as LegalKind | null;
  const authKind = (AUTH_ROUTES as string[]).includes(route) ? (route as AuthKind) : null;

  // Form state
  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<TripPreferences['budget']>('Moderate');
  const [travelMode, setTravelMode] = useState<TripPreferences['travelMode']>('Flight');
  const [interests, setInterests] = useState<string[]>(['Nature & Outdoors']);
  const [otherPreferences, setOtherPreferences] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', themePref);
  }, [theme, themePref]);

  // Live-sync this user's trips from Firestore.
  useEffect(() => {
    if (!user || !db) {
      setSavedTrips([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'trips'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => setSavedTrips(snap.docs.map((d) => ({ ...(d.data() as Omit<SavedTrip, 'id'>), id: d.id }))),
      () => setSaveError('Could not load your saved trips. Check your connection and the Firestore rules.')
    );
  }, [user]);

  // Signed in while on an auth page: leave it and open the planner.
  useEffect(() => {
    if (user && authKind) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      setRoute('');
      setActiveTab('form');
      setIsLanding(false);
      window.scrollTo({ top: 0 });
    }
  }, [user, authKind]);

  // A signed-in Google account without consent on file must finish the consent page.
  useEffect(() => {
    if (needsConsent && route !== 'consent') go('consent');
    if (!needsConsent && !authLoading && !user && route === 'consent') go('signin');
  }, [needsConsent, authLoading, user, route]);

  // Signing out returns to the landing page.
  useEffect(() => {
    if (!authLoading && !user && !isLanding) setIsLanding(true);
  }, [authLoading, user, isLanding]);

  const persistTrip = useCallback(
    async (trip: Omit<SavedTrip, 'id'>) => {
      if (!user || !db) return null;
      try {
        setSaveError(null);
        const ref = await addDoc(collection(db, 'users', user.uid, 'trips'), { ...trip, createdAt: Date.now() });
        return ref.id;
      } catch {
        setSaveError('Could not save this trip to your account.');
        return null;
      }
    },
    [user]
  );


  const handleInterestToggle = (label: string) => {
    setInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  };

  const applyPrefill = (p: Prefill) => {
    if (p.from !== undefined) setFrom(p.from);
    if (p.destination !== undefined) setDestination(p.destination);
    if (p.days !== undefined) setDays(p.days);
    if (p.budget) setBudget(p.budget);
    if (p.travelMode) setTravelMode(p.travelMode);
    if (p.interests) setInterests(p.interests);
    if (p.otherPreferences !== undefined) setOtherPreferences(p.otherPreferences);
  };

  const handleEnter = (prefill?: Prefill) => {
    if (prefill) applyPrefill(prefill);
    if (!user) {
      go('signup');
      return;
    }
    setActiveTab('form');
    setIsLanding(false);
    window.scrollTo({ top: 0 });
  };

  const handleApplyTemplate = (tpl: (typeof SUGGESTION_TEMPLATES)[number]) => {
    applyPrefill(tpl);
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
      otherPreferences: otherPreferences.trim(),
    };

    try {
      const generated = await generateItinerary(preferences, apiKey);
      setItinerary(generated);

      const id = await persistTrip({
        dateCreated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        preferences,
        itinerary: generated,
      });
      setActiveTripId(id);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Something went wrong during generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentTrip = async () => {
    if (!itinerary) return;
    const exists = savedTrips.some((t) => t.itinerary.tripOverview.title === itinerary.tripOverview.title);
    if (exists) return;

    const id = await persistTrip({
      dateCreated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      preferences: { from, destination, days, budget, travelMode, interests, otherPreferences },
      itinerary,
    });
    if (id) setActiveTripId(id);
  };

  const handleLoadSavedTrip = (trip: SavedTrip) => {
    setItinerary(trip.itinerary);
    applyPrefill(trip.preferences);
    setActiveTripId(trip.id);
    setError(null);
    setActiveTab('itinerary');
  };

  const handleDeleteSavedTrip = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trips', id));
    } catch {
      setSaveError('Could not delete that trip. Please try again.');
      return;
    }
    if (activeTripId === id) {
      setActiveTripId(null);
      setItinerary(null);
    }
  };

  const isCurrentTripSaved = itinerary
    ? savedTrips.some((trip) => trip.itinerary.tripOverview.title === itinerary.tripOverview.title)
    : false;

  const overlays = <CookieBanner />;

  if (legal) {
    return (
      <>
        <LegalPage kind={legal} />
        {overlays}
      </>
    );
  }

  if (authKind && !user) {
    return (
      <>
        <AuthPage kind={authKind} themePref={themePref} onThemeChange={setThemePref} />
        {overlays}
      </>
    );
  }

  if (isLanding) {
    return (
      <>
        <LandingPage
          onEnter={handleEnter}
          onSignIn={() => go('signin')}
          signedIn={Boolean(user)}
          themePref={themePref}
          onThemeChange={setThemePref}
        />
        {overlays}
      </>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'form', label: 'Plan', icon: Compass },
    { id: 'itinerary', label: 'Itinerary', icon: BookOpen },
    { id: 'saved', label: `Saved (${savedTrips.length})`, icon: History },
  ];

  return (
    <>
    {overlays}
    <div className="app">
      <header className="app-header no-print">
        <div className="app-header-in">
          <button className="logo app-logo" onClick={() => setIsLanding(true)} aria-label="TravelSynth home">
            <span className="logo-mark" aria-hidden />
            TravelSynth
          </button>

          <nav className="app-tabs" aria-label="Workspace">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className="app-tab"
                aria-current={activeTab === id ? 'page' : undefined}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <span className="who" title={user?.email ?? ''}>{user?.displayName || user?.email}</span>
          <ThemeMenu value={themePref} onChange={setThemePref} />
          <button className="icon-btn" onClick={() => void signOut()} aria-label="Sign out" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {saveError && (
          <p className="form-error app-banner" role="alert">{saveError}</p>
        )}
        {/* PLAN */}
        {activeTab === 'form' && (
          <div className="plan rise">
            <form className="plan-form" onSubmit={handleGenerate}>
              <header className="plan-head">
                <h1>Where are we going?</h1>
                <p>Answer a few questions. Your day-by-day plan is generated in under a minute.</p>
              </header>

              <fieldset className="pf-block">
                <legend className="pf-legend">Route</legend>
                <div className="pf-row">
                  <div className="field">
                    <label htmlFor="pf-from">Leaving from</label>
                    <input
                      id="pf-from"
                      className="input"
                      placeholder="e.g. London"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="pf-to">Going to</label>
                    <input
                      id="pf-to"
                      className="input"
                      placeholder="e.g. Paris"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="pf-block">
                <legend className="pf-legend">How long</legend>
                <div className="pf-days">
                  <output
                    className="pf-days-num"
                    htmlFor="pf-days"
                    style={{ fontVariationSettings: `'wght' ${300 + days * 50}, 'wdth' ${100 - (10 - days) * 2}, 'opsz' 96` }}
                  >
                    {days}
                  </output>
                  <div className="pf-days-ctl">
                    <label htmlFor="pf-days" className="pf-days-label">
                      {days === 1 ? 'day' : 'days'}
                    </label>
                    <input
                      id="pf-days"
                      className="range"
                      type="range"
                      min={1}
                      max={10}
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="pf-block">
                <legend className="pf-legend">Budget</legend>
                <div className="pf-budget">
                  {BUDGET_TIERS.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <button
                        type="button"
                        key={tier.label}
                        className="tier"
                        aria-pressed={budget === tier.label}
                        onClick={() => setBudget(tier.label)}
                      >
                        <Icon size={22} aria-hidden />
                        <strong>{tier.label}</strong>
                        <span>{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="pf-block">
                <legend className="pf-legend">Getting around</legend>
                <div className="pf-chips">
                  {TRAVEL_MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        type="button"
                        key={mode.label}
                        className="chip"
                        aria-pressed={travelMode === mode.label}
                        onClick={() => setTravelMode(mode.label)}
                      >
                        <Icon size={18} aria-hidden />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="pf-block">
                <legend className="pf-legend">What you love</legend>
                <div className="pf-chips">
                  {INTERESTS_OPTIONS.map((option) => {
                    const selected = interests.includes(option.label);
                    const Icon = selected ? Check : option.icon;
                    return (
                      <button
                        type="button"
                        key={option.label}
                        className="chip"
                        aria-pressed={selected}
                        onClick={() => handleInterestToggle(option.label)}
                      >
                        <Icon size={18} aria-hidden />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="pf-block field">
                <label htmlFor="pf-notes">Anything else we should know?</label>
                <textarea
                  id="pf-notes"
                  className="input"
                  placeholder="Vegetarian food, traveling with parents, step-free routes, slow pace..."
                  value={otherPreferences}
                  onChange={(e) => setOtherPreferences(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg pf-submit" disabled={isLoading}>
                <Sparkles size={20} aria-hidden className={isLoading ? 'spin' : ''} />
                {isLoading ? 'Building your trip...' : 'Build my itinerary'}
              </button>
            </form>

            <aside className="plan-side">
              <div className="live-tag-wrap" aria-label="Trip summary">
                <div className="live-tag tag tag-shadow">
                  <div className="lt-code">{destination.trim() ? cityCode(destination) : '???'}</div>
                  <div className="lt-route">
                    <span>{from.trim() || 'Origin'}</span>
                    <ArrowRight size={16} aria-hidden />
                    <span>{destination.trim() || 'Destination'}</span>
                  </div>
                  <dl className="lt-facts">
                    <div>
                      <dt>Length</dt>
                      <dd>{days} {days === 1 ? 'day' : 'days'}</dd>
                    </div>
                    <div>
                      <dt>Budget</dt>
                      <dd>{budget}</dd>
                    </div>
                    <div>
                      <dt>Travel</dt>
                      <dd>{travelMode}</dd>
                    </div>
                    <div>
                      <dt>Interests</dt>
                      <dd>{interests.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <section className="starts" aria-labelledby="starts-h">
                <h2 id="starts-h">Or start from a sample</h2>
                <ul>
                  {SUGGESTION_TEMPLATES.map((tpl) => (
                    <li key={tpl.code}>
                      <button type="button" className="start" onClick={() => handleApplyTemplate(tpl)}>
                        <span className="start-code">{tpl.code}</span>
                        <span className="start-text">
                          <strong>{tpl.title}</strong>
                          <span>{tpl.days} days, {tpl.desc}</span>
                        </span>
                        <ArrowRight size={18} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        )}

        {/* ITINERARY */}
        {activeTab === 'itinerary' &&
          (isLoading ? (
            <LoadingScreen />
          ) : error ? (
            <div className="state rise" role="alert">
              <AlertCircle size={44} aria-hidden />
              <h2>We could not build that plan</h2>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('form')}>
                Back to the planner
              </button>
            </div>
          ) : itinerary ? (
            <ItineraryDisplay itinerary={itinerary} onSaveTrip={() => void handleSaveCurrentTrip()} isSaved={isCurrentTripSaved} />
          ) : (
            <div className="state rise">
              <Map size={44} aria-hidden />
              <h2>No itinerary yet</h2>
              <p>Fill in the planner and your day-by-day plan will show up here.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('form')}>
                Open the planner
              </button>
            </div>
          ))}

        {/* SAVED */}
        {activeTab === 'saved' && (
          <section className="saved rise">
            <header className="plan-head">
              <h1>Saved trips</h1>
              <p>Saved to your account. Open one to read it again.</p>
            </header>

            {savedTrips.length === 0 ? (
              <div className="state">
                <FolderOpen size={44} aria-hidden />
                <h2>Nothing saved yet</h2>
                <p>Every plan you generate lands here automatically.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('form')}>
                  Plan your first trip
                </button>
              </div>
            ) : (
              <ul className="saved-grid">
                {savedTrips.map((trip, i) => (
                  <li key={trip.id} className="saved-item" style={{ ['--rot' as string]: `${[-1.6, 1.2, -0.8, 1.6][i % 4]}deg` }}>
                    <div className="saved-tag tag tag-shadow">
                      <button className="saved-open" onClick={() => handleLoadSavedTrip(trip)}>
                        <span className="saved-code">{cityCode(trip.itinerary.tripOverview.destination)}</span>
                        <span className="saved-dest">{trip.itinerary.tripOverview.destination}</span>
                        <span className="saved-title">{trip.itinerary.tripOverview.title}</span>
                        <span className="saved-meta">
                          <span><Calendar size={14} aria-hidden /> {trip.itinerary.tripOverview.durationDays} days</span>
                          <span><WalletIcon size={14} aria-hidden /> {trip.preferences.budget}</span>
                          <span><Navigation size={14} aria-hidden /> {trip.preferences.travelMode}</span>
                          <span><MapPin size={14} aria-hidden /> {trip.dateCreated}</span>
                        </span>
                      </button>
                      <button
                        className="saved-del"
                        onClick={() => void handleDeleteSavedTrip(trip.id)}
                        aria-label={`Delete ${trip.itinerary.tripOverview.title}`}
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
    </>
  );
}

export default App;
