const User = require('../models/User');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// Sync user data from Clerk to MongoDB
const syncUser = async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);
    
    if (!clerkUser) {
      return res.status(404).json({ message: 'User not found in Clerk' });
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ clerkId });

    const userData = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role: clerkUser.publicMetadata?.role || 'parent',
      lastLogin: new Date()
    };

    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { clerkId },
        userData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }

    res.status(200).json({
      message: 'User synced successfully',
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
    console.error('Sync user error:', error);
    res.status(500).json({ 
      message: 'Error syncing user data',
      error: error.message 
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId })
      .populate('children', 'firstName lastName studentId grade')
      .populate('assignedRoutes', 'routeName busNumber');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        children: user.children,
        assignedRoutes: user.assignedRoutes,
        notifications: user.notifications,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { phone, address, notifications } = req.body;
    
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (notifications) updateData.notifications = notifications;

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        address: user.address,
        notifications: user.notifications
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  updateProfile
};