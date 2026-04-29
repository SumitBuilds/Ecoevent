import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bmcWorkerAPI } from '../../services/api'

export default function FleetStatus() {
  const navigate = useNavigate()
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bmcWorkerAPI.getFleetStatus()
      .then(res => setFleet(res.data.fleetStatus || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statusColor = s =>
    s === 'idle' ? 'var(--accent)' : s === 'assigned' ? '#f59e0b' :
    s === 'on_route' ? '#3b82f6' : '#22c55e'

  const statusLabel = s =>
    s === 'idle' ? '● Available' : s === 'assigned' ? '● Assigned' :
    s === 'on_route' ? '● On Route' : '● Completed'

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '4px' }}>
        Fleet Status
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '24px' }}>Real-time truck and worker availability</p>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Workers', value: fleet.length, color: 'var(--text-1)' },
          { label: 'Available', value: fleet.filter(w => w.status === 'idle').length, color: 'var(--accent)' },
          { label: 'On Assignment', value: fleet.filter(w => ['assigned','on_route'].includes(w.status)).length, color: '#f59e0b' },
          { label: 'Total Declined', value: fleet.reduce((s, w) => s + (w.totalDeclined || 0), 0), color: '#ef4444' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 700, color: card.color, marginTop: '4px' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet grid */}
      {loading ? <p style={{ color: 'var(--text-2)' }}>Loading fleet...</p> : fleet.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', color: 'var(--text-1)' }}>No workers registered</p>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>Add workers via Fleet Management.</p>
          <button onClick={() => navigate('/bmc/fleet-management')} style={{ marginTop: '16px', padding: '10px 24px', background: 'var(--accent)', color: '#071007', border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Add Workers
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {fleet.map(worker => (
            <div key={worker.workerId} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)' }}>{worker.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>ID: {worker.employeeId}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor(worker.status) }}>
                  {statusLabel(worker.status)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                <p>🚛 {worker.truckName} ({worker.truckId})</p>
                <p>⏰ Shift: {worker.shiftStart} – {worker.shiftEnd}</p>
                <p>📞 {worker.phone || 'No phone'}</p>
              </div>
              {worker.activeJob && (
                <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', fontSize: '11px', color: '#f59e0b' }}>
                  Currently assigned: {worker.activeJob.eventId?.eventName}
                </div>
              )}
              {worker.totalDeclined > 0 && (
                <p style={{ marginTop: '6px', fontSize: '11px', color: '#ef4444' }}>⚠ {worker.totalDeclined} job(s) declined</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
