import { useState, useEffect } from 'react'
import { bmcWorkerAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function FleetManagement() {
  const { user } = useAuth()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', employeeId: '', email: '', password: '',
    phone: '', truckId: '', truckName: '',
    shiftStart: '20:00', shiftEnd: '04:00', wardZone: user?.wardZone || ''
  })

  const loadWorkers = () => {
    setLoading(true)
    bmcWorkerAPI.getAll()
      .then(res => setWorkers(res.data.workers || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWorkers() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await bmcWorkerAPI.createWorker(form)
      setSuccess(`Worker ${form.name} created. They can log in with ${form.email}.`)
      setShowForm(false)
      setForm({ name: '', employeeId: '', email: '', password: '', phone: '', truckId: '', truckName: '', shiftStart: '20:00', shiftEnd: '04:00', wardZone: user?.wardZone || '' })
      loadWorkers()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create worker.')
    } finally { setSubmitting(false) }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-1)', outline: 'none' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '4px' }}>Fleet Management</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>Manage workers and drivers in your ward</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#071007', border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ Add Worker'}
        </button>
      </div>

      {success && <div style={{ background: 'rgba(110,232,74,0.1)', border: '1px solid rgba(110,232,74,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--accent)', fontSize: '13px', marginBottom: '16px' }}>✓ {success}</div>}

      {/* Create Worker Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>Register New Worker</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                ['Full Name', 'name', 'text', 'Rajesh Kumar'],
                ['Employee ID', 'employeeId', 'text', 'BMC-2026-001'],
                ['Email', 'email', 'email', 'rajesh@bmc.gov.in'],
                ['Password', 'password', 'password', 'Min 6 characters'],
                ['Phone', 'phone', 'tel', '9820XXXXXX'],
                ['Truck ID', 'truckId', 'text', 'LMV-4521'],
                ['Truck Name', 'truckName', 'text', 'Truck 1 — LMV-4521'],
              ].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} required placeholder={placeholder} style={inputStyle}
                    value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Shift Start</label>
                <input type="time" style={inputStyle} value={form.shiftStart}
                  onChange={e => setForm(p => ({ ...p, shiftStart: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Shift End</label>
                <input type="time" style={inputStyle} value={form.shiftEnd}
                  onChange={e => setForm(p => ({ ...p, shiftEnd: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '12px 28px', background: 'var(--accent)', color: '#071007', border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {submitting ? 'Creating...' : 'Create Worker Account'}
            </button>
          </form>
        </div>
      )}

      {/* Workers list */}
      {loading ? <p style={{ color: 'var(--text-2)' }}>Loading...</p> : workers.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', color: 'var(--text-1)' }}>No workers yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>Click "+ Add Worker" to register your first driver.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Name', 'Emp ID', 'Truck', 'Shift', 'Phone', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{w.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{w.employeeId}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{w.truckName}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{w.shiftStart}–{w.shiftEnd}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{w.phone || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500, background: w.status === 'idle' ? 'rgba(110,232,74,0.1)' : 'rgba(245,158,11,0.1)', color: w.status === 'idle' ? 'var(--accent)' : '#f59e0b' }}>
                      {w.status === 'idle' ? '● Available' : '● Assigned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
