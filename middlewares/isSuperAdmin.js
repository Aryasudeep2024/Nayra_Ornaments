// middleware/isSuperAdmin.js
const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super-admin') {
    return res.status(403).json({ message: "Access denied: Super-admins only" });
  }
  next();
};

module.exports = isSuperAdmin;
