const Trip = require('../models/Trip');
const User = require('../models/User');
const Student = require('../models/Student');

// Get all trips
const getAllTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, driver } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (driver) query.driver = driver;

    const trips = await Trip.find(query)
      .populate('driver', 'firstName lastName email phone')
      .populate('stops.students.student', 'firstName lastName studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, scheduledStartTime: -1 });

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all trips error:', error);
    res.status(500).json({ 
      message: 'Error fetching trips',
      error: error.message 
    });
  }
};

// Get trip by ID
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findById(id)
      .populate('driver', 'firstName lastName email phone assignedBus')
      .populate('stops.students.student', 'firstName lastName studentId grade homeAddress');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json({ trip });

  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ 
      message: 'Error fetching trip',
      error: error.message 
    });
  }
};

// Create new trip
const createTrip = async (req, res) => {
  try {
    const {
      routeName,
      busNumber,
      driver,
      type,
      date,
      scheduledStartTime,
      scheduledEndTime,
      stops
    } = req.body;

    // Validate driver exists and is active
    const driverUser = await User.findById(driver);
    if (!driverUser || driverUser.role !== 'driver' || !driverUser.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive driver' });
    }

    const trip = new Trip({
      routeName,
      busNumber,
      driver,
      type,
      date: new Date(date),
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      stops: stops || []
    });

    await trip.save();

    // Populate the created trip
    const populatedTrip = await Trip.findById(trip._id)
      .populate('driver', 'firstName lastName email')
      .populate('stops.students.student', 'firstName lastName studentId');

    res.status(201).json({
      message: 'Trip created successfully',
      trip: populatedTrip
    });

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ 
      message: 'Error creating trip',
      error: error.message 
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.scheduledStartTime) updateData.scheduledStartTime = new Date(updateData.scheduledStartTime);
    if (updateData.scheduledEndTime) updateData.scheduledEndTime = new Date(updateData.scheduledEndTime);
    if (updateData.actualStartTime) updateData.actualStartTime = new Date(updateData.actualStartTime);
    if (updateData.actualEndTime) updateData.actualEndTime = new Date(updateData.actualEndTime);

    const trip = await Trip.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('driver', 'firstName lastName email')
     .populate('stops.students.student', 'firstName lastName studentId');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json({
      message: 'Trip updated successfully',
      trip
    });

  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ 
      message: 'Error updating trip',
      error: error.message 
    });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json({ message: 'Trip deleted successfully' });

  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ 
      message: 'Error deleting trip',
      error: error.message 
    });
  }
};

// Get trips by driver
const getTripsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { date, status } = req.query;

    const query = { driver: driverId };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (status) query.status = status;

    const trips = await Trip.find(query)
      .populate('stops.students.student', 'firstName lastName studentId homeAddress')
      .sort({ scheduledStartTime: 1 });

    res.status(200).json({ trips });

  } catch (error) {
    console.error('Get trips by driver error:', error);
    res.status(500).json({ 
      message: 'Error fetching driver trips',
      error: error.message 
    });
  }
};

// Update trip location (for real-time tracking)
const updateTripLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      id,
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Emit location update via Socket.IO
    req.app.get('io').emit('locationUpdate', {
      tripId: id,
      location: { latitude, longitude },
      timestamp: new Date()
    });

    res.status(200).json({
      message: 'Location updated successfully',
      location: trip.currentLocation
    });

  } catch (error) {
    console.error('Update trip location error:', error);
    res.status(500).json({ 
      message: 'Error updating trip location',
      error: error.message 
    });
  }
};

// Start trip
const startTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByIdAndUpdate(
      id,
      {
        status: 'in-progress',
        actualStartTime: new Date()
      },
      { new: true }
    ).populate('driver', 'firstName lastName')
     .populate('stops.students.student', 'firstName lastName');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Emit trip started event
    req.app.get('io').emit('tripStarted', {
      tripId: id,
      routeName: trip.routeName,
      driver: trip.driver,
      startTime: trip.actualStartTime
    });

    res.status(200).json({
      message: 'Trip started successfully',
      trip
    });

  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ 
      message: 'Error starting trip',
      error: error.message 
    });
  }
};

// Complete trip
const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        actualEndTime: new Date()
      },
      { new: true }
    ).populate('driver', 'firstName lastName');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Emit trip completed event
    req.app.get('io').emit('tripCompleted', {
      tripId: id,
      routeName: trip.routeName,
      driver: trip.driver,
      endTime: trip.actualEndTime
    });

    res.status(200).json({
      message: 'Trip completed successfully',
      trip
    });

  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ 
      message: 'Error completing trip',
      error: error.message 
    });
  }
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripsByDriver,
  updateTripLocation,
  startTrip,
  completeTrip
};