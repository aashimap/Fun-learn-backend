const jwt = require("jsonwebtoken");

// Middleware to verify JWT token from cookie
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({
      status: false,
      message: "No token provided",
    });
  }

  // Remove the  "Bearer" prefix from token.
  const tokenWithoutBearer = token.replace("Bearer ", "");

  jwt.verify(tokenWithoutBearer, process.env.API_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: false,
        message: "Failed to authenticate token",
      });
    }
    console.log("Decoded data :", decoded);
    req.id = decoded.id;
    req.role = decoded.role;
    // req.user = user;
    next();
  });
};

module.exports = verifyToken;
