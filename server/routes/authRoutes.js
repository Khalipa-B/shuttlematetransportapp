const express = require('express');
const router = express.Router();
const { requireAuth, extractUserInfo } = require('../middleware/authMiddleware');
const { syncUser, getCurrentUser, updateProfile } = require('../controllers/authController');

// Sync user data from Clerk to MongoDB
router.post('/sync', syncUser);

// Get current user profile (protected)
router.get('/me', requireAuth, extractUserInfo, getCurrentUser);

// Update user profile (protected)
router.put('/profile', requireAuth, extractUserInfo, updateProfile);

module.exports = router;