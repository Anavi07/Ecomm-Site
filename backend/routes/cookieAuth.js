const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * COOKIE-ONLY AUTHENTICATION
 * Uses signed cookies without sessions or external storage
 */

/**
 * POST /cookie/login
 * Validates credentials and sets signed cookie
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

    // Find user and verify password
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

    // Create user payload for cookie
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    // Set signed cookie (expires in 7 days)
    res.cookie('userAuth', JSON.stringify(userPayload), {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: 'Cookie login successful',
      authMethod: 'cookie',
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
 * POST /cookie/logout
 * Clears signed cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('userAuth');
  res.json({
    success: true,
    message: 'Cookie logout successful',
    authMethod: 'cookie',
  });
});

/**
 * GET /cookie/me
 * Returns current user from signed cookie
 */
router.get('/me', async (req, res) => {
  try {
    const userCookie = req.signedCookies.userAuth;

    if (!userCookie) {
      return res.status(401).json({
        success: false,
        message: 'No authentication cookie found',
        authMethod: 'cookie',
      });
    }

    let userData;
    try {
      userData = JSON.parse(userCookie);
    } catch (parseErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid cookie format',
        authMethod: 'cookie',
      });
    }

    // Verify user still exists
    const user = await User.findById(userData.id);
    if (!user) {
      res.clearCookie('userAuth');
      return res.status(404).json({
        success: false,
        message: 'User not found',
        authMethod: 'cookie',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      res.clearCookie('userAuth');
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        authMethod: 'cookie',
      });
    }

    const responseData = user.toObject();
    delete responseData.password;

    res.json({
      success: true,
      data: responseData,
      authMethod: 'cookie',
      cookieData: userData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      authMethod: 'cookie',
    });
  }
});

/**
 * Cookie Authentication Middleware
 */
const cookieAuth = async (req, res, next) => {
  try {
    const userCookie = req.signedCookies.userAuth;

    if (!userCookie) {
      return res.status(401).json({
        success: false,
        message: 'No authentication cookie found',
        authMethod: 'cookie',
      });
    }

    const userData = JSON.parse(userCookie);
    const user = await User.findById(userData.id);

    if (!user || !user.isActive) {
      res.clearCookie('userAuth');
      return res.status(401).json({
        success: false,
        message: 'Invalid cookie or inactive user',
        authMethod: 'cookie',
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      authMethod: 'cookie',
    });
  }
};

module.exports = router;
module.exports.cookieAuth = cookieAuth;