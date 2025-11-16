const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');

// Route modules
const products = require('./products');
const users = require('./users');
const orders = require('./orders');
const testing = require('./testing');          // Security testing routes

// Authentication routes
const authSession = require('./auth');        // Session-based auth
const authJWT = require('./authJWT');         // JWT auth
const authCookie = require('./cookieAuth');   // Cookie-only auth

// Apply logging middleware to all routes handled by this router
router.use(logger);

// Mount authentication routes
router.use('/auth/session', authSession);
router.use('/auth/jwt', authJWT);
router.use('/auth/cookie', authCookie);

// Mount testing routes
router.use('/testing', testing);

// Mount other modules
router.use('/products', products);
router.use('/users', users);
router.use('/orders', orders);

module.exports = router;
