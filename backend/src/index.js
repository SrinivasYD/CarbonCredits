// backend/src/index.js
const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000

require('./config/db') // Connect to MongoDB

// Importing your Blockchain Controller
const {
  fetchAndSyncEvents,
  setupEventListeners
} = require('./controllers/blockchainController')

// Import the carbon emission routes
const carbonEmissionRoutes = require('./routes/carbonEmissionRoutes')

// Middleware
app.use(cors())
app.use(express.json())

// Use the carbon emission routes
app.use('/api', carbonEmissionRoutes)

// Sync blockchain data and set up event listeners
fetchAndSyncEvents()
setupEventListeners()

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
