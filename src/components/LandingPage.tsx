import { useRef } from 'react';
import './LandingPage.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Compass,
  Sun,
  Moon,
  ArrowRight,
  Plane,
  MapPin,
  Sparkles,
  BookMarked,
  ShieldCheck,
  Coins,
  MapPinned,
  Clock,
  Zap,
  Globe,
  Map,
  Navigation,
  Check,
  ChevronDown,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onEnter: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const FEATURES = [
  {
    icon: MapPinned,
    title: 'Custom Local Routing',
    desc: 'Every activity logs local hotspots, walking schedules, and specific coordinates tailored to your profile rather than generic tour traps.',
    color: '#3b82f6',
  },
  {
    icon: Coins,
    title: 'Budget Allocation',
    desc: 'Stays and activities structured directly around your budget class. Hostel rates for backpackers, fine dining lists for luxury travelers.',
    color: '#f97316',
  },
  {
    icon: BookMarked,
    title: 'Passport Binder',
    desc: 'Save unlimited travel plans directly to your browser memory, letting you compare different routing configurations instantly.',
    color: '#8b5cf6',
  },
  {
    icon: ShieldCheck,
    title: 'Cultural Advisor',
    desc: 'Receive practical tips on packing, local transport maps, currency guidelines, and localized safety alerts before you arrive.',
    color: '#0d9488',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    desc: 'AI-powered planning generates your complete, day-by-day travel logbook synthesized in under 30 seconds.',
    color: '#f35e3e',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    desc: 'From hidden coastal towns in Croatia to neon-lit backstreets of Tokyo. Any destination, any travel style.',
    color: '#16a34a',
  },
];

const STATS = [
  { value: '190+', label: 'Countries Covered' },
  { value: '<30s', label: 'Plan Generation Time' },
  { value: '3', label: 'Simple Setup Steps' },
  { value: '100%', label: 'Local Storage. No Signup' },
];

const STEPS = [
  {
    num: '01',
    title: 'Set Coordinates',
    desc: 'Specify your departure origin, target destination, and trip length in our focused boarding-pass workspace.',
    icon: MapPin,
  },
  {
    num: '02',
    title: 'Stamp Preferences',
    desc: 'Pick your transit styles, budget levels, and multi-select interest cards representing your travel profile.',
    icon: Navigation,
  },
  {
    num: '03',
    title: 'Generate Logbook',
    desc: 'Receive a detailed, chronological logbook packed with activities, stay tips, and local cost estimates.',
    icon: Map,
  },
];


