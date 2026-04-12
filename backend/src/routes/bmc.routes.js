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
    const eventsWithSlots = await Promise.all(events.map(async (e) => {
      const slot = await PickupSlot.findOne({ eventId: e._id })
      return { ...e.toObject(), pickupSlot: slot }
    }))
    res.json({ events: eventsWithSlots })
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
    const totalBins = events.reduce((sum, e) =>
      sum + (e.estimatedBins?.wet || 0) + (e.estimatedBins?.dry || 0) + (e.estimatedBins?.recyclable || 0), 0)
    const avgScore = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.score || 0), 0) / logs.length)
      : 0

    res.json({ totalEvents: events.length, totalBins, confirmed, pending, avgScore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/bmc/slots/:id/confirm — confirm a pickup slot
router.patch('/slots/:id/confirm', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const { truckId, scheduledTime } = req.body
    const slot = await PickupSlot.findByIdAndUpdate(
      req.params.id,
      {
        truckId,
        scheduledTime,
        status: 'confirmed',
        bmcOfficerId: req.user.id,
        confirmedAt: new Date(),
        organizerNotified: true
      },
      { new: true }
    )
    if (!slot) return res.status(404).json({ error: 'Slot not found' })
    res.json({ slot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/bmc/slots/:id/complete — mark pickup as done
router.patch('/slots/:id/complete', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const slot = await PickupSlot.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    )
    if (!slot) return res.status(404).json({ error: 'Slot not found' })
    res.json({ slot })
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
