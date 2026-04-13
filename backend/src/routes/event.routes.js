const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const PickupSlot = require('../models/PickupSlot')
const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const { estimateWaste } = require('../utils/wasteEstimator')

// POST /api/events — create event (organizer only)
router.post('/', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const estimatedBins = estimateWaste({
      guestCount:    req.body.guestCount,
      cateringStyle: req.body.cateringStyle,
      plateType:     req.body.plateType,
      bottleCrates:  req.body.bottleCrates,
      decorTypes:    req.body.decorTypes
    })
    const event = await Event.create({
      ...req.body,
      organizerId: req.user.id,
      estimatedBins: {
        wet:          estimatedBins.wetBins,
        dry:          estimatedBins.dryBins,
        recyclable:   estimatedBins.recycleBins,
        wetKg:        estimatedBins.wetKg,
        dryKg:        estimatedBins.dryKg,
        recyclableKg: estimatedBins.recyclableKg
      }
    })
    // Auto-create pending pickup slot for BMC
    await PickupSlot.create({
      eventId: event._id,
      wardZone: req.body.wardZone,
      status: 'pending'
    })
    res.status(201).json({ event })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/events — get organizer's own events
router.get('/', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id }).sort({ createdAt: -1 })
    const eventsWithSlots = await Promise.all(events.map(async (e) => {
      const slot = await PickupSlot.findOne({ eventId: e._id })
      return { ...e.toObject(), pickupSlot: slot }
    }))
    res.json({ events: eventsWithSlots })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/events/:id — single event detail
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found' })

    // Ownership validation: ensure logged-in organizer only accesses their own events
    if (req.user.role === 'organizer' && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this event' })
    }

    const slot = await PickupSlot.findOne({ eventId: req.params.id })
    res.json({ event, pickupSlot: slot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
