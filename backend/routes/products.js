const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// GET all products with pagination and filtering (public)
router.get('/', productController.getAllProducts);

// GET single product by ID (public)
router.get('/:id', productController.getProduct);

// POST - Create new product (admin and vendor only)
router.post('/', authenticate, authorize(['admin', 'vendor']), productController.createProduct);

// PUT - Update product (admin and vendor - vendor can only edit their own products)
router.put('/:id', authenticate, authorize(['admin', 'vendor']), productController.updateProduct);

// DELETE - Delete product (admin only)
router.delete('/:id', authenticate, authorize(['admin']), productController.deleteProduct);

// POST - Add review to product (authenticated users)
router.post('/:id/reviews', authenticate, productController.addReview);

module.exports = router;
