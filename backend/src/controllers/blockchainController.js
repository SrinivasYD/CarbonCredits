const ethers = require('ethers')
const Project = require('../models/Project')
const MintedNFT = require('../models/MintedNFT')
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

// ProjectApproval contract setup
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

// CarbonCreditNFT contract setup for minting events
const carbonCreditNFTAbiPath = path.join(contractsDir, 'CarbonCreditNFT.json')
const carbonCreditNFTAbi = JSON.parse(
  fs.readFileSync(carbonCreditNFTAbiPath)
).abi
const carbonCreditNFTAddress = contractAddresses.CarbonCreditNFT

const carbonCreditNFTContract = new ethers.Contract(
  carbonCreditNFTAddress,
  carbonCreditNFTAbi,
  provider
)

// Function to fetch and sync project-related events with MongoDB
async function fetchAndSyncEvents() {
  try {
    // Clear existing project data before sync
    await Project.deleteMany({})
    console.log('Cleared all project data.')

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

    console.log('Project events successfully synced with blockchain data.')
  } catch (error) {
    console.error(
      'Error fetching project events and syncing with MongoDB:',
      error
    )
  }
}

// Function to fetch and sync minted NFT events with MongoDB
async function fetchAndSyncMintedNFTs() {
  try {
    // Clear existing NFT data before syncing
    await MintedNFT.deleteMany({})
    console.log('Cleared all NFT data.')

    // Fetch past CarbonCreditsMinted events from the contract
    const mintedEvents = await carbonCreditNFTContract.queryFilter(
      'CarbonCreditsMinted'
    )

    console.log(`Found ${mintedEvents.length} minted NFT events.`) // Log the number of events

    for (const event of mintedEvents) {
      const { owner, recipient, numberOfTokens, timestamp } = event.args

      // Store the new minted NFT event
      const nft = new MintedNFT({
        owner,
        recipient,
        numberOfTokens: numberOfTokens.toString(), // Convert to string for consistent storage
        timestamp: new Date(timestamp.toNumber() * 1000) // Convert UNIX timestamp to JS date
      })

      await nft.save()
      console.log(`Saved minted NFT for ${owner} to the database.`)
    }

    console.log('Minted NFTs successfully synced with blockchain data.')
  } catch (error) {
    console.error(
      'Error fetching NFT minting events and syncing with MongoDB:',
      error
    )
  }
}

// Set up event listeners for ProjectApproval events
function setupEventListeners() {
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

// Set up event listeners for CarbonCreditNFT minting events
function setupMintingEventListener() {
  carbonCreditNFTContract.on(
    'CarbonCreditsMinted',
    async (owner, recipient, numberOfTokens, timestamp) => {
      console.log(`NFT minted by ${owner} to ${recipient}`)
      try {
        const nft = new MintedNFT({
          owner,
          recipient,
          numberOfTokens: numberOfTokens.toString(), // Ensure consistency in storage
          timestamp: new Date(timestamp.toNumber() * 1000) // Convert UNIX timestamp to JS date
        })
        await nft.save()
        console.log(`Saved minted NFT for ${owner} to the database.`)
      } catch (error) {
        console.error('Error saving minted NFT to MongoDB:', error)
      }
    }
  )
}

module.exports = {
  fetchAndSyncEvents,
  setupEventListeners,
  fetchAndSyncMintedNFTs,
  setupMintingEventListener
}