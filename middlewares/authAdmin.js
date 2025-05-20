const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "User not authorized, no token" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decodedToken || !decodedToken.id || decodedToken.role !== 'admin') {
      return res.status(403).json({ message: "Access denied, not an admin" });
    }

    req.user = decodedToken;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Admin Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authAdmin;
