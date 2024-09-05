const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  address: { type: String, required: true },
  energyProduced: { type: Number, default: 0 },
  emissions: { type: Number, default: 0 }
})

module.exports = mongoose.model('Project', projectSchema)
