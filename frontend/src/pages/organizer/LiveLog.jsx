import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RiAddLine, RiDeleteBin7Line, RiHistoryLine, RiCheckLine } from 'react-icons/ri'
import { eventAPI, wasteLogAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import './LiveLog.css'

const FILL_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 0.25, label: '25%' },
  { value: 0.50, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1.00, label: '100%' },
]

const BinCard = ({ label, bins, type, colorClass, confirmed, onAdd, onUpdate, onConfirm, onRemove }) => {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 className="heading-4">{label}</h4>
          {confirmed > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
              ✓ {confirmed.toFixed(2)} bins confirmed & saved
            </span>
          )}
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); onAdd(type); }}>
          <RiAddLine /> Add Bin
        </button>
      </div>

      <div className="livelog__bins-list">
        {bins.length === 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', background: 'var(--bg-2)', borderRadius: '12px' }}>
            All bins confirmed. Click "Add Bin" if more are needed.
          </div>
        )}
        {bins.map((bin, idx) => (
          <div key={`${type}-${idx}`} className="livelog__bin-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-2)', borderRadius: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', minWidth: '40px' }}>BIN {idx + 1}</span>
            <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILL_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={`fill-btn ${colorClass} ${bin.fill === opt.value ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onUpdate(type, idx, opt.value); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button 
              type="button" 
              className="btn-confirm btn-sm" 
              title="Confirm & save this bin" 
              onClick={(e) => { e.preventDefault(); onConfirm(type, idx); }} 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              <RiCheckLine size={14} /> Confirm
            </button>
            <button 
              type="button" 
              className="btn-danger btn-sm" 
              style={{ padding: '8px' }} 
              onClick={(e) => { e.preventDefault(); onRemove(type, idx); }}
            >
              <RiDeleteBin7Line />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LiveLog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [apiError, setApiError] = useState('')

  // Multi-bin state: each bin is { fill: 0, confirmed: false }
  const [wetBins, setWetBins] = useState([{ fill: 0, confirmed: false }])
  const [dryBins, setDryBins] = useState([{ fill: 0, confirmed: false }])
  const [recBins, setRecBins] = useState([{ fill: 0, confirmed: false }])

  // Confirmed bins accumulator (removed from UI, kept for submission)
  const [confirmedData, setConfirmedData] = useState({ wet: 0, dry: 0, rec: 0 })
  
  const [bottlesUsed, setBottlesUsed] = useState('')
  const [platesUsed, setPlatesUsed] = useState('')
  const [leftoverTrays, setLeftoverTrays] = useState('')
  const [segregationStatus, setSegregationStatus] = useState('yes')

  useEffect(() => {
    if (id) {
      eventAPI.getOne(id)
        .then(res => setEvent(res.data.event))
        .catch(console.error)
    }
  }, [id])

  const handleAddBin = (type) => {
    const newBin = { fill: 0, confirmed: false }
    if (type === 'wet') setWetBins(prev => [...prev, newBin])
    if (type === 'dry') setDryBins(prev => [...prev, newBin])
    if (type === 'rec') setRecBins(prev => [...prev, newBin])
  }

  const handleRemoveBin = (type, index) => {
    if (type === 'wet') setWetBins(prev => prev.filter((_, i) => i !== index))
    if (type === 'dry') setDryBins(prev => prev.filter((_, i) => i !== index))
    if (type === 'rec') setRecBins(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateBin = (type, index, val) => {
    const updater = (prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], fill: val }
      return copy
    }
    if (type === 'wet') setWetBins(updater)
    if (type === 'dry') setDryBins(updater)
    if (type === 'rec') setRecBins(updater)
  }

  const handleConfirmBin = (type, index) => {
    let binFill = 0
    if (type === 'wet') binFill = wetBins[index].fill
    if (type === 'dry') binFill = dryBins[index].fill
    if (type === 'rec') binFill = recBins[index].fill

    if (binFill === 0) {
      setApiError('Cannot confirm a bin with 0% fill.')
      setTimeout(() => setApiError(''), 3000)
      return
    }

    if (type === 'wet') setWetBins(prev => prev.filter((_, i) => i !== index))
    if (type === 'dry') setDryBins(prev => prev.filter((_, i) => i !== index))
    if (type === 'rec') setRecBins(prev => prev.filter((_, i) => i !== index))

    setConfirmedData(prev => ({ ...prev, [type]: prev[type] + binFill }))
  }

  const confirmedCount = (type) => {
    // Count how many bins have been confirmed in each category
    const raw = confirmedData[type]
    // Each "1" = one full bin, so round to nearest bin count
    return raw
  }

  const handleSubmit = async () => {
    if (!id) return
    setApiError('')
    setSubmitting(true)
    try {
      // Sum confirmed bins + any remaining active bins for the final payload
      const payload = {
        eventId: id,

        // Fill levels MUST be decimal (0.25, 0.5, 0.75, 1.0)
        wetFill:     confirmedData.wet + wetBins.reduce((a, b) => a + b.fill, 0),
        dryFill:     confirmedData.dry + dryBins.reduce((a, b) => a + b.fill, 0),
        recycleFill: confirmedData.rec + recBins.reduce((a, b) => a + b.fill, 0),

        bottlesUsed:   Number(bottlesUsed)   || 0,
        platesUsed:    Number(platesUsed)    || 0,
        leftoverTrays: Number(leftoverTrays) || 0,

        // CRITICAL: must be lowercase
        segregationStatus: (segregationStatus || 'no').toLowerCase().trim(),
      }
      await wasteLogAPI.submit(payload)
      setToast('Waste log submitted!')
      setTimeout(() => navigate(`/organizer/report/${id}`), 1500)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to submit log.')
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <PageWrapper role="organizer">
      <div className="livelog">
        <div className="page-header page-header--flex">
          <div>
            <h1 className="heading-2">{event?.eventName || 'Loading...'}</h1>
            <p className="date" style={{ color: 'var(--accent)', fontWeight: 600 }}>LIVE EVENT LOGGING</p>
          </div>
          <div className="badge-pill">
            <RiHistoryLine /> Active Session
          </div>
        </div>

        <div className="livelog__layout">
          <div className="livelog__main">
            <BinCard 
              label="Wet Waste" 
              bins={wetBins} 
              type="wet" 
              colorClass="wet" 
              confirmed={confirmedData.wet}
              onAdd={handleAddBin}
              onUpdate={handleUpdateBin}
              onConfirm={handleConfirmBin}
              onRemove={handleRemoveBin}
            />
            <BinCard 
              label="Dry Waste" 
              bins={dryBins} 
              type="dry" 
              colorClass="dry" 
              confirmed={confirmedData.dry}
              onAdd={handleAddBin}
              onUpdate={handleUpdateBin}
              onConfirm={handleConfirmBin}
              onRemove={handleRemoveBin}
            />
            <BinCard 
              label="Recyclable" 
              bins={recBins} 
              type="rec" 
              colorClass="rec" 
              confirmed={confirmedData.rec}
              onAdd={handleAddBin}
              onUpdate={handleUpdateBin}
              onConfirm={handleConfirmBin}
              onRemove={handleRemoveBin}
            />

            <div className="card">
              <h4 className="heading-4" style={{ marginBottom: '20px' }}>Item Consumption</h4>
              <div className="grid-2">
                <div>
                  <label>Bottles Used (Number)</label>
                  <input type="number" value={bottlesUsed} onChange={e => setBottlesUsed(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label>Plates Used (Number)</label>
                  <input type="number" value={platesUsed} onChange={e => setPlatesUsed(e.target.value)} placeholder="0" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Leftover Trays (Number)</label>
                  <input type="number" value={leftoverTrays} onChange={e => setLeftoverTrays(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="livelog__sidebar">
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h4 className="heading-4" style={{ marginBottom: '16px' }}>Finalize Log</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label>Waste Segregated?</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {['yes', 'partial', 'no'].map(st => (
                    <button
                      type="button"
                      key={st}
                      className={`radio-pill ${segregationStatus === st ? 'active' : ''}`}
                      onClick={() => setSegregationStatus(st)}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary of confirmed bins */}
              {(confirmedData.wet > 0 || confirmedData.dry > 0 || confirmedData.rec > 0) && (
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(201,168,76,0.08)', borderRadius: '10px', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed Bins</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.8' }}>
                    <div>Wet: <strong>{confirmedData.wet.toFixed(2)}</strong></div>
                    <div>Dry: <strong>{confirmedData.dry.toFixed(2)}</strong></div>
                    <div>Recyclable: <strong>{confirmedData.rec.toFixed(2)}</strong></div>
                  </div>
                </div>
              )}

              {apiError && <div className="status-badge red" style={{ width: '100%', marginBottom: '12px' }}>{apiError}</div>}
              {toast && <div className="status-badge green" style={{ width: '100%', marginBottom: '12px' }}>{toast}</div>}

              <button type="button" className="btn-primary btn-full" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Sending Data...' : 'Submit Final Report'}
              </button>
              
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-3)', textAlign: 'center' }}>
                Warning: Submitted logs cannot be edited later. Check all bin levels carefully.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
