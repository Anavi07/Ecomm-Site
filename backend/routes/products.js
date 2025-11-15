const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products with pagination and filtering
router.get('/', productController.getAllProducts);

// GET single product by ID
router.get('/:id', productController.getProduct);

// POST - Create new product (admin only)
router.post('/', productController.createProduct);

// PUT - Update product (admin only)
router.put('/:id', productController.updateProduct);

// DELETE - Delete product (admin only)
router.delete('/:id', productController.deleteProduct);

// POST - Add review to product
router.post('/:id/reviews', productController.addReview);

module.exports = router;
