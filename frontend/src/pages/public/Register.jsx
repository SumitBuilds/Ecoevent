import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const WARDS = [
  'A Ward — Colaba', 'B Ward — Mandvi', 'D Ward — Malabar Hill', 'E Ward — Byculla',
  'F/N Ward — Sion', 'F/S Ward — Wadala', 'G/N Ward — Dharavi', 'G/S Ward — Mahim',
  'H/E Ward — Bandra East', 'H/W Ward — Bandra West', 'K/E Ward — Andheri East',
  'K/W Ward — Andheri West', 'L Ward — Kurla', 'M/E Ward — Chembur East',
  'M/W Ward — Chembur West', 'N Ward — Ghatkopar', 'P/N Ward — Borivali',
  'P/S Ward — Kandivali', 'R/C Ward — Dahisar', 'R/N Ward — Borivali North',
  'R/S Ward — Malad', 'S Ward — Bhandup', 'T Ward — Mulund'
]

export default function Register() {
  const navigate = useNavigate()
  const { loginUser, user } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', wardZone: ''
  })
  const [role, setRole] = useState('organizer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'bmc') navigate('/bmc/overview')
      else navigate('/organizer/dashboard')
    }
  }, [user, navigate])

  const update = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    if (!form.wardZone) {
      return setError('Please select your Mumbai ward zone')
    }
    setLoading(true)
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        wardZone: form.wardZone
      })
      loginUser(res.data.token, res.data.user)
      navigate(role === 'bmc' ? '/bmc/overview' : '/organizer/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px', color: 'var(--text-1)', outline: 'none'
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 500,
    color: 'var(--text-2)', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '6px'
  }

  const toggleBtnBase = {
    flex: 1, padding: '10px', border: '1px solid var(--border)',
    fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '480px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontSize: '28px',
            fontWeight: 900, color: 'var(--accent)'
          }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px' }}>
            Join EcoEvent — manage waste responsibly
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => { setRole('organizer'); if (error) setError('') }}
            style={{
              ...toggleBtnBase,
              borderRadius: '8px 0 0 8px',
              background: role === 'organizer' ? 'var(--accent)' : 'transparent',
              color: role === 'organizer' ? '#071007' : 'var(--text-2)',
              borderColor: role === 'organizer' ? 'var(--accent)' : 'var(--border)'
            }}
          >
            🎉 Event Organizer
          </button>
          <button
            type="button"
            onClick={() => { setRole('bmc'); if (error) setError('') }}
            style={{
              ...toggleBtnBase,
              borderRadius: '0 8px 8px 0',
              background: role === 'bmc' ? '#6366f1' : 'transparent',
              color: role === 'bmc' ? '#fff' : 'var(--text-2)',
              borderColor: role === 'bmc' ? '#6366f1' : 'var(--border)'
            }}
          >
            🏛️ BMC Officer
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#ef4444'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} required placeholder="Sumit Pathak"
              value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" required
              placeholder={role === 'bmc' ? 'officer@bmc.gov.in' : 'your@email.com'}
              value={form.email} onChange={e => update('email', e.target.value)} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              {role === 'bmc' ? 'Assigned Ward Zone' : 'Event Venue Ward Zone'}
            </label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
              value={form.wardZone}
              onChange={e => update('wardZone', e.target.value)}
            >
              <option value="">Select your Mumbai ward</option>
              {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '4px' }}>
              {role === 'bmc'
                ? 'Your assigned ward — you will only see events in this ward'
                : 'The ward where you host most of your events'}
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" required placeholder="Min 6 characters"
              value={form.password} onChange={e => update('password', e.target.value)} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input style={inputStyle} type="password" required placeholder="Repeat password"
              value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(201,168,76,0.5)' : role === 'bmc' ? '#6366f1' : 'var(--accent)',
              color: role === 'bmc' ? '#fff' : '#071007',
              border: 'none', borderRadius: '50px',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating account...' : role === 'bmc' ? 'Create BMC Account' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '13px', color: 'var(--text-2)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
