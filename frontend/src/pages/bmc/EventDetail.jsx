import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventAPI, bmcAPI, bmcFleetAPI, bmcCompletionAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import { RiTruckLine, RiTimeLine, RiMapPinLine, RiUserLine, RiPhoneLine } from 'react-icons/ri'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [pickupSlot, setPickupSlot] = useState(null)
  const [wasteLog, setWasteLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickupDone, setPickupDone] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [time, setTime] = useState('')
  const [availableWorkers, setAvailableWorkers] = useState([])
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [jobAssignment, setJobAssignment] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [bmcConfirming, setBmcConfirming] = useState(false)

  const fetchEvent = () => {
    eventAPI.getOne(id)
      .then(res => {
        setEvent(res.data.event)
        setPickupSlot(res.data.pickupSlot)
        setWasteLog(res.data.wasteLog)
        setJobAssignment(res.data.jobAssignment) // Now provided directly by the main event API
        if (res.data.pickupSlot?.status === 'completed') setPickupDone(true)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvent() }, [id])

  // Fetch available workers for the dropdown
  useEffect(() => {
    bmcFleetAPI.getAvailable()
      .then(res => setAvailableWorkers(res.data.workers || []))
      .catch(console.error)
  }, [])

  const handleConfirm = async () => {
    if (!pickupSlot?._id) return
    if (!selectedWorkerId) {
      alert('Worker assignment is mandatory. Please select a worker before confirming.')
      return
    }
    if (!time.trim()) {
      alert('Please enter a pickup time window')
      return
    }
    setConfirming(true)
    try {
      await bmcAPI.confirmSlot(pickupSlot._id, {
        scheduledTime: time,
        workerId: selectedWorkerId
      })
      await fetchEvent()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to confirm. Try again.')
    } finally { setConfirming(false) }
  }



  if (loading) return (
    <PageWrapper role="bmc">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        Loading event...
      </div>
    </PageWrapper>
  )

  const timeline = [
    { step: 'Event Registered',   done: true },
    { step: 'Waste Log Submitted', done: !!wasteLog },
    { step: 'Pickup Scheduled',   done: pickupSlot?.status !== 'pending' },
    { step: 'Worker Accepted',    done: jobAssignment && jobAssignment.workerStatus !== 'pending_accept' },
    { step: 'Pickup Verified',    done: !!jobAssignment?.bmcVerifiedAt },
    { step: 'Certificate Released',  done: event?.status === 'completed' },
  ]

  // Determine sub-status for better display
  const getSubStatus = () => {
    if (pickupSlot?.status === 'completed') return 'Pickup Completed';
    if (jobAssignment) {
      if (jobAssignment.workerStatus === 'pending_accept') return 'Awaiting Worker Acceptance';
      if (jobAssignment.workerStatus === 'accepted') return 'Worker En Route';
      if (jobAssignment.workerStatus === 'worker_completed') return 'Awaiting BMC Final Review';
    }
    return pickupSlot?.status || 'Pending';
  };

  const actualBins = wasteLog 
    ? (wasteLog.wetFill || 0) + (wasteLog.dryFill || 0) + (wasteLog.recycleFill || 0)
    : 0;

  const actualKg = wasteLog
    ? (wasteLog.wetFill * 45) + (wasteLog.dryFill * 22) + (wasteLog.recycleFill * 15)
    : 0;

  return (
    <PageWrapper role="bmc">
      <div className="event-detail" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <Link to="/bmc/events" style={{ color: 'var(--text-3)', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '10px' }}>← Back to Registry</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="heading-2">{event?.eventName}</h1>
            <span style={{
              padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
              background: 
                getSubStatus().includes('Completed') ? 'rgba(34,197,94,0.1)' :
                getSubStatus().includes('Awaiting') ? 'rgba(245,158,11,0.1)' :
                getSubStatus().includes('En Route') ? 'rgba(59,130,246,0.1)' : 'rgba(201,168,76,0.1)',
              color: 
                getSubStatus().includes('Completed') ? '#22c55e' :
                getSubStatus().includes('Awaiting') ? '#f59e0b' :
                getSubStatus().includes('En Route') ? '#3b82f6' : 'var(--accent)'
            }}>
              {getSubStatus()}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '30px' }}>
          <div className="event-detail__main">
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Logistics Overview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>Event Type</label>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{event?.eventType}</p>
                </div>
                <div>
                  <label>Ward Zone</label>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{event?.wardZone}</p>
                </div>
                <div>
                  <label>Date (Event Day)</label>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{event?.date}</p>
                </div>
                <div>
                  <label>Guests</label>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{event?.guestCount} Predicted</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Event Timings</label>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{event?.startTime || 'TBD'} to {event?.endTime || 'TBD'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', background: 'rgba(201,168,76,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <label style={{ color: 'var(--accent)', fontWeight: 600 }}>Requested Pickup Window (Post-Event)</label>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginTop: '4px' }}>
                    {event?.pickupTimeRange || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>
                {wasteLog ? 'Actual Collection Data' : 'Resource Requirements'}
              </h4>
              
              {wasteLog ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>🟢 Actual Wet Waste</span>
                    <span style={{ fontWeight: 600 }}>{wasteLog.wetFill} bins (~{wasteLog.wetFill * 45}kg)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>🟡 Actual Dry Waste</span>
                    <span style={{ fontWeight: 600 }}>{wasteLog.dryFill} bins (~{wasteLog.dryFill * 22}kg)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>🔵 Actual Recyclable</span>
                    <span style={{ fontWeight: 600 }}>{wasteLog.recycleFill} bins (~{wasteLog.recycleFill * 15}kg)</span>
                  </div>
                  <p style={{ marginTop: '16px', fontSize: '13px', textAlign: 'center', color: 'var(--accent)', fontWeight: 600 }}>
                    Total Actual Load: {actualBins} Bins ({actualKg}kg)
                  </p>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-3)', margin: 0 }}>
                    No wastelog exists yet. Prediction visibility restricted.
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
                    Please wait for organizer to log actual observations after the event ends.
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Contact Points</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <RiUserLine />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', margin: 0 }}>Caterer</p>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{event?.catererName} — {event?.catererContact}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <RiUserLine />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', margin: 0 }}>Decorator</p>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{event?.decoratorName} — {event?.decoratorContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="event-detail__aside">
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Pickup Management</h4>
              {pickupSlot?.status === 'completed' ? (
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: '10px', padding: '14px'
                }}>
                  <p style={{ color: '#22c55e', fontWeight: 600, margin: 0 }}>✓ Pickup Fully Completed</p>
                  <p style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
                    Verification finished. Certificate released to organizer.
                  </p>
                </div>
              ) : pickupSlot?.status === 'confirmed' ? (
                <div>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                    ✓ Logic Set — {pickupSlot.truckId} · {pickupSlot.scheduledTime}
                  </p>
                  
                  {jobAssignment ? (
                    <div style={{
                      marginTop: '12px', padding: '12px',
                      background: jobAssignment.workerStatus === 'pending_accept' ? 'rgba(245,158,11,0.05)' : 'var(--bg)',
                      border: jobAssignment.workerStatus === 'pending_accept' ? '1px dashed #f59e0b' : '1px solid var(--border)',
                      borderRadius: '10px'
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '6px' }}>
                        Assignment Status
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                        👷 {jobAssignment.workerId?.name} ({jobAssignment.workerId?.truckName})
                      </p>
                      
                      <div style={{
                        marginTop: '10px', padding: '8px', borderRadius: '6px',
                        background: 'var(--bg-2)', textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '12px', margin: 0, fontWeight: 700, 
                          color: jobAssignment.workerStatus === 'pending_accept' ? '#f59e0b' : 
                                 jobAssignment.workerStatus === 'accepted' ? '#3b82f6' : 'var(--accent)' 
                        }}>
                          {jobAssignment.workerStatus === 'pending_accept' ? '⏳ Awaiting worker to accept...' :
                           jobAssignment.workerStatus === 'accepted' ? '🚛 Pickup in Progress' :
                           '✓ Work Completed / Proof Sent'}
                        </p>
                      </div>

                      {/* Show proof photo if worker completed */}
                      {jobAssignment.workerStatus === 'worker_completed' && jobAssignment.proofPhotoBase64 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={jobAssignment.proofPhotoBase64}
                            alt="Worker proof"
                            onClick={() => setShowPhotoModal(true)}
                            style={{
                              width: '100%', maxHeight: '160px',
                              objectFit: 'cover', borderRadius: '8px',
                              border: '1px solid var(--border)', cursor: 'pointer'
                            }}
                          />
                          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '4px', textAlign: 'center' }}>
                            Click to enlarge · Photo by {jobAssignment.workerId?.name}
                          </p>

                          {!jobAssignment.bmcVerifiedAt && (
                            <button
                              onClick={async () => {
                                setBmcConfirming(true)
                                try {
                                  await bmcCompletionAPI.bmcConfirmComplete(pickupSlot._id)
                                  await fetchEvent()
                                } catch (err) {
                                  alert(err.response?.data?.error || 'Failed')
                                } finally { setBmcConfirming(false) }
                              }}
                              disabled={bmcConfirming}
                              style={{
                                marginTop: '10px', width: '100%', padding: '12px',
                                background: 'var(--accent)', color: '#071007',
                                border: 'none', borderRadius: '50px',
                                fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              {bmcConfirming ? 'Confirming...' : '✓ Confirm Pickup Complete'}
                            </button>
                          )}

                          {jobAssignment.bmcVerifiedAt && (
                            <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600, marginTop: '8px', textAlign: 'center' }}>
                              ✓ BMC Confirmed · {new Date(jobAssignment.bmcVerifiedAt).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '8px' }}>
                      No worker assigned yet
                    </p>
                  )}
                  {(!jobAssignment || jobAssignment.workerStatus !== 'worker_completed') && (
                    <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-3)', margin: 0 }}>
                        Awaiting worker photo proof submission. Manual force-completion is disabled.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#f59e0b', fontWeight: 500, fontSize: '13px' }}>⏳ Awaiting Slot Assignment</p>
                  
                  {/* Real worker dropdown */}
                  <div>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 500,
                      color: 'var(--text-2)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: '6px'
                    }}>
                      Assign Worker & Truck
                    </label>
                    <select
                      value={selectedWorkerId}
                      onChange={e => setSelectedWorkerId(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13px', color: 'var(--text-1)', outline: 'none'
                      }}
                    >
                      <option value="">Select available worker...</option>
                      {availableWorkers.map(w => (
                        <option key={w._id} value={w._id}>
                          {w.name} — {w.truckName} {w.truckCapacity ? `(${w.truckCapacity})` : ''} · Shift: {w.shiftStart}–{w.shiftEnd}
                        </option>
                      ))}
                      {availableWorkers.length === 0 && (
                        <option disabled>No workers available right now</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 500,
                      color: 'var(--text-2)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: '6px'
                    }}>
                      Pickup Time Window
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      placeholder="e.g. 11:00 PM – 1:00 AM"
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13px', color: 'var(--text-1)', outline: 'none'
                      }}
                    />
                  </div>

                  {!selectedWorkerId && (
                    <p style={{
                      fontSize: '11px', color: '#ef4444', fontWeight: 500,
                      marginTop: '4px', marginBottom: '0'
                    }}>
                      ⚠ Worker selection is mandatory to confirm this pickup.
                    </p>
                  )}

                  <button
                    className="btn-primary"
                    onClick={handleConfirm}
                    disabled={confirming || !selectedWorkerId}
                    style={{
                      marginTop: '5px',
                      opacity: !selectedWorkerId ? 0.5 : 1,
                      cursor: !selectedWorkerId ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {confirming ? 'Confirming...' : !selectedWorkerId ? '🔒 Select Worker to Confirm' : 'Confirm Pickup'}
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '20px' }}>Lifecycle Progress</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {timeline.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: st.done ? 1 : 0.4 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: st.done ? 'var(--accent)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.done ? '#0a140a' : 'var(--text-3)', fontSize: '11px', fontWeight: 'bold' }}>
                      {st.done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: st.done ? 500 : 400 }}>{st.step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full photo modal */}
      {showPhotoModal && jobAssignment?.proofPhotoBase64 && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }} onClick={() => setShowPhotoModal(false)}>
          <img
            src={jobAssignment.proofPhotoBase64}
            alt="Proof"
            style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '10px' }}
          />
        </div>
      )}
    </PageWrapper>
  )
}
