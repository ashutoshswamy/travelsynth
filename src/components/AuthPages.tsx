import { useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, ShieldCheck, MailCheck } from 'lucide-react';
import { authErrorMessage, useAuth } from '../auth';
import { SUGGESTION_TEMPLATES } from '../constants';
import { ThemeMenu, type ThemePref } from './ThemeMenu';
import './AuthPages.css';

export type AuthKind = 'signin' | 'signup' | 'forgot' | 'consent';
export const AUTH_ROUTES: AuthKind[] = ['signin', 'signup', 'forgot', 'consent'];

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const COPY: Record<AuthKind, { title: string; lead: string; aside: string }> = {
  signup: {
    title: 'Create your account',
    lead: 'Free to use. Your trips are saved to your account and follow you across devices.',
    aside: 'Save every trip you plan.',
  },
  signin: {
    title: 'Welcome back',
    lead: 'Sign in to open your saved trips and plan a new one.',
    aside: 'Pick up where you left off.',
  },
  forgot: {
    title: 'Reset your password',
    lead: 'Enter your email and we will send you a link to choose a new password.',
    aside: 'Back on the road in a minute.',
  },
  consent: {
    title: 'One last step',
    lead: 'Your Google account is ready. Confirm the two points below to finish creating your TravelSynth account.',
    aside: 'Almost packed.',
  },
};

interface AuthPageProps {
  kind: AuthKind;
  themePref: ThemePref;
  onThemeChange: (v: ThemePref) => void;
}

export function AuthPage({ kind, themePref, onThemeChange }: AuthPageProps) {
  const { configured, signUpEmail, signInEmail, signInGoogle, completeConsent, cancelConsent, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const copy = COPY[kind];
  const consentOk = adult && terms;
  const consentError = 'Please confirm you are 18 or older and accept the Terms and Privacy Policy.';

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // On success the app sees the signed-in user and routes into the planner.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kind === 'signup' && !consentOk) return setError(consentError);
    void run(async () => {
      if (kind === 'signup') await signUpEmail(name.trim(), email.trim(), password);
      else if (kind === 'signin') await signInEmail(email.trim(), password);
      else if (kind === 'forgot') {
        await resetPassword(email.trim());
        setSent(true);
      }
    });
  };

  const google = () => {
    if (kind === 'signup' && !consentOk) return setError(consentError);
    void run(async () => {
      await signInGoogle(kind === 'signup' && consentOk);
    });
  };

  const confirm = () => {
    if (!consentOk) return setError(consentError);
    void run(completeConsent);
  };

  const decline = () => void run(cancelConsent);

  const consentFields = (
    <fieldset className="consent">
      <legend className="sr-only">Age and terms</legend>
      <label className="check">
        <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        <span>I am 18 years old or older.</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
        <span>
          I agree to the{' '}
          <a href="#/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
          <a href="#/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </span>
      </label>
    </fieldset>
  );

  const emailField = (
    <div className="field">
      <label htmlFor="ap-email">Email</label>
      <input id="ap-email" type="email" className="input" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  );

  return (
    <div className="ap">
      {/* Left: the shell, with the tags this account will hold */}
      <aside className="ap-aside">
        <a className="logo ap-logo" href="#" onClick={() => { window.location.hash = ''; }}>
          <span className="logo-mark" aria-hidden />
          TravelSynth
        </a>

        <div className="ap-aside-body">
          <h2 className="ap-aside-h">{copy.aside}</h2>
          <ul className="ap-perks">
            <li><Check size={18} aria-hidden /> Free to use</li>
            <li><Check size={18} aria-hidden /> Trips saved across devices</li>
            <li><Check size={18} aria-hidden /> Print or save as PDF</li>
          </ul>
        </div>

        <div className="ap-stack" aria-hidden>
          {SUGGESTION_TEMPLATES.map((t, i) => (
            <div key={t.code} className={`ap-mini tag tag-shadow ap-mini-${i}`}>
              <span className="ap-mini-code">{t.code}</span>
              <span className="ap-mini-title">{t.title}</span>
              <span className="ap-mini-meta">{t.days} days, {t.budget}</span>
            </div>
          ))}
          <span className="sticker ap-sticker">Sample trips</span>
        </div>
      </aside>

      {/* Right: the form on paper */}
      <main className="ap-main">
        <div className="ap-bar">
          <a className="ap-back" href="#" onClick={() => { window.location.hash = ''; }}>
            <ArrowLeft size={18} aria-hidden /> Home
          </a>
          <ThemeMenu value={themePref} onChange={onThemeChange} tone="paper" />
        </div>

        <div className="ap-card rise" key={kind}>
          {kind === 'consent' && (
            <span className="sticker mint ap-badge"><ShieldCheck size={15} aria-hidden /> Google account ready</span>
          )}
          <h1 className="ap-h">{copy.title}</h1>
          <p className="ap-lead">{copy.lead}</p>

          {!configured && (
            <p className="form-error" role="alert">
              Sign-in is not set up yet. Add the Firebase keys to .env.local and restart the dev server.
            </p>
          )}

          {kind === 'consent' && (
            <>
              {consentFields}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="btn btn-primary btn-lg ap-submit" onClick={confirm} disabled={busy}>Create my account</button>
              <button className="btn btn-ghost ap-secondary" onClick={decline} disabled={busy}>No thanks, remove it</button>
            </>
          )}

          {kind === 'forgot' && (
            sent ? (
              <div className="form-ok ap-sent" role="status">
                <MailCheck size={22} aria-hidden />
                <span>If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.</span>
              </div>
            ) : (
              <form className="ap-form" onSubmit={submit}>
                {emailField}
                {error && <p className="form-error" role="alert">{error}</p>}
                <button type="submit" className="btn btn-primary btn-lg ap-submit" disabled={busy}>
                  {busy ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )
          )}

          {(kind === 'signin' || kind === 'signup') && (
            <>
              {kind === 'signup' && consentFields}

              <button type="button" className="btn google-btn" onClick={google} disabled={busy}>
                <GoogleG /> Continue with Google
              </button>

              <div className="or" aria-hidden><span>or use email</span></div>

              <form className="ap-form" onSubmit={submit}>
                {kind === 'signup' && (
                  <div className="field">
                    <label htmlFor="ap-name">Name</label>
                    <input id="ap-name" className="input" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                {emailField}
                <div className="field">
                  <label htmlFor="ap-pass">
                    <span>Password</span>
                    {kind === 'signin' && <a className="link" href="#/forgot">Forgot password?</a>}
                  </label>
                  <div className="pw">
                    <input
                      id="ap-pass"
                      type={showPw ? 'text' : 'password'}
                      className="input"
                      autoComplete={kind === 'signup' ? 'new-password' : 'current-password'}
                      minLength={kind === 'signup' ? 8 : undefined}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw} aria-label={showPw ? 'Hide password' : 'Show password'}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {kind === 'signup' && <small className="hint">At least 8 characters.</small>}
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary btn-lg ap-submit" disabled={busy}>
                  {busy ? 'One moment...' : kind === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              </form>
            </>
          )}

          <p className="ap-switch">
            {kind === 'signup' && <>Already have an account? <a className="link" href="#/signin">Sign in</a></>}
            {kind === 'signin' && <>New to TravelSynth? <a className="link" href="#/signup">Create an account</a></>}
            {kind === 'forgot' && <>Remembered it? <a className="link" href="#/signin">Back to sign in</a></>}
          </p>
        </div>
      </main>
    </div>
  );
}
