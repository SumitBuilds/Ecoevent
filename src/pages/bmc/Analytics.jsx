import { useState, useEffect } from 'react'
import { bmcAPI } from '../../services/api'
import PageWrapper from '../../components/shared/PageWrapper'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import './Analytics.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bmcAPI.getAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageWrapper role="bmc">
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
        Loading analytics...
      </div>
    </PageWrapper>
  )

  const eventTypeData = {
    labels: Object.keys(analytics?.byType || {}),
    datasets: [{
      label: 'Events by Type',
      data: Object.values(analytics?.byType || {}),
      backgroundColor: [
        'rgba(201,168,76,0.6)', 
        'rgba(59,130,246,0.6)',
        'rgba(245,158,11,0.6)', 
        'rgba(239,68,68,0.6)'
      ],
      borderRadius: 8
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    }
  }

  return (
    <PageWrapper role="bmc">
      <div className="analytics">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <h1 className="heading-2">Ward Analytics</h1>
          <p className="date" style={{ color: 'var(--text-3)' }}>Aggregated insights and performance metrics for your jurisdiction.</p>
        </div>

        <div className="grid-3" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>Total Events</p>
            <h2 style={{ fontSize: '32px', margin: 0, color: 'var(--accent)' }}>{analytics?.totalEvents || 0}</h2>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>Average Compliance</p>
            <h2 style={{ fontSize: '32px', margin: 0, color: '#f59e0b' }}>{analytics?.avgScore || 0}/100</h2>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>Audit Participation</p>
            <h2 style={{ fontSize: '32px', margin: 0, color: 'rgba(59,130,246,1)' }}>{analytics?.logsSubmitted || 0} Logs</h2>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h4 className="heading-4" style={{ marginBottom: '20px' }}>Event Distribution</h4>
            <Bar data={eventTypeData} options={chartOptions} />
          </div>
          <div className="card">
            <h4 className="heading-4" style={{ marginBottom: '20px' }}>Operational Insights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-2)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  <strong>{analytics?.byType?.wedding || 0} Weddings</strong> tracked this period. 
                  High-volume waste streams identified in commercial zones.
                </p>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-2)', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Compliance rate is <strong>{(analytics?.avgScore > 60 ? 'Healthy' : 'Needs Attention')}</strong>. 
                  Audit logs indicate 100% participation in {analytics?.wardName || 'your ward'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
