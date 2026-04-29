import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workerAPI, workerJobAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [declineProof, setDeclineProof] = useState('')
  const [workerNotes, setWorkerNotes] = useState('')
  const [proofPhoto, setProofPhoto] = useState('')  // base64 string
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    workerJobAPI.getMyJobs()
      .then(res => {
        const found = res.data.jobs?.find(j => j._id === id)
        setJob(found || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAccept = async () => {
    setSubmitting(true)
    setError('')
    try {
      await workerJobAPI.accept(id)
      setSuccess('Job accepted! Head to the venue at the scheduled time.')
      setTimeout(() => navigate('/worker/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept. Try again.')
    } finally { setSubmitting(false) }
  }

  const handleDecline = async () => {
    if (declineReason.trim().length < 10) {
      setError('Please provide a detailed reason (minimum 10 characters)')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await workerJobAPI.decline(id, {
        declineReason: declineReason.trim(),
        declineProofUrl: declineProof.trim()
      })
      setSuccess('Job declined. Your supervisor has been notified.')
      setTimeout(() => navigate('/worker/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to decline. Try again.')
    } finally { setSubmitting(false) }
  }

  const handleComplete = async () => {
    if (!proofPhoto) {
      setError('Please upload a photo proof first')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await workerJobAPI.completeWithPhoto(id, { 
        workerNotes: workerNotes.trim(),
        proofPhotoBase64: proofPhoto
      })
      setSuccess('Pickup submitted with photo proof! BMC will verify.')
      setTimeout(() => navigate('/worker/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Loading job details...</div>
  )
  if (!job) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Job not found.</div>
  )

  const event = job.eventId
  const totalBins = (event?.estimatedBins?.wet || 0) + (event?.estimatedBins?.dry || 0) + (event?.estimatedBins?.recyclable || 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 24px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate('/worker/dashboard')} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ← Back to Dashboard
      </button>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 900, color: 'var(--text-1)', marginBottom: '4px' }}>
        {event?.eventName}
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '24px' }}>{event?.eventType}</p>

      {/* Toast */}
      {success && <div style={{ background: 'rgba(110,232,74,0.1)', border: '1px solid rgba(110,232,74,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--accent)', fontSize: '13px', fontWeight: 500, marginBottom: '16px', textAlign: 'center' }}>✓ {success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

      {/* Event Details */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px' }}>Event Details</h3>
        {[
          ['Date', event?.date], ['Venue', event?.venueName],
          ['Ward', event?.wardZone], ['Guests', event?.guestCount],
          ['Caterer', `${event?.catererName || '—'} ${event?.catererContact ? '· ' + event.catererContact : ''}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-2)' }}>{label}</span>
            <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{value || '—'}</span>
          </div>
        ))}
      </div>

      {/* Bin Breakdown */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px' }}>Bins to Collect</h3>
        {[
          { label: 'Wet Waste (Green)', count: event?.estimatedBins?.wet, color: 'var(--accent)' },
          { label: 'Dry Waste (Blue)', count: event?.estimatedBins?.dry, color: '#3b82f6' },
          { label: 'Recyclable (Yellow)', count: event?.estimatedBins?.recyclable, color: '#f59e0b' },
        ].map(bin => (
          <div key={bin.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-2)' }}>{bin.label}</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: bin.color }}>{bin.count || 0} bins</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-1)' }}>Total</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'Fraunces, serif', fontSize: '22px' }}>{totalBins} bins</span>
        </div>
      </div>

      {/* Action section based on status */}
      {job.workerStatus === 'pending_accept' && !showDeclineModal && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
          <button onClick={handleAccept} disabled={submitting} style={{ padding: '14px', background: 'var(--accent)', color: '#071007', border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {submitting ? 'Accepting...' : '✓ Accept Job'}
          </button>
          <button onClick={() => setShowDeclineModal(true)} style={{ padding: '14px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            ✕ Decline
          </button>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '20px', marginTop: '8px' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: '#ef4444', marginBottom: '12px' }}>Decline Job — Reason Required</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Reason (minimum 10 characters) *
            </label>
            <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3}
              placeholder="e.g. Truck breakdown — engine failure. Vehicle sent for repair."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-1)', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Proof (photo URL or description — optional but recommended)
            </label>
            <input value={declineProof} onChange={e => setDeclineProof(e.target.value)}
              placeholder="e.g. Photo URL, repair receipt number, or additional details"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-1)', outline: 'none' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '4px' }}>This will be shown to your BMC supervisor. False reasons may result in disciplinary action.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => setShowDeclineModal(false)} style={{ padding: '12px', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDecline} disabled={submitting || declineReason.trim().length < 10}
              style={{ padding: '12px', background: declineReason.trim().length < 10 ? 'rgba(239,68,68,0.3)' : '#ef4444', color: '#fff', border: 'none', borderRadius: '50px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, cursor: declineReason.trim().length < 10 ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Submitting...' : 'Submit Decline'}
            </button>
          </div>
        </div>
      )}

      {job.workerStatus === 'accepted' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '12px', padding: '20px', marginTop: '8px'
        }}>
          <h3 style={{
            fontFamily: 'Fraunces, serif', fontSize: '15px',
            fontWeight: 700, color: '#3b82f6', marginBottom: '6px'
          }}>
            Mark Pickup Complete
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '16px' }}>
            ⚠ You must upload a photo of the collected bins as proof before completing.
          </p>

          {/* PHOTO UPLOAD */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 500,
              color: 'var(--text-2)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '8px'
            }}>
              Photo Proof * (Required)
            </label>

            {/* Camera / File picker */}
            <input
              type="file"
              accept="image/*"
              id="proofPhoto"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                
                setError('') // Clear previous errors
                
                const reader = new FileReader()
                reader.onload = (ev) => {
                  const img = new Image()
                  img.src = ev.target.result
                  img.onload = () => {
                    // Maximum dimensions for the compressed image
                    const MAX_WIDTH = 1200
                    const MAX_HEIGHT = 1200
                    let width = img.width
                    let height = img.height

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                      if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                      }
                    } else {
                      if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                      }
                    }

                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas')
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)
                    
                    // Compress to lightweight JPEG (70% quality)
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
                    setProofPhoto(compressedBase64)
                  }
                }
                reader.readAsDataURL(file)
              }}
            />

            {!proofPhoto ? (
              <label htmlFor="proofPhoto" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                border: '2px dashed var(--border)', borderRadius: '10px',
                padding: '28px', cursor: 'pointer',
                background: 'var(--bg)', transition: 'border-color 0.2s'
              }}>
                <span style={{ fontSize: '28px' }}>📷</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
                  Take Photo or Upload
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                  Photo of collected bins at venue (max 5MB)
                </span>
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <img
                  src={proofPhoto}
                  alt="Proof photo"
                  style={{
                    width: '100%', maxHeight: '240px',
                    objectFit: 'cover', borderRadius: '10px',
                    border: '1px solid var(--border)'
                  }}
                />
                <button
                  onClick={() => setProofPhoto('')}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px',
                    cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
                <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px', textAlign: 'center' }}>
                  ✓ Photo ready to submit
                </p>
              </div>
            )}
          </div>

          {/* Optional notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 500,
              color: 'var(--text-2)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '6px'
            }}>
              Notes (optional)
            </label>
            <textarea
              rows={2} value={workerNotes}
              onChange={e => setWorkerNotes(e.target.value)}
              placeholder="e.g. All 6 bins collected. Area left clean."
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '8px', fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px', color: 'var(--text-1)', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          {/* Submit button — BLOCKED without photo */}
          <button
            onClick={handleComplete}
            disabled={submitting || !proofPhoto}
            style={{
              width: '100%', padding: '14px',
              background: !proofPhoto
                ? 'rgba(110,232,74,0.3)'
                : 'var(--accent)',
              color: '#071007', border: 'none', borderRadius: '50px',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: 600,
              cursor: !proofPhoto ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {submitting
              ? 'Submitting...'
              : !proofPhoto
              ? '📷 Upload photo to continue'
              : '✓ Submit Proof & Complete Pickup'}
          </button>
          {!proofPhoto && (
            <p style={{ fontSize: '11px', color: '#ef4444', textAlign: 'center', marginTop: '6px' }}>
              Photo proof is required. BMC cannot verify without it.
            </p>
          )}
          <p style={{ fontSize: '11px', color: 'var(--text-2)', textAlign: 'center', marginTop: '6px' }}>
            BMC officer will view your photo and confirm the pickup.
          </p>
        </div>
      )}

      {/* Declined state */}
      {job.workerStatus === 'declined' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>✕ You declined this job</p>
          <p style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '6px' }}>Reason: {job.declineReason}</p>
          {job.declineProofUrl && <p style={{ color: 'var(--text-2)', fontSize: '12px' }}>Proof: {job.declineProofUrl}</p>}
        </div>
      )}

      {/* Completed state */}
      {job.workerStatus === 'worker_completed' && (
        <div style={{ background: 'rgba(110,232,74,0.08)', border: '1px solid rgba(110,232,74,0.25)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px' }}>✓ You marked this pickup complete</p>
          <p style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '4px' }}>Completed: {new Date(job.completedAt).toLocaleString('en-IN')}</p>
          {job.workerNotes && <p style={{ color: 'var(--text-2)', fontSize: '12px' }}>Your notes: {job.workerNotes}</p>}
          <p style={{ color: 'var(--text-2)', fontSize: '11px', marginTop: '6px' }}>Waiting for BMC officer to confirm on their end.</p>
        </div>
      )}
    </div>
  )
}
