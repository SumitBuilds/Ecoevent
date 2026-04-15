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

    const estimatedTotal = (event.estimatedBins.wet || 0)
      + (event.estimatedBins.dry || 0)
      + (event.estimatedBins.recyclable || 0)

    const actualTotal = (req.body.wetFill > 0 ? 1 : 0)
      + (req.body.dryFill > 0 ? 1 : 0)
      + (req.body.recycleFill > 0 ? 1 : 0)

    const score = calculateScore({
      segregationStatus: req.body.segregationStatus,
      plateType: event.plateType,
      decorTypes: event.decorTypes,
      estimatedTotal,
      actualTotal
    })

    const segregation = req.body.segregationStatus === 'yes' ? 40 : req.body.segregationStatus === 'partial' ? 20 : 0;
    const plates = event.plateType === 'steel' ? 20 : 0;
    const decor = !(event.decorTypes || []).includes('thermocol') ? 15 : 0;
    const diff = Math.abs((actualTotal || 0) - (estimatedTotal || 1));
    const accuracyRaw = Math.max(0, 1 - diff / (estimatedTotal || 1));
    const accuracy = accuracyRaw >= 0.85 ? 25 : accuracyRaw >= 0.65 ? 15 : accuracyRaw >= 0.40 ? 8 : 0;
    const breakdown = { segregation, plates, decor, accuracy };

    const log = await WasteLog.create({ 
      ...req.body, 
      score,
      scoreBreakdown: breakdown
    })
    await Event.findByIdAndUpdate(req.body.eventId, { status: 'completed' })

    res.status(201).json({ log, score, breakdown })
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
