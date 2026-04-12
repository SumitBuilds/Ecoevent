import { useState, useEffect } from 'react';
import PageWrapper from '../../components/shared/PageWrapper';
import StatCard from '../../components/shared/StatCard';
import Badge from '../../components/shared/Badge';
import { RiCalendarLine, RiLeafLine, RiDeleteBinLine, RiMedalLine, RiArrowRightSLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventAPI.getAll()
      .then(res => setEvents(res.data.events))
      .catch(err => console.error("Failed to load events", err))
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  // Fallback map: actual score would be tracked in WasteLogs but 0 for now until wired
  const avgScore = 0; 
  const totalBins = events.reduce((sum, e) => {
    const bins = e.estimatedBins ? (e.estimatedBins.wet + e.estimatedBins.dry + e.estimatedBins.recyclable) : 0;
    return sum + bins;
  }, 0);
  const certificates = events.filter(e => e.status === 'completed').length;

  const getActionButton = (event) => {
    if (event.status === 'registered') return { label: 'View Estimate →', path: `/organizer/estimate/${event._id}` }
    if (event.status === 'active') return { label: 'Log Event Day →', path: `/organizer/live-log/${event._id}` }
    if (event.status === 'completed') return { label: 'View Report →', path: `/organizer/report/${event._id}` }
    return { label: 'View Details', path: `/organizer/report/${event._id}` }
  };

  const recentActivity = events.slice(0, 5).map(e => ({
    text: `${e.eventName} — ${e.status}`,
    time: new Date(e.createdAt).toLocaleDateString(),
  }));

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PageWrapper role="organizer">
      <div className="dash">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-2">Good morning, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p className="date">{today}</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/organizer/register')}
            style={{ padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RiCalendarLine size={18} />
            Register New Event
          </button>
        </div>

        <div className="grid-4 dash__stats">
          <StatCard value={totalEvents} label="Events Registered" icon={<RiCalendarLine size={20} />} color="green" />
          <StatCard value={avgScore || '—'} label="Avg Sustainability Score" icon={<RiLeafLine size={20} />} color="green" />
          <StatCard value={totalBins} label="Total Bins Planned" icon={<RiDeleteBinLine size={20} />} color="blue" />
          <StatCard value={certificates} label="Certificates Earned" icon={<RiMedalLine size={20} />} color="amber" />
        </div>

        <div className="dash__body">
          <div className="dash__main">
            <div className="card">
              <h3 className="heading-4" style={{ marginBottom: '20px' }}>Your Events</h3>
              
              {loading ? (
                 <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>Loading events...</div>
              ) : events.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px'
                }}>
                  <p style={{
                    fontFamily: 'Fraunces, serif', fontSize: '22px',
                    fontWeight: 900, color: 'var(--text-1)', marginBottom: '8px'
                  }}>
                    No events yet
                  </p>
                  <p style={{fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px'}}>
                    Register your first event to get your bin plan and notify BMC automatically.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/organizer/register')}
                  >
                    Register Your First Event →
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Type</th>
                      <th>Date & Timings</th>
                      <th>Guests</th>
                      <th>Bins</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(e => {
                      const totalEventBins = e.estimatedBins ? (e.estimatedBins.wet + e.estimatedBins.dry + e.estimatedBins.recyclable) : '—';
                      const action = getActionButton(e);

                      return (
                        <tr 
                          key={e._id} 
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onClick={() => navigate(action.path, { state: { eventId: e._id } })}
                          onMouseOver={(ev) => ev.currentTarget.style.background = 'var(--bg-card)'}
                          onMouseOut={(ev) => ev.currentTarget.style.background = 'transparent'}
                          title="Click to view details"
                        >
                          <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{e.eventName}</td>
                          <td style={{ textTransform: 'capitalize' }}>{e.eventType}</td>
                          <td>
                            {e.date}
                            {e.startTime && e.endTime && (
                              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                                {e.startTime} to {e.endTime}
                              </div>
                            )}
                          </td>
                          <td>{e.guestCount}</td>
                          <td>{totalEventBins}</td>
                          <td>{e.score || '—'}</td>
                          <td>
                            <Badge status={e.status === 'completed' ? 'Completed' : e.status === 'active' ? 'Active' : 'Registered'} />
                            {e.pickupSlot?.status === 'confirmed' ? (
                              <p style={{
                                fontSize: '11px', color: 'var(--accent)',
                                marginTop: '4px', fontWeight: 500
                              }}>
                                🚛 Pickup: {e.pickupSlot.truckId} · {e.pickupSlot.scheduledTime}
                              </p>
                            ) : e.pickupSlot?.status === 'pending' ? (
                              <p style={{
                                fontSize: '11px', color: '#f59e0b',
                                marginTop: '4px', fontWeight: 500
                              }}>
                                ⏳ Awaiting BMC
                              </p>
                            ) : null}
                          </td>
                          <td>
                            <button
                              className="btn-primary"
                              style={{fontSize: '12px', padding: '6px 14px'}}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                navigate(action.path, { state: { eventId: e._id } });
                              }}
                            >
                              {action.label}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="dash__aside">
            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Recent Activity</h4>
              <div className="activity-list">
                {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-item__dot"></div>
                    <div>
                      <div className="activity-item__text">{a.text}</div>
                      <div className="activity-item__time">{a.time}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-3)', fontSize: '14px', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                    No recent activity to show.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
