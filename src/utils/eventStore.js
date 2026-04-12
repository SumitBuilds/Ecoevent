/**
 * SEGREGACY — Event Data Store
 * localStorage persistence layer for the full data lifecycle.
 *
 * Stores: events, predicted waste, actual waste, fill levels,
 *         sustainability scores, reports, and BMC pickup schedules.
 */

const STORE_KEY = 'segregacy_events';

// ─── Helpers ────────────────────────────────────────────────────────

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAll(events) {
  localStorage.setItem(STORE_KEY, JSON.stringify(events));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── CRUD Operations ────────────────────────────────────────────────

/** Save a new event registration + prediction data */
export function saveEvent(eventForm, prediction) {
  const events = getAll();
  const event = {
    id: genId(),
    createdAt: new Date().toISOString(),
    status: 'registered',          // registered → active → completed
    form: { ...eventForm },
    prediction: { ...prediction },
    liveLog: null,                  // filled during event
    actualWaste: null,              // filled after live log
    score: null,                    // filled in report
    report: null,                   // filled in report
    pickup: null,                   // BMC schedule
  };
  events.push(event);
  saveAll(events);

  // Also keep backward-compatible localStorage keys
  localStorage.setItem('current_event', JSON.stringify(eventForm));
  localStorage.setItem('current_event_id', event.id);

  return event;
}

/** Get all events */
export function getAllEvents() {
  return getAll();
}

/** Get a single event by ID */
export function getEvent(id) {
  return getAll().find(e => e.id === id) || null;
}

/** Get the most recent active or registered event */
export function getCurrentEvent() {
  const all = getAll();
  // First, check if there's an explicit current event ID and it's not completed
  const id = localStorage.getItem('current_event_id');
  if (id) {
    const ev = getEvent(id);
    if (ev && ev.status !== 'completed') return ev;
  }
  // Otherwise, return the most recent active or registered event
  const activeEvents = all.filter(e => e.status !== 'completed');
  if (activeEvents.length > 0) return activeEvents[activeEvents.length - 1];
  
  // Fallback to the last event created
  return all.length > 0 ? all[all.length - 1] : null;
}

/** Save and Load Draft Form Data for RegisterEvent */
export function saveDraftEvent(form) {
  localStorage.setItem('register_draft', JSON.stringify(form));
}

export function getDraftEvent() {
  try {
    const draft = localStorage.getItem('register_draft');
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function clearDraftEvent() {
  localStorage.removeItem('register_draft');
}

/** Save and Load Draft data for LiveLog */
export function saveLiveLogDraft(eventId, data) {
  if (!eventId) return;
  localStorage.setItem(`livelog_draft_${eventId}`, JSON.stringify(data));
}

export function getLiveLogDraft(eventId) {
  if (!eventId) return null;
  try {
    const draft = localStorage.getItem(`livelog_draft_${eventId}`);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function clearLiveLogDraft(eventId) {
  if (!eventId) return;
  localStorage.removeItem(`livelog_draft_${eventId}`);
}

/** Update event live-log data (fill levels, counters, segregation) */
export function saveEventLog(id, logData) {
  const events = getAll();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  events[idx].liveLog = { ...logData };
  events[idx].status = 'active';
  saveAll(events);
  return events[idx];
}

/** Update event with actual waste calculations */
export function saveActualWaste(id, actualWaste) {
  const events = getAll();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  events[idx].actualWaste = { ...actualWaste };
  saveAll(events);
  return events[idx];
}

/** Save sustainability score + report */
export function saveReport(id, scoreData) {
  const events = getAll();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  events[idx].score = scoreData.score;
  events[idx].report = { ...scoreData };
  events[idx].status = 'completed';
  saveAll(events);

  // Backward compat
  localStorage.setItem('current_score', scoreData.score);

  return events[idx];
}

/** BMC: assign pickup schedule */
export function savePickupSchedule(id, pickupData) {
  const events = getAll();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  events[idx].pickup = { ...pickupData };
  saveAll(events);
  return events[idx];
}

/** Get events by status */
export function getEventsByStatus(status) {
  return getAll().filter(e => e.status === status);
}

/** Get events for a specific ward */
export function getEventsByWard(ward) {
  return getAll().filter(e => e.form?.ward === ward);
}
