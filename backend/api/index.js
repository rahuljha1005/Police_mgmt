require("../src/config/env");

const app = require("../src/app");

// Vercel provides the HTTP listener. Exporting the Express app prevents
// app.listen() from running inside the serverless function.
module.exports = app;
