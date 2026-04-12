import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiLeafLine, RiArrowRightLine, RiTeamLine,
  RiGovernmentLine, RiCheckboxCircleLine,
  RiDonutChartLine, RiFileList3Line, RiCheckLine
} from 'react-icons/ri';
import Navbar from '../../components/shared/Navbar';
import Button from '../../components/shared/Button';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') navigate('/organizer/dashboard');
      else navigate('/bmc/overview');
    }
  }, [user]);


  return (
    <div className="landing">
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="hero">
        <div className="hero__grain"></div>
        <div className="hero__vignette"></div>

        {/* Ambient Lighting Orbs */}
        <div className="hero__ambient hero__ambient--1"></div>
        <div className="hero__ambient hero__ambient--2"></div>
        <div className="hero__ambient hero__ambient--3"></div>

        <div className="hero__content">
          <div className="hero__left">
            <div className="badge-pill">
              <span>✦</span> Track • Segregate • Reduce Waste
            </div>

            <h1 className="hero__headline">
              <span className="hero__line">Where Events Meet</span>
              <span className="hero__line hero__accent">Accountability</span>
            </h1>

            <p className="hero__sub">
              Mumbai&apos;s first smart event waste platform — connecting organizers, vendors, and BMC for responsible celebrations.
            </p>

            <div className="hero__actions">
              <Link to="/register" className="btn-primary">
                <RiTeamLine size={18} />
                Register Your Event
              </Link>
              <Link to="/login" className="btn-ghost">
                <RiGovernmentLine size={16} />
                Sign In
              </Link>
            </div>
          </div>

          <div className="hero__right">
            {/* Earth Container */}
            <div className="city-data-visual">
              <div className="city-data__bg"></div>
              <div className="city-data__overlay"></div>

              <svg className="city-data__network" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                {/* Network Lines */}
                <line x1="80" y1="120" x2="220" y2="90" />
                <line x1="220" y1="90" x2="310" y2="190" />
                <line x1="310" y1="190" x2="150" y2="280" />
                <line x1="150" y1="280" x2="80" y2="120" />
                <line x1="220" y1="90" x2="280" y2="300" />
                <line x1="150" y1="280" x2="200" y2="350" />
                <line x1="80" y1="120" x2="50" y2="220" />
                <line x1="50" y1="220" x2="150" y2="280" className="line-fast" />
                <line x1="310" y1="190" x2="280" y2="300" />

                {/* Nodes */}
                <circle cx="80" cy="120" r="4" className="node" />
                <circle cx="220" cy="90" r="6" className="node node--active" />
                <circle cx="310" cy="190" r="4" className="node" />
                <circle cx="150" cy="280" r="7" className="node node--active" style={{ animationDelay: '1s' }} />
                <circle cx="280" cy="300" r="3" className="node" />
                <circle cx="200" cy="350" r="4" className="node" />
                <circle cx="50" cy="220" r="3" className="node" />
              </svg>

              {/* HTML Pulses for main nodes corresponding to SVG coords */}
              <div className="pulse" style={{ top: '22.5%', left: '55%' }}></div>
              <div className="pulse pulse--delayed" style={{ top: '70%', left: '37.5%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS STRIP ═══════ */}
      <section className="stats-strip">
        <div className="stats-strip__inner">
          <div className="stat-block">
            <div className="stat-block__number">75–80%</div>
            <div className="stat-block__text">of event organizers cannot estimate their waste<br /><span className="text-faded">(field research: Chembur, Thane)</span></div>
          </div>
          <div className="stat-block__divider"></div>
          <div className="stat-block">
            <div className="stat-block__number">0</div>
            <div className="stat-block__text">platforms currently bridge private events<br />with BMC advance notice in Mumbai</div>
          </div>
          <div className="stat-block__divider"></div>
          <div className="stat-block">
            <div className="stat-block__number">SDG 12</div>
            <div className="stat-block__text">Aligned — Responsible Consumption<br />& Production</div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="eyebrow">Process</div>
          <h2 className="heading-1" style={{ marginBottom: '64px' }}>How It Works</h2>

          <div className="steps-grid">
            {[
              {
                num: '01',
                title: 'Register your event',
                desc: 'Enter guest count, catering style, décor type. We build your waste profile in seconds.'
              },
              {
                num: '02',
                title: 'Get your bin plan',
                desc: 'Exact bins needed — wet, dry, recyclable. Vendor checklist sent. BMC notified automatically.'
              },
              {
                num: '03',
                title: 'Log on event day',
                desc: 'Tap bin fill levels on your phone. Get a sustainability score + downloadable green certificate.'
              }
            ].map((step) => (
              <div className="step-card" key={step.num}>
                <div className="step-card__num">{step.num}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TWO PORTALS ═══════ */}
      <section className="portals" id="for-organizers">
        <div className="section-container">
          <div className="portals__grid">
            <div className="portal-card portal-card--organizer" id="for-organizers">
              <div className="eyebrow">FOR ORGANIZER</div>
              <h3 className="heading-3">Smart Waste Planning<br />for Every Event</h3>
              <ul className="portal-card__list">
                <li><RiCheckLine size={16} /> Instant bin count recommendations</li>
                <li><RiCheckLine size={16} /> Auto-notify BMC before your event</li>
                <li><RiCheckLine size={16} /> Vendor segregation checklists</li>
                <li><RiCheckLine size={16} /> Live event-day waste logging</li>
                <li><RiCheckLine size={16} /> Sustainability score & certificate</li>
              </ul>
              <Link to="/login" className="btn-primary btn-sm" style={{ marginTop: '20px' }}>
                Organizer Dashboard <RiArrowRightLine size={14} />
              </Link>
            </div>

            <div className="portal-card portal-card--bmc" id="for-bmc">
              <div className="eyebrow">FOR BMC OFFICERS</div>
              <h3 className="heading-3">City-Wide Event<br />Waste Intelligence</h3>
              <ul className="portal-card__list">
                <li><RiCheckLine size={16} /> Advance notice of all events</li>
                <li><RiCheckLine size={16} /> Bin requirements per ward zone</li>
                <li><RiCheckLine size={16} /> Pickup truck scheduling</li>
                <li><RiCheckLine size={16} /> Segregation compliance audit</li>
                <li><RiCheckLine size={16} /> City-wide analytics dashboard</li>
              </ul>
              <Link to="/login" className="btn-ghost btn-sm" style={{ marginTop: '20px' }}>
                BMC Portal <RiArrowRightLine size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CERTIFICATE PREVIEW ═══════ */}
      <section className="cert-preview">
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="eyebrow">Recognition</div>
            <h2 className="heading-1">Every responsible event<br />earns one of these.</h2>
          </div>
          <div className="cert-preview__card">
            <div className="cert-mock">
              <div className="cert-mock__header">
                <svg viewBox="0 0 32 32" width="32" height="32">
                  <path d="M16 4C11 4 7 9 7 14c0 4 3 7.5 7 8.5v4.5c0 .6.4 1 1 1s1-.4 1-1v-4.5c4-1 7-4.5 7-8.5 0-5-4-10-7-10z" fill="var(--accent)" />
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--accent)' }}>SEGREGACY</span>
              </div>
              <div className="cert-mock__title">Certificate of Sustainable Event Management</div>
              <div className="cert-mock__line"></div>
              <div className="cert-mock__text">This certifies that</div>
              <div className="cert-mock__name">A. Organizer</div>
              <div className="cert-mock__text">responsibly managed waste at</div>
              <div className="cert-mock__event">Grand Reception · March 20, 2026</div>
              <div className="cert-mock__score">78</div>
              <div className="cert-mock__score-label">Sustainability Score</div>
              <div className="cert-mock__sdg">
                <div className="cert-mock__sdg-badge">SDG 12</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BUILT ON RESEARCH ═══════ */}
      <section className="research" id="about">
        <div className="section-container">
          <div className="research__inner">
            <div className="eyebrow">Field-Tested</div>
            <h2 className="heading-2">Built on Research,<br />Not Assumptions</h2>
            <p className="research__text">
              Field-tested across 6–10 venues in Chembur and Thane. Every formula, every bin recommendation is grounded in real conversations with organizers, caterers, and BMC ward officers.
            </p>
            <blockquote className="research__quote">
              <span className="research__quote-mark">&quot;</span>
              75–80% of organizers surveyed could not estimate the waste their event would generate.
              <span className="research__quote-mark">&quot;</span>
            </blockquote>
            <div className="research__source">— Primary field research, 2025</div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 32 32" width="24" height="24">
                <path d="M16 4C11 4 7 9 7 14c0 4 3 7.5 7 8.5v4.5c0 .6.4 1 1 1s1-.4 1-1v-4.5c4-1 7-4.5 7-8.5 0-5-4-10-7-10z" fill="var(--accent)" />
              </svg>
              <span>SEGREGACY</span>
            </Link>
            <p className="footer__tagline">Smart event waste management for Mumbai.</p>
            <div className="badge-pill" style={{ marginTop: '12px', fontSize: '10px' }}>
              <RiLeafLine size={12} /> SDG 12 ALIGNED
            </div>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Platform</div>
            <Link to="/register">Register Event</Link>
            <Link to="/login">BMC Portal</Link>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Resources</div>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Support</a>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Legal</div>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__status">
            <span className="footer__status-dot"></span>
            <span className="footer__status-text">System Operational</span>
          </div>
          <div className="footer__copy">© 2026 SEGREGACY. Built for Mumbai.</div>
        </div>
      </footer>
    </div>
  );
}
