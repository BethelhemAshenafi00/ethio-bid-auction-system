const jwt = require("jsonwebtoken");

// ⚠️ Use ONLY environment variable (no fallback)
const JWT_SECRET = process.env.JWT_SECRET;

/* =======================
   VERIFY TOKEN
======================= */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // { id, role }
    req.user._id = req.user.id; // Fix seller.js ID undefined
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
}

/* =======================
   ROLE CHECK (Flexible)
======================= */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "Access denied. Insufficient role.",
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };

