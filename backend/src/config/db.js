const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/police-management";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  return mongoose.connection;
};

module.exports = connectDB;
