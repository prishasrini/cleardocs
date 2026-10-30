require("dotenv").config();
const fs = require("fs");
const app = require("./app");
const connectDB = require("./config/db");
const { UPLOAD_DIR } = require("./middleware/upload");

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to your .env file.");
  process.exit(1);
}

// Make sure the uploads folder exists (it is in .gitignore, so a fresh clone won't have it)
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Connect to the database first, then start listening.
// "0.0.0.0" lets your phone reach the API over Wi-Fi while you test the app.
connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ClearDocs API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
