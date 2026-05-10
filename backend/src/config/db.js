const mongoose = require("mongoose");

let cachedConnection = null;
let cachedConnectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not configured");
  }

  if (!cachedConnectionPromise) {
    // Serverless functions are reused between requests. Caching the connection
    // promise prevents opening a new MongoDB connection on every invocation.
    cachedConnectionPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((error) => {
        cachedConnectionPromise = null;
        throw error;
      });
  }

  await cachedConnectionPromise;
  cachedConnection = mongoose.connection;

  return cachedConnection;
};

module.exports = connectDB;
