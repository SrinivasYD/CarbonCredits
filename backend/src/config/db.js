const mongoose = require('mongoose')
require('dotenv').config()

console.log('MongoDB URI:', process.env.MONGODB_URI)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err))
