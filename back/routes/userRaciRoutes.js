const express = require('express');
const router = express.Router();
const { getMyRaciAssignments } = require('../controllers/userRaciController');
const { protect } = require('../middleware/authMiddleware');

// Route to get current user's RACI assignments
router.get('/my-assignments', protect, getMyRaciAssignments);

module.exports = router;
