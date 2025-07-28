const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['parent', 'driver', 'admin'],
    default: 'parent'
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  // Parent-specific fields
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  // Driver-specific fields
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'driver'; }
  },
  assignedBus: {
    type: String,
    required: function() { return this.role === 'driver'; }
  },
  assignedRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);