// backend/src/routes/carbonEmissionRoutes.js
const express = require('express')
const {
  getCarbonEmissions
} = require('../controllers/carbonEmissionController')
const router = express.Router()

// Route to get carbon emission data
router.get('/carbon-emissions', getCarbonEmissions)

module.exports = router
