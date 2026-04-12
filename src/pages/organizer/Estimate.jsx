import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/shared/PageWrapper';
import WasteBinCard from '../../components/shared/WasteBinCard';
import Badge from '../../components/shared/Badge';
import { RiCheckLine, RiTimeLine, RiLightbulbLine, RiRefreshLine, RiTruckLine } from 'react-icons/ri';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { eventAPI } from '../../services/api';
import { estimateWaste } from '../../utils/wasteEstimator';
import './Estimate.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const donutOpts = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#a8c5a0', font: { family: 'DM Sans', size: 12 }, padding: 16 },
    },
  },
  cutout: '65%',
};

export default function Estimate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [eventData, setEventData] = useState(null);
  const [slotData, setSlotData] = useState(null);
  const [eventId] = useState(id || location.state?.eventId || null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvent = useCallback(() => {
    if (!eventId) { setLoading(false); return; }
    eventAPI.getOne(eventId)
      .then(res => {
        const e = res.data.event;
        const slot = res.data.pickupSlot;
        if (!e) throw new Error("Event not found");
        
        setSlotData(slot);
        setEventData({
          name: e.eventName, type: e.eventType, guests: e.guestCount,
          date: e.date, startTime: e.startTime, endTime: e.endTime, pickupTimeRange: e.pickupTimeRange, 
          duration: e.durationHours, cateringStyle: e.cateringStyle,
          plateType: e.plateType, decorTypes: e.decorTypes,
          caterer: e.catererName, decorator: e.decoratorName,
          wetWaste: e.estimatedBins?.wet * 45 || 0,
          dryWaste: e.estimatedBins?.dry * 22 || 0,
          recyclableWaste: e.estimatedBins?.recyclable * 15 || 0,
          wetBins: e.estimatedBins?.wet || 0,
          dryBins: e.estimatedBins?.dry || 0,
          recyclableBins: e.estimatedBins?.recyclable || 0,
          totalBins: (e.estimatedBins?.wet || 0) + (e.estimatedBins?.dry || 0) + (e.estimatedBins?.recyclable || 0)
        });
      })
      .catch(err => console.error("Estimate fetch error:", err))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  // Auto-refresh every 15 seconds to check pickup status update
  useEffect(() => {
    if (!eventId) return;
    const interval = setInterval(() => { fetchEvent(); }, 15000);
    return () => clearInterval(interval);
  }, [eventId, fetchEvent]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvent();
  };

  const est = useMemo(() => {
    if (!eventData) return null;
    return location.state?.prediction || estimateWaste({
      guestCount: eventData.guests,
      cateringStyle: eventData.cateringStyle,
      plateType: eventData.plateType,
      decorTypes: eventData.decorTypes
    });
  }, [eventData, location.state]);

  const donutData = useMemo(() => {
    if (!est) return null;
    return {
      labels: [
        `Wet Waste (${est.wetWaste} kg)`,
        `Dry Waste (${est.dryWaste} kg)`,
        `Recyclable (${est.recyclableWaste} kg)`
      ],
      datasets: [{
        data: [est.wetWaste, est.dryWaste, est.recyclableWaste],
        backgroundColor: ['#4caf50', '#ffc107', '#2196f3'],
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 4,
        borderRadius: 4,
      }],
    };
  }, [est]);

  const isConfirmed = slotData?.status === 'confirmed'
  const isCompleted = slotData?.status === 'completed'

  return (
    <PageWrapper role="organizer">
      {loading ? (
        <div style={{padding:'60px', textAlign:'center'}}>Loading estimation...</div>
      ) : (!eventData || !est) ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '40px' }}>
            <h2 className="heading-2">No Event Selected</h2>
            <button className="btn-primary" onClick={() => navigate('/organizer/register')}>Register Event</button>
          </div>
        </div>
      ) : (
        <div className="estimate">
          <div className="page-header">
            <h1 className="heading-2">Waste Estimate</h1>
            <p className="date">{eventData.name} · {eventData.date}</p>
          </div>

          <div className="estimate__grid">
            <div className="estimate__left">
              <div className="card" style={{ marginBottom: '20px' }}>
                <h4 className="heading-4">Event Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item"><span>Event</span><span>{eventData.name}</span></div>
                  <div className="summary-item" style={{ gridColumn: '1 / -1' }}><span>Timings</span><span>{eventData.startTime || 'TBD'} to {eventData.endTime || 'TBD'}</span></div>
                  <div className="summary-item" style={{ gridColumn: '1 / -1' }}><span>Requested Pickup</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{eventData.pickupTimeRange || 'Any time post-event'}</span></div>
                  <div className="summary-item"><span>Guests</span><span>{eventData.guests}</span></div>
                  <div className="summary-item"><span>Catering</span><span>{eventData.cateringStyle}</span></div>
                  <div className="summary-item"><span>Plates</span><span>{eventData.plateType}</span></div>
                  <div className="summary-item"><span>Décor</span><span>{eventData.decorTypes?.join(', ') || 'None'}</span></div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <h4 className="heading-4">🗑️ Bin Requirement</h4>
                <div className="bins-grid">
                  <WasteBinCard type="wet" bins={eventData.wetBins} size="120L" />
                  <WasteBinCard type="dry" bins={eventData.dryBins} size="120L" />
                  <WasteBinCard type="recyclable" bins={eventData.recyclableBins} size="60L" />
                </div>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Total: {eventData.totalBins} bins</span>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 className="heading-4">BMC & Pickup Status</h4>
                  <button 
                    type="button"
                    onClick={handleRefresh} 
                    style={{ 
                      background: 'none', border: '1px solid var(--border)', borderRadius: '8px', 
                      padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', color: 'var(--text-2)', fontWeight: 500
                    }}
                  >
                    <RiRefreshLine size={14} className={refreshing ? 'spin' : ''} /> Refresh
                  </button>
                </div>

                {isCompleted ? (
                  <div style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '10px', padding: '16px'
                  }}>
                    <p style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                      ✓ Pickup Completed
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                      Waste has been collected. Event lifecycle complete.
                    </p>
                  </div>
                ) : isConfirmed ? (
                  <div style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '10px', padding: '16px'
                  }}>
                    <p style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '8px', fontSize: '14px' }}>
                      ✓ Pickup Confirmed by BMC
                    </p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RiTruckLine size={14} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                          <strong>{slotData.truckId || 'Assigned'}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RiTimeLine size={14} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                          <strong>{slotData.scheduledTime || 'Scheduled'}</strong>
                        </span>
                      </div>
                    </div>
                    {slotData.confirmedAt && (
                      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>
                        Confirmed on {new Date(slotData.confirmedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(245,158,11,0.1)',
                    borderRadius: '10px', padding: '16px'
                  }}>
                    <p style={{ fontWeight: 600, color: '#f59e0b' }}>
                      ⏳ BMC Notified — Awaiting confirmation
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
                      Your ward's BMC officer has been notified. This page auto-refreshes every 15 seconds.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="estimate__right">
              <div className="card" style={{ marginBottom: '20px' }}>
                <h4 className="heading-4">Waste Distribution</h4>
                <Doughnut data={donutData} options={donutOpts} />
              </div>

              <div className="card">
                <h4 className="heading-4"><RiLightbulbLine color="var(--amber)" /> Smart Tips</h4>
                <div className="tips-list">
                  {est.tips.map((tip, idx) => (
                    <div className="tip-item" key={idx}>✨ {tip}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button className="btn-primary btn-lg" onClick={() => navigate(`/organizer/live-log/${eventId}`, { state: { form: eventData, prediction: est, eventId } })}>
              Start Live Event Logging
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
