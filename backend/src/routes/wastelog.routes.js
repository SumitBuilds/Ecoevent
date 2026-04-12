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

    const estimatedTotal = (event.estimatedBins.wet || 0)
      + (event.estimatedBins.dry || 0)
      + (event.estimatedBins.recyclable || 0)

    const actualTotal = (Number(req.body.wetFill) || 0)
      + (Number(req.body.dryFill) || 0)
      + (Number(req.body.recycleFill) || 0)

    const { total, breakdown } = calculateScore({
      segregationStatus: req.body.segregationStatus,
      plateType: event.plateType,
      decorTypes: event.decorTypes,
      estimatedTotal,
      actualTotal
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
    const log = await WasteLog.findOne({ eventId: req.params.eventId })
    res.json({ log })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
