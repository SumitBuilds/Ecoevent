import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventAPI, wasteLogAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import { RiDownloadLine } from 'react-icons/ri'
import './Report.css'

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [wasteLog, setWasteLog] = useState(null)
  const [pickupSlot, setPickupSlot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      Promise.all([
        eventAPI.getOne(id),
        wasteLogAPI.getOne(id)
      ])
      .then(([eventRes, logRes]) => {
        setEvent(eventRes.data.event)
        setPickupSlot(eventRes.data.pickupSlot)
        setWasteLog(logRes.data.log)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <PageWrapper role="organizer">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        Loading report...
      </div>
    </PageWrapper>
  )

  if (!wasteLog) return (
    <PageWrapper role="organizer">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        <h2 className="heading-2">No waste log found for this event.</h2>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate(`/organizer/live-log/${id}`)}>
          Submit log first
        </button>
      </div>
    </PageWrapper>
  )

  // Score
  const score = wasteLog?.score || 0
  const breakdown = wasteLog?.scoreBreakdown || {
    segregation: 0,
    plates: 0,
    decor: 0,
    accuracy: 0
  }

  // Score grade
  const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor'
  const gradeColor = score >= 80 ? 'var(--accent)' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444'

  // Metrics
  const actualBins = (Number(wasteLog?.wetFill) || 0)
    + (Number(wasteLog?.dryFill) || 0)
    + (Number(wasteLog?.recycleFill) || 0)
  const estimatedTotal = (event?.estimatedBins?.wet || 0)
    + (event?.estimatedBins?.dry || 0)
    + (event?.estimatedBins?.recyclable || 0)

  const segregationRate = wasteLog?.segregationStatus === 'yes' ? '100%'
    : wasteLog?.segregationStatus === 'partial' ? '50%' : '0%'

  const breakdownCards = [
    { label: 'Segregation', points: breakdown.segregation, max: 40 },
    { label: 'Plate Type', points: breakdown.plates, max: 20 },
    { label: 'No Thermocol', points: breakdown.decor, max: 15 },
    { label: 'Accuracy (Est vs Actual)', points: breakdown.accuracy, max: 25 },
  ]

  return (
    <PageWrapper role="organizer">
      <div className="report" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="page-header">
           <h1 className="heading-2">{event?.eventName}</h1>
           <p className="date">{event?.date} · {event?.guestCount} Guests</p>
        </div>

        <div className="report__score-section card">
          <div className="score-circle" style={{ borderColor: gradeColor }}>
            <div className="score-value" style={{ color: gradeColor }}>{score}</div>
            <div className="score-label">Sustainability Score</div>
          </div>
          <div className="grade-badge" style={{ backgroundColor: gradeColor }}>{grade}</div>
        </div>

        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Segregation Rate</div>
            <div className="stat-val" style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: 700 }}>{segregationRate}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Bins Diverted</div>
            <div className="stat-val" style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: 700 }}>{actualBins} of {estimatedTotal}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Eco Score</div>
            <div className="stat-val" style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: 700 }}>{score}/100</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-label">Grade</div>
            <div className="stat-val" style={{ color: gradeColor, fontSize: '24px', fontWeight: 700 }}>{grade}</div>
          </div>
        </div>

        <div className="report__grid" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          <div className="report__left">
            <div className="card">
              <h4 className="heading-4">Actual vs Estimated Comparison</h4>
              <table className="analysis-table" style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Category</th>
                    <th style={{ padding: '12px 8px' }}>Estimated</th>
                    <th style={{ padding: '12px 8px' }}>Actual Status</th>
                    <th style={{ padding: '12px 8px' }}>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 8px' }}>Wet Bins</td>
                    <td style={{ padding: '12px 8px' }}>{event?.estimatedBins?.wet} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.wetFill || 0} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.wetFill <= (event?.estimatedBins?.wet || 0) ? '✓ On track' : '⚠ Over'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 8px' }}>Dry Bins</td>
                    <td style={{ padding: '12px 8px' }}>{event?.estimatedBins?.dry} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.dryFill || 0} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.dryFill <= (event?.estimatedBins?.dry || 0) ? '✓ On track' : '⚠ Over'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 8px' }}>Recyclable Bins</td>
                    <td style={{ padding: '12px 8px' }}>{event?.estimatedBins?.recyclable} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.recycleFill || 0} bins</td>
                    <td style={{ padding: '12px 8px' }}>{wasteLog?.recycleFill <= (event?.estimatedBins?.recyclable || 0) ? '✓ On track' : '⚠ Over'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="report__right">
            <div className="card">
              <h4 className="heading-4">Score Breakdown</h4>
              <div style={{ marginTop: '15px' }}>
                {breakdownCards.map(card => (
                  <div key={card.label} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span>{card.label}</span>
                      <span>{card.points}/{card.max}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-2)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(card.points / card.max) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={() => navigate(`/organizer/certificate/${id}`)} className="btn-primary">
            <RiDownloadLine size={16} /> Download Certificate
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
