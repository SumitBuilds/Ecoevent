import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiAddLine } from 'react-icons/ri';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      setHidden(y > lastY && y > 300);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  const isLanding = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${hidden ? 'navbar--hidden' : ''} ${!isLanding ? 'navbar--solid' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <svg className="navbar__leaf" viewBox="0 0 32 32" width="28" height="28">
            <path d="M16 4C11 4 7 9 7 14c0 4 3 7.5 7 8.5v4.5c0 .6.4 1 1 1s1-.4 1-1v-4.5c4-1 7-4.5 7-8.5 0-5-4-10-7-10zm-2 15.3c-3-.8-5-3.5-5-6.3C9 9 12 6 16 6c.4 0 .7 0 1 .1C13.5 8 11.5 11.5 11.5 15.5c0 1.3.3 2.6.8 3.8H14z" fill="var(--accent)" />
          </svg>
          <span className="navbar__name">SEGREGACY</span>
        </Link>

        <div className="navbar__pill">
          <a href="#how-it-works" className="navbar__link">How It Works</a>
          <a href="#for-organizers" className="navbar__link">For Organizers</a>
          <a href="#for-bmc" className="navbar__link">For BMC</a>
          <a href="#about" className="navbar__link">About</a>
        </div>

        <Link to="/register" className="btn-primary btn-sm navbar__cta">
          <RiAddLine size={16} />
          Register Event
        </Link>
      </div>
    </nav>
  );
}
