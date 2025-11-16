const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key';

/**
 * POST /login
 * Validates credentials and returns access token + refresh token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { id: user._id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt,
    });

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      data: userData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /refresh
 * Accepts refresh token and returns new access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
      revokedAt: null,
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or revoked',
      });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
      });
    }

    // Generate new access token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /logout
 * Revokes refresh token (adds to blacklist)
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Find and revoke the refresh token
    const token = await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revokedAt: new Date() },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Refresh token not found',
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * GET /me
 * Returns current user info using JWT token
 */
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.',
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      data: userData,
      authMethod: 'JWT'
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token has expired',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
});

module.exports = router;
