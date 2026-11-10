import { useState } from 'react';
import { Cookie } from 'lucide-react';
import './Overlays.css';

const KEY = 'cookie_notice_ack';

const alreadyAcknowledged = () => {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
};

export function CookieBanner() {
  const [show, setShow] = useState(() => !alreadyAcknowledged());
  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* storage blocked: banner simply returns next visit */
    }
    setShow(false);
  };

  return (
    <aside className="cookie no-print" role="dialog" aria-modal="false" aria-labelledby="cookie-h">
      <span className="cookie-ico" aria-hidden><Cookie size={22} /></span>
      <div className="cookie-text">
        <h2 id="cookie-h">We keep cookies minimal</h2>
        <p>
          TravelSynth uses only essential cookies and browser storage: to keep you signed in and remember your theme. No ads, no tracking.{' '}
          <a href="#/cookies">Read the Cookie Policy</a>
        </p>
      </div>
      <button className="btn btn-sun cookie-btn" onClick={accept}>Got it</button>
    </aside>
  );
}
