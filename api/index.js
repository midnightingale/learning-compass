const serverless = require('serverless-http');

// Import the existing Express app from backend
const app = require('../backend/server');

// Export the serverless handler
module.exports.handler = serverless(app);