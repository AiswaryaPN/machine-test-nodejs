const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    // Setting user role
    req.user = user;
    next();
  });
};

// Middleware to authorize roles 
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.userType === role) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: ${req.user.userType} role cannot access user management APIs`,
      });
    }
  };
};

module.exports = { authenticateToken, authorizeRole };