import { ArrowLeft } from 'lucide-react';
import { LEGAL_VERSION } from '../constants';
import './Overlays.css';

export type LegalKind = 'terms' | 'privacy' | 'cookies';

interface Section {
  h: string;
  p: string[];
}

const DOCS: Record<LegalKind, { title: string; intro: string; sections: Section[] }> = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms govern your use of TravelSynth. By creating an account you agree to them.',
    sections: [
      {
        h: 'Who can use TravelSynth',
        p: ['You must be at least 18 years old to create an account. By signing up you confirm that you are.'],
      },
      {
        h: 'What the service does',
        p: [
          'TravelSynth generates travel itineraries with Google Gemini, based on the preferences you enter. Plans are suggestions only. Prices, opening hours, availability and safety conditions can change, so check them before you travel.',
        ],
      },
      {
        h: 'Your account',
        p: [
          'Keep your sign-in details private. You are responsible for activity on your account. You can delete your saved trips at any time from the Saved tab.',
        ],
      },
      {
        h: 'Acceptable use',
        p: [
          'Do not misuse the service, attempt to break or overload it, or enter unlawful or harmful content. We may suspend accounts that do.',
        ],
      },
      {
        h: 'No warranty',
        p: [
          'TravelSynth is provided as is. We do not guarantee that itineraries are accurate, complete or suitable for you, and we are not liable for losses arising from trips planned with it, to the extent the law allows.',
        ],
      },
      {
        h: 'Changes and contact',
        p: [
          'We may update these terms. Material changes are reflected by a new version date below. Questions can be sent through the contact links at ashutoshswamy.in.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This explains what TravelSynth collects, why, and the choices you have.',
    sections: [
      {
        h: 'What we collect',
        p: [
          'Account data: your email address, display name and sign-in method (Google or email and password). Passwords are handled by Firebase Authentication and are never visible to us.',
          'Consent record: that you confirmed you are 18 or older and accepted these policies, with the policy version and time.',
          'Your trips: the preferences you enter and the itineraries generated, saved to your account.',
        ],
      },
      {
        h: 'How we use it',
        p: [
          'To sign you in, generate and store your itineraries, and keep the service secure. We do not sell your data and do not use it for advertising.',
        ],
      },
      {
        h: 'Who processes it',
        p: [
          'Google Firebase (Authentication and Firestore) stores account and trip data. Google Gemini receives the trip preferences you submit in order to write an itinerary. Both are subject to their own privacy terms.',
        ],
      },
      {
        h: 'Your choices',
        p: [
          'You can delete individual saved trips in the app. To have your account and data removed, contact us through ashutoshswamy.in and we will delete it. Depending on where you live you may also have rights to access, correct or export your data.',
        ],
      },
      {
        h: 'Retention and security',
        p: [
          'Data is kept while your account exists. Access is limited by security rules so that each account can only read its own data.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'TravelSynth keeps cookies and similar browser storage to the minimum needed to work.',
    sections: [
      {
        h: 'What we store',
        p: [
          'Sign-in session: Firebase Authentication stores a token in your browser (IndexedDB or local storage) so you stay signed in.',
          'Theme: your light or dark choice, so it is remembered next visit.',
          'Cookie notice: a note that you have seen the cookie banner, so we do not show it again.',
        ],
      },
      {
        h: 'Google sign-in',
        p: [
          'If you choose Continue with Google, Google may set its own cookies in the pop-up window to complete sign-in. These are controlled by Google.',
        ],
      },
      {
        h: 'What we do not use',
        p: ['No advertising cookies, no analytics or tracking cookies, and no cross-site profiling.'],
      },
      {
        h: 'Managing storage',
        p: [
          'You can clear cookies and site data in your browser settings at any time. Doing so signs you out and resets your theme.',
        ],
      },
    ],
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const doc = DOCS[kind];
  return (
    <main className="legal">
      <a className="legal-back no-print" href="#" onClick={() => { window.location.hash = ''; }}>
        <ArrowLeft size={18} aria-hidden /> Back to TravelSynth
      </a>
      <h1>{doc.title}</h1>
      <p className="legal-intro">{doc.intro}</p>
      {doc.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </section>
      ))}
      <p className="legal-version">Version {LEGAL_VERSION}</p>
      <nav className="legal-nav" aria-label="Legal documents">
        <a href="#/terms">Terms of Service</a>
        <a href="#/privacy">Privacy Policy</a>
        <a href="#/cookies">Cookie Policy</a>
      </nav>
    </main>
  );
}