export function LandingPage({ onEnter, theme, onToggleTheme }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {

      // ─── HERO SECTION ────────────────────────────────────────────
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl
        .fromTo('.lp-hero-eyebrow',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        )
        .fromTo('.lp-hero-title .lp-word',
          { y: 60, opacity: 0, rotateX: -30 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.07, ease: 'power4.out' },
          '-=0.2'
        )
        .fromTo('.lp-hero-subtitle',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.lp-hero-cta-group',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' },
          '-=0.2'
        )
        .fromTo('.lp-hero-scroll-hint',
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          '-=0.1'
        );

      // ─── HERO TICKET FLOAT IN ─────────────────────────────────────
      heroTl.fromTo('.lp-ticket-visual',
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.8'
      );

      // Continuous ticket float
      gsap.to('.lp-ticket-visual', {
        y: -10,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      // ─── PARALLAX BACKGROUND ELEMENTS ─────────────────────────────
      gsap.to('.lp-parallax-plane', {
        y: -200,
        rotation: -8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      });

      gsap.to('.lp-parallax-compass', {
        y: 160,
        rotation: 45,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      gsap.to('.lp-parallax-globe', {
        y: -120,
        rotation: 20,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });

      gsap.to('.lp-parallax-pin', {
        y: 80,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      // ─── STATS BAR ────────────────────────────────────────────────
      gsap.fromTo('.lp-stat-item',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.lp-stats-bar',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats counter animation
      document.querySelectorAll('.lp-stat-value').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.fromTo(el,
              { scale: 0.7, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
            );
          },
        });
      });

      // ─── HOW IT WORKS ─────────────────────────────────────────────
      gsap.fromTo('.lp-section-head',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.lp-steps-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo('.lp-step-card',
        { y: 50, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.18, duration: 0.65, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.lp-steps-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Connector lines animate in
      gsap.fromTo('.lp-step-connector',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.inOut', stagger: 0.2,
          scrollTrigger: {
            trigger: '.lp-steps-grid',
            start: 'top 75%',
          },
        }
      );

      // ─── FEATURES GRID ───────────────────────────────────────────
      gsap.fromTo('.lp-feature-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.lp-features-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // ─── FINAL CTA ───────────────────────────────────────────────
      gsap.fromTo('.lp-final-cta-inner',
        { y: 50, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.lp-final-cta',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Scroll-driven parallax bg for final CTA
      gsap.to('.lp-final-cta-bg', {
        backgroundPositionY: '30%',
        scrollTrigger: {
          trigger: '.lp-final-cta',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  // Scroll hint bounce
  const scrollHintRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (scrollHintRef.current) {
      gsap.to(scrollHintRef.current, {
        y: 8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      });
    }
  }, { scope: scrollHintRef });

  return (
    <div className="lp-root" ref={containerRef}>

      {/* ─── Parallax Background Elements ─── */}
      <div className="lp-parallax-plane lp-bg-shape" style={{ top: '8%', left: '4%' }}>
        <Plane size={160} strokeWidth={0.4} />
      </div>
      <div className="lp-parallax-compass lp-bg-shape" style={{ top: '42%', right: '3%' }}>
        <Compass size={200} strokeWidth={0.4} />
      </div>
      <div className="lp-parallax-globe lp-bg-shape" style={{ top: '70%', left: '5%' }}>
        <Globe size={140} strokeWidth={0.4} />
      </div>
      <div className="lp-parallax-pin lp-bg-shape" style={{ top: '22%', right: '12%' }}>
        <MapPin size={80} strokeWidth={0.4} />
      </div>

      {/* ─── Header ─── */}
      <header className="lp-header">
        <div className="lp-logo-group">
          <Compass className="lp-logo-icon" />
          <span className="lp-logo-text">TravelSynth</span>
        </div>
        <nav className="lp-nav">
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
          <a href="#features" className="lp-nav-link">Features</a>
        </nav>
        <div className="lp-header-right">
          <button
            className="lp-theme-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="lp-header-cta" onClick={onEnter}>
            Launch App
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        <div className="lp-hero-left">

          <h1 className="lp-hero-title" style={{ perspective: '600px' }}>
            {['Synthesize', 'Your', 'Next', 'Escape.'].map((word) => (
              <span className="lp-word" key={word}>{word}</span>
            ))}
          </h1>

          <p className="lp-hero-subtitle">
            A tactile AI travel coordinator that drafts bespoke, budget-aligned daily itineraries and logbooks. No templated plans. Zero hassle.
          </p>

          <div className="lp-hero-cta-group">
            <button className="lp-primary-cta" onClick={onEnter}>
              <span>Start Planning</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="lp-hero-scroll-hint" ref={scrollHintRef}>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Ticket Visual */}
        <div className="lp-hero-right">
          <div className="lp-ticket-visual">
            <div className="lp-ticket-inner">
              {/* Ticket top bar */}
              <div className="lp-ticket-top">
                <div className="lp-ticket-airline">
                  <Plane size={16} />
                  <span>TRAVELSYNTH AIRWAYS</span>
                </div>
                <div className="lp-ticket-class">FIRST CLASS</div>
              </div>

              {/* Route section */}
              <div className="lp-ticket-route">
                <div className="lp-ticket-city">
                  <div className="lp-city-code">SFO</div>
                  <div className="lp-city-name">San Francisco</div>
                </div>
                <div className="lp-ticket-flight-line">
                  <div className="lp-flight-dashes"></div>
                  <Plane size={20} className="lp-flight-plane-icon" />
                </div>
                <div className="lp-ticket-city lp-city-right">
                  <div className="lp-city-code">TYO</div>
                  <div className="lp-city-name">Tokyo</div>
                </div>
              </div>

              {/* Ticket details grid */}
              <div className="lp-ticket-details">
                <div className="lp-ticket-field">
                  <div className="lp-ticket-field-label">DURATION</div>
                  <div className="lp-ticket-field-val">05 DAYS</div>
                </div>
                <div className="lp-ticket-field">
                  <div className="lp-ticket-field-label">BUDGET TIER</div>
                  <div className="lp-ticket-field-val">LUXURY</div>
                </div>
                <div className="lp-ticket-field">
                  <div className="lp-ticket-field-label">TRANSIT</div>
                  <div className="lp-ticket-field-val">FLIGHT</div>
                </div>
                <div className="lp-ticket-field">
                  <div className="lp-ticket-field-label">STATUS</div>
                  <div className="lp-ticket-field-val lp-status-active">ACTIVE</div>
                </div>
              </div>

              {/* Perforation */}
              <div className="lp-ticket-perf">
                <div className="lp-perf-circle lp-perf-left"></div>
                <div className="lp-perf-line"></div>
                <div className="lp-perf-circle lp-perf-right"></div>
              </div>

              {/* Barcode strip */}
              <div className="lp-ticket-barcode-strip">
                <div className="lp-barcode"></div>
                <div className="lp-barcode-text">AI-GEN-2024-TSX-0001</div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="lp-float-badge lp-badge-1">
              <Check size={12} />
              <span>AI Generated</span>
            </div>
            <div className="lp-float-badge lp-badge-2">
              <Sparkles size={12} />
              <span>Personalized</span>
            </div>
            <div className="lp-float-badge lp-badge-3">
              <Clock size={12} />
              <span>Ready in 30s</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="lp-stats-bar">
        {STATS.map((stat) => (
          <div key={stat.label} className="lp-stat-item">
            <div className="lp-stat-value">{stat.value}</div>
            <div className="lp-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="lp-steps-section" id="how-it-works">
        <div className="lp-section-head">
          <div className="lp-section-eyebrow">
            <span>Simple Process</span>
          </div>
          <h2 className="lp-section-title">Plan Chronology</h2>
          <p className="lp-section-subtitle">
            Three focused logs stamp your complete travel logbook. No accounts needed, no friction.
          </p>
        </div>

        <div className="lp-steps-grid">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="lp-step-card">
                {i < STEPS.length - 1 && (
                  <div className="lp-step-connector" style={{ transformOrigin: 'left center' }}></div>
                )}
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-icon-wrap">
                  <Icon size={24} />
                </div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="lp-features-section" id="features">
        <div className="lp-section-head">
          <div className="lp-section-eyebrow">
            <span>Capabilities</span>
          </div>
          <h2 className="lp-section-title">Bespoke Curation</h2>
          <p className="lp-section-subtitle">
            Engineered to bypass templated vacation standards. Every plan is architected for you.
          </p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ color: feat.color, background: `${feat.color}14`, border: `1px solid ${feat.color}30` }}>
                  <Icon size={22} />
                </div>
                <h3 className="lp-feature-title">{feat.title}</h3>
                <p className="lp-feature-desc">{feat.desc}</p>
                <div className="lp-feature-accent" style={{ background: feat.color }}></div>
              </div>
            );
          })}
        </div>
      </section>



      {/* ─── FINAL CTA ─── */}
      <section className="lp-final-cta">
        <div className="lp-final-cta-bg"></div>
        <div className="lp-final-cta-inner">
          <div className="lp-final-cta-icon">
            <Compass size={40} />
          </div>
          <h2 className="lp-final-cta-title">Ready to Stamp Your Ticket?</h2>
          <p className="lp-final-cta-subtitle">
            Begin planning your bespoke travel logs immediately. Fully saved in local memory. No account required.
          </p>
          <div className="lp-final-cta-actions">
            <button className="lp-primary-cta" onClick={onEnter}>
              <span>Begin Journey</span>
              <ArrowRight size={16} />
            </button>
            <div className="lp-cta-features">
              {['No signup', 'Free to use', 'Instant generation'].map((f) => (
                <div key={f} className="lp-cta-feature-item">
                  <Check size={12} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Compass size={18} className="lp-logo-icon" />
            <span className="lp-logo-text">TravelSynth</span>
          </div>

          <div className="lp-footer-dev">
            <span className="lp-footer-copy">Built by</span>
            <a
              href="https://ashutoshswamy.in"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-footer-dev-link"
            >
              Ashutosh Swamy
            </a>
          </div>

          <div className="lp-footer-socials">
            <a href="https://github.com/ashutoshswamy" target="_blank" rel="noopener noreferrer" className="lp-social-link" title="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/in/ashutoshswamy" target="_blank" rel="noopener noreferrer" className="lp-social-link" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://x.com/ashutoshswamy_" target="_blank" rel="noopener noreferrer" className="lp-social-link" title="X (Twitter)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://ashutoshswamy.in" target="_blank" rel="noopener noreferrer" className="lp-social-link" title="Portfolio">
              <Globe size={16} />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
