const express = require('express')
const router = express.Router()
const projectService = require('../controllers/projectEmissionsService')

// Register a project
router.post('/register-project', async (req, res) => {
  const { projectAddress } = req.body
  try {
    if (!projectAddress) {
      return res.status(400).json({ error: 'Project address is required' })
    }
    const result = await projectService.registerProject(projectAddress)
    res.status(200).json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error registering project: ' + error.message })
  }
})

// Update project data
router.post('/update-project-data', async (req, res) => {
  const { projectAddress, energyProduced, emissions } = req.body
  try {
    if (
      !projectAddress ||
      energyProduced === undefined ||
      emissions === undefined
    ) {
      return res.status(400).json({
        error: 'Project address, energy produced, and emissions are required'
      })
    }
    const result = await projectService.updateProjectData(
      projectAddress,
      energyProduced,
      emissions
    )
    res.status(200).json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error updating project data: ' + error.message })
  }
})

// Validate Ethereum address
const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address)

// Get project emissions data
router.get('/get-project-emissions', async (req, res) => {
  const { projectAddress } = req.query
  console.log('Received address:', projectAddress) // Debugging line
  if (!projectAddress || !isValidEthereumAddress(projectAddress)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format' })
  }
  try {
    const result = await projectService.getProjectEmissionsData(projectAddress)
    console.log('Contract result:', result) // Debugging line
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching project emissions data: ' + error.message
    })
  }
})

// Get energy produced
router.get('/get-energy-produced', async (req, res) => {
  const { projectAddress } = req.query
  try {
    if (!projectAddress || !isValidEthereumAddress(projectAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' })
    }
    const result = await projectService.getEnergyProduced(projectAddress)
    res.status(200).json(result)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching energy produced: ' + error.message })
  }
})

// Update remaining energy
router.post('/update-remaining-energy', async (req, res) => {
  const { projectAddress, remainingEnergy } = req.body
  try {
    if (!projectAddress || remainingEnergy === undefined) {
      return res
        .status(400)
        .json({ error: 'Project address and remaining energy are required' })
    }
    const result = await projectService.updateRemainingEnergy(
      projectAddress,
      remainingEnergy
    )
    res.status(200).json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error updating remaining energy: ' + error.message })
  }
})

// Authorize caller
router.post('/authorize-caller', async (req, res) => {
  const { callerAddress } = req.body
  try {
    if (!callerAddress || !isValidEthereumAddress(callerAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' })
    }
    const result = await projectService.authorizeCaller(callerAddress)
    res.status(200).json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error authorizing caller: ' + error.message })
  }
})

// Deauthorize caller
router.post('/deauthorize-caller', async (req, res) => {
  const { callerAddress } = req.body
  try {
    if (!callerAddress || !isValidEthereumAddress(callerAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' })
    }
    const result = await projectService.deauthorizeCaller(callerAddress)
    res.status(200).json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error deauthorizing caller: ' + error.message })
  }
})

module.exports = router
