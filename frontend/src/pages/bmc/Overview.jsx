import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bmcAPI, bmcWorkerAPI, bmcCompletionAPI } from '../../services/api'
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
  const [declinedAlerts, setDeclinedAlerts] = useState([])
  const [workerCompletions, setWorkerCompletions] = useState([])
  const [photoModal, setPhotoModal] = useState(null) // {photo, workerName, eventName}
  const [confirming, setConfirming] = useState(false)
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

    bmcWorkerAPI.getDeclinedAlerts()
      .then(res => setDeclinedAlerts(res.data.declinedAlerts || []))
      .catch(console.error)

    bmcCompletionAPI.getWorkerCompletions()
      .then(res => setWorkerCompletions(res.data.completions || []))
      .catch(console.error)
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
        <div className="page-header page-header--flex">
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

        {/* Worker Completion Alerts */}
        {workerCompletions.length > 0 && (
          <div style={{
            background: 'rgba(110,232,74,0.06)',
            border: '1px solid rgba(110,232,74,0.25)',
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '13px', fontWeight: 600,
              color: 'var(--accent)', marginBottom: '12px'
            }}>
              ✓ Workers Awaiting Your Confirmation ({workerCompletions.length})
            </p>
            {workerCompletions.map(item => (
              <div key={item._id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '12px', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-1)' }}>
                      {item.eventId?.eventName}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '3px' }}>
                      🚛 {item.workerId?.name} ({item.workerId?.truckName})
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                      📅 {item.eventId?.date} · 📍 {item.eventId?.venueName}
                    </p>
                    {item.workerNotes && (
                      <p style={{ fontSize: '11px', color: 'var(--text-2)', fontStyle: 'italic', marginTop: '3px' }}>
                        Note: {item.workerNotes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    {/* View photo button */}
                    {item.proofPhotoBase64 && (
                      <button
                        onClick={() => setPhotoModal({
                          photo: item.proofPhotoBase64,
                          workerName: item.workerId?.name,
                          eventName: item.eventId?.eventName,
                          slotId: item.pickupSlotId?._id || item.pickupSlotId
                        })}
                        style={{
                          padding: '7px 14px', background: 'rgba(59,130,246,0.1)',
                          color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '50px', fontFamily: 'DM Sans, sans-serif',
                          fontSize: '12px', cursor: 'pointer', fontWeight: 500
                        }}
                      >
                        📷 View Proof
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo proof modal */}
        {photoModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '24px',
              maxWidth: '480px', width: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>
                    Proof Photo
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    {photoModal.workerName} · {photoModal.eventName}
                  </p>
                </div>
                <button onClick={() => setPhotoModal(null)} style={{
                  background: 'transparent', border: 'none', color: 'var(--text-2)',
                  cursor: 'pointer', fontSize: '20px'
                }}>✕</button>
              </div>

              <img
                src={photoModal.photo}
                alt="Worker proof"
                style={{
                  width: '100%', maxHeight: '300px',
                  objectFit: 'contain', borderRadius: '10px',
                  border: '1px solid var(--border)', marginBottom: '16px'
                }}
              />

              <button
                onClick={async () => {
                  setConfirming(true)
                  try {
                    await bmcCompletionAPI.bmcConfirmComplete(photoModal.slotId)
                    setPhotoModal(null)
                    // Refresh completions list
                    const res = await bmcCompletionAPI.getWorkerCompletions()
                    setWorkerCompletions(res.data.completions || [])
                  } catch (err) {
                    alert(err.response?.data?.error || 'Failed to confirm')
                  } finally { setConfirming(false) }
                }}
                disabled={confirming}
                style={{
                  width: '100%', padding: '14px',
                  background: 'var(--accent)', color: '#071007',
                  border: 'none', borderRadius: '50px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {confirming ? 'Confirming...' : '✓ Confirm Pickup Complete'}
              </button>
              <p style={{ fontSize: '11px', color: 'var(--text-2)', textAlign: 'center', marginTop: '8px' }}>
                By confirming, you verify this pickup was completed. Organizer will be notified.
              </p>
            </div>
          </div>
        )}

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

              {/* Declined job alerts */}
              {declinedAlerts.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>
                    ⚠ Worker Declined Jobs — Reassignment Needed
                  </p>
                  {declinedAlerts.map(alert => (
                    <div key={alert._id} style={{
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', fontSize: '12px'
                    }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                        {alert.eventId?.eventName} — Declined by {alert.workerId?.name}
                      </p>
                      <p style={{ color: 'var(--text-2)', marginTop: '3px' }}>
                        Reason: {alert.declineReason}
                      </p>
                      {alert.declineProofUrl && (
                        <p style={{ color: '#3b82f6', fontSize: '11px', marginTop: '2px' }}>
                          Proof: {alert.declineProofUrl}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
