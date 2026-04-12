const mongoose = require('mongoose')

const wasteLogSchema = new mongoose.Schema({
  eventId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  wetFill:           { type: Number, default: 0 },
  dryFill:           { type: Number, default: 0 },
  recycleFill:       { type: Number, default: 0 },
  bottlesUsed:       { type: Number, default: 0 },
  platesUsed:        { type: Number, default: 0 },
  leftoverTrays:     { type: Number, default: 0 },
  segregationStatus: { type: String, enum: ['yes','no','partial'], default: 'no' },
  score:             { type: Number, default: 0 },
  scoreBreakdown:    {
    segregation: { type: Number, default: 0 },
    plates:      { type: Number, default: 0 },
    decor:       { type: Number, default: 0 },
    accuracy:    { type: Number, default: 0 }
  },
  submittedAt:       { type: Date, default: Date.now }
})

module.exports = mongoose.model('WasteLog', wasteLogSchema)
