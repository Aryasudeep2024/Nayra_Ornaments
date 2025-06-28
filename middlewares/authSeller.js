const jwt = require('jsonwebtoken');

const authSeller = (req, res, next) => {
  try {
    // 1. Get token from cookies
    const { token } = req.cookies;
console.log('🍪 [Middleware] Token from cookie:', token);

    // 2. If token not found
    if (!token) {
      return res.status(401).json({ message: 'User not authorized. Token missing.' });
    }

    // 3. Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('✅ [Middleware] Decoded JWT payload:', decodedToken);


    // 4. Invalid token check (optional, already throws if invalid)
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // 5. Check role
    if (decodedToken.role !== 'superadmin' && decodedToken.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Not a seller or admin.' });
    }

    // 6. Attach user to request
    req.user = decodedToken;

    // 7. Pass to next middleware
    next();

  } catch (error) {
  console.error('Auth Middleware Error:', error);
  return res.status(500).json({ message: 'Internal server error' });
}

};

module.exports = authSeller;
