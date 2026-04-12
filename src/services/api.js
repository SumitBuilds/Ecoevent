import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoevent_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle expired token — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecoevent_token')
      localStorage.removeItem('ecoevent_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

// ─── EVENTS ──────────────────────────────────────────────
export const eventAPI = {
  create:  (data) => api.post('/events', data),
  getAll:  ()     => api.get('/events'),
  getOne:  (id)   => api.get(`/events/${id}`),
}

// ─── WASTE LOGS ──────────────────────────────────────────
export const wasteLogAPI = {
  submit: (data)    => api.post('/wastelogs', data),
  getOne: (eventId) => api.get(`/wastelogs/${eventId}`),
}

// ─── BMC ─────────────────────────────────────────────────
export const bmcAPI = {
  getEvents:      ()           => api.get('/bmc/events'),
  getStats:       ()           => api.get('/bmc/stats'),
  confirmSlot:    (id, data)   => api.patch(`/bmc/slots/${id}/confirm`, data),
  completeSlot:   (id)         => api.patch(`/bmc/slots/${id}/complete`),
  getAudit:       ()           => api.get('/bmc/audit'),
  getAnalytics:   ()           => api.get('/bmc/analytics'),
}
