const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ This is important!
    req.user = {
      _id: decoded.id,        // Not decoded._id
      role: decoded.role,     // Add role if you use it in delete logic
      name: decoded.name      // Optional: if you store name in token
    };

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Auth failed', error });
  }
};

module.exports = authUser;
