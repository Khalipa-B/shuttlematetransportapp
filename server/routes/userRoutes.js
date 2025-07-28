const express = require('express');
const router = express.Router();
const { requireAuth, extractUserInfo } = require('../middleware/authMiddleware');
const { requireAdmin, requireDriverOrAdmin } = require('../middleware/roleMiddleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDrivers,
  getParents
} = require('../controllers/userController');

// Get all users (Admin only)
router.get('/', requireAuth, extractUserInfo, requireAdmin, getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', requireAuth, extractUserInfo, requireAdmin, getUserById);

// Create new user (Admin only)
router.post('/', requireAuth, extractUserInfo, requireAdmin, createUser);

// Update user (Admin only)
router.put('/:id', requireAuth, extractUserInfo, requireAdmin, updateUser);

// Delete user (Admin only)
router.delete('/:id', requireAuth, extractUserInfo, requireAdmin, deleteUser);

// Get all drivers (Admin and Driver access)
router.get('/role/drivers', requireAuth, extractUserInfo, requireDriverOrAdmin, getDrivers);

// Get all parents (Admin only)
router.get('/role/parents', requireAuth, extractUserInfo, requireAdmin, getParents);

module.exports = router;