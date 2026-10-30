// Fills the database with the services list and creates an admin account.
// Run it once after setting up .env:   npm run seed
// Safe to run again: it updates existing services instead of duplicating them.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Service = require("./models/Service");
const User = require("./models/User");
const services = require("./data/services");

async function seed() {
  await connectDB(process.env.MONGO_URI);

  for (const s of services) {
    await Service.findOneAndUpdate({ slug: s.slug }, s, { upsert: true });
  }
  console.log(`Saved ${services.length} services`);

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      existing.role = "admin";
      await existing.save();
      console.log(`${ADMIN_EMAIL} is an admin`);
    } else {
      await User.create({ name: "ClearDocs Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" });
      console.log(`Created admin account ${ADMIN_EMAIL}`);
    }
  } else {
    console.log("No ADMIN_EMAIL / ADMIN_PASSWORD in .env, so no admin account was created");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
