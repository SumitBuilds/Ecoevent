const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Worker = require('../models/Worker')
const JobAssignment = require('../models/JobAssignment')
const PickupSlot = require('../models/PickupSlot')
const Event = require('../models/Event')
const { protect } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')

// Worker token middleware
const protectWorker = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'worker') return res.status(403).json({ error: 'Not a worker account' })
    req.worker = decoded
    next()
  } catch (err) { res.status(401).json({ error: 'Invalid or expired token' }) }
}

// ─── WORKER AUTH ─────────────────────────────

// POST /api/workers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const worker = await Worker.findOne({ email })
    if (!worker) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, worker.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign(
      { id: worker._id, role: 'worker', wardZone: worker.wardZone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      worker: {
        id: worker._id, name: worker.name, email: worker.email,
        employeeId: worker.employeeId, truckId: worker.truckId,
        truckName: worker.truckName, truckCapacity: worker.truckCapacity,
        wardZone: worker.wardZone, shiftStart: worker.shiftStart,
        shiftEnd: worker.shiftEnd, status: worker.status, phone: worker.phone
      }
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─── BMC — CREATE AND VIEW WORKERS ───────────

// POST /api/workers — BMC creates worker
router.post('/', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const { name, employeeId, email, password, phone,
            truckId, truckName, truckCapacity, shiftStart, shiftEnd } = req.body
    if (!name || !employeeId || !email || !password || !truckId || !truckName) {
      return res.status(400).json({ error: 'All fields required' })
    }
    const existing = await Worker.findOne({ $or: [{ email }, { employeeId }] })
    if (existing) return res.status(400).json({ error: 'Email or Employee ID already exists' })
    const passwordHash = await bcrypt.hash(password, 12)
    const worker = await Worker.create({
      name, employeeId, email, passwordHash, phone: phone || '',
      truckId, truckName, truckCapacity: truckCapacity || '',
      shiftStart: shiftStart || '20:00', shiftEnd: shiftEnd || '04:00',
      wardZone: req.user.wardZone, createdBy: req.user.id
    })
    res.status(201).json({ worker })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/workers — BMC gets all workers in ward
router.get('/', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const { status } = req.query
    const filter = { wardZone: req.user.wardZone }
    if (status) filter.status = status
    const workers = await Worker.find(filter).select('-passwordHash')
    res.json({ workers })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/workers/available — BMC gets only idle workers (for dropdown)
router.get('/available', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const workers = await Worker.find({
      wardZone: req.user.wardZone,
      status: 'idle'
    }).select('-passwordHash')
    res.json({ workers })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/workers/fleet-status — full fleet overview for BMC
router.get('/fleet-status', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const workers = await Worker.find({ wardZone: req.user.wardZone }).select('-passwordHash')
    const fleetStatus = await Promise.all(workers.map(async (w) => {
      const activeJob = await JobAssignment.findOne({
        workerId: w._id,
        workerStatus: { $in: ['pending_accept', 'accepted'] }
      }).populate('eventId', 'eventName date venueName guestCount estimatedBins')
      return { ...w.toObject(), activeJob: activeJob || null }
    }))
    res.json({ fleetStatus })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/workers/declined-alerts — declined jobs needing reassignment
router.get('/declined-alerts', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const allDeclined = await JobAssignment.find({ workerStatus: 'declined' })
      .populate('workerId', 'name truckName employeeId')
      .populate('eventId', 'eventName date wardZone venueName')
      .sort({ assignedAt: -1 })
    const filtered = allDeclined.filter(j => j.eventId?.wardZone === req.user.wardZone)
    res.json({ declinedAlerts: filtered })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/workers/assign — BMC assigns worker to a pickup slot
router.post('/assign', protect, roleGuard('bmc'), async (req, res) => {
  try {
    const { pickupSlotId, workerId } = req.body
    const slot = await PickupSlot.findById(pickupSlotId)
    if (!slot) return res.status(404).json({ error: 'Pickup slot not found' })
    const existingAssignment = await JobAssignment.findOne({
      workerId, workerStatus: { $in: ['pending_accept', 'accepted'] }
    })
    if (existingAssignment) {
      return res.status(400).json({ error: 'Worker is already assigned to another job' })
    }
    const assignment = await JobAssignment.create({
      pickupSlotId, eventId: slot.eventId,
      workerId, assignedBy: req.user.id
    })
    await Worker.findByIdAndUpdate(workerId, { status: 'assigned' })
    res.status(201).json({ assignment })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─── WORKER — MY JOBS ────────────────────────

// GET /api/workers/my-jobs — worker sees their own jobs
router.get('/my-jobs', protectWorker, async (req, res) => {
  try {
    const jobs = await JobAssignment.find({ workerId: req.worker.id })
      .populate({
        path: 'eventId',
        select: 'eventName eventType date guestCount venueName wardZone estimatedBins catererName catererContact decoratorName'
      })
      .populate({
        path: 'pickupSlotId',
        select: 'scheduledTime truckId status'
      })
      .sort({ assignedAt: -1 })
    res.json({ jobs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/workers/my-profile — worker gets own profile
router.get('/my-profile', protectWorker, async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id).select('-passwordHash')
    res.json({ worker })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/workers/jobs/:id/accept
router.patch('/jobs/:id/accept', protectWorker, async (req, res) => {
  try {
    const job = await JobAssignment.findById(req.params.id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    if (job.workerId.toString() !== req.worker.id) {
      return res.status(403).json({ error: 'Not your job' })
    }
    if (job.workerStatus !== 'pending_accept') {
      return res.status(400).json({ error: 'Job already actioned' })
    }
    await JobAssignment.findByIdAndUpdate(req.params.id, { workerStatus: 'accepted' })
    await Worker.findByIdAndUpdate(req.worker.id, { status: 'on_route' })
    res.json({ message: 'Job accepted successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/workers/jobs/:id/decline
router.patch('/jobs/:id/decline', protectWorker, async (req, res) => {
  try {
    const { declineReason, declineProofUrl } = req.body
    if (!declineReason || declineReason.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a detailed reason (minimum 10 characters)' })
    }
    const job = await JobAssignment.findById(req.params.id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    if (job.workerId.toString() !== req.worker.id) {
      return res.status(403).json({ error: 'Not your job' })
    }
    await JobAssignment.findByIdAndUpdate(req.params.id, {
      workerStatus: 'declined',
      declineReason: declineReason.trim(),
      declineProofUrl: declineProofUrl || ''
    })
    // Set worker back to idle so they can be assigned again
    await Worker.findByIdAndUpdate(req.worker.id, { status: 'idle' })
    // Set pickup slot back to pending so BMC can reassign
    await PickupSlot.findByIdAndUpdate(job.pickupSlotId, {
      status: 'pending',
      truckId: '',
      scheduledTime: '',
      bmcOfficerId: null,
      organizerNotified: false
    })
    res.json({ message: 'Job declined. BMC has been notified.' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/workers/jobs/:id/worker-complete
router.patch('/jobs/:id/worker-complete', protectWorker, async (req, res) => {
  try {
    const { workerNotes, proofPhotoBase64 } = req.body

    // Photo is REQUIRED
    if (!proofPhotoBase64 || proofPhotoBase64.trim() === '') {
      return res.status(400).json({
        error: 'Photo proof is required before marking pickup as complete'
      })
    }

    // Validate it looks like a base64 image
    if (!proofPhotoBase64.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Invalid photo format. Please upload a valid image.'
      })
    }

    const job = await JobAssignment.findById(req.params.id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    if (job.workerId.toString() !== req.worker.id) {
      return res.status(403).json({ error: 'Not your job' })
    }
    if (job.workerStatus !== 'accepted') {
      return res.status(400).json({ error: 'Job must be accepted before completing' })
    }

    await JobAssignment.findByIdAndUpdate(req.params.id, {
      workerStatus:     'worker_completed',
      completedAt:      new Date(),
      workerNotes:      workerNotes || '',
      proofPhotoBase64: proofPhotoBase64,
      proofSubmittedAt: new Date()
    })

    // Worker goes back to IDLE immediately
    await Worker.findByIdAndUpdate(req.worker.id, {
      status: 'idle'
    })

    res.json({ message: 'Pickup marked complete with photo proof. BMC will verify.' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
