import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventAPI, bmcAPI } from '../../services/api'
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
  const [truck, setTruck] = useState('Truck 1')
  const [time, setTime] = useState('22:00 – 00:00')

  const fetchEvent = () => {
    eventAPI.getOne(id)
      .then(res => {
        setEvent(res.data.event)
        setPickupSlot(res.data.pickupSlot)
        setWasteLog(res.data.wasteLog)
        if (res.data.pickupSlot?.status === 'completed') setPickupDone(true)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvent() }, [id])

  const handleConfirm = async () => {
    if (!pickupSlot?._id) return
    setConfirming(true)
    try {
      await bmcAPI.confirmSlot(pickupSlot._id, {
        truckId: truck,
        scheduledTime: time
      })
      await fetchEvent() // refresh to show confirmed state
    } catch (err) {
      console.error(err)
    } finally {
      setConfirming(false)
    }
  }

  const handleComplete = async () => {
    if (!pickupSlot?._id) return
    try {
      await bmcAPI.completeSlot(pickupSlot._id)
      setPickupDone(true)
      await fetchEvent()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <PageWrapper role="bmc">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        Loading event...
      </div>
    </PageWrapper>
  )

  const timeline = [
    { step: 'Registered',   done: true },
    { step: 'BMC Notified', done: true },
    { step: 'Slot Assigned', done: pickupSlot?.status === 'confirmed' || pickupSlot?.status === 'completed' },
    { step: 'Event Day',    done: new Date(event?.date) < new Date() },
    { step: 'Waste Log',    done: event?.status === 'completed' },
    { step: 'Certificate',  done: event?.status === 'completed' },
  ]

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
              background: pickupSlot?.status === 'confirmed' ? 'rgba(201,168,76,0.1)' : 'rgba(245,158,11,0.1)',
              color: pickupSlot?.status === 'confirmed' ? 'var(--accent)' : '#f59e0b'
            }}>
              {pickupSlot?.status || 'pending'}
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
              {pickupDone || pickupSlot?.status === 'completed' ? (
                <div style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: '10px', padding: '14px'
                }}>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>✓ Pickup Completed</p>
                  <p style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
                    Waste collected. Event lifecycle closed. Audit log updated.
                  </p>
                </div>
              ) : pickupSlot?.status === 'confirmed' ? (
                <div>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                    ✓ Confirmed — {pickupSlot.truckId} · {pickupSlot.scheduledTime}
                  </p>
                  <button className="btn-primary btn-full" onClick={handleComplete}>
                    Mark Pickup Complete
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#f59e0b', fontWeight: 500, fontSize: '13px' }}>⏳ Awaiting Slot Assignment</p>
                  <div>
                    <label style={{ fontSize: '11px' }}>Assign Truck</label>
                    <select
                      value={truck}
                      onChange={e => setTruck(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', background: 'var(--bg)',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        color: 'var(--text-1)', fontSize: '13px'
                      }}
                    >
                      <option>Truck 1</option>
                      <option>Truck 2</option>
                      <option>Truck 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px' }}>Pickup Time Window</label>
                    <input
                      type="text"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      placeholder="e.g. 22:00 – 00:00"
                      style={{
                        width: '100%', padding: '9px 12px', background: 'var(--bg)',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        color: 'var(--text-1)', fontSize: '13px'
                      }}
                    />
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleConfirm}
                    disabled={confirming}
                    style={{ marginTop: '5px' }}
                  >
                    {confirming ? 'Confirming...' : 'Confirm Pickup'}
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
    </PageWrapper>
  )
}
