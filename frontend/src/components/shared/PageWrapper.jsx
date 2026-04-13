import { useState } from 'react';
import Sidebar from './Sidebar';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import './PageWrapper.css';

export default function PageWrapper({ children, role = 'organizer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-wrapper">
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 32 32" width="20" height="20">
            <path d="M16 4C11 4 7 9 7 14c0 4 3 7.5 7 8.5v4.5c0 .6.4 1 1 1s1-.4 1-1v-4.5c4-1 7-4.5 7-8.5 0-5-4-10-7-10zm-2 15.3c-3-.8-5-3.5-5-6.3C9 9 12 6 16 6c.4 0 .7 0 1 .1C13.5 8 11.5 11.5 11.5 15.5c0 1.3.3 2.6.8 3.8H14z" fill="var(--accent)" />
          </svg>
          SEGREGACY
        </div>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </button>
      </div>

      <Sidebar role={role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="page-content">
        {children}
      </main>
    </div>
  );
}
