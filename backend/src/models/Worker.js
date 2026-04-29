const mongoose = require('mongoose')

const workerSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  employeeId:   { type: String, required: true, unique: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone:        { type: String, default: '' },
  truckId:      { type: String, required: true },
  truckName:    { type: String, required: true },
  truckCapacity:{ type: String, default: '' },
  shiftStart:   { type: String, default: '20:00' },
  shiftEnd:     { type: String, default: '04:00' },
  wardZone:     { type: String, required: true },
  status:       { type: String, enum: ['idle','assigned','on_route'], default: 'idle' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:    { type: Date, default: Date.now }
})

module.exports = mongoose.models.Worker || mongoose.model('Worker', workerSchema)
