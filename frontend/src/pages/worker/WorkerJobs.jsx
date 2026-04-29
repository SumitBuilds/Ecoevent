import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerJobAPI } from '../../services/api'

export default function WorkerJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workerJobAPI.getMyJobs()
      .then(res => setJobs(res.data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.workerStatus === filter)

  const statusConfig = {
    pending_accept:   { label: '⏳ Awaiting Response', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    accepted:         { label: '🚛 In Progress',       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    worker_completed: { label: '✓ Completed',          color: 'var(--accent)', bg: 'rgba(110,232,74,0.1)' },
    declined:         { label: '✗ Declined',           color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Jobs Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.05) 100%)',
        border: '1px solid var(--border)', borderRadius: '24px',
        padding: '36px 40px', marginBottom: '32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ padding: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '12px', display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>
              My Jobs
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', maxWidth: '400px' }}>
            Browse and manage all pickup allocations assigned to your truck route.
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Jobs Today</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '36px', fontWeight: 700, color: 'var(--text-1)' }}>{jobs.length}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'pending_accept', label: 'Needs Response' },
          { value: 'accepted', label: 'In Progress' },
          { value: 'worker_completed', label: 'Completed' },
          { value: 'declined', label: 'Declined' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: filter === f.value ? 'var(--accent)' : 'var(--border)',
            background: filter === f.value ? 'rgba(110,232,74,0.1)' : 'transparent',
            color: filter === f.value ? 'var(--accent)' : 'var(--text-2)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer'
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-2)' }}>Loading jobs...</p>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px outset var(--border)',
          borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', color: 'var(--text-1)', marginBottom: '8px' }}>
            No jobs in this category
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>
            Switch to a different filter or check back later when new jobs are assigned.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(job => {
            const s = statusConfig[job.workerStatus] || {}
            const ev = job.eventId
            const totalBins = (ev?.estimatedBins?.wet||0)+(ev?.estimatedBins?.dry||0)+(ev?.estimatedBins?.recyclable||0)
            return (
              <div key={job._id}
                onClick={() => navigate(`/worker/job/${job._id}`)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '24px', cursor: 'pointer',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)', marginBottom: '4px' }}>
                    {ev?.eventName}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    📅 {ev?.date} &nbsp;·&nbsp; 📍 {ev?.venueName}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>
                    👥 {ev?.guestCount} guests &nbsp;·&nbsp; 🗑 {totalBins} bins
                    {job.pickupSlotId?.scheduledTime && ` · ⏰ ${job.pickupSlotId.scheduledTime}`}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                  background: s.bg, color: s.color, whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
