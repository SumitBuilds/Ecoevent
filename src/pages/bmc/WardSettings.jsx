import { useState, useEffect } from 'react'
import PageWrapper from '../../components/shared/PageWrapper'
import {
  RiMapPinLine, RiTruckLine, RiTimeLine, RiUserLine,
  RiPhoneLine, RiMailLine, RiSaveLine, RiShieldCheckLine,
  RiBuilding2Line, RiCheckboxCircleLine
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'

const MUMBAI_WARDS = [
  'A Ward — Colaba', 'B Ward — Mandvi', 'C Ward — Masjid Bunder',
  'D Ward — Malabar Hill', 'E Ward — Byculla', 'F/N Ward — Sion',
  'F/S Ward — Wadala', 'G/N Ward — Dharavi', 'G/S Ward — Mahim',
  'H/E Ward — Bandra East', 'H/W Ward — Bandra West',
  'K/E Ward — Andheri East', 'K/W Ward — Andheri West',
  'L Ward — Kurla', 'M/E Ward — Chembur East', 'M/W Ward — Chembur West',
  'N Ward — Ghatkopar', 'P/N Ward — Borivali', 'P/S Ward — Kandivali',
  'R/C Ward — Dahisar', 'R/N Ward — Borivali North',
  'R/S Ward — Malad', 'S Ward — Bhandup', 'T Ward — Mulund',
]

const DESIGNATIONS = [
  'Head Supervisor',
  'Assistant Head Supervisor (AHS)',
  'Assistant Engineer (SWM)',
  'Junior Engineer (SWM)',
  'Ward Officer',
]

export default function WardSettings() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    officerName: user?.name || 'Dhiraj Jadhwani',
    designation: 'Head Supervisor',
    wardZone: user?.wardZone || 'M/E Ward — Chembur East',
    email: user?.email || 'swm.chembur@mcgm.gov.in',
    phone: '022-26532145',
    trucks: '3',
    truck1: 'Truck 1 — LMV-4521',
    truck2: 'Truck 2 — LMV-4522',
    truck3: 'Truck 3 — LMV-4523',
    pickupStart: '22:00',
    pickupEnd: '02:00',
    dailyCapacity: '450',
    supervisorName: 'A.K. Sharma',
    supervisorEmail: 'ae.swm.chembur@mcgm.gov.in',
    reportFrequency: 'Monthly',
    emergencyDesk: '022-26532145',
    cutoffTime: '18:00',
  })

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('wardSettings') || '{}')
    if (Object.keys(savedData).length > 0) {
      setForm(prev => ({ ...prev, ...savedData }))
    } else if (user) {
      // If no local storage but we have a user, ensure form reflects user
      setForm(prev => ({
        ...prev,
        officerName: user.name,
        email: user.email,
        wardZone: user.wardZone || prev.wardZone
      }))
    }
  }, [user])

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    localStorage.setItem('wardSettings', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <PageWrapper role="bmc">
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '4px' }}>
          Ward Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>
          Configure your ward details, fleet, and reporting preferences
        </p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div style={{
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--accent)', fontSize: '13px', fontWeight: 500
        }}>
          <RiCheckboxCircleLine size={16} />
          Settings saved successfully
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(380px, 1fr)', gap: '32px', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Card 1 — Officer Details */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiUserLine size={16} color='var(--accent)' />
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                Officer Details
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Full Name" icon={<RiUserLine size={13} />}>
                <input value={form.officerName} onChange={e => update('officerName', e.target.value)} />
              </Field>
              <Field label="Designation">
                <select value={form.designation} onChange={e => update('designation', e.target.value)}>
                  {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Ward / Zone" icon={<RiMapPinLine size={13} />}>
                <select value={form.wardZone} onChange={e => update('wardZone', e.target.value)}>
                  {MUMBAI_WARDS.map(w => <option key={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Emergency Desk" icon={<RiPhoneLine size={13} />}>
                <input value={form.emergencyDesk} onChange={e => update('emergencyDesk', e.target.value)} />
              </Field>
              <Field label="Email" icon={<RiMailLine size={13} />}>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={e => update('phone', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Card 2 — Fleet Configuration */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiTruckLine size={16} color='var(--accent)' />
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                Fleet Configuration
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Field label="Active Trucks">
                <input type="number" min="1" max="20" value={form.trucks} onChange={e => update('trucks', e.target.value)} />
              </Field>
              <Field label="Daily Capacity (Tons)">
                <input type="number" value={form.dailyCapacity} onChange={e => update('dailyCapacity', e.target.value)} />
              </Field>
              <Field label="Same-Day Cutoff" icon={<RiTimeLine size={13} />}>
                <input type="time" value={form.cutoffTime} onChange={e => update('cutoffTime', e.target.value)} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Field label="Default Pickup Start">
                <input type="time" value={form.pickupStart} onChange={e => update('pickupStart', e.target.value)} />
              </Field>
              <Field label="Default Pickup End">
                <input type="time" value={form.pickupEnd} onChange={e => update('pickupEnd', e.target.value)} />
              </Field>
            </div>

            <div style={{ marginTop: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Truck Names (shown in Pickup Scheduler)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['truck1', 'truck2', 'truck3'].map((key, i) => (
                  <input
                    key={key}
                    value={form[key]}
                    onChange={e => update(key, e.target.value)}
                    placeholder={`Truck ${i + 1} name / registration`}
                    style={inputStyle}
                  />
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '6px' }}>
                These truck names appear as options when assigning pickup slots in the Scheduler.
              </p>
            </div>
          </div>

          {/* Card 3 — Supervisor Report Settings */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiShieldCheckLine size={16} color='var(--accent)' />
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                Supervisor Report Settings
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Supervisor Name">
                <input value={form.supervisorName} onChange={e => update('supervisorName', e.target.value)} />
              </Field>
              <Field label="Supervisor Email" icon={<RiMailLine size={13} />}>
                <input type="email" value={form.supervisorEmail} onChange={e => update('supervisorEmail', e.target.value)} />
              </Field>
              <Field label="Report Frequency">
                <select value={form.reportFrequency} onChange={e => update('reportFrequency', e.target.value)}>
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Fortnightly</option>
                </select>
              </Field>
              <Field label="Auto-generate On">
                <select>
                  <option>1st of every month</option>
                  <option>Every Monday</option>
                  <option>Manually only</option>
                </select>
              </Field>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '10px' }}>
              When you click "Submit to Supervisor" in the Audit Log, the compliance report is sent to this email.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

          {/* Summary Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RiBuilding2Line size={16} color='var(--accent)' />
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                Ward Summary
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Ward', value: form.wardZone },
                { label: 'Officer', value: form.officerName },
                { label: 'Designation', value: form.designation },
                { label: 'Active Trucks', value: `${form.trucks} vehicles` },
                { label: 'Daily Capacity', value: `${form.dailyCapacity} tons` },
                { label: 'Pickup Window', value: `${form.pickupStart} – ${form.pickupEnd}` },
                { label: 'Cutoff Time', value: form.cutoffTime },
                { label: 'Supervisor', value: form.supervisorName },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-2)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 500, textAlign: 'right', maxWidth: '180px', wordBreak: 'break-word' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              This Month
            </p>
            {[
              { label: 'Events handled', value: '12' },
              { label: 'Bins collected', value: '67' },
              { label: 'Compliance rate', value: '83%' },
              { label: 'Reports submitted', value: '1' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-2)' }}>{s.label}</span>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--accent)', fontSize: '16px' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              background: 'var(--accent)', color: '#071007', border: 'none',
              borderRadius: '50px', padding: '14px 24px', fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            <RiSaveLine size={16} />
            Save Configuration
          </button>

        </div>
      </div>
    </div>
    </PageWrapper>
  )
}

// Reusable Field component — label + input wrapper
const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px', color: 'var(--text-1)', outline: 'none',
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label style={{
        fontSize: '11px', fontWeight: 500, color: 'var(--text-2)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px'
      }}>
        {icon} {label}
      </label>
      {children && (() => {
        const child = children
        const type = child.type
        const sharedStyle = inputStyle
        if (type === 'input' || type === 'select' || type === 'textarea') {
          return <child.type {...child.props} style={{ ...sharedStyle, ...child.props.style }} />
        }
        return child
      })()}
    </div>
  )
}