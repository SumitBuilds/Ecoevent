import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'

const MUMBAI_WARDS = [
  'M/E Ward — Chembur East', 'M/W Ward — Chembur West',
  'L Ward — Kurla', 'N Ward — Ghatkopar',
  'K/E Ward — Andheri East', 'K/W Ward — Andheri West',
  'P/N Ward — Borivali', 'P/S Ward — Kandivali',
  'H/E Ward — Bandra East', 'H/W Ward — Bandra West',
  'G/N Ward — Dharavi', 'G/S Ward — Mahim',
  'T Ward — Mulund', 'S Ward — Bhandup',
  'R/C Ward — Dahisar', 'A Ward — Colaba',
  'B Ward — Mandvi', 'D Ward — Malabar Hill',
  'E Ward — Byculla', 'F/N Ward — Sion',
  'F/S Ward — Wadala', 'R/S Ward — Malad', 'Other'
]

export default function Profile() {
  const { user, loginUser } = useAuth()
  const [wardZone, setWardZone] = useState(user?.wardZone || '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!wardZone) return setError('Please select a ward zone')
    try {
      const res = await authAPI.updateWard(wardZone)
      const updatedUser = res.data.user
      loginUser(localStorage.getItem('segregacy_token'), updatedUser)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to update. Try again.')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px', color: 'var(--text-1)', outline: 'none'
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '500px' }}>
      <h1 style={{
        fontFamily: 'Fraunces, serif', fontSize: '28px',
        fontWeight: 900, color: 'var(--text-1)', marginBottom: '4px'
      }}>My Profile</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '24px' }}>
        Update your details
      </p>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '20px'
      }}>
        {/* Read-only info */}
        {[
          { label: 'Name', value: user?.name },
          { label: 'Email', value: user?.email },
          { label: 'Role', value: user?.role === 'bmc' ? 'BMC Officer' : 'Event Organizer' },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 500,
              color: 'var(--text-2)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '6px'
            }}>{row.label}</label>
            <div style={{
              padding: '10px 14px', background: 'var(--bg)',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', color: 'var(--text-2)'
            }}>{row.value}</div>
          </div>
        ))}

        {/* Editable wardZone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: 500,
            color: 'var(--text-2)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '6px'
          }}>Ward Zone</label>
          <select style={inputStyle} value={wardZone} onChange={e => setWardZone(e.target.value)}>
            <option value="">Select ward</option>
            {MUMBAI_WARDS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>
            ⚠ This must match the BMC officer's ward for events to appear in BMC portal
          </p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{
            background: 'rgba(110,232,74,0.1)',
            border: '1px solid rgba(110,232,74,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '12px',
            color: 'var(--accent)', fontSize: '13px'
          }}>
            ✓ Ward zone updated successfully
          </div>
        )}

        <button
          onClick={handleSave}
          style={{
            background: 'var(--accent)', color: '#071007', border: 'none',
            borderRadius: '50px', padding: '12px 24px', width: '100%',
            fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
