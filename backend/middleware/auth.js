const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Runs before protected routes.
// Reads "Authorization: Bearer <token>", checks the token, and puts the user on req.user.
async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Account no longer exists." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

// Use after protect: only lets admins through
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
}

module.exports = { protect, adminOnly };
