const express = require('express')
const router = express.Router()
const WasteLog = require('../models/WasteLog')
const Event = require('../models/Event')
const { protect } = require('../middleware/auth')
const { calculateScore } = require('../utils/scoreCalculator')

// POST /api/wastelogs — submit waste log
router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId)
    if (!event) return res.status(404).json({ error: 'Event not found' })

    // Check if a log already exists for this event
    const existingLog = await WasteLog.findOne({ eventId: req.body.eventId })
    if (existingLog) {
      return res.status(400).json({ error: 'A waste log has already been submitted for this event.' })
    }

    // Ownership validation: ensure organizers can only log waste for their own events
    if (req.user.role === 'organizer' && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to submit log for this event' })
    }

    const { total, breakdown } = calculateScore({
      segregationStatus: req.body.segregationStatus,
      plateType: event.plateType,
      decorTypes: event.decorTypes,
      estimatedWet: event.estimatedBins.wet,
      actualWet: req.body.wetFill,
      estimatedDry: event.estimatedBins.dry,
      actualDry: req.body.dryFill,
      estimatedRecyclable: event.estimatedBins.recyclable,
      actualRecyclable: req.body.recycleFill
    })

    const log = await WasteLog.create({ 
      ...req.body, 
      score: total,
      scoreBreakdown: breakdown
    })
    await Event.findByIdAndUpdate(req.body.eventId, { status: 'completed' })

    res.status(201).json({ log, score: total, breakdown })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/wastelogs/:eventId — get log for an event
router.get('/:eventId', protect, async (req, res) => {
  try {
    // Validate event ownership before returning the log
    const event = await Event.findById(req.params.eventId)
    if (!event) return res.status(404).json({ error: 'Event not found' })
    
    if (req.user.role === 'organizer' && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this event log' })
    }

    const log = await WasteLog.findOne({ eventId: req.params.eventId })
    res.json({ log })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
