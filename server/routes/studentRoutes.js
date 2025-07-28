const express = require('express');
const router = express.Router();
const { requireAuth, extractUserInfo } = require('../middleware/authMiddleware');
const { requireAdmin, requireDriverOrAdmin, requireParentOrAdmin } = require('../middleware/roleMiddleware');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByParent,
  checkInStudent,
  checkOutStudent,
  getStudentAttendance
} = require('../controllers/studentController');

// Get all students (Admin only)
router.get('/', requireAuth, extractUserInfo, requireAdmin, getAllStudents);

// Get student by ID (Admin and Parent access)
router.get('/:id', requireAuth, extractUserInfo, requireParentOrAdmin, getStudentById);

// Create new student (Admin only)
router.post('/', requireAuth, extractUserInfo, requireAdmin, createStudent);

// Update student (Admin only)
router.put('/:id', requireAuth, extractUserInfo, requireAdmin, updateStudent);

// Delete student (Admin only)
router.delete('/:id', requireAuth, extractUserInfo, requireAdmin, deleteStudent);

// Get students by parent (Parent and Admin access)
router.get('/parent/:parentId', requireAuth, extractUserInfo, requireParentOrAdmin, getStudentsByParent);

// Check in student (Driver and Admin access)
router.post('/:id/checkin', requireAuth, extractUserInfo, requireDriverOrAdmin, checkInStudent);

// Check out student (Driver and Admin access)
router.post('/:id/checkout', requireAuth, extractUserInfo, requireDriverOrAdmin, checkOutStudent);

// Get student attendance history (Parent and Admin access)
router.get('/:id/attendance', requireAuth, extractUserInfo, requireParentOrAdmin, getStudentAttendance);

module.exports = router;