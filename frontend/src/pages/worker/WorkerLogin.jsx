import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { workerAPI } from '../../services/api'

export default function WorkerLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await workerAPI.login(form)
      localStorage.setItem('ecoevent_worker_token', res.data.token)
      localStorage.setItem('ecoevent_worker', JSON.stringify(res.data.worker))
      navigate('/worker/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px', color: 'var(--text-1)', outline: 'none'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>
            Segregacy
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px' }}>
            Worker / Driver Portal
          </p>
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
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Email
            </label>
            <input type="email" required style={inputStyle}
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Password
            </label>
            <input type="password" required style={inputStyle}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: loading ? 'rgba(110,232,74,0.5)' : 'var(--accent)',
            color: '#071007', border: 'none', borderRadius: '50px',
            fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Signing in...' : 'Sign In as Worker'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-2)' }}>
          Your account is created by your BMC supervisor.
        </p>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-3)', fontSize: '12px', textDecoration: 'none' }}>
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  )
}
