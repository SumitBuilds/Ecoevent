import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bmcAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/shared/PageWrapper'
import StatCard from '../../components/shared/StatCard'
import { RiCalendarLine, RiDeleteBinLine, RiCheckDoubleLine, RiAlertLine, RiArrowRightSLine, RiLogoutBoxRLine } from 'react-icons/ri'
import './Overview.css'

export default function Overview() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalEvents: 0, totalBins: 0, confirmed: 0, pending: 0
  })
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([bmcAPI.getStats(), bmcAPI.getEvents()])
      .then(([statsRes, eventsRes]) => {
        setStats(statsRes.data)
        // Filter events with no pickup slot confirmed
        const pending = eventsRes.data.events.filter(
          e => !e.pickupSlot || e.pickupSlot.status === 'pending'
        )
        setPendingEvents(pending)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  const unassignedWeekend = pendingEvents.filter(e => {
    const day = new Date(e.date).getDay()
    return day === 0 || day === 6 // Saturday or Sunday
  })
  const showRiskAlert = unassignedWeekend.length >= 2

  return (
    <PageWrapper role="bmc">
      <div className="overview">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-2">
              {user?.name || 'Ward Officer'} — {user?.wardZone || 'Mumbai'}
            </h1>
            <p className="date">{today}</p>
          </div>
          <button className="btn-ghost" onClick={() => { logout(); navigate('/') }}>
            <RiLogoutBoxRLine /> Sign Out
          </button>
        </div>

        {showRiskAlert && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>
              <RiAlertLine size={16} /> ⚠ HIGH RISK ALERT — WEEKEND OPERATIONS
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
              {unassignedWeekend.length} events this weekend with no pickup slot assigned. 
              Schedule logistics to avoid overflow.
            </p>
          </div>
        )}

        <div className="grid-4" style={{ marginBottom: '28px' }}>
          <StatCard value={stats.totalEvents} label="Events This Week" icon={<RiCalendarLine size={20} />} color="green" />
          <StatCard value={`${stats.totalBins} bins`} label="Actual Bins Logged" icon={<RiDeleteBinLine size={20} />} color="blue" />
          <StatCard value={`${stats.totalWasteKg || 0} kg`} label="Total Waste (Actual)" icon={<RiCheckDoubleLine size={20} />} color="green" />
          <StatCard value={stats.pending} label="Pending Slots" icon={<RiAlertLine size={20} />} color={stats.pending > 0 ? "red" : "green"} />
        </div>

        <div className="overview__body">
          <div className="overview__main">
            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Ward Activity Feedback</h4>
              <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>
                {stats.totalBins > 0 
                  ? `Managed ${stats.totalBins} bins of actual waste across ${stats.totalEvents} events. Accuracy focus: High.`
                  : "Waiting for event data logs to calculate ward-wide performance metrics."}
              </p>
            </div>
          </div>

          <div className="overview__aside">
            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Pending Assignment</h4>
              <div className="alert-list">
                {loading ? (
                  <div style={{ color: 'var(--text-2)', fontSize: '13px' }}>Loading alerts...</div>
                ) : pendingEvents.length === 0 ? (
                  <div style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                    ✓ All events have pickup slots assigned
                  </div>
                ) : (
                  pendingEvents.slice(0, 5).map(event => (
                    <div key={event._id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid var(--border)'
                    }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
                          {event.eventName}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                          {event.date} · {event.wardZone} · {
                            event.wasteLog 
                              ? `${(event.wasteLog.wetFill || 0) + (event.wasteLog.dryFill || 0) + (event.wasteLog.recycleFill || 0)} Bins`
                              : "No data logged yet"
                          }
                        </p>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => navigate(`/bmc/events/${event._id}`)}
                      >
                        Assign →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
