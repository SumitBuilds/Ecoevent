const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  organizerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName:       { type: String, required: true },
  eventType:       { type: String, required: true },
  guestCount:      { type: Number, required: true },
  date:            { type: String, required: true },
  durationHours:   { type: Number, default: 4 },
  venueName:       { type: String, default: '' },
  startTime:       { type: String, default: '' },
  endTime:         { type: String, default: '' },
  pickupTimeRange: { type: String, default: '' },
  wardZone:        { type: String, required: true },
  cateringStyle:   { type: String, default: 'buffet' },
  plateType:       { type: String, default: 'disposable' },
  bottleCrates:    { type: Number, default: 0 },
  decorTypes:      { type: [String], default: [] },
  catererName:     { type: String, default: '' },
  catererContact:  { type: String, default: '' },
  decoratorName:   { type: String, default: '' },
  decoratorContact:{ type: String, default: '' },
  status:          { type: String, enum: ['registered','active','completed'], default: 'registered' },
  estimatedBins: {
    wet:          { type: Number, default: 0 },
    dry:          { type: Number, default: 0 },
    recyclable:   { type: Number, default: 0 },
    wetKg:        { type: Number, default: 0 },
    dryKg:        { type: Number, default: 0 },
    recyclableKg: { type: Number, default: 0 }
  },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Event', eventSchema)
