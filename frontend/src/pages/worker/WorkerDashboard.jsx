import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerJobAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'

export default function WorkerDashboard() {
  const navigate = useNavigate()
  const worker = JSON.parse(localStorage.getItem('ecoevent_worker') || '{}')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workerJobAPI.getMyJobs()
      .then(res => setJobs(res.data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending   = jobs.filter(j => j.workerStatus === 'pending_accept')
  const active    = jobs.filter(j => j.workerStatus === 'accepted')
  const completed = jobs.filter(j => j.workerStatus === 'worker_completed')
  const declined  = jobs.filter(j => j.workerStatus === 'declined')

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero Strip */}
      <div style={{
        background: 'linear-gradient(to right, var(--bg-card) 40%, rgba(110,232,74,0.1) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '24px', padding: '40px', marginBottom: '32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
      }}>
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Shift Operations
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '42px', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1.1 }}>
            Good day, {worker.name?.split(' ')[0] || 'Worker'} 👋
          </h1>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <span style={{ background: 'var(--bg)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', border: '1px solid var(--border)' }}>
              🚛 {worker.truckName}
            </span>
            <span style={{ background: 'var(--bg)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', border: '1px solid var(--border)' }}>
              ⏰ {worker.shiftStart} – {worker.shiftEnd}
            </span>
          </div>
        </div>
        
        {/* Dynamic Truck Status Graphic */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(110,232,74,0.1)', border: '4px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(110,232,74,0.2)'
        }}>
          <span style={{ fontSize: '48px' }}>🚛</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {[
          { label: 'Needs Response', value: pending.length,   icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
          { label: 'In Progress',    value: active.length,    icon: '📍', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)' },
          { label: 'Completed',      value: completed.length, icon: '✓', color: 'var(--accent)', bg: 'rgba(110,232,74,0.05)' },
          { label: 'Declined',       value: declined.length,  icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.05)' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', position: 'relative', overflow: 'hidden'
          }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: c.bg, borderRadius: '50%', transform: 'translate(30%, -30%)', filter: 'blur(20px)' }}></div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.02em', zIndex: 1 }}>
              {c.icon} {c.label}
            </p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '48px', fontWeight: 700, color: c.color, marginTop: '8px', zIndex: 1 }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Urgent — pending response */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: 'Fraunces, serif', fontSize: '16px',
            fontWeight: 700, color: '#f59e0b', marginBottom: '12px'
          }}>
            ⚠ Action Required — {pending.length} job{pending.length > 1 ? 's' : ''} awaiting your response
          </h2>
          {pending.map(job => {
            const ev = job.eventId
            const totalBins = (ev?.estimatedBins?.wet||0)+(ev?.estimatedBins?.dry||0)+(ev?.estimatedBins?.recyclable||0)
            return (
              <div key={job._id}
                onClick={() => navigate(`/worker/job/${job._id}`)}
                style={{
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '12px', padding: '16px', marginBottom: '10px',
                  cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)' }}>
                    {ev?.eventName}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                    📅 {ev?.date} &nbsp;·&nbsp; 📍 {ev?.venueName} &nbsp;·&nbsp; 🗑 {totalBins} bins
                  </p>
                  {job.pickupSlotId?.scheduledTime && (
                    <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '3px' }}>
                      ⏰ Pickup: {job.pickupSlotId.scheduledTime}
                    </p>
                  )}
                </div>
                <button style={{
                  padding: '10px 18px', background: 'var(--accent)', color: '#071007',
                  border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Respond →
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Active job */}
      {active.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: '#3b82f6', marginBottom: '12px' }}>
            🚛 Active Job
          </h2>
          {active.map(job => (
            <div key={job._id}
              onClick={() => navigate(`/worker/job/${job._id}`)}
              style={{
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '12px', padding: '16px', cursor: 'pointer'
              }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)' }}>
                {job.eventId?.eventName}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                📍 {job.eventId?.venueName} &nbsp;·&nbsp; ⏰ {job.pickupSlotId?.scheduledTime}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{
                  padding: '10px 18px', background: 'var(--accent)', color: '#071007',
                  border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Mark Complete ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent jobs */}
      {loading ? (
        <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Loading...</p>
      ) : jobs.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '48px', textAlign: 'center'
        }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', color: 'var(--text-1)' }}>
            No jobs yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>
            Your BMC supervisor will assign pickup jobs to you here.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px' }}>
            Recent Jobs
          </h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {jobs.slice(0, 8).map((job, i) => {
              const statusMap = {
                pending_accept: { label: '⏳ Awaiting Response', color: '#f59e0b' },
                accepted:       { label: '🚛 In Progress',       color: '#3b82f6' },
                worker_completed:{ label:'✓ Completed',          color: 'var(--accent)' },
                declined:       { label: '✗ Declined',           color: '#ef4444' },
              }
              const s = statusMap[job.workerStatus] || {}
              return (
                <div key={job._id}
                  onClick={() => navigate(`/worker/job/${job._id}`)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < jobs.slice(0,8).length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-1)' }}>
                      {job.eventId?.eventName}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>
                      {job.eventId?.date} · {job.eventId?.venueName}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: s.color }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
