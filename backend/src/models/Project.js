// backend/src/models/project.js
const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  owner: String,
  projectDetailsHash: String,
  certificateHash: String,
  approvalHash: String,
  isApproved: Boolean,
  isRevoked: Boolean
})

module.exports = mongoose.model('Project', projectSchema)
