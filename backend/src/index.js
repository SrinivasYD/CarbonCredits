const express = require('express')
const app = express()
const port = process.env.PORT || 3000
require('./config/db') // Connect to MongoDB

const projectEmission = require('./routes/projectRoutes')
const emission = require('./routes/emissions')
app.use(express.json())

app.use('/api/carbon-credits', projectEmission, emission)
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
