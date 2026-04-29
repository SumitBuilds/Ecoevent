require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const connectDB = require('./config/db')

const app = express()

// ==========================================
// 1. Core Middleware & Security
// ==========================================

// Setup security headers
app.use(helmet())

// HTTP request logging
app.use(morgan('dev'))

// CORS configuration (Environment variable fallback to default Vite port)
app.use(cors({
  origin: true,
  credentials: true
}))

// Parse incoming request bodies (increased limit for base64 photo uploads)
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

// ==========================================
// 2. Health & Monitoring
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Segregacy backend running securely' })
})

// ==========================================
// 3. API Routes
// ==========================================
app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/events',    require('./routes/event.routes'))
app.use('/api/wastelogs', require('./routes/wastelog.routes'))
app.use('/api/bmc',       require('./routes/bmc.routes'))
app.use('/api/workers',   require('./routes/worker.routes'))

// ==========================================
// 4. Global Error Handling
// ==========================================

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
})

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  })
})

// ==========================================
// 5. Server Initialization Structure
// ==========================================
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Await database connection before allowing the server to bind
    await connectDB()
    
    const server = app.listen(PORT, () => {
      console.log(`[Server] Segregacy backend running on port ${PORT}`)
      console.log(`[Server] CORS enabled for ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
    })

    // Keep Render free tier alive
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        require('https').get(
          'https://ecoevent-backend.onrender.com/api/health',
          () => console.log('Keepalive ping sent')
        ).on('error', () => {})
      }, 14 * 60 * 1000)
    }
  } catch (error) {
    console.error('[Server] Failed to initialize backend systems:', error.message)
    // Abort process cleanly if required DB cannot connect
    process.exit(1)
  }
}

// Start application
startServer()
