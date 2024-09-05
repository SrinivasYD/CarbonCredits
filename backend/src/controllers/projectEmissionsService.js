const { JsonRpcProvider, Wallet, Contract } = require('ethers')
require('dotenv').config()
// Import the Project model
const Project = require('../models/Project')

const provider = new JsonRpcProvider(process.env.INFURA_URL)
const wallet = new Wallet(process.env.PRIVATE_KEY, provider)
const contract = new Contract(
  process.env.CONTRACT_ADDRESS,
  [
    'function registerProject(address project) external',
    'function updateProjectData(address project, uint256 energyProduced, uint256 emissions) external',
    'function getProjectEmissionsData(address project) external view returns (uint256)',
    'function getEnergyProduced(address project) external view returns (uint256)',
    'function updateRemainingEnergy(address project, uint256 remainingEnergy) external',
    'function authorizeCaller(address caller) external',
    'function deauthorizeCaller(address caller) external'
  ],
  wallet
)

module.exports = {
  registerProject: async (projectAddress) => {
    try {
      if (!projectAddress) throw new Error('Project address is required')
      const tx = await contract.registerProject(projectAddress)
      await tx.wait() // Wait for the transaction to be mined
      return `Project registered: ${projectAddress}`
    } catch (error) {
      console.error('Error registering project:', error)
      throw new Error('Error registering project: ' + error.message)
    }
  },

  updateProjectData: async (projectAddress, energyProduced, emissions) => {
    try {
      const tx = await contract.updateProjectData(
        projectAddress,
        energyProduced,
        emissions
      )
      await tx.wait() // Wait for the transaction to be mined
      let project = await Project.findOne({ address: projectAddress })
      if (!project) {
        project = new Project({
          address: projectAddress,
          energyProduced,
          emissions
        })
      } else {
        project.energyProduced += energyProduced
        project.emissions = emissions
      }
      await project.save()
      return `Project data updated for: ${projectAddress}`
    } catch (error) {
      throw new Error('Error updating project data: ' + error.message)
    }
  },

  getProjectEmissionsData: async (projectAddress) => {
    try {
      if (!projectAddress) throw new Error('Project address is required')
      console.log('Fetching emissions data for address:', projectAddress)
      const emissionsData =
        await contract.getProjectEmissionsData(projectAddress)
      console.log('Raw emissions data received:', emissionsData.toString()) // Ensure conversion
      return { projectAddress, emissionsData: emissionsData.toString() }
    } catch (error) {
      console.error('Error fetching project emissions data:', error)
      throw new Error('Error fetching project emissions data: ' + error.message)
    }
  },

  getEnergyProduced: async (projectAddress) => {
    try {
      if (!projectAddress) throw new Error('Project address is required')
      const energyData = await contract.getEnergyProduced(projectAddress)
      console.log('Raw energy data received:', energyData.toString()) // Ensure conversion
      return { projectAddress, energyProduced: energyData.toString() }
    } catch (error) {
      console.error('Error fetching energy produced:', error)
      throw new Error('Error fetching energy produced: ' + error.message)
    }
  },

  updateRemainingEnergy: async (projectAddress, remainingEnergy) => {
    try {
      if (!projectAddress) throw new Error('Project address is required')
      const tx = await contract.updateRemainingEnergy(
        projectAddress,
        remainingEnergy
      )
      await tx.wait() // Wait for the transaction to be mined
      await Project.updateOne(
        { address: projectAddress },
        { energyProduced: remainingEnergy }
      )
      return `Remaining energy updated for: ${projectAddress}`
    } catch (error) {
      console.error('Error updating remaining energy:', error)
      throw new Error('Error updating remaining energy: ' + error.message)
    }
  },

  authorizeCaller: async (callerAddress) => {
    try {
      if (!callerAddress) throw new Error('Caller address is required')
      const tx = await contract.authorizeCaller(callerAddress)
      await tx.wait() // Wait for the transaction to be mined
      return `Caller authorized: ${callerAddress}`
    } catch (error) {
      console.error('Error authorizing caller:', error)
      throw new Error('Error authorizing caller: ' + error.message)
    }
  },

  deauthorizeCaller: async (callerAddress) => {
    try {
      if (!callerAddress) throw new Error('Caller address is required')
      const tx = await contract.deauthorizeCaller(callerAddress)
      await tx.wait() // Wait for the transaction to be mined
      return `Caller deauthorized: ${callerAddress}`
    } catch (error) {
      console.error('Error deauthorizing caller:', error)
      throw new Error('Error deauthorizing caller: ' + error.message)
    }
  }
}
