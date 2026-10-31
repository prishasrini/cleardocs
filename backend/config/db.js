const dns = require("node:dns");
const mongoose = require("mongoose");

// Connects to MongoDB using the connection string from .env.
// If it fails, we stop the app: an API with no database is useless.
async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }
  // "mongodb+srv://" addresses (MongoDB Atlas) need a DNS SRV lookup. On some Windows
  // setups and home routers Node can't do that lookup and fails with "querySrv ECONNREFUSED",
  // so we ask public DNS servers instead. Set DNS_SERVERS in .env to override.
  if (uri.startsWith("mongodb+srv://")) {
    dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((s) => s.trim()));
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
