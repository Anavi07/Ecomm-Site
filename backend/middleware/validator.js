const { body, validationResult } = require('express-validator');

// Product validation
const validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ gt: -1 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  (req, res, next) => validateResult(req, res, next),
];

// User registration validation
const validateUserRegistration = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  (req, res, next) => validateResult(req, res, next),
];

// Order validation
const validateOrder = [
  body('orderItems').isArray({ min: 1 }).withMessage('orderItems must be a non-empty array'),
  body('shippingAddress.address').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city').notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Shipping postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Shipping country is required'),
  (req, res, next) => validateResult(req, res, next),
];

// Helper to format validation results
function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
}

module.exports = {
  validateProduct,
  validateUserRegistration,
  validateOrder,
};
