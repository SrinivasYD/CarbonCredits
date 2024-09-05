const { JsonRpcProvider, Wallet, Contract } = require('ethers')
const Emissions = require('../models/Emissions')
require('dotenv').config()

const provider = new JsonRpcProvider(process.env.INFURA_URL)
const wallet = new Wallet(process.env.PRIVATE_KEY, provider)
const contract = new Contract(
  process.env.CONTRACT_ADDRESS,
  [
    'function getAverageEmissionsFactor() view returns (uint256)',
    'function updateAverageEmissionsFactor(uint256 emissionsFactor) external',
    'function addTrustedSource(address source) external'
  ],
  wallet
)

module.exports = {
  getAverageEmissionsFactor: async () => {
    try {
      return await contract.getAverageEmissionsFactor()
    } catch (error) {
      throw new Error(
        'Error fetching the average emissions factor: ' + error.message
      )
    }
  },

  updateAverageEmissionsFactor: async (emissionsFactor) => {
    try {
      const tx = await contract.updateAverageEmissionsFactor(emissionsFactor)
      await tx.wait() // Wait for the transaction to be mined
      return emissionsFactor
    } catch (error) {
      throw new Error(
        'Error updating the average emissions factor: ' + error.message
      )
    }
  },

  addTrustedSource: async (address) => {
    try {
      const tx = await contract.addTrustedSource(address)
      await tx.wait() // Wait for the transaction to be mined
      return `Trusted source added: ${address}`
    } catch (error) {
      throw new Error('Error adding trusted source: ' + error.message)
    }
  },

  saveEmissionsToDB: async (address, averageEmissionsFactor) => {
    try {
      let emissions = await Emissions.findOne({ address })
      if (!emissions) {
        emissions = new Emissions({ address, averageEmissionsFactor })
      } else {
        emissions.averageEmissionsFactor = averageEmissionsFactor
        emissions.updatedAt = Date.now()
      }
      await emissions.save()
      return emissions
    } catch (error) {
      throw new Error(
        'Error saving emissions data to MongoDB: ' + error.message
      )
    }
  }
}
