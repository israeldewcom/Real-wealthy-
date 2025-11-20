const express = require('express');
const router = express.Router();

// GET /api/plans - Get all investment plans
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Investment plans fetched successfully',
      data: {
        plans: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
