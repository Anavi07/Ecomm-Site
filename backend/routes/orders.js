const express = require('express');
const router = express.Router();

// Placeholder order routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Orders route placeholder' });
});

module.exports = router;
