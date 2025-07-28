const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, grade, school, parent } = req.query;
    
    const query = {};
    if (grade) query.grade = grade;
    if (school) query['school.name'] = { $regex: school, $options: 'i' };
    if (parent) query.parent = parent;

    const students = await Student.find(query)
      .populate('parent', 'firstName lastName email phone')
      .populate('assignedRoute', 'routeName busNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastName: 1, firstName: 1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ 
      message: 'Error fetching students',
      error: error.message 
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id)
      .populate('parent', 'firstName lastName email phone address')
      .populate('assignedRoute', 'routeName busNumber driver');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ student });

  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ 
      message: 'Error fetching student',
      error: error.message 
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      studentId,
      grade,
      school,
      parent,
      homeAddress,
      pickupTime,
      specialNeeds,
      emergencyContact
    } = req.body;

    // Validate parent exists
    const parentUser = await User.findById(parent);
    if (!parentUser || parentUser.role !== 'parent') {
      return res.status(400).json({ message: 'Invalid parent ID' });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const student = new Student({
      firstName,
      lastName,
      studentId,
      grade,
      school,
      parent,
      homeAddress,
      pickupTime,
      specialNeeds,
      emergencyContact
    });

    await student.save();

    // Add student to parent's children array
    await User.findByIdAndUpdate(
      parent,
      { $push: { children: student._id } }
    );

    const populatedStudent = await Student.findById(student._id)
      .populate('parent', 'firstName lastName email');

    res.status(201).json({
      message: 'Student created successfully',
      student: populatedStudent
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ 
      message: 'Error creating student',
      error: error.message 
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parent', 'firstName lastName email')
     .populate('assignedRoute', 'routeName busNumber');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student updated successfully',
      student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      message: 'Error updating student',
      error: error.message 
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from parent's children array
    await User.findByIdAndUpdate(
      student.parent,
      { $pull: { children: id } }
    );

    // Delete student
    await Student.findByIdAndDelete(id);

    res.status(200).json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      message: 'Error deleting student',
      error: error.message 
    });
  }
};

// Get students by parent
const getStudentsByParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    const students = await Student.find({ parent: parentId, isActive: true })
      .populate('assignedRoute', 'routeName busNumber driver')
      .sort({ firstName: 1 });

    res.status(200).json({ students });

  } catch (error) {
    console.error('Get students by parent error:', error);
    res.status(500).json({ 
      message: 'Error fetching parent students',
      error: error.message 
    });
  }
};

// Check in student
const checkInStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { tripId, location } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student status
    await Student.findByIdAndUpdate(id, {
      currentStatus: 'picked-up'
    });

    // Create attendance record
    const attendance = new Attendance({
      student: id,
      trip: tripId,
      date: new Date(),
      type: 'pickup',
      status: 'present',
      checkInTime: new Date(),
      location,
      recordedBy: req.user.id || null
    });

    await attendance.save();

    // Emit check-in event
    req.app.get('io').emit('studentCheckedIn', {
      studentId: id,
      studentName: `${student.firstName} ${student.lastName}`,
      tripId,
      timestamp: new Date()
    });

    res.status(200).json({
      message: 'Student checked in successfully',
      attendance
    });

  } catch (error) {
    console.error('Check in student error:', error);
    res.status(500).json({ 
      message: 'Error checking in student',
      error: error.message 
    });
  }
};

// Check out student
const checkOutStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { tripId, location } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student status
    await Student.findByIdAndUpdate(id, {
      currentStatus: 'dropped-off'
    });

    // Create attendance record
    const attendance = new Attendance({
      student: id,
      trip: tripId,
      date: new Date(),
      type: 'dropoff',
      status: 'present',
      checkOutTime: new Date(),
      location,
      recordedBy: req.user.id || null
    });

    await attendance.save();

    // Emit check-out event
    req.app.get('io').emit('studentCheckedOut', {
      studentId: id,
      studentName: `${student.firstName} ${student.lastName}`,
      tripId,
      timestamp: new Date()
    });

    res.status(200).json({
      message: 'Student checked out successfully',
      attendance
    });

  } catch (error) {
    console.error('Check out student error:', error);
    res.status(500).json({ 
      message: 'Error checking out student',
      error: error.message 
    });
  }
};

// Get student attendance history
const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type } = req.query;

    const query = { student: id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) query.type = type;

    const attendance = await Attendance.find(query)
      .populate('trip', 'routeName busNumber driver')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({ attendance });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ 
      message: 'Error fetching student attendance',
      error: error.message 
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByParent,
  checkInStudent,
  checkOutStudent,
  getStudentAttendance
};