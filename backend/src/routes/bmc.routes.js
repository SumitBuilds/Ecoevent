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
    const slot = await PickupSlot.findById(req.params.id).populate('eventId')
    if (!slot) return res.status(404).json({ error: 'Slot not found' })

    const event = slot.eventId
    if (event && event.date && event.endTime) {
      const now = new Date()
      const [endH, endM] = event.endTime.split(':').map(Number)
      const [startH, startM] = (event.startTime || "00:00").split(':').map(Number)
      
      // event.date is YYYY-MM-DD
      let eventEndDate = new Date(event.date)
      eventEndDate.setHours(endH, endM, 0, 0)

      // Handle events ending past midnight
      // If end time is earlier than start time, it ends the next day
      const startTimeMinutes = startH * 60 + startM
      const endTimeMinutes = endH * 60 + endM
      
      if (endTimeMinutes < startTimeMinutes) {
        eventEndDate.setDate(eventEndDate.getDate() + 1)
      }

      if (now < eventEndDate) {
        return res.status(400).json({ 
          error: `Event "${event.eventName}" is still ongoing. Pickup can only be completed after it ends at ${event.endTime}.` 
        })
      }
    }

    slot.status = 'completed'
    await slot.save()

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
