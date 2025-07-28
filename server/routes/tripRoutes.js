const express = require('express');
const router = express.Router();
const { requireAuth, extractUserInfo } = require('../middleware/authMiddleware');
const { requireAdmin, requireDriverOrAdmin } = require('../middleware/roleMiddleware');
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripsByDriver,
  updateTripLocation,
  startTrip,
  completeTrip
} = require('../controllers/tripController');

// Get all trips (Admin and Driver access)
router.get('/', requireAuth, extractUserInfo, requireDriverOrAdmin, getAllTrips);

// Get trip by ID (Admin and Driver access)
router.get('/:id', requireAuth, extractUserInfo, requireDriverOrAdmin, getTripById);

// Create new trip (Admin only)
router.post('/', requireAuth, extractUserInfo, requireAdmin, createTrip);

// Update trip (Admin only)
router.put('/:id', requireAuth, extractUserInfo, requireAdmin, updateTrip);

// Delete trip (Admin only)
router.delete('/:id', requireAuth, extractUserInfo, requireAdmin, deleteTrip);

// Get trips by driver (Driver and Admin access)
router.get('/driver/:driverId', requireAuth, extractUserInfo, requireDriverOrAdmin, getTripsByDriver);

// Update trip location (Driver and Admin access)
router.put('/:id/location', requireAuth, extractUserInfo, requireDriverOrAdmin, updateTripLocation);

// Start trip (Driver and Admin access)
router.put('/:id/start', requireAuth, extractUserInfo, requireDriverOrAdmin, startTrip);

// Complete trip (Driver and Admin access)
router.put('/:id/complete', requireAuth, extractUserInfo, requireDriverOrAdmin, completeTrip);

module.exports = router;