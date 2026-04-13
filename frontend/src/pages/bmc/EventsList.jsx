import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bmcAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import './EventsList.css'

export default function EventsList() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    bmcAPI.getEvents()
      .then(res => {
        setEvents(res.data.events)
        setFiltered(res.data.events)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter logic
  useEffect(() => {
    if (statusFilter === 'all') setFiltered(events)
    else if (statusFilter === 'pending')
      setFiltered(events.filter(e => !e.pickupSlot || e.pickupSlot.status === 'pending'))
    else if (statusFilter === 'confirmed')
      setFiltered(events.filter(e => e.pickupSlot?.status === 'confirmed'))
    else if (statusFilter === 'completed')
      setFiltered(events.filter(e => e.pickupSlot?.status === 'completed'))
  }, [statusFilter, events])

  return (
    <PageWrapper role="bmc">
      <div className="events-list">
        <div className="page-header page-header--flex">
          <div>
            <h1 className="heading-2">Events Registry</h1>
            <p className="date" style={{ color: 'var(--text-3)' }}>Monitor activity and schedule pickups across your ward zone.</p>
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-1)' }}
          >
            <option value="all">All Events</option>
            <option value="pending">⏳ Pending Assignment</option>
            <option value="confirmed">✓ Confirmed Pickups</option>
            <option value="completed">● Completed Cycles</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Date & Req. Pickup</th>
                <th>Venue</th>
                <th>Attendees</th>
                      <th>Actual Waste</th>
                      <th>Pickup Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-2)', padding: '24px' }}>
                        Loading events...
                      </td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-2)', padding: '24px' }}>
                        No events found in your ward zone
                      </td></tr>
                    ) : (
                      filtered.map(event => {
                        const log = event.wasteLog
                        const totalActualBins = log ? (log.wetFill || 0) + (log.dryFill || 0) + (log.recycleFill || 0) : null
                        const slotStatus = event.pickupSlot?.status || 'pending'
      
                        return (
                          <tr key={event._id}>
                            <td style={{ fontWeight: 500 }}>{event.eventName}</td>
                            <td>{event.organizerId?.name || 'Unknown'}</td>
                            <td>
                              {event.date}
                              {event.pickupTimeRange && (
                                <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px', fontWeight: 600 }}>
                                  Req: {event.pickupTimeRange}
                                </div>
                              )}
                            </td>
                            <td>{event.venueName}</td>
                            <td>{event.guestCount}</td>
                            <td>
                              {log ? (
                                <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                                  {totalActualBins} bins
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-3)', fontSize: '11px', fontStyle: 'italic' }}>
                                  No data logged yet
                                </span>
                              )}
                            </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                          background: slotStatus === 'confirmed' ? 'rgba(201,168,76,0.1)'
                            : slotStatus === 'completed' ? 'rgba(100,100,100,0.1)'
                            : 'rgba(245,158,11,0.1)',
                          color: slotStatus === 'confirmed' ? 'var(--accent)'
                            : slotStatus === 'completed' ? 'var(--text-2)'
                            : '#f59e0b'
                        }}>
                          {slotStatus === 'confirmed' ? '✓ Confirmed'
                            : slotStatus === 'completed' ? 'Completed'
                            : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => navigate(`/bmc/events/${event._id}`)}
                        >
                          {slotStatus === 'pending' ? 'Assign Slot' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
