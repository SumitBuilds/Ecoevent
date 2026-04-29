import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { loginUser, user } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect away automatically
  React.useEffect(() => {
    const worker = localStorage.getItem('ecoevent_worker');
    if (worker) {
      navigate('/worker/dashboard');
      return;
    }

    if (user) {
      if (user.role === 'bmc') navigate('/bmc/overview')
      else navigate('/organizer/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      loginUser(res.data.token, res.data.user)

      // Route based on role
      if (res.data.user.role === 'bmc') {
        navigate('/bmc/overview')
      } else {
        navigate('/organizer/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
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

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontSize: '28px',
            fontWeight: 900, color: 'var(--accent)'
          }}>Segregacy</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px' }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => {
                setForm(p => ({ ...p, email: e.target.value }));
                if (error) setError('');
              }}
              style={inputStyle}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => {
                setForm(p => ({ ...p, password: e.target.value }));
                if (error) setError('');
              }}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(201,168,76,0.5)' : 'var(--accent)',
              color: '#071007', border: 'none', borderRadius: '50px',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '13px', color: 'var(--text-2)'
        }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>

        <div style={{
          marginTop: '24px', paddingTop: '24px',
          borderTop: '1px solid var(--border)', textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Looking for the field portal?
          </p>
          <Link 
            to="/worker/login" 
            style={{ 
              display: 'inline-block', padding: '8px 20px',
              border: '1px solid var(--border)', borderRadius: '50px',
              color: 'var(--text-2)', fontSize: '12px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.target.style.background = 'var(--bg)'}
            onMouseOut={e => e.target.style.background = 'transparent'}
          >
            Worker / Driver Portal →
          </Link>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '11px', color: 'var(--text-3)'
        }}>
          Organizer and BMC accounts use the main login above.
        </p>
      </div>
    </div>
  )
}
