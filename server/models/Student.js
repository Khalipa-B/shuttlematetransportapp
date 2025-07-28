const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  grade: {
    type: String,
    required: true
  },
  school: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  pickupTime: {
    morning: String,
    afternoon: String
  },
  specialNeeds: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentStatus: {
    type: String,
    enum: ['home', 'picked-up', 'at-school', 'dropped-off'],
    default: 'home'
  }
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ parent: 1 });
studentSchema.index({ assignedRoute: 1 });

module.exports = mongoose.model('Student', studentSchema);