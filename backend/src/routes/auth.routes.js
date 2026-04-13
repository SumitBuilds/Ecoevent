const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, wardZone } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required' })
    }

    if (!['organizer', 'bmc'].includes(role)) {
      return res.status(400).json({ error: 'role must be organizer or bmc' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role, wardZone: wardZone || '' })

    const token = jwt.sign(
      { id: user._id, role: user.role, wardZone: user.wardZone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wardZone: user.wardZone
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id, role: user.role, wardZone: user.wardZone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wardZone: user.wardZone
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/auth/update-ward
router.patch('/update-ward', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { wardZone } = req.body
    if (!wardZone) return res.status(400).json({ error: 'wardZone required' })

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { wardZone },
      { new: true }
    ).select('-passwordHash')

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
