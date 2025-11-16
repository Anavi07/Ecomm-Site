const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth'); // JWT middleware
const sessionAuth = require('../middleware/sessionAuth'); // Session middleware
const { cookieAuth } = require('./cookieAuth'); // Cookie middleware

/**
 * SECURITY TESTING ENDPOINTS
 * These endpoints demonstrate security features and vulnerabilities
 * for comparison between authentication methods
 */

/**
 * GET /testing/public
 * Public endpoint accessible without authentication
 */
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString(),
    data: {
      publicInfo: 'This data is accessible to everyone',
      serverTime: new Date().toLocaleString(),
    }
  });
});

/**
 * JWT Protected Endpoints
 */
router.get('/jwt/protected', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'JWT protected endpoint accessed successfully',
    authMethod: 'JWT',
    user: req.user,
    tokenInfo: {
      userId: req.user.id,
      userRole: req.user.role,
      message: 'Token successfully verified'
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/jwt/admin', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      authMethod: 'JWT',
      userRole: req.user.role
    });
  }

  res.json({
    success: true,
    message: 'JWT admin endpoint accessed successfully',
    authMethod: 'JWT',
    adminData: {
      sensitiveInfo: 'Admin-only information via JWT',
      systemStats: { uptime: process.uptime(), memory: process.memoryUsage() }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Session Protected Endpoints
 */
router.get('/session/protected', sessionAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Session protected endpoint accessed successfully',
    authMethod: 'Session',
    user: req.user,
    sessionInfo: {
      userId: req.user.id,
      userRole: req.user.role,
      message: 'Session successfully validated'
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/session/admin', sessionAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      authMethod: 'Session',
      userRole: req.user.role
    });
  }

  res.json({
    success: true,
    message: 'Session admin endpoint accessed successfully',
    authMethod: 'Session',
    adminData: {
      sensitiveInfo: 'Admin-only information via Session',
      systemStats: { uptime: process.uptime(), memory: process.memoryUsage() }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Cookie Protected Endpoints
 */
router.get('/cookie/protected', cookieAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Cookie protected endpoint accessed successfully',
    authMethod: 'Cookie',
    user: req.user,
    cookieInfo: {
      userId: req.user.id,
      userRole: req.user.role,
      message: 'Signed cookie successfully validated'
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/cookie/admin', cookieAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      authMethod: 'Cookie',
      userRole: req.user.role
    });
  }

  res.json({
    success: true,
    message: 'Cookie admin endpoint accessed successfully',
    authMethod: 'Cookie',
    adminData: {
      sensitiveInfo: 'Admin-only information via Cookie',
      systemStats: { uptime: process.uptime(), memory: process.memoryUsage() }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Security Demonstration Endpoints
 */

// Token inspection endpoint (JWT)
router.get('/jwt/inspect', authenticate, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.decode(token, { complete: true });
    res.json({
      success: true,
      message: 'JWT token inspection',
      tokenData: {
        header: decoded.header,
        payload: decoded.payload,
        signature: '***HIDDEN***'
      },
      tokenLength: token.length,
      tokenType: 'Bearer JWT'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid JWT token',
      error: error.message
    });
  }
});

// Session inspection endpoint
router.get('/session/inspect', sessionAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Session inspection',
    sessionData: {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID,
      cookie: req.session.cookie,
      sessionAge: Date.now() - req.session.cookie.originalMaxAge
    },
    storageType: 'Server-side MongoDB'
  });
});

// Cookie inspection endpoint
router.get('/cookie/inspect', cookieAuth, (req, res) => {
  const userCookie = req.signedCookies.userAuth;
  
  res.json({
    success: true,
    message: 'Cookie inspection',
    cookieData: {
      userData: JSON.parse(userCookie),
      cookieSize: userCookie.length,
      signed: true,
      httpOnly: true
    },
    allCookies: Object.keys(req.cookies).length > 0 ? req.cookies : 'No unsigned cookies',
    storageType: 'Client-side signed cookie'
  });
});

/**
 * Performance Testing Endpoints
 */
router.get('/performance/jwt', authenticate, (req, res) => {
  const startTime = process.hrtime.bigint();
  
  // Simulate some processing
  const data = { processed: true, timestamp: Date.now() };
  
  const endTime = process.hrtime.bigint();
  const processingTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  
  res.json({
    success: true,
    authMethod: 'JWT',
    processingTime: `${processingTime.toFixed(3)}ms`,
    data
  });
});

router.get('/performance/session', sessionAuth, (req, res) => {
  const startTime = process.hrtime.bigint();
  
  // Simulate some processing
  const data = { processed: true, timestamp: Date.now() };
  
  const endTime = process.hrtime.bigint();
  const processingTime = Number(endTime - startTime) / 1000000;
  
  res.json({
    success: true,
    authMethod: 'Session',
    processingTime: `${processingTime.toFixed(3)}ms`,
    data
  });
});

router.get('/performance/cookie', cookieAuth, (req, res) => {
  const startTime = process.hrtime.bigint();
  
  // Simulate some processing
  const data = { processed: true, timestamp: Date.now() };
  
  const endTime = process.hrtime.bigint();
  const processingTime = Number(endTime - startTime) / 1000000;
  
  res.json({
    success: true,
    authMethod: 'Cookie',
    processingTime: `${processingTime.toFixed(3)}ms`,
    data
  });
});

/**
 * Vulnerability Demonstration Endpoints
 */

// CSRF demonstration (Session is protected, JWT/Cookie are not)
router.post('/csrf-test/session', sessionAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Session-based request completed',
    note: 'Sessions have built-in CSRF protection',
    authMethod: 'Session'
  });
});

router.post('/csrf-test/jwt', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'JWT-based request completed',
    note: 'JWT tokens are vulnerable to CSRF if not properly implemented',
    authMethod: 'JWT',
    warning: 'Ensure CSRF protection is implemented separately'
  });
});

router.post('/csrf-test/cookie', cookieAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Cookie-based request completed',
    note: 'Cookies are vulnerable to CSRF attacks',
    authMethod: 'Cookie',
    warning: 'Implement CSRF tokens or SameSite cookies'
  });
});

module.exports = router;