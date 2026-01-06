// Middleware to check if user is admin
// Note: This middleware should be used AFTER authenticate middleware
// authenticate middleware should set req.user
const requireAdmin = (req, res, next) => {
  // Check if user is authenticated and is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

module.exports = { requireAdmin };

