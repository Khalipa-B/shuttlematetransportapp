const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pickup', 'dropoff'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualEndTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'delayed'],
    default: 'scheduled'
  },
  stops: [{
    location: {
      name: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    scheduledTime: Date,
    actualTime: Date,
    students: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      status: {
        type: String,
        enum: ['scheduled', 'picked-up', 'dropped-off', 'absent'],
        default: 'scheduled'
      },
      timestamp: Date
    }],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  studentsPickedUp: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  delays: [{
    reason: String,
    duration: Number, // in minutes
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Indexes
tripSchema.index({ driver: 1, date: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ date: 1 });

module.exports = mongoose.model('Trip', tripSchema);