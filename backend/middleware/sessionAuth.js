const User = require('../models/User');

/**
 * Session Authentication Middleware
 * Validates server-side session and attaches user to req.user
 */
const sessionAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'No active session. Please login.',
      });
    }

    // Fetch user from database using session userId
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Session invalid.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive.',
      });
    }

    // Attach user object to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Refresh session expiry on each request
    req.session.touch();

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = sessionAuth;
