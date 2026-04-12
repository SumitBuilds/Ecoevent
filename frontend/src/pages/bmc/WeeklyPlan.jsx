import { useState, useEffect } from 'react';
import PageWrapper from '../../components/shared/PageWrapper';
import Badge from '../../components/shared/Badge';
import { bmcAPI } from '../../services/api';
import { RiDownloadLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function WeeklyPlan() {
  const [events, setEvents] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [weekStart, setWeekStart] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bmcAPI.getEvents()
      .then(res => setEvents(res.data.events))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let curr = new Date(weekStart);
    let first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    let monday = new Date(curr.setDate(first));
    
    let days = [];
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (let i = 0; i < 7; i++) {
      let next = new Date(monday);
      next.setDate(monday.getDate() + i);
      let yyyy = next.getFullYear();
      let mm = String(next.getMonth() + 1).padStart(2, '0');
      let dd = String(next.getDate()).padStart(2, '0');
      
      days.push({
        day: names[i],
        date: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isoDate: `${yyyy}-${mm}-${dd}`
      });
    }
    setWeekDays(days);
  }, [weekStart]);

  const changeWeek = (offset) => {
    setWeekStart(prev => {
      let next = new Date(prev);
      next.setDate(prev.getDate() + (offset * 7));
      return next;
    });
  };

  const grouped = {};
  weekDays.forEach(d => { grouped[d.day] = []; });
  
  // Filter events logically mapping to current selected week
  const weekEvents = [];
  
  events.forEach(e => {
    if (!e.date) return;
    const match = weekDays.find(d => d.isoDate === e.date);
    if (match) {
      grouped[match.day].push({
        ...e,
        slotStatus: e.pickupSlot?.status || 'pending'
      });
      weekEvents.push({
        ...e,
        slotStatus: e.pickupSlot?.status || 'pending'
      });
    }
  });

  const totalEvents = weekEvents.length;
  // Calculate total bins correctly dynamically from structured object backend model
  const totalBins = weekEvents.reduce((sum, e) => {
    return sum + (e.estimatedBins ? (e.estimatedBins.wet + e.estimatedBins.dry + e.estimatedBins.recyclable) : 0);
  }, 0);
  const confirmedSlots = weekEvents.filter(e => e.slotStatus === 'confirmed' || e.slotStatus === 'completed').length;

  const highRiskDaysCount = Object.values(grouped).filter(dayEvents => {
    const unassignedCount = dayEvents.filter(e => e.slotStatus === 'pending').length;
    return dayEvents.length >= 3 || unassignedCount > 0;
  }).length;

  const handleDownloadPDF = () => {
    window.print();
  };

  const weekTitle = weekDays.length > 0 ? `Week of ${weekDays[0].date} – ${weekDays[6].date}, ${new Date(weekStart).getFullYear()}` : 'Loading week...';

  return (
    <PageWrapper role="bmc">
      <style>{`
        @media print {
          .sidebar, .page-header button { display: none !important; }
          .weekly-plan-container { padding: 0 !important; }
          body { background: white !important; }
          .card { border: 1px solid #ccc !important; box-shadow: none !important; page-break-inside: avoid; }
        }
      `}</style>

      <div className="weekly-plan-container" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: 0 }}>
          <div>
            <h1 className="heading-2">Weekly Planning View</h1>
            <p className="date" style={{ color: 'var(--text-2)' }}>{weekTitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn-ghost" onClick={() => changeWeek(-1)} style={{ display: 'inline-flex', padding: '6px 12px' }}>
              <RiArrowLeftSLine size={16} /> Previous Week
            </button>
            <button className="btn-ghost" onClick={() => changeWeek(1)} style={{ display: 'inline-flex', padding: '6px 12px' }}>
              Next Week <RiArrowRightSLine size={16} />
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
            <button className="btn-primary" onClick={handleDownloadPDF} style={{ borderRadius: '999px', padding: '8px 20px' }}>
              <RiDownloadLine size={16} style={{ marginRight: '6px' }} /> Download PDF
            </button>
          </div>
        </div>

        {loading ? <div style={{ color: 'var(--text-3)' }}>Loading week data...</div> : (
          <>
            {/* Section 1: Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '8px' }}>Total Events This Week</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)', fontFamily: '"Fraunces", serif' }}>{totalEvents}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '8px' }}>Total Bins Needed</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)', fontFamily: '"Fraunces", serif' }}>{totalBins}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '8px' }}>Slots Confirmed</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)', fontFamily: '"Fraunces", serif' }}>{confirmedSlots}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '8px' }}>High Risk Days</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: highRiskDaysCount > 0 ? 'var(--red)' : 'var(--accent)', fontFamily: '"Fraunces", serif' }}>{highRiskDaysCount}</div>
              </div>
            </div>

            {/* Section 2: Day breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {weekDays.map(({ day, date }) => {
                const dayEvents = grouped[day];
                const isHighRisk = dayEvents.length >= 3 || dayEvents.some(e => e.slotStatus === 'pending');
                const isBusy = dayEvents.length === 2 && !isHighRisk;
                const isEmpty = dayEvents.length === 0;
                
                let bg = 'var(--bg-card)';
                let borderColor = 'var(--border)';
                if (isHighRisk) {
                  bg = 'rgba(239,68,68,0.06)';
                  borderColor = 'rgba(239,68,68,0.2)';
                } else if (isBusy) {
                  bg = 'var(--bg-elevated, var(--bg))';
                }
                
                const totalPredictedBins = dayEvents.reduce((s, e) => s + (e.estimatedBins ? (e.estimatedBins.wet + e.estimatedBins.dry + e.estimatedBins.recyclable) : 0), 0);
                const missingSlots = dayEvents.filter(e => e.slotStatus === 'pending').length;

                return (
                  <div key={day} style={{
                    backgroundColor: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '20px',
                    opacity: isEmpty ? 0.6 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: isEmpty ? 'none' : '1px solid ' + borderColor, paddingBottom: isEmpty ? 0 : '12px', marginBottom: isEmpty ? 0 : '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</h3>
                        <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{date}</span>
                      </div>
                      {!isEmpty && (
                        <div style={{ fontSize: '13px', fontWeight: 500, color: isHighRisk ? 'var(--red)' : 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isHighRisk && <span>⚠</span>} {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                        </div>
                      )}
                    </div>
                    
                    {isEmpty ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-3)', paddingLeft: '4px' }}>No events registered</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {dayEvents.map(event => (
                            <div key={event._id} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 2fr) 1fr 1fr 1fr 120px', alignItems: 'center', fontSize: '13px', gap: '16px', backgroundColor: isHighRisk ? 'rgba(255,255,255,0.4)' : 'var(--bg)', padding: '10px 16px', borderRadius: '8px' }}>
                              <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{event.eventName}</span>
                              <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{event.wardZone}</span>
                              <span style={{ color: 'var(--text-2)' }}>{event.guestCount} guests</span>
                              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{event.estimatedBins ? (event.estimatedBins.wet + event.estimatedBins.dry + event.estimatedBins.recyclable) : 0} bins</span>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {event.slotStatus === 'confirmed' || event.slotStatus === 'completed' ? (
                                  <Badge status="completed" label="✓ Confirmed" />
                                ) : (
                                  <Badge status="pending" label="⏳ No slot" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {(totalPredictedBins > 0 || missingSlots > 0) && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: `1px solid ${borderColor}` }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                              Total predicted: <strong>{totalPredictedBins} bins</strong>
                              {missingSlots > 0 && <span style={{ color: 'var(--text-2)', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>{missingSlots} slots still need assignment</span>}
                            </div>
                            {missingSlots > 0 && (
                              <Link to="/bmc/scheduler" state={{ filterRange: 'week' }} className="btn-primary btn-sm" style={{ borderRadius: '999px', textDecoration: 'none' }}>
                                Assign Missing Slots →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
