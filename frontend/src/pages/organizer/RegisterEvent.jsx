import { useState, useEffect } from 'react';
import PageWrapper from '../../components/shared/PageWrapper';
import { RiArrowRightLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { estimateWaste } from '../../utils/wasteEstimator';
import { saveEvent, saveDraftEvent, getDraftEvent, clearDraftEvent } from '../../utils/eventStore';
import './RegisterEvent.css';

function TimeInput12({ name, value, onChange }) {
  const [h, m] = value ? value.split(':') : ['', ''];
  
  let hour12 = '';
  let ampm = 'AM';
  if (h !== '') {
    let hour = parseInt(h, 10);
    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    hour12 = hour.toString().padStart(2, '0');
  }

  const handleUpdate = (newH12, newMin, newAp) => {
    let hr = parseInt(newH12 || '12', 10);
    if (newAp === 'PM' && hr !== 12) hr += 12;
    if (newAp === 'AM' && hr === 12) hr = 0;
    
    const finalM = newMin ? newMin.padStart(2, '0') : '00';
    if (!newH12) { 
      onChange({ target: { name, value: '' } });
      return; 
    }
    
    const finalH = hr.toString().padStart(2, '0');
    onChange({ target: { name, value: `${finalH}:${finalM}` } });
  };

  const selectStyle = {
    flex: 1, 
    minWidth: 0, 
    padding: '10px 4px', 
    borderRadius: '8px', 
    border: '1px solid var(--border)', 
    background: 'transparent',
    fontSize: '15px',
    textAlign: 'center'
  };

  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <select 
         style={selectStyle}
         value={hour12} 
         onChange={e => handleUpdate(e.target.value, m, ampm)}
      >
        <option value="">HH</option>
        {[...Array(12)].map((_, i) => {
           let val = (i+1).toString().padStart(2, '0');
           return <option key={val} value={val}>{val}</option>;
        })}
      </select>
      <select 
         style={selectStyle}
         value={m || ''} 
         onChange={e => handleUpdate(hour12, e.target.value, ampm)}
      >
        <option value="">MM</option>
        {["00","05","10","15","20","25","30","35","40","45","50","55"].map(val => (
           <option key={val} value={val}>{val}</option>
        ))}
      </select>
      <select 
         style={selectStyle}
         value={ampm} 
         onChange={e => handleUpdate(hour12, m, e.target.value)}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export default function RegisterEvent() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '', type: '', date: '', duration: '1', venue: '', ward: '',
    startTime: '', endTime: '', pickupStart: '', pickupEnd: '', pickupTimeRange: '',
    guestCount: '', bottleCrates: '', cateringStyle: 'buffet', plateType: 'disposable',
    decorTypes: ['flowers'],
    caterer: '', catererContact: '', decorator: '', decoratorContact: ''
  });
  
  const [error, setError] = useState('');

  // Load draft on mount
  useEffect(() => {
    const draft = getDraftEvent();
    if (draft) setForm(draft);
  }, []);

  // Save to draft whenever form changes
  useEffect(() => {
    saveDraftEvent(form);
  }, [form]);

  // Auto-calculate duration based on start and end time
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const [startH, startM] = form.startTime.split(':').map(Number);
      const [endH, endM] = form.endTime.split(':').map(Number);
      
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      
      // If end time is before start time, assume it ends the next day
      if (endTotal < startTotal) {
        endTotal += 24 * 60;
      }
      
      let diffHours = (endTotal - startTotal) / 60;
      diffHours = Math.round(diffHours * 10) / 10;
      if (diffHours === 0) diffHours = 24; 
      
      if (form.duration !== diffHours.toString()) {
        setForm(f => ({ ...f, duration: diffHours.toString() }));
      }
    }
  }, [form.startTime, form.endTime]);

  const [submitting, setSubmitting] = useState(false);

  const handleNext = async (nextStep) => {
    setError('');
    if (step === 1) {
      if (!form.name || !form.type || !form.date || !form.duration || !form.venue || !form.ward || !form.startTime || !form.endTime || !form.pickupStart || !form.pickupEnd) {
        setError('Please fill in all Event Details, including timings, to continue.');
        return;
      }
    } else if (step === 2) {
      if (!form.guestCount || form.bottleCrates === null || form.bottleCrates === undefined || form.bottleCrates === '') {
        setError('Please fill in Waste Inputs to continue.');
        return;
      }
      if (form.guestCount < 1) {
        setError('Guests count must be at least 1.');
        return;
      }
    } else if (step === 3 && nextStep === 4) {
      if (!form.caterer || !form.catererContact || !form.decorator || !form.decoratorContact) {
        setError('Please fill in Vendor Information.');
        return;
      }
      
      const phoneRegex = /^[\d\s\+\-()]{10,}$/;
      if (!phoneRegex.test(form.catererContact) || !phoneRegex.test(form.decoratorContact)) {
        setError('Please enter valid vendor contact numbers (at least 10 digits).');
        return;
      }
      
      setSubmitting(true);
      try {
        const prediction = estimateWaste(form);
        
        const format12H = (val24) => {
           if (!val24) return '';
           const [h,m] = val24.split(':');
           let hr = parseInt(h, 10);
           const ap = hr >= 12 ? 'PM' : 'AM';
           if (hr > 12) hr -= 12;
           if (hr === 0) hr = 12;
           return `${hr.toString().padStart(2, '0')}:${m} ${ap}`;
        };
        const generatedPickupTimeRange = form.pickupStart && form.pickupEnd 
           ? `${format12H(form.pickupStart)} - ${format12H(form.pickupEnd)}` 
           : form.pickupTimeRange;
        
        const payload = {
          eventName: form.name,
          eventType: form.type,
          guestCount: form.guestCount,
          date: form.date,
          durationHours: form.duration,
          venueName: form.venue,
          startTime: form.startTime,
          endTime: form.endTime,
          pickupTimeRange: generatedPickupTimeRange,
          wardZone: form.ward,
          cateringStyle: form.cateringStyle,
          plateType: form.plateType,
          bottleCrates: form.bottleCrates,
          decorTypes: form.decorTypes,
          catererName: form.caterer,
          catererContact: form.catererContact,
          decoratorName: form.decorator,
          decoratorContact: form.decoratorContact,
          estimatedBins: {
             wet: prediction.wetBins || 0,
             dry: prediction.dryBins || 0,
             recyclable: prediction.recyclableBins || 0
          }
        };

        const { eventAPI } = await import('../../services/api');
        const res = await eventAPI.create(payload);
        const savedEvent = res.data.event;
        
        clearDraftEvent(); 
        
        navigate(`/organizer/estimate/${savedEvent._id}`);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to securely register event. Try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep(nextStep);
  };

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  return (
    <PageWrapper role="organizer">
      <div className="register" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="page-header">
          <h1 className="heading-2">Register New Event</h1>
          <p className="date">Fill in event details to get your bin plan</p>
        </div>

        {/* Step Indicator */}
        <div>
          <div className="step-indicator">
            {['Event Details', 'Waste Inputs', 'Vendor Info'].map((label, i) => (
              <div className={`step-item ${step === i + 1 ? 'active' : i + 1 < step ? 'completed' : ''}`} key={i}>
                <div className="step-circle">{i + 1}</div>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>
        
          {error && <div style={{ color: 'var(--red)', marginBottom: '16px', background: 'var(--red-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        </div>

        {/* Step 1 — Event Details */}
        {step === 1 && (
          <div className="card register__card">
            <h3 className="heading-4" style={{ marginBottom: '24px' }}>Event Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Event Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Sharma Wedding Reception" />
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="">Select type...</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              <div className="form-group">
                <label>Event Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Venue Name</label>
                <input type="text" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g., Grand Ballroom, Chembur" />
              </div>
              <div className="form-group">
                <label>Event Start Time</label>
                <TimeInput12 name="startTime" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Event End Time</label>
                <TimeInput12 name="endTime" value={form.endTime} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Duration (hours)</label>
                <input type="number" name="duration" value={form.duration} readOnly style={{ backgroundColor: 'rgba(0,0,0,0.02)', cursor: 'not-allowed', color: 'var(--text-2)' }} placeholder="Auto-calculated" />
              </div>
              <div className="form-group form-group--full">
                <label>Requested Pickup Time Range</label>
                <div className="time-range-group">
                  <div style={{ flex: 1, width: '100%' }}>
                     <TimeInput12 name="pickupStart" value={form.pickupStart} onChange={handleChange} />
                  </div>
                  <span className="time-range-spacer">to</span>
                  <div style={{ flex: 1, width: '100%' }}>
                     <TimeInput12 name="pickupEnd" value={form.pickupEnd} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="form-group form-group--full">
                <label>Mumbai Ward / Zone</label>
                <select name="ward" value={form.ward} onChange={handleChange}>
                  <option value="">Select ward...</option>
                  <option value="A Ward — Colaba">A Ward — Colaba</option>
                  <option value="B Ward — Mandvi">B Ward — Mandvi</option>
                  <option value="D Ward — Malabar Hill">D Ward — Malabar Hill</option>
                  <option value="E Ward — Byculla">E Ward — Byculla</option>
                  <option value="F/N Ward — Sion">F/N Ward — Sion</option>
                  <option value="F/S Ward — Wadala">F/S Ward — Wadala</option>
                  <option value="G/N Ward — Dharavi">G/N Ward — Dharavi</option>
                  <option value="G/S Ward — Mahim">G/S Ward — Mahim</option>
                  <option value="H/E Ward — Bandra East">H/E Ward — Bandra East</option>
                  <option value="H/W Ward — Bandra West">H/W Ward — Bandra West</option>
                  <option value="K/E Ward — Andheri East">K/E Ward — Andheri East</option>
                  <option value="K/W Ward — Andheri West">K/W Ward — Andheri West</option>
                  <option value="L Ward — Kurla">L Ward — Kurla</option>
                  <option value="M/E Ward — Chembur East">M/E Ward — Chembur East</option>
                  <option value="M/W Ward — Chembur West">M/W Ward — Chembur West</option>
                  <option value="N Ward — Ghatkopar">N Ward — Ghatkopar</option>
                  <option value="P/N Ward — Borivali">P/N Ward — Borivali</option>
                  <option value="P/S Ward — Kandivali">P/S Ward — Kandivali</option>
                  <option value="R/C Ward — Dahisar">R/C Ward — Dahisar</option>
                  <option value="R/N Ward — Borivali North">R/N Ward — Borivali North</option>
                  <option value="R/S Ward — Malad">R/S Ward — Malad</option>
                  <option value="S Ward — Bhandup">S Ward — Bhandup</option>
                  <option value="T Ward — Mulund">T Ward — Mulund</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button className="btn-primary" onClick={() => handleNext(2)}>
                Next: Waste Inputs <RiArrowRightLine size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Waste Inputs */}
        {step === 2 && (
          <div className="card register__card">
            <h3 className="heading-4" style={{ marginBottom: '24px' }}>Waste Inputs</h3>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>Number of Guests</label>
                <input type="number" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="e.g., 350" min="10" />
              </div>

              <div className="form-group form-group--full">
                <label>Catering Style</label>
                <div className="radio-pills">
                  {[
                    { val: 'buffet', label: 'Buffet' },
                    { val: 'plated', label: 'Plated' },
                    { val: 'snacks', label: 'Snacks Only' }
                  ].map(s => (
                    <button 
                      className={`radio-pill ${form.cateringStyle === s.val ? 'active' : ''}`} 
                      key={s.val}
                      onClick={() => setForm({...form, cateringStyle: s.val})}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group form-group--full">
                <label>Disposable Plates?</label>
                <div className="radio-pills">
                  {[
                    { val: 'disposable', label: 'Yes — Disposable' },
                    { val: 'steel', label: 'No — Reusable / Steel' }
                  ].map(s => (
                    <button 
                      className={`radio-pill ${form.plateType === s.val ? 'active' : ''}`} 
                      key={s.val}
                      onClick={() => setForm({...form, plateType: s.val})}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Water Bottle Crates <span className="text-faded">(1 crate ≈ 24 bottles)</span></label>
                <input type="number" name="bottleCrates" value={form.bottleCrates} onChange={handleChange} placeholder="e.g., 5" min="0" />
              </div>

              <div className="form-group form-group--full">
                <label>Decoration Type</label>
                <div className="radio-pills">
                  {[
                    { val: 'flowers', label: 'Flowers' },
                    { val: 'thermocol', label: 'Thermocol' },
                    { val: 'none', label: 'None' }
                  ].map(s => (
                    <button 
                      className={`radio-pill ${form.decorTypes.includes(s.val) ? 'active' : ''}`} 
                      key={s.val}
                      onClick={() => {
                        // Multi-select toggle
                        if (s.val === 'none') {
                          setForm({...form, decorTypes: ['none']});
                        } else {
                          const without = form.decorTypes.filter(t => t !== 'none');
                          const newTypes = without.includes(s.val)
                            ? without.filter(t => t !== s.val)
                            : [...without, s.val];
                          setForm({...form, decorTypes: newTypes.length > 0 ? newTypes : ['none']});
                        }
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => handleNext(3)}>
                Next: Vendor Info <RiArrowRightLine size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Vendor Info */}
        {step === 3 && (
          <div className="card register__card">
            <h3 className="heading-4" style={{ marginBottom: '24px' }}>Vendor Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Caterer Name</label>
                <input type="text" name="caterer" value={form.caterer} onChange={handleChange} placeholder="e.g., Rajesh Caterers" />
              </div>
              <div className="form-group">
                <label>Caterer Contact</label>
                <input type="tel" name="catererContact" value={form.catererContact} onChange={handleChange} placeholder="e.g., +91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Decorator Name</label>
                <input type="text" name="decorator" value={form.decorator} onChange={handleChange} placeholder="e.g., Dream Décor" />
              </div>
              <div className="form-group">
                <label>Decorator Contact</label>
                <input type="tel" name="decoratorContact" value={form.decoratorContact} onChange={handleChange} placeholder="e.g., +91 98765 43210" />
              </div>
            </div>
            <div className="register__note">
              <RiArrowRightLine size={14} />
              Segregation checklist will be auto-sent to these contacts
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary btn-full" onClick={() => handleNext(4)} style={{ maxWidth: '400px' }} disabled={submitting}>
                {submitting ? 'Registering event...' : <><RiArrowRightLine size={16} /> Calculate Bin Plan</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
