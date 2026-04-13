import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine, RiCalendarCheckLine, RiListCheck2,
  RiLeafLine, RiFileChartLine, RiMedalLine,
  RiCalendarEventLine, RiTruckLine, RiShieldCheckLine,
  RiBarChartLine, RiSettings3Line, RiLogoutBoxLine,
  RiAlertLine, RiWhatsappLine, RiUserLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const organizerLinks = [
  { to: '/organizer/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/organizer/register', icon: RiCalendarCheckLine, label: 'Register Event' },
  { to: '/organizer/events', icon: RiListCheck2, label: 'My Events' },
  { to: '/organizer/live-logs', icon: RiLeafLine, label: 'Live Log' },
  { to: '/organizer/reports', icon: RiFileChartLine, label: 'Reports' },
  { to: '/organizer/certificates', icon: RiMedalLine, label: 'Certificates' },
  { to: '/organizer/profile', icon: RiUserLine, label: 'My Profile' },
];

const bmcLinks = [
  { to: '/bmc/overview', icon: RiDashboardLine, label: 'Overview' },
  { to: '/bmc/events', icon: RiCalendarEventLine, label: 'Upcoming Events' },
  { to: '/bmc/scheduler', icon: RiTruckLine, label: 'Pickup Scheduler' },
  { to: '/bmc/audit', icon: RiShieldCheckLine, label: 'Audit Log' },
  { to: '/bmc/analytics', icon: RiBarChartLine, label: 'Analytics' },
  { to: '/bmc/weekly-plan', icon: RiCalendarCheckLine, label: 'Weekly Plan' },
  { to: '/bmc/settings', icon: RiSettings3Line, label: 'Ward Settings' },
];

export default function Sidebar({ role = 'organizer' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const links = role === 'bmc' ? bmcLinks : organizerLinks;
  const userName = user?.name || (role === 'bmc' ? 'BMC Officer' : 'Event Organizer');
  const userRole = role === 'bmc' ? 'BMC Ward Officer' : 'Event Organizer';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <Link to="/" className="sidebar__logo" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 32 32" width="24" height="24">
            <path d="M16 4C11 4 7 9 7 14c0 4 3 7.5 7 8.5v4.5c0 .6.4 1 1 1s1-.4 1-1v-4.5c4-1 7-4.5 7-8.5 0-5-4-10-7-10zm-2 15.3c-3-.8-5-3.5-5-6.3C9 9 12 6 16 6c.4 0 .7 0 1 .1C13.5 8 11.5 11.5 11.5 15.5c0 1.3.3 2.6.8 3.8H14z" fill="var(--accent)" />
          </svg>
          <span className="sidebar__brand">SEGREGACY</span>
        </Link>
      </div>

      <nav className="sidebar__nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{userName}</div>
            <div className="sidebar__user-role">{userRole}</div>
          </div>
        </div>
        <button className="sidebar__signout" onClick={handleLogout}>
          <RiLogoutBoxLine size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
