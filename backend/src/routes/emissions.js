const express = require('express')
const router = express.Router()
const {
  getAverageEmissionsFactor,
  updateAverageEmissionsFactor,
  addTrustedSource,
  saveEmissionsToDB
} = require('../controllers/contract')

router.get('/get-average-emissions', async (req, res) => {
  try {
    const factor = await getAverageEmissionsFactor()
    res.json({ averageEmissionsFactor: factor.toString() })
  } catch (error) {
    res.status(500).json({
      error: `Error fetching the average emissions factor: ${error.message}`
    })
  }
})

router.post('/update-emissions', async (req, res) => {
  const { address, emissionsFactor } = req.body
  try {
    const result = await updateAverageEmissionsFactor(emissionsFactor)
    await saveEmissionsToDB(address, emissionsFactor)
    res.json({ averageEmissionsFactor: result })
  } catch (error) {
    res.status(500).json({
      error: `Error updating the average emissions factor: ${error.message}`
    })
  }
})

router.post('/add-trusted-source', async (req, res) => {
  const { address } = req.body
  try {
    const result = await addTrustedSource(address)
    res.json({ message: result })
  } catch (error) {
    res
      .status(500)
      .json({ error: `Error adding trusted source: ${error.message}` })
  }
})

module.exports = router
