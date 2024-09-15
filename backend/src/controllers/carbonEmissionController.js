// backend/src/controllers/carbonEmissionController.js
const axios = require('axios')
require('dotenv').config() // Load environment variables from .env

const getCarbonEmissions = async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.co2signal.com/v1/latest?countryCode=US',
      {
        headers: {
          'auth-token': process.env.CO2_SIGNAL_API_KEY // Using API key from .env file
        }
      }
    )
    res.json(response.data)
  } catch (error) {
    console.error('Error fetching carbon emission data:', error)
    res.status(500).json({ error: 'Error fetching data' })
  }
}

module.exports = {
  getCarbonEmissions
}
