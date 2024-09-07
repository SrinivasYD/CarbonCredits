// backend/src/index.js
const express = require("express");
const app = express();
const port = 5000;
require("./config/db"); // Connect to MongoDB

const {
  fetchAndSyncEvents,
  setupEventListeners,
} = require("./controllers/blockchainController");

app.use(express.json());

// Sync blockchain data and set up event listeners
fetchAndSyncEvents();
setupEventListeners();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
