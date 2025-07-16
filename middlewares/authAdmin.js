const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
   // console.log("hi am here",decodedToken)

    if (!decodedToken || !decodedToken.userId || !decodedToken.role) {
      return res.status(403).json({ message: "Unauthorized: Invalid token payload" });
    }

    req.user = decodedToken; // Contains id, role, etc.
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
