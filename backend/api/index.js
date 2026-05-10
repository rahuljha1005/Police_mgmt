const dotenv = require("dotenv");
const app = require("../src/app");
const connectDB = require("../src/config/db");

dotenv.config();

let dbConnection;

module.exports = async (req, res) => {
  dbConnection = dbConnection || connectDB();
  await dbConnection;

  return app(req, res);
};
