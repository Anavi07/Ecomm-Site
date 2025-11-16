const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');

// Route modules
const products = require('./products');
const users = require('./users');
const orders = require('./orders');

// Apply logging middleware to all routes handled by this router
router.use(logger);

// Mount modules
router.use('/products', products);
router.use('/users', users);
router.use('/orders', orders);

module.exports = router;
