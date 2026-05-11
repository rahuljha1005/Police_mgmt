require("../src/config/env");

const app = require("../src/app");

// Vercel provides the HTTP listener. This file only exports the Express app.
module.exports = app;
module.exports.default = app;
