const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded?.userId) {
      return res.status(401).json({ message: 'Invalid token data' });
    }

    req.user = {
      _id: decoded.userId,   // ✅ Consistent with MongoDB _id usage
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Auth failed', error });
  }
};

module.exports = authUser;
