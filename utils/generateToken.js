const jwt = require('jsonwebtoken');

const createToken = (userId, role) => {
  try {
    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' } // Optional: Expiry
    );
    return token;
  } catch (error) {
    console.error("❌ Token creation error:", error);
  }
};

module.exports = createToken;
