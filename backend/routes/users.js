const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');

// User registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// User profile
router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);

// Admin endpoints
router.get('/', getAllUsers); // Get all users (pagination)
router.delete('/:id', deleteUser); // Delete user

module.exports = router;
