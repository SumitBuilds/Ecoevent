import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { eventAPI, wasteLogAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/shared/PageWrapper'
import './Certificate.css'

export default function Certificate() {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [wasteLog, setWasteLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      Promise.all([
        eventAPI.getOne(id),
        wasteLogAPI.getOne(id)
      ])
      .then(([eventRes, logRes]) => {
        setEvent(eventRes.data.event)
        setWasteLog(logRes.data.log)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <PageWrapper role="organizer">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        Generating certificate...
      </div>
    </PageWrapper>
  )

  const handlePrint = () => window.print()

  const handleShare = () => {
    const text = `I just earned a Green Certificate from EcoEvent! My event "${event?.eventName}" scored ${wasteLog?.score}/100 for sustainable waste management. 🌱 #EcoEvent #SDG12`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const divertedBins = (event?.estimatedBins?.wet || 0) +
    (event?.estimatedBins?.dry || 0) +
    (event?.estimatedBins?.recyclable || 0)

  return (
    <PageWrapper role="organizer">
      <div className="cert-page">
        <div className="cert-container">
          <div className="cert-card" id="certificate">
            <div className="cert-header">
              <span className="cert-brand">EcoEvent</span>
            </div>

            <h2 className="cert-title">Certificate of Achievement</h2>
            <p className="cert-subtitle">FOR SUSTAINABLE WASTE MANAGEMENT</p>
            
            <div className="cert-body">
              <p className="cert-to">This certificate is proudly presented to</p>
              <h3 className="cert-organizer-name" style={{ 
                fontSize: '2.5rem', 
                fontFamily: 'Cormorant Garamond, serif', 
                fontStyle: 'italic',
                color: 'var(--accent)',
                margin: '20px 0'
              }}>
                {user?.name || 'Event Organizer'}
              </h3>
              
              <p className="cert-for">for successfully managing waste at</p>
              <h4 className="cert-event-name" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '5px' }}>
                {event?.eventName}
              </h4>
              <p className="cert-event-date">{event?.date}</p>

              <div className="cert-score-wrap" style={{ margin: '30px 0' }}>
                <div className="cert-score-large" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {wasteLog?.score || 0}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Sustainability Score
                </p>
              </div>

              <p className="cert-impact" style={{ maxWidth: '80%', margin: '0 auto', fontSize: '14px', lineHeight: 1.6 }}>
                This event diverted <strong>{divertedBins} bins</strong> of waste from Mumbai's landfills, 
                contributing significantly to Sustainable Development Goal 12.
              </p>
            </div>

            <div className="cert-footer" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="cert-date">
                <p style={{ fontSize: '10px', color: 'var(--text-3)' }}>ISSUED ON</p>
                <p style={{ fontWeight: 600 }}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="cert-verified">
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Verified by EcoEvent ✓</p>
              </div>
            </div>
          </div>

          <div className="cert-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handlePrint}>Print Certificate</button>
            <button className="btn-ghost" onClick={handleShare}>Share on WhatsApp</button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
