const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const WasteLog = require('../models/WasteLog')
const PickupSlot = require('../models/PickupSlot')
const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

/**
 * Build a flexible wardZone query that matches:
 *   - Exact match: "M/E Ward — Chembur East" === "M/E Ward — Chembur East"
 *   - Legacy match: "M/E Ward — Chembur East" regex-matches "chembur" (case-insensitive)
 * This ensures old events created with short ward names still appear for BMC officers.
 */
function buildWardQuery(officerWard) {
  if (!officerWard) return { wardZone: '' }

  // Extract the area name from "M/E Ward — Chembur East" → "Chembur East"
  const parts = officerWard.split('—')
  const areaName = parts.length > 1 ? parts[1].trim() : officerWard

  // Extract just the primary area name: "Chembur East" → "Chembur"
  const primaryArea = areaName.split(' ')[0]

  // Match exact full name OR legacy short name (case-insensitive)
  return {
    wardZone: {
      $regex: `^(${officerWard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${primaryArea})`,
      $options: 'i'
    }
  }
}

function buildSlotWardQuery(officerWard) {
  if (!officerWard) return { wardZone: '' }

  const parts = officerWard.split('—')
  const areaName = parts.length > 1 ? parts[1].trim() : officerWard
  const primaryArea = areaName.split(' ')[0]

  return {
    wardZone: {
      $regex: `^(${officerWard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${primaryArea})`,
      $options: 'i'
    }
  }
}

// GET /api/bmc/events — all events in officer's ward
router.get('/events', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const wardQuery = buildWardQuery(req.user.wardZone)
    const events = await Event.find(wardQuery).populate('organizerId', 'name email').sort({ date: -1 })
    
    const eventsWithLogs = await Promise.all(events.map(async (e) => {
      const slot = await PickupSlot.findOne({ eventId: e._id })
      const log = await WasteLog.findOne({ eventId: e._id })
      
      const eventObj = e.toObject()
      
      // CRITICAL: Hide predictions from BMC officer
      delete eventObj.estimatedBins
      
      return { 
        ...eventObj, 
        pickupSlot: slot,
        wasteLog: log 
      }
    }))
    res.json({ events: eventsWithLogs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bmc/stats — dashboard numbers
router.get('/stats', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const wardQuery = buildWardQuery(req.user.wardZone)
    const slotWardQuery = buildSlotWardQuery(req.user.wardZone)

    const events = await Event.find(wardQuery)
    const slots = await PickupSlot.find(slotWardQuery)
    const logs = await WasteLog.find({ eventId: { $in: events.map(e => e._id) } })

    const confirmed = slots.filter(s => s.status === 'confirmed').length
    const pending = slots.filter(s => s.status === 'pending').length
    
    // NEW: Calculate total bins and total weight from ACTUAL logs only
    const actualBins = logs.reduce((sum, l) => sum + (l.wetFill || 0) + (l.dryFill || 0) + (l.recycleFill || 0), 0)
    const actualKg = logs.reduce((sum, l) => {
      const wet = (l.wetFill || 0) * 45
      const dry = (l.dryFill || 0) * 22
      const rec = (l.recycleFill || 0) * 15
      return sum + wet + dry + rec
    }, 0)

    const avgScore = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.score || 0), 0) / logs.length)
      : 0

    res.json({ 
      totalEvents: events.length, 
      totalBins: actualBins, 
      totalWasteKg: Math.round(actualKg),
      confirmed, 
      pending, 
      avgScore 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/bmc/slots/:id/confirm — confirm a pickup slot
router.patch('/slots/:id/confirm', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const { truckId, scheduledTime, workerId } = req.body
    if (!workerId) {
      return res.status(400).json({ error: 'Worker selection is mandatory. Please assign a worker before confirming the pickup.' })
    }
    if (!scheduledTime) {
      return res.status(400).json({ error: 'Pickup time window is required.' })
    }

    const Worker = require('../models/Worker')
    const JobAssignment = require('../models/JobAssignment')
    // PRE-VALIDATE WORKER BEFORE UPDATING SLOT (worker is mandatory)
    const worker = await Worker.findById(workerId)
    if (!worker) return res.status(404).json({ error: 'Selected worker not found' })
    if (worker.status !== 'idle') {
      return res.status(400).json({ error: 'Worker is currently assigned or busy. Please refresh and select an idle worker.' })
    }

    // Update pickup slot (truckId is auto-derived from assigned worker)
    const slot = await PickupSlot.findByIdAndUpdate(
      req.params.id,
      {
        truckId: worker.truckId, scheduledTime,
        status: 'confirmed',
        bmcOfficerId: req.user.id,
        confirmedAt: new Date(),
        organizerNotified: true
      },
      { new: true }
    )

    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    // Cancel any existing pending assignment for this slot
    await JobAssignment.deleteMany({
      pickupSlotId: req.params.id,
      workerStatus: 'pending_accept'
    })
    // Create new job assignment
    await JobAssignment.create({
      pickupSlotId: slot._id,
      eventId: slot.eventId,
      workerId: worker._id,
      assignedBy: req.user.id,
      workerStatus: 'pending_accept'
    })
    // Update worker status to assigned
    worker.status = 'assigned'
    await worker.save()

    res.json({ slot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/bmc/slots/:id/complete — mark pickup as done (Legacy/Fallback)
router.patch('/slots/:id/complete', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const slot = await PickupSlot.findById(req.params.id).populate('eventId')
    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    slot.status = 'completed'
    await slot.save()

    res.json({ slot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/bmc/slots/:id/bmc-confirm-complete
// NEW WORKFLOW: BMC reviews worker photo and confirms pickup
router.patch('/slots/:id/bmc-confirm-complete', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const slot = await PickupSlot.findById(req.params.id)
    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    const JobAssignment = require('../models/JobAssignment')
    const Worker = require('../models/Worker')

    // 1. Verify that job exists and worker has uploaded proof
    const job = await JobAssignment.findOne({ pickupSlotId: slot._id, workerStatus: 'worker_completed' })
    if (!job) {
      return res.status(400).json({ error: 'Worker has not completed this job or submitted proof yet.' })
    }

    // 2. Mark Job as BMC verified
    job.bmcVerifiedAt = new Date()
    await job.save()

    // 3. Mark Slot as completed
    slot.status = 'completed'
    await slot.save()

    // 4. ALSO mark the Event as officially completed now that BMC has verified pickup
    const Event = require('../models/Event')
    await Event.findByIdAndUpdate(slot.eventId, { status: 'completed' })

    // 5. Free up the worker so they can take new jobs
    await Worker.findByIdAndUpdate(job.workerId, { status: 'idle' })

    res.json({ slot, job, message: 'Pickup confirmed and worker released.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bmc/audit — compliance audit log
router.get('/audit', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const wardQuery = buildWardQuery(req.user.wardZone)
    const events = await Event.find(wardQuery)
    const audit = await Promise.all(events.map(async (e) => {
      const log = await WasteLog.findOne({ eventId: e._id })
      const slot = await PickupSlot.findOne({ eventId: e._id })
      return {
        event: e,
        wasteLog: log,
        pickupSlot: slot
      }
    }))
    res.json({ audit })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bmc/analytics — chart data
router.get('/analytics', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const wardQuery = buildWardQuery(req.user.wardZone)
    const events = await Event.find(wardQuery)
    const logs = await WasteLog.find({ eventId: { $in: events.map(e => e._id) } })

    const byType = events.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1
      return acc
    }, {})

    const avgScore = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.score || 0), 0) / logs.length)
      : 0

    res.json({
      totalEvents: events.length,
      avgScore,
      byType,
      logsSubmitted: logs.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
