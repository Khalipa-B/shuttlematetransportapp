import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { MapPin, Clock, MessageCircle, AlertCircle, Bus, User } from 'lucide-react'

const ParentDashboard = () => {
  const { user } = useUser()
  const [busLocation, setBusLocation] = useState({ lat: 40.7128, lng: -74.0060 })
  const [studentStatus, setStudentStatus] = useState('On Bus')
  const [nextStop, setNextStop] = useState('Main Street School')
  const [eta, setEta] = useState('15 minutes')

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBusLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Parent Dashboard" />
      <Sidebar userRole="parent" />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Track your child's school transport and stay connected.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Bus Status</p>
                  <p className="text-lg font-semibold text-gray-900">On Route</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <User className="h-8 w-8 text-secondary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Child Status</p>
                  <p className="text-lg font-semibold text-gray-900">{studentStatus}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">ETA</p>
                  <p className="text-lg font-semibold text-gray-900">{eta}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Stop</p>
                  <p className="text-lg font-semibold text-gray-900">{nextStop}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Tracking */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                Live Bus Tracking
              </h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Bus className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                  <p className="text-gray-600">Bus Location</p>
                  <p className="text-sm text-gray-500">
                    Lat: {busLocation.lat.toFixed(4)}, Lng: {busLocation.lng.toFixed(4)}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-primary-600 mr-2" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Child checked in</p>
                    <p className="text-xs text-gray-500">8:15 AM - Bus #42</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bus departed school</p>
                    <p className="text-xs text-gray-500">3:30 PM - Route A</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Message from driver</p>
                    <p className="text-xs text-gray-500">2:45 PM - "Running 5 minutes late"</p>
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
                  <span className="text-sm font-medium">Message Driver</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-sm font-medium">Report Issue</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Clock className="h-6 w-6 text-secondary-600 mr-2" />
                  <span className="text-sm font-medium">View Schedule</span>
                </button>
                
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <MapPin className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Track History</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Bus Update</p>
                  <p className="text-xs text-blue-700">Your child's bus is running on schedule today.</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Safety Check</p>
                  <p className="text-xs text-green-700">All safety protocols completed successfully.</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Schedule Change</p>
                  <p className="text-xs text-yellow-700">Tomorrow's pickup time changed to 8:00 AM.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ParentDashboard