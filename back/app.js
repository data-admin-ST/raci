const express = require('express');
const router = express.Router();

// Middleware to check authentication and authorization
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Controller methods
const {
  getCompanyRaciAssignments,
  getMyRaciAssignments
} = require('../controllers/raciTrackerController');

// Routes
router.get('/company', authenticateJWT, authorizeRole('company_admin'), getCompanyRaciAssignments);
router.get('/my-assignments', authenticateJWT, getMyRaciAssignments);

module.exports = router;

const raciTrackerRoutes = require('./routes/raciTracker');
app.use('/api/raci-tracker', raciTrackerRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);