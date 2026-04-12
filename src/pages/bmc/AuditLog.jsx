import { useState, useEffect } from 'react'
import { bmcAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import './AuditLog.css'

export default function AuditLog() {
  const [auditData, setAuditData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bmcAPI.getAudit()
      .then(res => setAuditData(res.data.audit))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper role="bmc">
      <div className="audit">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <h1 className="heading-2">Audit Log</h1>
          <p className="date" style={{ color: 'var(--text-3)' }}>Official records of event compliance and waste diversion across the ward.</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Organizer</th>
                <th>Segregation</th>
                <th>Score</th>
                <th>Log</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)' }}>
                  Loading audit data...
                </td></tr>
              ) : auditData.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)' }}>
                  No completed events found in the audit log
                </td></tr>
              ) : (
                auditData.map(({ event, wasteLog, pickupSlot }) => (
                  <tr key={event._id}>
                    <td style={{ fontWeight: 500 }}>{event.eventName}</td>
                    <td>{event.date}</td>
                    <td>{event.organizerId?.name || '—'}</td>
                    <td>
                      {wasteLog ? (
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                          background: wasteLog.segregationStatus === 'yes' ? 'rgba(201,168,76,0.1)'
                            : wasteLog.segregationStatus === 'partial' ? 'rgba(245,158,11,0.1)'
                            : 'rgba(239,68,68,0.1)',
                          color: wasteLog.segregationStatus === 'yes' ? 'var(--accent)'
                            : wasteLog.segregationStatus === 'partial' ? '#f59e0b'
                            : '#ef4444'
                        }}>
                          {wasteLog.segregationStatus === 'yes' ? '● Yes'
                            : wasteLog.segregationStatus === 'partial' ? '● Partial'
                            : '● No'}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{
                      fontWeight: 700, fontSize: '15px',
                      color: !wasteLog ? 'var(--text-2)'
                        : wasteLog.score >= 60 ? 'var(--accent)'
                        : wasteLog.score >= 40 ? '#f59e0b' : '#ef4444'
                    }}>
                      {wasteLog?.score ?? '—'}
                    </td>
                    <td>{wasteLog ? '✓' : '—'}</td>
                    <td>{event.status === 'completed' ? '✓' : '—'}</td>
                    <td>
                      <button
                        style={{
                          padding: '4px 12px', borderRadius: '12px', fontSize: '11px',
                          border: '1px solid rgba(239,68,68,0.3)', background: 'transparent',
                          color: '#ef4444', cursor: 'pointer'
                        }}
                        onClick={() => alert(`Event ${event.eventName} flagged for non-compliance auditing.`)}
                      >
                        ⚑ Flag
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
