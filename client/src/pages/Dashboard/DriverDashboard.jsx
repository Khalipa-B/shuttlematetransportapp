import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { MapPin, Users, CheckCircle, Clock, MessageCircle, AlertTriangle } from 'lucide-react'

const DriverDashboard = () => {
  const { user } = useUser()
  const [students] = useState([
    { id: 1, name: 'Emma Johnson', status: 'checked-in', pickupTime: '8:15 AM', location: 'Oak Street' },
    { id: 2, name: 'Liam Smith', status: 'pending', pickupTime: '8:20 AM', location: 'Pine Avenue' },
    { id: 3, name: 'Sophia Davis', status: 'checked-in', pickupTime: '8:25 AM', location: 'Maple Drive' },
    { id: 4, name: 'Noah Wilson', status: 'pending', pickupTime: '8:30 AM', location: 'Cedar Lane' },
  ])

  const [currentRoute] = useState({
    name: 'Route A - Morning',
    totalStops: 8,
    completedStops: 3,
    estimatedCompletion: '9:15 AM'
  })

  const handleCheckIn = (studentId) => {
    // Handle student check-in logic
    console.log('Checking in student:', studentId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Driver Dashboard" />
      <Sidebar userRole="driver" />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Good morning, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Ready for today's route? Let's ensure safe transport for all students.
            </p>
          </div>

          {/* Route Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Route</p>
                  <p className="text-lg font-semibold text-gray-900">{currentRoute.name}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-secondary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-lg font-semibold text-gray-900">{students.length} assigned</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentRoute.completedStops}/{currentRoute.totalStops} stops
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">ETA</p>
                  <p className="text-lg font-semibold text-gray-900">{currentRoute.estimatedCompletion}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Attendance */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-primary-600 mr-2" />
                Student Attendance
              </h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        student.status === 'checked-in' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.location} • {student.pickupTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {student.status === 'pending' ? (
                        <button
                          onClick={() => handleCheckIn(student.id)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                          Checked In
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Map */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                Route Overview
              </h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                  <p className="text-gray-600">Route Map</p>
                  <p className="text-sm text-gray-500">Interactive route visualization</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Completed stops</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Upcoming stops</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-sm font-medium">Send Update</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-sm font-medium">Report Issue</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Clock className="h-6 w-6 text-secondary-600 mr-2" />
                  <span className="text-sm font-medium">Break Time</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Complete Route</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-blue-900">Admin</p>
                    <p className="text-xs text-blue-700">10:30 AM</p>
                  </div>
                  <p className="text-sm text-blue-800">Route A schedule updated for tomorrow.</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-green-900">Parent (Emma's Mom)</p>
                    <p className="text-xs text-green-700">9:45 AM</p>
                  </div>
                  <p className="text-sm text-green-800">Thank you for the safe ride!</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-yellow-900">System</p>
                    <p className="text-xs text-yellow-700">8:00 AM</p>
                  </div>
                  <p className="text-sm text-yellow-800">Daily safety check reminder.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DriverDashboard