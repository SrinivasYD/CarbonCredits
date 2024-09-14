// backend/src/controllers/blockchainController.js
const ethers = require('ethers')
const Project = require('../models/Project')
const fs = require('fs')
const path = require('path')

// Ethereum provider and contract setup
const provider = new ethers.providers.WebSocketProvider(
  process.env.WEB3_PROVIDER
)

// Set the correct path for the contract directory

const contractsDir = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'frontend',
  'src',
  'contracts'
)

// Fetch contract details
const contractAddressesPath = path.join(contractsDir, 'contract-addresses.json')
const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath))

const projectApprovalAbiPath = path.join(contractsDir, 'ProjectApproval.json')
const projectApprovalAbi = JSON.parse(
  fs.readFileSync(projectApprovalAbiPath)
).abi
const projectApprovalAddress = contractAddresses.ProjectApproval

const projectApprovalContract = new ethers.Contract(
  projectApprovalAddress,
  projectApprovalAbi,
  provider
)

// Function to fetch events and sync with MongoDB
async function fetchAndSyncEvents () {
  try {
    // Clear existing data before sync
    await Project.deleteMany({})

    // Fetch past ProjectSubmitted events
    const submittedEvents =
      await projectApprovalContract.queryFilter('ProjectSubmitted')
    for (const event of submittedEvents) {
      const { owner, projectDetailsHash, certificateHash } = event.args
      const project = new Project({
        owner,
        projectDetailsHash,
        certificateHash,
        isApproved: false,
        isRevoked: false
      })
      await project.save()
    }

    // Fetch past ProjectApproved events
    const approvedEvents =
      await projectApprovalContract.queryFilter('ProjectApproved')
    for (const event of approvedEvents) {
      const { owner, approvalHash } = event.args
      await Project.findOneAndUpdate(
        { owner },
        { isApproved: true, approvalHash }
      )
    }

    // Fetch past ProjectRevoked events
    const revokedEvents =
      await projectApprovalContract.queryFilter('ProjectRevoked')
    for (const event of revokedEvents) {
      const { owner } = event.args
      await Project.findOneAndUpdate({ owner }, { isRevoked: true })
    }

    console.log('Database successfully synced with blockchain data.')
  } catch (error) {
    console.error('Error fetching events and syncing with MongoDB:', error)
  }
}

// Set up event listeners
function setupEventListeners () {
  projectApprovalContract.on(
    'ProjectSubmitted',
    async (owner, projectDetailsHash, certificateHash) => {
      console.log(`New project submitted by ${owner}`)
      try {
        const project = new Project({
          owner,
          projectDetailsHash,
          certificateHash,
          isApproved: false,
          isRevoked: false
        })
        await project.save()
        console.log(`Saved new project for ${owner} to the database.`)
      } catch (error) {
        console.error('Error saving new project to MongoDB:', error)
      }
    }
  )

  projectApprovalContract.on('ProjectApproved', async (owner, approvalHash) => {
    console.log(`Project approved for ${owner}. Approval Hash: ${approvalHash}`)
    try {
      await Project.findOneAndUpdate(
        { owner },
        { isApproved: true, approvalHash }
      )
      console.log(`Updated project approval for ${owner} in the database.`)
    } catch (error) {
      console.error('Error updating project approval in MongoDB:', error)
    }
  })

  projectApprovalContract.on('ProjectRevoked', async (owner) => {
    console.log(`Project revoked for ${owner}`)
    try {
      await Project.findOneAndUpdate({ owner }, { isRevoked: true })
      console.log(`Project revoked for ${owner} in the database.`)
    } catch (error) {
      console.error('Error revoking project in MongoDB:', error)
    }
  })
}

module.exports = {
  fetchAndSyncEvents,
  setupEventListeners
}
