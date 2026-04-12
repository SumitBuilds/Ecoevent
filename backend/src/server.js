require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}))
app.use(express.json())

// Health check — test this first after starting server
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoEvent backend running' })
})

// Routes
app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/events',    require('./routes/event.routes'))
app.use('/api/wastelogs', require('./routes/wastelog.routes'))
app.use('/api/bmc',       require('./routes/bmc.routes'))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`EcoEvent backend running on http://localhost:${PORT}`)
})
