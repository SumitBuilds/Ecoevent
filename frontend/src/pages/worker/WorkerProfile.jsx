import { useState, useEffect } from 'react'
import { workerAuthAPI } from '../../services/api'

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workerAuthAPI.myProfile()
      .then(res => setWorker(res.data.worker))
      .catch(() => {
        const cached = localStorage.getItem('ecoevent_worker')
        if (cached) setWorker(JSON.parse(cached))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-2)' }}>Loading...</div>
  if (!worker) return <div style={{ padding: '40px', color: 'var(--text-2)' }}>Could not load profile.</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
      
      {/* Profile Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(110,232,74,0.05) 100%)',
        border: '1px solid var(--border)', borderRadius: '24px',
        padding: '40px', marginBottom: '32px', display: 'flex',
        alignItems: 'center', gap: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--accent)', color: '#071007',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 900, fontFamily: 'Fraunces, serif'
        }}>
          {worker.name ? worker.name.charAt(0) : 'W'}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '8px' }}>
            {worker.name || 'Worker Profile'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', display: 'flex', gap: '16px' }}>
            <span>🆔 {worker.employeeId || 'ID Pending'}</span>
            <span>📍 {worker.wardZone || 'No Zone'}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Personal Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Contact Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Email Address</p>
              <p style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 500 }}>{worker.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Phone Number</p>
              <p style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 500 }}>{worker.phone || 'Not provided'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Account Status</p>
              <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(110,232,74,0.1)', color: 'var(--accent)', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {worker.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Fleet Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Fleet & Assignment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Assigned Truck</p>
              <p style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 500 }}>{worker.truckName || worker.truckId || 'None assigned'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Truck Capacity</p>
              <p style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 500 }}>{worker.truckCapacity ? `${worker.truckCapacity} Kg` : '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Shift Window</p>
              <p style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 500 }}>{worker.shiftStart} to {worker.shiftEnd}</p>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '32px', textAlign: 'center', background: 'rgba(245,158,11,0.05)', border: '1px dashed rgba(245,158,11,0.3)', padding: '20px', borderRadius: '16px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
          Need to update your details or change your routing? Contact your BMC Ward Officer directly to request an override.
        </p>
      </div>
    </div>
  )
}
