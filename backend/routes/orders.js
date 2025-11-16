const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Create order
router.post('/', createOrder);

// Get order by ID
router.get('/:id', getOrderById);

// Get user's orders
router.get('/user/:userId', getUserOrders);

// Admin endpoints
router.get('/', getAllOrders); // Get all orders
router.put('/:id', updateOrderStatus); // Update order status

module.exports = router;
