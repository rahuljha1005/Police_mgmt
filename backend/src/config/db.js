const mongoose = require("mongoose");

let cachedConnection = null;
let cachedConnectionPromise = null;

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not configured");
  }

  if (!cachedConnectionPromise) {
    // Serverless functions are reused between requests. Caching the connection
    // promise prevents opening a new MongoDB connection on every invocation.
    console.log("Connecting to MongoDB...");
    cachedConnectionPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((error) => {
        cachedConnectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  await cachedConnectionPromise;
  cachedConnection = mongoose.connection;
  console.log("MongoDB connected");

  return cachedConnection;
};

module.exports = connectDB;
