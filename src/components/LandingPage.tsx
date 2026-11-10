import { useState } from 'react';
import './LandingPage.css';
import {
  ArrowRight,
  Globe,
  Check,
  Wallet,
  Home,
  Info,
  Printer,
  Cloud,
} from 'lucide-react';
import { ThemeMenu, type ThemePref } from './ThemeMenu';
import { ActivityCard } from './ItineraryDisplay';
import { SUGGESTION_TEMPLATES, type TripTemplate } from '../constants';
import type { Activity, TripPreferences } from '../types';

export type Prefill = Partial<TripPreferences>;

interface LandingPageProps {
  onEnter: (prefill?: Prefill) => void;
  onSignIn: () => void;
  signedIn: boolean;
  themePref: ThemePref;
  onThemeChange: (v: ThemePref) => void;
}

const STEPS = [
  {
    title: 'Pick where and how long',
    desc: 'Type your origin and destination, then set the number of days.',
    tone: 'sun',
  },
  {
    title: 'Set budget, transport and interests',
    desc: 'Choose a budget tier, how you travel, and what you love doing.',
    tone: 'mint',
  },
  {
    title: 'Get a day-by-day plan',
    desc: 'Morning, afternoon and evening stops with places, durations and costs.',
    tone: 'pink',
  },
];

// Sample content, authored for this page. Labelled as a sample wherever it appears.
const SAMPLE_DAYS: { label: string; theme: string; activities: Activity[] }[] = [
  {
    label: 'Day 1',
    theme: 'Old Tokyo and the river',
    activities: [
      {
        timeSlot: 'Morning',
        activityTitle: 'Senso-ji before the crowds',
        description: 'Walk through Kaminarimon at opening time, then browse Nakamise street as the stalls roll up their shutters.',
        locationName: 'Senso-ji, Asakusa',
        duration: '2 hours',
        cost: 'Free',
        iconType: 'sightseeing',
      },
      {
        timeSlot: 'Afternoon',
        activityTitle: 'Tempura lunch by the Sumida',
        description: 'Counter seats, a set menu and a short stroll along the river terrace to digest.',
        locationName: 'Sumida Riverside, Asakusa',
        duration: '1.5 hours',
        cost: '¥3,200',
        iconType: 'dining',
      },
      {
        timeSlot: 'Evening',
        activityTitle: 'Water bus to Odaiba',
        description: 'Take the sunset boat across the bay and watch the skyline switch on.',
        locationName: 'Asakusa Pier',
        duration: '1 hour',
        cost: '¥1,200',
        iconType: 'transit',
      },
    ],
  },
  {
    label: 'Day 2',
    theme: 'Gardens and Ginza',
    activities: [
      {
        timeSlot: 'Morning',
        activityTitle: 'Hamarikyu Gardens tea house',
        description: 'Matcha and a wagashi sweet on a pond-side pavilion, tide gates and pine trees all around.',
        locationName: 'Hamarikyu Gardens',
        duration: '2 hours',
        cost: '¥800',
        iconType: 'nature',
      },
      {
        timeSlot: 'Afternoon',
        activityTitle: 'Ginza department stores',
        description: 'Ride the elevators floor by floor: stationery, ceramics and a food hall worth the detour.',
        locationName: 'Ginza',
        duration: '3 hours',
        cost: '¥5,000+',
        iconType: 'shopping',
      },
      {
        timeSlot: 'Evening',
        activityTitle: 'Yakitori under the tracks',
        description: 'Smoky, tiny and loud. Order by the skewer and keep the napkins close.',
        locationName: 'Yurakucho Gado-shita',
        duration: '2 hours',
        cost: '¥4,000',
        iconType: 'dining',
      },
    ],
  },
];

const BENTO = [
  {
    cls: 'b-budget',
    icon: Wallet,
    title: 'Plans that match your budget',
    desc: 'Hostel beds and street food, mid-range hotels, or tasting menus. Every stop is priced for your tier.',
  },
  {
    cls: 'b-stay',
    icon: Home,
    title: 'Stays picked to fit',
    desc: 'Lodging suggestions with type and nightly range.',
  },
  {
    cls: 'b-tips',
    icon: Info,
    title: 'Tips before you land',
    desc: 'Packing, transit, currency and safety notes.',
  },
  {
    cls: 'b-local',
    icon: Cloud,
    title: 'Saved to your account',
    desc: 'Sign in with Google or email and your trips follow you across devices.',
  },
  {
    cls: 'b-print',
    icon: Printer,
    title: 'Print it or save a PDF',
    desc: 'A clean layout for the fridge, the glovebox or the airport.',
  },
];

