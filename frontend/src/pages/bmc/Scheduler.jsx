import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageWrapper from '../../components/shared/PageWrapper';
import { RiTruckLine, RiCheckLine, RiLoader4Line } from 'react-icons/ri';
import { bmcAPI } from '../../services/api';
import './Scheduler.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Scheduler() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [truck, setTruck] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [pickupTime, setPickupTime] = useState('06:00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    bmcAPI.getEvents()
      .then(res => {
        setEvents(res.data.events);
        if (res.data.events.length > 0) {
          if (location.state?.eventId) {
            setSelectedEventId(location.state.eventId);
          } else {
            const firstPending = res.data.events.find(e => e.pickupSlot?.status === 'pending');
            if (firstPending) setSelectedEventId(firstPending._id);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [location.state]);

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1] || '';
  };

  const pendingEvents = events.filter(e => e.pickupSlot?.status === 'pending');
  const confirmedEvents = events.filter(e => e.pickupSlot?.status === 'confirmed' || e.pickupSlot?.status === 'completed');

  const calendarEvents = pendingEvents.map((e, i) => ({
    name: e.eventName || 'Event',
    day: getDayOfWeek(e.date),
    color: ['var(--accent)', 'var(--blue)', 'var(--amber)', '#e879f9', '#f97316'][i % 5],
    id: e._id,
    event: e,
  }));

  const handleConfirm = () => {
    const sel = events.find(e => e._id === selectedEventId);
    if (sel && sel.pickupSlot?._id && truck) {
      setSubmitting(true);
      bmcAPI.confirmSlot(sel.pickupSlot._id, { truckId: truck, scheduledTime: pickupTime })
        .then(() => {
          alert(`Pickup confirmed for ${sel.eventName}! Planner will be notified.`);
          fetchEvents(); // Refresh state
        })
        .catch(err => {
          console.error(err);
          alert('Failed to confirm pickup.');
        })
        .finally(() => setSubmitting(false));
    } else {
      alert("Please select a truck to secure this slot.");
    }
  };

  const sel = events.find(e => e._id === selectedEventId);

  return (
    <PageWrapper role="bmc">
      <div className="scheduler">
        <div className="page-header">
          <h1 className="heading-2">Pickup Scheduler</h1>
          <p className="date">BMC Waste Collection Management</p>
        </div>

        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{ 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'upcoming' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'upcoming' ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Pending Assignments
          </button>
          <button 
            onClick={() => setActiveTab('confirmed')}
            style={{ 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'confirmed' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'confirmed' ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Confirmed Pickups
          </button>
        </div>

        {activeTab === 'upcoming' ? (
        <div className="scheduler__grid">
          {/* Calendar */}
          <div className="card scheduler__calendar">
            <h4 className="heading-4" style={{ marginBottom: '20px' }}>Pending Weekly Assignments</h4>
            {loading ? <div style={{ color: 'var(--text-3)' }}>Loading calendar...</div> : (
            <div className="cal-grid">
              {weekDays.map(day => (
                <div className="cal-day" key={day}>
                  <div className="cal-day__label">{day}</div>
                  <div className="cal-day__slots">
                    {calendarEvents.filter(e => e.day === day).map((e, i) => (
                      <div
                        className={`cal-event ${selectedEventId === e.id ? 'active' : ''}`}
                        key={i}
                        style={{
                          background: selectedEventId === e.id ? e.color : e.color + '20',
                          borderLeft: selectedEventId === e.id ? 'none' : `3px solid ${e.color}`,
                          color: selectedEventId === e.id ? '#000' : e.color,
                          cursor: 'pointer',
                          fontWeight: selectedEventId === e.id ? 700 : 500,
                        }}
                        onClick={() => setSelectedEventId(e.id)}
                      >
                        {e.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="scheduler__detail">
            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '20px' }}>Assignment Control</h4>
              {sel ? (
                <>
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">Event</span><span style={{fontWeight: 600, color: 'var(--text-1)'}}>{sel.eventName}</span></div>
                    <div className="detail-item"><span className="detail-label">Address</span><span>{sel.location}</span></div>
                    <div className="detail-item"><span className="detail-label">Ward</span><span style={{ textTransform: 'capitalize' }}>{sel.wardZone}</span></div>
                    <div className="detail-item"><span className="detail-label">Est. Waste</span><span>{Math.round((sel.estimatedBins?.wet*45||0) + (sel.estimatedBins?.dry*22||0) + (sel.estimatedBins?.recyclable*15||0))} kg</span></div>
                    <div className="detail-item"><span className="detail-label">Wet Bins</span><span>{sel.estimatedBins?.wet || 0}</span></div>
                    <div className="detail-item"><span className="detail-label">Dry Bins</span><span>{sel.estimatedBins?.dry || 0}</span></div>
                    <div className="detail-item"><span className="detail-label">Recyclable</span><span>{sel.estimatedBins?.recyclable || 0} Bins</span></div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="form-group">
                      <label>Assign Municipal Truck</label>
                      <select value={truck} onChange={(e) => setTruck(e.target.value)}>
                        <option value="">Select an available truck...</option>
                        <option value="MH-01-AB-1234">MH-01-AB-1234 — 10T Compactor</option>
                        <option value="MH-01-CD-5678">MH-01-CD-5678 — 6T Open</option>
                        <option value="MH-01-EF-9012">MH-01-EF-9012 — 8T Covered</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label>Arrival Time Slot</label>
                      <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                    </div>
                  </div>

                  <button className="btn-primary btn-full" style={{ marginTop: '24px' }} onClick={handleConfirm} disabled={submitting}>
                     {submitting ? 'Confirming...' : <RiCheckLine size={16} />}
                     {!submitting && 'Confirm Pickup Assignment'}
                  </button>
                  <div className="scheduler__confirm-note">
                    <RiTruckLine size={14} />
                    Organizer will be notified automatically ✓
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '24px 0' }}>
                  Select a pending event from the calendar to assign a truck.
                </p>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="card" style={{ maxWidth: '1000px' }}>
            {loading ? <div style={{ color: 'var(--text-3)', padding: '24px' }}>Loading confirmed events...</div> :
             confirmedEvents.length === 0 ? <div style={{ color: 'var(--text-3)', padding: '24px' }}>No confirmed pickups yet.</div> :
             (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Pickup Date</th>
                  <th>Address</th>
                  <th>Assigned Truck</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {confirmedEvents.map(e => (
                  <tr key={e._id}>
                    <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{e.eventName}</td>
                    <td>{e.date}</td>
                    <td>{e.location}</td>
                    <td style={{ fontFamily: 'monospace' }}>{e.pickupSlot?.truckId}</td>
                    <td style={{ fontWeight: 600 }}>{e.pickupSlot?.scheduledTime}</td>
                    <td><span className="badge-pill" style={{ padding: '4px 12px', fontSize: '11px', background: 'rgba(201,168,76,0.1)', color: 'var(--accent)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '999px', display: 'inline-block' }}>✓ Confirmed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
