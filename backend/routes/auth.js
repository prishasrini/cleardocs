const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Creates a login token that lasts 7 days
function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// The user fields we send back (never the password)
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register  — create an account
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // role is NOT taken from the request, so nobody can sign themselves up as admin
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

// POST /api/auth/login  — log in and get a token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // We asked for select:false on password, so we have to request it here
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  // Same message for "no such user" and "wrong password", so attackers
  // can't use this endpoint to find out which emails have accounts
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  res.json({ token: makeToken(user), user: publicUser(user) });
});

// GET /api/auth/me  — who am I? (used by the app when it reopens)
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
