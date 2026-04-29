const mongoose = require('mongoose')

const pickupSlotSchema = new mongoose.Schema({
  eventId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bmcOfficerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  truckId:           { type: String, default: '' },
  scheduledTime:     { type: String, default: '' },
  wardZone:          { type: String, required: true },
  status:            { type: String, enum: ['pending','confirmed','completed'], default: 'pending' },
  confirmedAt:       { type: Date, default: null },
  organizerNotified: { type: Boolean, default: false },
  organizerConfirmed:   { type: Boolean, default: false },
  organizerConfirmedAt: { type: Date, default: null }
})

module.exports = mongoose.model('PickupSlot', pickupSlotSchema)
