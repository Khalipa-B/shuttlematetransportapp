const User = require('../models/User');
const Student = require('../models/Student');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('children', 'firstName lastName studentId')
      .populate('assignedRoutes', 'routeName busNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('children', 'firstName lastName studentId grade school')
      .populate('assignedRoutes', 'routeName busNumber type');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      message: 'Error fetching user',
      error: error.message 
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      phone, 
      address,
      licenseNumber,
      assignedBus 
    } = req.body;

    // Create user in Clerk first
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      publicMetadata: { role }
    });

    // Create user in MongoDB
    const userData = {
      clerkId: clerkUser.id,
      email,
      firstName,
      lastName,
      role,
      phone,
      address
    };

    // Add driver-specific fields
    if (role === 'driver') {
      userData.licenseNumber = licenseNumber;
      userData.assignedBus = assignedBus;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: error.message 
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.clerkId;
    delete updateData.email;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Clerk user if role changed
    if (updateData.role) {
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: { role: updateData.role }
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Error updating user',
      error: error.message 
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete from Clerk
    await clerkClient.users.deleteUser(user.clerkId);

    // Delete from MongoDB
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

// Get drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true })
      .populate('assignedRoutes', 'routeName busNumber')
      .select('firstName lastName email phone assignedBus licenseNumber assignedRoutes');

    res.status(200).json({ drivers });

  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ 
      message: 'Error fetching drivers',
      error: error.message 
    });
  }
};

// Get parents
const getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent', isActive: true })
      .populate('children', 'firstName lastName studentId grade')
      .select('firstName lastName email phone address children');

    res.status(200).json({ parents });

  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ 
      message: 'Error fetching parents',
      error: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDrivers,
  getParents
};