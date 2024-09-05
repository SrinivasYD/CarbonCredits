// models/Emissions.js
const mongoose = require('mongoose')

const EmissionsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  averageEmissionsFactor: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Emissions', EmissionsSchema)
