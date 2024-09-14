const mongoose = require('mongoose')

const mintedNFTSchema = new mongoose.Schema({
  owner: String,
  recipient: String,
  numberOfTokens: String,
  timestamp: Date
})

module.exports = mongoose.model('MintedNFT', mintedNFTSchema)
