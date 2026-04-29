import axios from 'axios'

// ─── MAIN API (Organizer & BMC) ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoevent_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/workers/login');
    
    // Only redirect if NOT a login attempt and it's a 401 (expired/invalid token)
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('ecoevent_token')
      localStorage.removeItem('ecoevent_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ─── WORKER API (Field Workers Only) ─────────────────────────────────────────────
const workerAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

workerAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoevent_worker_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

workerAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecoevent_worker_token')
      localStorage.removeItem('ecoevent_worker')
      window.location.href = '/worker/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateWard: (wardZone) => api.patch('/auth/update-ward', { wardZone }),
}

// ─── EVENTS ──────────────────────────────────────────────
export const eventAPI = {
  create: (data) => api.post('/events', data),
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  delete: (id) => api.delete(`/events/${id}`),
}

// ─── WASTE LOGS ──────────────────────────────────────────
export const wasteLogAPI = {
  submit: (data) => api.post('/wastelogs', data),
  getOne: (eventId) => api.get(`/wastelogs/${eventId}`),
}

// ─── BMC ─────────────────────────────────────────────────
export const bmcAPI = {
  getEvents: () => api.get('/bmc/events'),
  getStats: () => api.get('/bmc/stats'),
  confirmSlot: (id, data) => api.patch(`/bmc/slots/${id}/confirm`, data),
  completeSlot: (id) => api.patch(`/bmc/slots/${id}/complete`),
  getAudit: () => api.get('/bmc/audit'),
  getAnalytics: () => api.get('/bmc/analytics'),
}

// ─── WORKER API ──────────────────────────────────────────────────────────────
export const workerAPI = {
  login:           (data)  => workerAxios.post('/workers/login', data),
  getMyJobs:       ()      => workerAxios.get('/workers/my-jobs'),
  acceptJob:       (id)    => workerAxios.patch(`/workers/jobs/${id}/accept`),
  declineJob:      (id, data) => workerAxios.patch(`/workers/jobs/${id}/decline`, data),
  workerComplete:  (id, data) => workerAxios.patch(`/workers/jobs/${id}/worker-complete`, data),
}

export const bmcWorkerAPI = {
  getAll:           ()          => api.get('/workers'),
  getFleetStatus:   ()          => api.get('/workers/fleet-status'),
  createWorker:     (data)      => api.post('/workers', data),
  assignWorker:     (data)      => api.post('/workers/assign', data),
  getDeclinedAlerts: ()         => api.get('/workers/declined-alerts'),
}

// ─── WORKER AUTH & JOB APIs (new endpoints) ──────────────────────────────────
export const workerAuthAPI = {
  login:      (data) => workerAxios.post('/workers/login', data),
  myProfile:  ()     => workerAxios.get('/workers/my-profile'),
}
export const workerJobAPI = {
  getMyJobs:      ()          => workerAxios.get('/workers/my-jobs'),
  accept:         (id)        => workerAxios.patch(`/workers/jobs/${id}/accept`),
  decline:        (id, data)  => workerAxios.patch(`/workers/jobs/${id}/decline`, data),
  complete:       (id, data)  => workerAxios.patch(`/workers/jobs/${id}/worker-complete`, data),
  completeWithPhoto:(id, data)=> workerAxios.patch(`/workers/jobs/${id}/worker-complete`, data),
}
export const bmcFleetAPI = {
  getAvailable:     ()     => api.get('/workers/available'),
  getAll:           ()     => api.get('/workers'),
  getFleetStatus:   ()     => api.get('/workers/fleet-status'),
  createWorker:     (data) => api.post('/workers', data),
  getDeclinedAlerts:()     => api.get('/workers/declined-alerts'),
}

export const bmcCompletionAPI = {
  getWorkerCompletions: () => api.get('/bmc/worker-completions'),
  bmcConfirmComplete:   (slotId) => api.patch(`/bmc/slots/${slotId}/bmc-confirm-complete`),
}

export const organizerConfirmAPI = {
  getPendingConfirmations: () => api.get('/events/pending-confirmations'),
  confirmPickup:           (slotId) => api.patch(`/events/slots/${slotId}/organizer-confirm`),
}
