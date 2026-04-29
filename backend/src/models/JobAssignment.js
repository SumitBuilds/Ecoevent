const mongoose = require('mongoose')

const jobAssignmentSchema = new mongoose.Schema({
  pickupSlotId:     { type: mongoose.Schema.Types.ObjectId, ref: 'PickupSlot', required: true },
  eventId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  workerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  assignedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt:       { type: Date, default: Date.now },
  workerStatus:     { type: String,
                      enum: ['pending_accept','accepted','declined','worker_completed'],
                      default: 'pending_accept' },
  declineReason:    { type: String, default: '' },
  declineProofUrl:  { type: String, default: '' },
  completedAt:      { type: Date, default: null },
  workerNotes:      { type: String, default: '' },
  proofPhotoBase64: { type: String, default: '' },
  proofSubmittedAt: { type: Date, default: null },
  bmcVerifiedAt:    { type: Date, default: null }
})

module.exports = mongoose.models.JobAssignment || mongoose.model('JobAssignment', jobAssignmentSchema)