const codeToneRot = ['-3deg', '2deg', '-1.5deg'];

export function LandingPage({ onEnter, onSignIn, signedIn, themePref, onThemeChange }: LandingPageProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [days, setDays] = useState(4);
  const [sampleDay, setSampleDay] = useState(0);

  // Type morph: the more days, the heavier and wider the numeral.
  const dayWeight = 300 + days * 50;
  const dayWidth = 100 - (10 - days) * 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnter({ from: from.trim(), destination: to.trim(), days });
  };

  const startFrom = (tpl: TripTemplate) => {
    const { code: _code, title: _title, desc: _desc, ...prefs } = tpl;
    void _code; void _title; void _desc;
    onEnter(prefs);
  };

  const day = SAMPLE_DAYS[sampleDay];

  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-header-in">
          <a className="logo" href="#top" aria-label="TravelSynth home">
            <span className="logo-mark" aria-hidden />
            TravelSynth
          </a>
          <nav className="lp-nav" aria-label="Sections">
            <a href="#how">How it works</a>
            <a href="#sample">Sample plan</a>
            <a href="#features">Features</a>
          </nav>
          <div className="lp-header-right">
            <ThemeMenu value={themePref} onChange={onThemeChange} />
            {!signedIn && (
              <button className="lp-signin" onClick={onSignIn}>Sign in</button>
            )}
            <button className="btn btn-primary lp-nav-cta" onClick={() => onEnter()}>
              Plan my trip
            </button>
          </div>
        </div>
      </header>

      {/* HERO: cobalt shell with the real quick-start on a luggage tag */}
      <section className="hero" id="top">
        <div className="hero-in">
          <div className="hero-copy">
            <h1 className="hero-h1" aria-label="Tell us where. We plan the days. Free AI travel itinerary planner.">
              <span className="sr-only">Free AI travel itinerary planner. </span>
              <span className="hero-mask"><span className="hero-line">Tell us where.</span></span>
              <span className="hero-mask"><span className="hero-line">We plan the days.</span></span>
            </h1>
            <p className="hero-sub">
              Free AI itineraries shaped by your budget and interests. Saved to your account, printable.
            </p>
            <div className="hero-cta">
              <button className="btn btn-sun btn-lg" onClick={() => onEnter()}>
                Plan my trip <ArrowRight size={20} aria-hidden />
              </button>
            </div>
          </div>

          <div className="hero-tag-wrap">
            <div className="hero-string" aria-hidden />
            <form className="hero-tag tag tag-shadow" onSubmit={submit} aria-label="Quick start">
              <div className="ht-top">
                <span className="ht-label">Trip tag</span>
              </div>
              <div className="field">
                <label htmlFor="ht-from">From</label>
                <input
                  id="ht-from"
                  className="input"
                  placeholder="London"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="ht-to">To</label>
                <input
                  id="ht-to"
                  className="input"
                  placeholder="Lisbon, Portugal"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="ht-days">
                  <span>Days</span>
                </label>
                <div className="ht-days">
                  <output
                    className="ht-days-num"
                    htmlFor="ht-days"
                    style={{ fontVariationSettings: `'wght' ${dayWeight}, 'wdth' ${dayWidth}, 'opsz' 96` }}
                  >
                    {days}
                  </output>
                  <input
                    id="ht-days"
                    className="range"
                    type="range"
                    min={1}
                    max={10}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary ht-go">
                Start planning <ArrowRight size={18} aria-hidden />
              </button>
            </form>

            <span className="sticker hero-sticker hs-1">
              <Check size={15} aria-hidden /> Free to use
            </span>
            <span className="sticker tomato hero-sticker hs-2">
              <Printer size={15} aria-hidden /> Print-ready
            </span>
            <span className="sticker mint hero-sticker hs-3">
              <Cloud size={15} aria-hidden /> Saved to your account
            </span>
          </div>
        </div>
      </section>

      {/* STARTERS: three real sample trips, each opens the planner filled in */}
      <section className="starters" aria-labelledby="starters-h">
        <div className="wrap">
          <h2 id="starters-h" className="starters-h reveal">Start from a sample trip</h2>
          <ul className="starters-row">
            {SUGGESTION_TEMPLATES.map((tpl, i) => (
              <li key={tpl.code} className="reveal" style={{ ['--rot' as string]: codeToneRot[i] }}>
                <button className="starter" onClick={() => startFrom(tpl)}>
                  <span className="starter-tag tag tag-shadow">
                    <span className="starter-code">{tpl.code}</span>
                    <span className="starter-title">{tpl.title}</span>
                    <span className="starter-desc">{tpl.desc}</span>
                    <span className="starter-meta">
                      {tpl.from} to {tpl.destination.split(',')[0]}
                      <br />
                      {tpl.days} days, {tpl.budget}, {tpl.travelMode}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW: staggered tags */}
      <section className="how" id="how">
        <div className="wrap">
          <h2 className="sec-h reveal">From blank page to packed days</h2>
          <ol className="steps-row">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`step-tag step-${s.tone}`} style={{ ['--i' as string]: i }}>
                <span className="step-num" aria-hidden>{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SAMPLE: real component preview */}
      <section className="sample" id="sample">
        <div className="wrap sample-grid">
          <div className="sample-intro reveal">
            <h2 className="sec-h">This is what you get</h2>
            <p className="sec-p">
              Every day split into morning, afternoon and evening, with place names, how long each takes and what it costs.
            </p>
            <div className="sample-tabs" role="group" aria-label="Sample days">
              {SAMPLE_DAYS.map((d, i) => (
                <button key={d.label} className="chip" aria-pressed={sampleDay === i} onClick={() => setSampleDay(i)}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="sample-note">Sample plan for Tokyo. Your own plan is generated from your answers.</p>
            <button className="btn btn-primary" onClick={() => onEnter(SUGGESTION_TEMPLATES[1])}>
              Plan my trip <ArrowRight size={18} aria-hidden />
            </button>
          </div>
          <div className="sample-plan reveal" key={sampleDay}>
            <header className="sample-day-head">
              <span className="sticker tomato">{day.label}</span>
              <h3>{day.theme}</h3>
            </header>
            {day.activities.map((a) => (
              <ActivityCard key={a.activityTitle} activity={a} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES: 5 items, 5 cells */}
      <section className="features" id="features">
        <div className="wrap">
          <h2 className="sec-h reveal">Built for how people actually travel</h2>
          <div className="bento">
            {BENTO.map((b) => {
              const Icon = b.icon;
              return (
                <article key={b.cls} className={`bento-cell ${b.cls} reveal`}>
                  <span className="bento-icon"><Icon size={24} aria-hidden /></span>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                  {b.cls === 'b-budget' && (
                    <div className="bento-tiers" aria-hidden>
                      <span className="sticker mint">Budget</span>
                      <span className="sticker">Moderate</span>
                      <span className="sticker pink">Luxury</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="final-in reveal">
          <h2>Your next trip is one tag away.</h2>
          <button className="btn btn-ink btn-lg" onClick={() => onEnter()}>
            Plan my trip <ArrowRight size={20} aria-hidden />
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-in">
          <a className="logo" href="#top">
            <span className="logo-mark" aria-hidden />
            TravelSynth
          </a>
          <nav className="foot-legal" aria-label="Legal">
            <a href="#/terms">Terms</a>
            <a href="#/privacy">Privacy</a>
            <a href="#/cookies">Cookies</a>
          </nav>
          <p className="foot-by">
            Built by{' '}
            <a href="https://ashutoshswamy.in" target="_blank" rel="noopener noreferrer">
              Ashutosh Swamy
            </a>
          </p>
          <div className="foot-social">
            <a href="https://github.com/ashutoshswamy" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/ashutoshswamy" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://x.com/ashutoshswamy_" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://ashutoshswamy.in" target="_blank" rel="noopener noreferrer" aria-label="Portfolio">
              <Globe size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
