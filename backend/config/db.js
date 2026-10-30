const mongoose = require("mongoose");

// Connects to MongoDB using the connection string from .env.
// If it fails, we stop the app: an API with no database is useless.
async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
