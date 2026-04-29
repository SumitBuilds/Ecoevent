const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const PickupSlot = require('../models/PickupSlot')
const WasteLog = require('../models/WasteLog')
const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const { estimateWaste } = require('../utils/wasteEstimator')

// POST /api/events — create event (organizer only)
router.post('/', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const { guestCount, bottleCrates, durationHours } = req.body

    // Sanitize numeric inputs to prevent validation failures (e.g. empty strings "" from frontend)
    const guests = Number(guestCount) || 0
    const crates = Number(bottleCrates) || 0
    const duration = Number(durationHours) || 4

    const estimatedBins = estimateWaste({
      guestCount: guests,
      cateringStyle: req.body.cateringStyle,
      plateType: req.body.plateType,
      bottleCrates: crates,
      decorTypes: req.body.decorTypes
    })

    const event = await Event.create({
      ...req.body,
      guestCount: guests,
      bottleCrates: crates,
      durationHours: duration,
      organizerId: req.user.id,
      estimatedBins: {
        wet: estimatedBins.wetBins,
        dry: estimatedBins.dryBins,
        recyclable: estimatedBins.recycleBins,
        wetKg: estimatedBins.wetKg,
        dryKg: estimatedBins.dryKg,
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
    const log = await WasteLog.findOne({ eventId: req.params.id })

    // Find latest job assignment and populate worker details
    const JobAssignment = require('../models/JobAssignment')
    const jobAssignment = await JobAssignment.findOne({ eventId: req.params.id })
      .populate('workerId', 'name truckName truckId phone employeeId')
      .sort({ assignedAt: -1 })

    const eventObj = event.toObject()

    // CRITICAL: Hide predictions from BMC officer
    if (req.user.role === 'bmc') {
      delete eventObj.estimatedBins
    }

    res.json({
      event: eventObj,
      pickupSlot: slot,
      wasteLog: log,
      jobAssignment: jobAssignment || null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/events/pending-confirmations — organizer sees events BMC completed
router.get('/pending-confirmations', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const PickupSlot = require('../models/PickupSlot')
    const events = await Event.find({ organizerId: req.user.id })
    const eventIds = events.map(e => e._id)

    const slots = await PickupSlot.find({
      eventId: { $in: eventIds },
      status: 'completed',
      organizerConfirmed: false
    }).populate('eventId', 'eventName date venueName guestCount estimatedBins')

    res.json({ pendingConfirmations: slots })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/events/slots/:slotId/organizer-confirm
router.patch('/slots/:slotId/organizer-confirm', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const PickupSlot = require('../models/PickupSlot')
    const slot = await PickupSlot.findByIdAndUpdate(
      req.params.slotId,
      { organizerConfirmed: true, organizerConfirmedAt: new Date() },
      { new: true }
    )
    if (!slot) return res.status(404).json({ error: 'Slot not found' })
    res.json({ slot, message: 'Confirmed' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/events/:id — organizer deletes their event
router.delete('/:id', protect, roleGuard('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found' })

    // Ensure only the organizer who created it can delete it
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' })
    }

    const JobAssignment = require('../models/JobAssignment')
    const Worker = require('../models/Worker')

    // Find any active jobs for this event and reset worker status to idle
    const activeJobs = await JobAssignment.find({ eventId: event._id })
    for (const job of activeJobs) {
      if (job.workerId) {
        await Worker.findByIdAndUpdate(job.workerId, { status: 'idle' })
      }
    }

    // Cascade delete associated records
    await PickupSlot.deleteMany({ eventId: event._id })
    await WasteLog.deleteMany({ eventId: event._id })
    await JobAssignment.deleteMany({ eventId: event._id })
    
    // Delete the event itself
    await Event.findByIdAndDelete(req.params.id)

    res.json({ message: 'Event deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
